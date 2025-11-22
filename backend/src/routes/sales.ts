import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';
import { sendSaleNotification } from '../utils/email';

const router = express.Router();

// Generate sale number
const generateSaleNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SALE-${year}${month}${day}-${random}`;
};

// Create sale
router.post('/', authenticate, checkPermission('make_sale'), async (req: AuthRequest, res) => {
  try {
    const {
      customer_id,
      services = [],
      packages: salePackages = [],
      menu_items = [],
      discount_amount = 0,
      payment_method,
      payment_reference,
      notes,
    } = req.body;

    if (services.length === 0 && salePackages.length === 0 && menu_items.length === 0) {
      return res.status(400).json({ error: 'At least one service, package, or menu item required' });
    }

    if (!payment_method) {
      return res.status(400).json({ error: 'Payment method required' });
    }

    const saleNumber = generateSaleNumber();
    let totalAmount = 0;
    let taxAmount = 0;

    const client = await (await import('../db/connection')).default.connect();
    try {
      await client.query('BEGIN');

      // Calculate totals
      if (services.length > 0) {
        for (const service of services) {
          const serviceResult = await client.query(
            'SELECT base_price FROM services WHERE id = $1',
            [service.service_id]
          );
          if (serviceResult.rows.length === 0) {
            throw new Error(`Service ${service.service_id} not found`);
          }
          const price = parseFloat(serviceResult.rows[0].base_price);
          const quantity = service.quantity || 1;
          const serviceDiscount = service.discount_amount || 0;
          totalAmount += price * quantity - serviceDiscount;
        }
      }

      // Calculate packages total
      if (salePackages.length > 0) {
        for (const pkg of salePackages) {
          const packageResult = await client.query(
            'SELECT base_price FROM packages WHERE id = $1',
            [pkg.package_id]
          );
          if (packageResult.rows.length === 0) {
            throw new Error(`Package ${pkg.package_id} not found`);
          }
          const price = parseFloat(packageResult.rows[0].base_price);
          const quantity = pkg.quantity || 1;
          const packageDiscount = pkg.discount_amount || 0;
          totalAmount += price * quantity - packageDiscount;
        }
      }

      if (menu_items.length > 0) {
        for (const item of menu_items) {
          const itemResult = await client.query(
            'SELECT price, tax_rate FROM menu_items WHERE id = $1',
            [item.menu_item_id]
          );
          if (itemResult.rows.length === 0) {
            throw new Error(`Menu item ${item.menu_item_id} not found`);
          }
          const price = parseFloat(itemResult.rows[0].price);
          const taxRate = parseFloat(itemResult.rows[0].tax_rate || 0);
          const quantity = item.quantity || 1;
          const itemDiscount = item.discount_amount || 0;
          const itemTotal = price * quantity - itemDiscount;
          const itemTax = (itemTotal * taxRate) / 100;
          totalAmount += itemTotal;
          taxAmount += itemTax;
        }
      }

      const finalAmount = totalAmount + taxAmount - discount_amount;

      // Create sale
      const saleResult = await client.query(
        `INSERT INTO sales 
         (sale_number, customer_id, staff_id, total_amount, discount_amount, tax_amount, final_amount, payment_method, payment_reference, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          saleNumber,
          customer_id || null,
          req.user!.id,
          totalAmount,
          discount_amount,
          taxAmount,
          finalAmount,
          payment_method,
          payment_reference || null,
          notes || null,
        ]
      );

      const sale = saleResult.rows[0];

      // Add sale services
      if (services.length > 0) {
        for (const service of services) {
          const serviceResult = await client.query(
            'SELECT base_price FROM services WHERE id = $1',
            [service.service_id]
          );
          const price = parseFloat(serviceResult.rows[0].base_price);
          const quantity = service.quantity || 1;
          const serviceDiscount = service.discount_amount || 0;
          const totalPrice = price * quantity - serviceDiscount;

          await client.query(
            `INSERT INTO sale_services 
             (sale_id, service_id, track_id, car_id, quantity, unit_price, discount_amount, total_price, duration_minutes, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              sale.id,
              service.service_id,
              service.track_id || null,
              service.car_id || null,
              quantity,
              price,
              serviceDiscount,
              totalPrice,
              service.duration_minutes || null,
              service.notes || null,
            ]
          );
        }
      }

      // Add sale packages
      if (salePackages.length > 0) {
        for (const pkg of salePackages) {
          const packageResult = await client.query(
            'SELECT base_price FROM packages WHERE id = $1',
            [pkg.package_id]
          );
          const price = parseFloat(packageResult.rows[0].base_price);
          const quantity = pkg.quantity || 1;
          const packageDiscount = pkg.discount_amount || 0;
          const totalPrice = price * quantity - packageDiscount;

          // Create service entry for package
          await client.query(
            `INSERT INTO sale_services 
             (sale_id, package_id, track_id, car_id, quantity, unit_price, discount_amount, total_price, duration_minutes, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              sale.id,
              pkg.package_id,
              pkg.track_id || null,
              pkg.car_id || null,
              quantity,
              price,
              packageDiscount,
              totalPrice,
              pkg.duration_minutes || null,
              pkg.notes || null,
            ]
          );

          // Add package menu items to sale
          const packageMenuItemsResult = await client.query(
            `SELECT menu_item_id, quantity 
             FROM package_menu_items 
             WHERE package_id = $1`,
            [pkg.package_id]
          );

          for (const pkgMenuItem of packageMenuItemsResult.rows) {
            const itemResult = await client.query(
              'SELECT price, tax_rate FROM menu_items WHERE id = $1',
              [pkgMenuItem.menu_item_id]
            );
            const itemPrice = parseFloat(itemResult.rows[0].price);
            const taxRate = parseFloat(itemResult.rows[0].tax_rate || 0);
            const itemQuantity = (pkgMenuItem.quantity || 1) * quantity;
            const itemTaxAmount = (itemPrice * itemQuantity * taxRate) / 100;
            const itemTotalPrice = itemPrice * itemQuantity + itemTaxAmount;

            await client.query(
              `INSERT INTO sale_menu_items 
               (sale_id, menu_item_id, quantity, unit_price, tax_rate, tax_amount, total_price)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                sale.id,
                pkgMenuItem.menu_item_id,
                itemQuantity,
                itemPrice,
                taxRate,
                itemTaxAmount,
                itemTotalPrice,
              ]
            );
          }
        }
      }

      // Add sale menu items
      if (menu_items.length > 0) {
        for (const item of menu_items) {
          const itemResult = await client.query(
            'SELECT price, tax_rate FROM menu_items WHERE id = $1',
            [item.menu_item_id]
          );
          const price = parseFloat(itemResult.rows[0].price);
          const taxRate = parseFloat(itemResult.rows[0].tax_rate || 0);
          const quantity = item.quantity || 1;
          const itemDiscount = item.discount_amount || 0;
          const itemTotal = price * quantity - itemDiscount;
          const itemTax = (itemTotal * taxRate) / 100;
          const totalPrice = itemTotal + itemTax;

          await client.query(
            `INSERT INTO sale_menu_items 
             (sale_id, menu_item_id, quantity, unit_price, discount_amount, tax_amount, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              sale.id,
              item.menu_item_id,
              quantity,
              price,
              itemDiscount,
              itemTax,
              totalPrice,
            ]
          );
        }
      }

      await client.query('COMMIT');

      // Log audit
      await logAudit(req, 'create', 'sale', sale.id, null, sale, `Sale created: ${saleNumber}`);

      // Send email notification to main admin
      try {
        const adminResult = await query(
          `SELECT u.email, ns.notify_on_sale 
           FROM users u
           LEFT JOIN notification_settings ns ON u.id = ns.user_id
           WHERE u.role = 'main_admin' AND (ns.notify_on_sale IS NULL OR ns.notify_on_sale = true)`
        );

        const saleItems = [
          ...services.map((s: any) => ({
            name: `Service ${s.service_id}`,
            quantity: s.quantity || 1,
            price: s.total_price || 0,
          })),
          ...salePackages.map((pkg: any) => ({
            name: `Package ${pkg.package_id}`,
            quantity: pkg.quantity || 1,
            price: pkg.total_price || 0,
          })),
          ...menu_items.map((m: any) => ({
            name: `Menu Item ${m.menu_item_id}`,
            quantity: m.quantity || 1,
            price: m.total_price || 0,
          })),
        ];

        // Send sale notification to main admin
        for (const admin of adminResult.rows) {
          await sendSaleNotification(admin.email, {
            saleNumber,
            date: new Date().toLocaleString(),
            items: saleItems,
            total: finalAmount,
            staff: req.user!.full_name,
          });
        }
        
        // Send sale notification to customer if email is available
        if (customer_id) {
          const customerResult = await query(
            'SELECT email, name FROM customers WHERE id = $1',
            [customer_id]
          );
          
          if (customerResult.rows.length > 0 && customerResult.rows[0].email) {
            try {
              await sendSaleNotification(customerResult.rows[0].email, {
                saleNumber,
                date: new Date().toLocaleString(),
                items: saleItems,
                total: finalAmount,
                staff: req.user!.full_name,
              });
            } catch (customerEmailError) {
              console.error('Failed to send sale notification to customer:', customerEmailError);
              // Don't fail the sale if customer email fails
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send sale notification:', emailError);
        // Don't fail the sale if email fails
      }

      res.status(201).json(sale);
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Create sale error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all sales
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date, customer_id, staff_id } = req.query;

    let queryText = `
      SELECT s.*, 
             c.name as customer_name, c.phone as customer_phone,
             u.full_name as staff_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.staff_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (start_date) {
      queryText += ` AND s.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      queryText += ` AND s.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (customer_id) {
      queryText += ` AND s.customer_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    if (staff_id) {
      queryText += ` AND s.staff_id = $${paramCount}`;
      params.push(staff_id);
      paramCount++;
    }

    queryText += ' ORDER BY s.created_at DESC LIMIT 100';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sale by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const saleResult = await query(
      `SELECT s.*, 
              c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
              u.full_name as staff_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN users u ON s.staff_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const sale = saleResult.rows[0];

    // Get sale services
    const servicesResult = await query(
      `SELECT ss.*, s.name as service_name, t.name as track_name, c.name as car_name, c.model as car_model
       FROM sale_services ss
       LEFT JOIN services s ON ss.service_id = s.id
       LEFT JOIN rc_tracks t ON ss.track_id = t.id
       LEFT JOIN rc_cars c ON ss.car_id = c.id
       WHERE ss.sale_id = $1`,
      [id]
    );

    // Get sale menu items
    const menuItemsResult = await query(
      `SELECT smi.*, mi.name as menu_item_name, mi.category
       FROM sale_menu_items smi
       LEFT JOIN menu_items mi ON smi.menu_item_id = mi.id
       WHERE smi.sale_id = $1`,
      [id]
    );

    res.json({
      ...sale,
      services: servicesResult.rows,
      menu_items: menuItemsResult.rows,
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


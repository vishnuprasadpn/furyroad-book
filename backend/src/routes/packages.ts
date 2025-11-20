import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';

const router = express.Router();

// Get all packages
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT p.*, t.name as track_name, c.name as car_name, c.model as car_model
       FROM packages p
       LEFT JOIN rc_tracks t ON p.track_id = t.id
       LEFT JOIN rc_cars c ON p.car_id = c.id
       ORDER BY p.created_at DESC`
    );
    
    // Get menu items for each package
    for (const pkg of result.rows) {
      const menuItemsResult = await query(
        `SELECT pmi.*, mi.name as menu_item_name, mi.price as menu_item_price, mi.category
         FROM package_menu_items pmi
         JOIN menu_items mi ON pmi.menu_item_id = mi.id
         WHERE pmi.package_id = $1`,
        [pkg.id]
      );
      pkg.menu_items = menuItemsResult.rows;
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get package by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, t.name as track_name, c.name as car_name, c.model as car_model
       FROM packages p
       LEFT JOIN rc_tracks t ON p.track_id = t.id
       LEFT JOIN rc_cars c ON p.car_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const pkg = result.rows[0];
    
    // Get menu items
    const menuItemsResult = await query(
      `SELECT pmi.*, mi.name as menu_item_name, mi.price as menu_item_price, mi.category
       FROM package_menu_items pmi
       JOIN menu_items mi ON pmi.menu_item_id = mi.id
       WHERE pmi.package_id = $1`,
      [id]
    );
    pkg.menu_items = menuItemsResult.rows;

    res.json(pkg);
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create package
router.post('/', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  const { getClient } = await import('../db/connection');
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const { name, description, track_id, car_id, base_price, duration_minutes, discount_percentage, menu_items, is_active } = req.body;

    if (!name || !base_price) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Name and base_price are required' });
    }

    const result = await client.query(
      `INSERT INTO packages (name, description, track_id, car_id, base_price, duration_minutes, discount_percentage, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        description || null,
        track_id || null,
        car_id || null,
        base_price,
        duration_minutes || null,
        discount_percentage || 0,
        is_active !== false
      ]
    );

    const packageId = result.rows[0].id;

    // Add menu items
    if (menu_items && menu_items.length > 0) {
      for (const item of menu_items) {
        await client.query(
          `INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
           VALUES ($1, $2, $3)`,
          [packageId, item.menu_item_id, item.quantity || 1]
        );
      }
    }

    await client.query('COMMIT');
    client.release();

    // Get full package with menu items
    const fullPackageResult = await query(
      `SELECT p.*, t.name as track_name, c.name as car_name, c.model as car_model
       FROM packages p
       LEFT JOIN rc_tracks t ON p.track_id = t.id
       LEFT JOIN rc_cars c ON p.car_id = c.id
       WHERE p.id = $1`,
      [packageId]
    );

    const pkg = fullPackageResult.rows[0];
    const menuItemsResult = await query(
      `SELECT pmi.*, mi.name as menu_item_name, mi.price as menu_item_price, mi.category
       FROM package_menu_items pmi
       JOIN menu_items mi ON pmi.menu_item_id = mi.id
       WHERE pmi.package_id = $1`,
      [packageId]
    );
    pkg.menu_items = menuItemsResult.rows;

    await logAudit(req, 'create', 'package', packageId, null, pkg, `Package created: ${name}`);

    res.status(201).json(pkg);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update package
router.put('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  const { getClient } = await import('../db/connection');
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { name, description, track_id, car_id, base_price, duration_minutes, discount_percentage, menu_items, is_active } = req.body;

    const oldResult = await client.query('SELECT * FROM packages WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Package not found' });
    }

    await client.query(
      `UPDATE packages 
       SET name = $1, description = $2, track_id = $3, car_id = $4, base_price = $5, 
           duration_minutes = $6, discount_percentage = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [name, description || null, track_id || null, car_id || null, base_price, duration_minutes || null, discount_percentage || 0, is_active !== false, id]
    );

    // Update menu items - delete existing and add new
    await client.query('DELETE FROM package_menu_items WHERE package_id = $1', [id]);
    
    if (menu_items && menu_items.length > 0) {
      for (const item of menu_items) {
        await client.query(
          `INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
           VALUES ($1, $2, $3)`,
          [id, item.menu_item_id, item.quantity || 1]
        );
      }
    }

    await client.query('COMMIT');
    client.release();

    // Get full package
    const result = await query(
      `SELECT p.*, t.name as track_name, c.name as car_name, c.model as car_model
       FROM packages p
       LEFT JOIN rc_tracks t ON p.track_id = t.id
       LEFT JOIN rc_cars c ON p.car_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    const pkg = result.rows[0];
    const menuItemsResult = await query(
      `SELECT pmi.*, mi.name as menu_item_name, mi.price as menu_item_price, mi.category
       FROM package_menu_items pmi
       JOIN menu_items mi ON pmi.menu_item_id = mi.id
       WHERE pmi.package_id = $1`,
      [id]
    );
    pkg.menu_items = menuItemsResult.rows;

    await logAudit(req, 'update', 'package', parseInt(id), oldResult.rows[0], pkg, `Package updated: ${name}`);

    res.json(pkg);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete package
router.delete('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM packages WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await query('DELETE FROM packages WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'package', parseInt(id), oldResult.rows[0], null, 'Package deleted');

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


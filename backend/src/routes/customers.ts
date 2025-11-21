import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';
import { sendCustomerWelcomeEmail } from '../utils/email';

const router = express.Router();

// Get all customers
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];

    if (search) {
      queryText += ' AND (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)';
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get visit history
    const salesResult = await query(
      `SELECT s.* FROM sales s WHERE s.customer_id = $1 ORDER BY s.created_at DESC LIMIT 10`,
      [id]
    );

    res.json({
      ...result.rows[0],
      visit_history: salesResult.rows,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer
router.post('/', authenticate, checkPermission('manage_customers'), async (req: AuthRequest, res) => {
  try {
    const { name, phone, email, preferred_track, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(
      `INSERT INTO customers (name, phone, email, preferred_track, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, phone || null, email || null, preferred_track || null, notes || null]
    );

    await logAudit(req, 'create', 'customer', result.rows[0].id, null, result.rows[0], `Customer created: ${name}`);

    // Email notifications disabled - only login codes and DB backups send emails
    // if (email) {
    //   try {
    //     await sendCustomerWelcomeEmail(email, {
    //       name,
    //       phone: phone || undefined,
    //     });
    //   } catch (emailError) {
    //     console.error('Failed to send customer welcome email:', emailError);
    //     // Don't fail the request if email fails
    //   }
    // }

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', authenticate, checkPermission('manage_customers'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, preferred_track, notes } = req.body;

    const oldResult = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const result = await query(
      `UPDATE customers 
       SET name = $1, phone = $2, email = $3, preferred_track = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, phone || null, email || null, preferred_track || null, notes || null, id]
    );

    await logAudit(req, 'update', 'customer', parseInt(id), oldResult.rows[0], result.rows[0], `Customer updated: ${name}`);

    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', authenticate, checkPermission('manage_customers'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await query('DELETE FROM customers WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'customer', parseInt(id), oldResult.rows[0], null, 'Customer deleted');

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


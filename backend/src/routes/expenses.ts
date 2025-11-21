import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';
import { sendExpenseNotification } from '../utils/email';

const router = express.Router();

// Get all expenses
router.get('/', authenticate, checkPermission('view_expenses'), async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date, category } = req.query;

    let queryText = `
      SELECT e.*, u.full_name as created_by_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (start_date) {
      queryText += ` AND e.date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      queryText += ` AND e.date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (category) {
      queryText += ` AND e.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    queryText += ' ORDER BY e.date DESC, e.created_at DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create expense
router.post('/', authenticate, checkPermission('edit_expenses'), async (req: AuthRequest, res) => {
  try {
    const { date, category, amount, description, vendor, payment_method, is_recurring, recurring_frequency } = req.body;

    if (!date || !category || !amount) {
      return res.status(400).json({ error: 'Date, category, and amount are required' });
    }

    const result = await query(
      `INSERT INTO expenses (date, category, amount, description, vendor, payment_method, is_recurring, recurring_frequency, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [date, category, amount, description || null, vendor || null, payment_method || null, is_recurring || false, recurring_frequency || null, req.user!.id]
    );

    await logAudit(req, 'create', 'expense', result.rows[0].id, null, result.rows[0], `Expense created: ${category} - ₹${amount}`);

    // Send email notification to main admin
    try {
      const adminResult = await query(
        `SELECT u.email, ns.notify_on_expense 
         FROM users u
         LEFT JOIN notification_settings ns ON u.id = ns.user_id
         WHERE u.role = 'main_admin' AND (ns.notify_on_expense IS NULL OR ns.notify_on_expense = true)`
      );

      // Email notifications disabled - only login codes and DB backups send emails
      // for (const admin of adminResult.rows) {
      //   await sendExpenseNotification(admin.email, {
      //     category,
      //     amount: parseFloat(amount),
      //     date: new Date(date).toLocaleDateString(),
      //     description,
      //     enteredBy: req.user!.full_name,
      //   });
      // }
    } catch (emailError) {
      console.error('Failed to send expense notification:', emailError);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticate, checkPermission('edit_expenses'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { date, category, amount, description, vendor, payment_method, is_recurring, recurring_frequency } = req.body;

    const oldResult = await query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const result = await query(
      `UPDATE expenses 
       SET date = $1, category = $2, amount = $3, description = $4, vendor = $5, 
           payment_method = $6, is_recurring = $7, recurring_frequency = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [date, category, amount, description || null, vendor || null, payment_method || null, is_recurring || false, recurring_frequency || null, id]
    );

    await logAudit(req, 'update', 'expense', parseInt(id), oldResult.rows[0], result.rows[0], `Expense updated: ${category}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticate, checkPermission('edit_expenses'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await query('DELETE FROM expenses WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'expense', parseInt(id), oldResult.rows[0], null, 'Expense deleted');

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


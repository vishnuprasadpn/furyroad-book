import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';

const router = express.Router();

// Get all menu items
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM menu_items ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get menu item by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create menu item
router.post('/', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { name, category, price, cost, tax_rate, description, is_available } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const result = await query(
      `INSERT INTO menu_items (name, category, price, cost, tax_rate, description, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, category, price, cost || null, tax_rate || 0, description || null, is_available !== false]
    );

    await logAudit(req, 'create', 'menu_item', result.rows[0].id, null, result.rows[0], `Menu item created: ${name}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu item
router.put('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, cost, tax_rate, description, is_available } = req.body;

    const oldResult = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const result = await query(
      `UPDATE menu_items 
       SET name = $1, category = $2, price = $3, cost = $4, tax_rate = $5, 
           description = $6, is_available = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, category, price, cost || null, tax_rate || 0, description || null, is_available !== false, id]
    );

    await logAudit(req, 'update', 'menu_item', parseInt(id), oldResult.rows[0], result.rows[0], `Menu item updated: ${name}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu item
router.delete('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await query('DELETE FROM menu_items WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'menu_item', parseInt(id), oldResult.rows[0], null, 'Menu item deleted');

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


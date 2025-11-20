import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';

const router = express.Router();

// Get all services
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT s.*, t.name as track_name, c.name as car_name, c.model as car_model
       FROM services s
       LEFT JOIN rc_tracks t ON s.track_id = t.id
       LEFT JOIN rc_cars c ON s.car_id = c.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT s.*, t.name as track_name, c.name as car_name, c.model as car_model
       FROM services s
       LEFT JOIN rc_tracks t ON s.track_id = t.id
       LEFT JOIN rc_cars c ON s.car_id = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create service
router.post('/', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { name, type, track_id, car_id, duration_minutes, base_price, cost, description, is_active } = req.body;

    if (!name || !type || !base_price) {
      return res.status(400).json({ error: 'Name, type, and base_price are required' });
    }

    const result = await query(
      `INSERT INTO services (name, type, track_id, car_id, duration_minutes, base_price, cost, description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, type, track_id || null, car_id || null, duration_minutes || null, base_price, cost || null, description || null, is_active !== false]
    );

    await logAudit(req, 'create', 'service', result.rows[0].id, null, result.rows[0], `Service created: ${name}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service
router.put('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, type, track_id, car_id, duration_minutes, base_price, cost, description, is_active } = req.body;

    const oldResult = await query('SELECT * FROM services WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const result = await query(
      `UPDATE services 
       SET name = $1, type = $2, track_id = $3, car_id = $4, duration_minutes = $5, base_price = $6, 
           cost = $7, description = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, type, track_id || null, car_id || null, duration_minutes || null, base_price, cost || null, description || null, is_active !== false, id]
    );

    await logAudit(req, 'update', 'service', parseInt(id), oldResult.rows[0], result.rows[0], `Service updated: ${name}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service
router.delete('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM services WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await query('DELETE FROM services WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'service', parseInt(id), oldResult.rows[0], null, 'Service deleted');

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


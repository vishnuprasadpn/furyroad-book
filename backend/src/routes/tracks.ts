import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';

const router = express.Router();

// Get all tracks
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM rc_tracks ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create track
router.post('/', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { name, description, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(
      `INSERT INTO rc_tracks (name, description, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, is_active !== false]
    );

    await logAudit(req, 'create', 'rc_track', result.rows[0].id, null, result.rows[0], `Track created: ${name}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update track
router.put('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const oldResult = await query('SELECT * FROM rc_tracks WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const result = await query(
      `UPDATE rc_tracks 
       SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description || null, is_active !== false, id]
    );

    await logAudit(req, 'update', 'rc_track', parseInt(id), oldResult.rows[0], result.rows[0], `Track updated: ${name}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


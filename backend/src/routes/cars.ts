import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';

const router = express.Router();

// Get all cars
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { track_id } = req.query;
    let queryText = `
      SELECT c.*, t.name as track_name
      FROM rc_cars c
      LEFT JOIN rc_tracks t ON c.track_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (track_id) {
      queryText += ' AND c.track_id = $1';
      params.push(track_id);
    }

    queryText += ' ORDER BY c.track_id, c.name';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get car by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT c.*, t.name as track_name
       FROM rc_cars c
       LEFT JOIN rc_tracks t ON c.track_id = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create car
router.post('/', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const {
      name,
      model,
      track_id,
      base_price,
      duration_minutes,
      description,
      image_url,
      is_active,
      china_rate_usd,
      indian_conversion,
      shipping_cost,
      available_units,
      total_units,
      our_rate,
      rate_difference,
      hourly_charge,
      max_minutes,
      play_minutes,
    } = req.body;

    if (!name || base_price === undefined || base_price === null) {
      return res.status(400).json({ error: 'Name and base price are required' });
    }

    const result = await query(
      `INSERT INTO rc_cars (
        name, model, track_id, base_price, duration_minutes, description, image_url, is_active,
        china_rate_usd, indian_conversion, shipping_cost, available_units, total_units, our_rate,
        rate_difference, hourly_charge, max_minutes, play_minutes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        name,
        model || null,
        track_id || null,
        base_price,
        duration_minutes || null,
        description || null,
        image_url || null,
        is_active !== false,
        china_rate_usd || null,
        indian_conversion || null,
        shipping_cost || null,
        available_units ?? null,
        total_units ?? null,
        our_rate || null,
        rate_difference || null,
        hourly_charge || null,
        max_minutes || null,
        play_minutes || null,
      ]
    );

    await logAudit(req, 'create', 'rc_car', result.rows[0].id, null, result.rows[0], `Car created: ${name}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update car
router.put('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      model,
      track_id,
      base_price,
      duration_minutes,
      description,
      image_url,
      is_active,
      china_rate_usd,
      indian_conversion,
      shipping_cost,
      available_units,
      total_units,
      our_rate,
      rate_difference,
      hourly_charge,
      max_minutes,
      play_minutes,
    } = req.body;

    const oldResult = await query('SELECT * FROM rc_cars WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const result = await query(
      `UPDATE rc_cars 
       SET name = $1, model = $2, track_id = $3, base_price = $4, duration_minutes = $5, 
           description = $6, image_url = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP,
           china_rate_usd = $9, indian_conversion = $10, shipping_cost = $11, available_units = $12,
           total_units = $13, our_rate = $14, rate_difference = $15, hourly_charge = $16,
           max_minutes = $17, play_minutes = $18
       WHERE id = $19
       RETURNING *`,
      [
        name,
        model || null,
        track_id || null,
        base_price,
        duration_minutes || null,
        description || null,
        image_url || null,
        is_active !== false,
        china_rate_usd || null,
        indian_conversion || null,
        shipping_cost || null,
        available_units ?? null,
        total_units ?? null,
        our_rate || null,
        rate_difference || null,
        hourly_charge || null,
        max_minutes || null,
        play_minutes || null,
        id,
      ]
    );

    await logAudit(req, 'update', 'rc_car', parseInt(id), oldResult.rows[0], result.rows[0], `Car updated: ${name}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete car
router.delete('/:id', authenticate, checkPermission('manage_prices'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM rc_cars WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    await query('DELETE FROM rc_cars WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'rc_car', parseInt(id), oldResult.rows[0], null, 'Car deleted');

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


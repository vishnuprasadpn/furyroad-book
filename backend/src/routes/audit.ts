import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest, requireMainAdmin } from '../middleware/auth';

const router = express.Router();

// Get audit logs (main admin only)
router.get('/', authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date, entity_type, user_id, action_type } = req.query;

    let queryText = `
      SELECT al.*, u.username, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (start_date) {
      queryText += ` AND al.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      queryText += ` AND al.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (entity_type) {
      queryText += ` AND al.entity_type = $${paramCount}`;
      params.push(entity_type);
      paramCount++;
    }

    if (user_id) {
      queryText += ` AND al.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (action_type) {
      queryText += ` AND al.action_type = $${paramCount}`;
      params.push(action_type);
      paramCount++;
    }

    queryText += ' ORDER BY al.created_at DESC LIMIT 500';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


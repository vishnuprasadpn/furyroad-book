import { query } from '../db/connection';
import { AuthRequest } from '../middleware/auth';

export const logAudit = async (
  req: AuthRequest,
  actionType: string,
  entityType: string,
  entityId?: number,
  oldValues?: any,
  newValues?: any,
  description?: string
) => {
  if (!req.user) return;

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    await query(
      `INSERT INTO audit_logs 
       (user_id, action_type, entity_type, entity_id, old_values, new_values, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        req.user.id,
        actionType,
        entityType,
        entityId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        description,
        ipAddress,
        userAgent,
      ]
    );
  } catch (error) {
    console.error('Failed to log audit:', error);
    // Don't throw - audit logging should not break the main flow
  }
};


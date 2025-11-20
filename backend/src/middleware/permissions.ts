import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { query } from '../db/connection';

export const checkPermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Main admin has all permissions
    if (req.user.role === 'main_admin') {
      return next();
    }

    // Staff has limited permissions
    if (req.user.role === 'staff') {
      // Staff can only make sales and view limited customer info
      if (permission === 'make_sale' || permission === 'view_customer_basic') {
        return next();
      }
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Secondary admin - check permissions
    if (req.user.role === 'secondary_admin') {
      const result = await query(
        'SELECT * FROM admin_permissions WHERE user_id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Permissions not configured' });
      }

      const permissions = result.rows[0];
      
      // Map permission strings to database columns
      const permissionMap: Record<string, string> = {
        'view_expenses': 'can_view_expenses',
        'edit_expenses': 'can_edit_expenses',
        'view_inventory': 'can_view_inventory',
        'edit_inventory': 'can_edit_inventory',
        'manage_prices': 'can_manage_prices',
        'manage_offers': 'can_manage_offers',
        'view_investments': 'can_view_investments',
        'edit_investments': 'can_edit_investments',
        'manage_customers': 'can_manage_customers',
        'manage_tasks': 'can_manage_tasks',
      };

      const dbPermission = permissionMap[permission];
      if (dbPermission && permissions[dbPermission]) {
        return next();
      }

      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};


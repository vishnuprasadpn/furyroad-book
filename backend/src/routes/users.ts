import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/connection';
import { authenticate, AuthRequest, requireMainAdmin } from '../middleware/auth';
import { logAudit } from '../utils/audit';
import { sendUserWelcomeEmail, sendPasswordResetEmail } from '../utils/email';

const router = express.Router();

// Get all users (main admin only)
router.get('/', authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, u.is_active, u.created_at,
              ap.*
       FROM users u
       LEFT JOIN admin_permissions ap ON u.id = ap.user_id
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (main admin only)
router.post('/', authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const { username, email, password, full_name, role, permissions } = req.body;

    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['secondary_admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await (await import('../db/connection')).default.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, full_name, role, is_active`,
        [username, email, hashedPassword, full_name, role]
      );

      const user = userResult.rows[0];

      // Create permissions for secondary admin
      if (role === 'secondary_admin' && permissions) {
        await client.query(
          `INSERT INTO admin_permissions 
           (user_id, can_view_expenses, can_edit_expenses, can_view_inventory, can_edit_inventory,
            can_manage_prices, can_manage_offers, can_view_investments, can_edit_investments,
            can_manage_customers, can_manage_tasks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            user.id,
            permissions.can_view_expenses || false,
            permissions.can_edit_expenses || false,
            permissions.can_view_inventory !== false,
            permissions.can_edit_inventory || false,
            permissions.can_manage_prices || false,
            permissions.can_manage_offers || false,
            permissions.can_view_investments || false,
            permissions.can_edit_investments || false,
            permissions.can_manage_customers !== false,
            permissions.can_manage_tasks !== false,
          ]
        );
      }

      // Create notification settings
      await client.query(
        `INSERT INTO notification_settings (user_id) VALUES ($1)`,
        [user.id]
      );

      await client.query('COMMIT');

      await logAudit(req, 'create', 'user', user.id, null, user, `Created ${role}: ${username}`);

      // Send welcome email
      try {
        await sendUserWelcomeEmail(email, {
          username,
          fullName: full_name,
          role,
          password: password, // Send password only on creation
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json(user);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (main admin only)
router.put('/:id', authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { username, email, full_name, role, is_active, permissions } = req.body;

    const oldUserResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (oldUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldUser = oldUserResult.rows[0];

    // Prevent modifying main admin's role or is_active status
    if (oldUser.role === 'main_admin') {
      if (role !== 'main_admin') {
        return res.status(400).json({ error: 'Cannot change main admin role' });
      }
      if (is_active === false) {
        return res.status(400).json({ error: 'Main admin account must always be active' });
      }
    }

    const client = await (await import('../db/connection')).default.connect();
    try {
      await client.query('BEGIN');

      // For main admin, always set is_active to true
      const finalIsActive = oldUser.role === 'main_admin' ? true : is_active;

      await client.query(
        `UPDATE users 
         SET username = $1, email = $2, full_name = $3, role = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [username, email, full_name, role, finalIsActive, id]
      );

      // Update permissions for secondary admin
      if (role === 'secondary_admin' && permissions) {
        const permResult = await client.query(
          'SELECT id FROM admin_permissions WHERE user_id = $1',
          [id]
        );

        if (permResult.rows.length > 0) {
          await client.query(
            `UPDATE admin_permissions 
             SET can_view_expenses = $1, can_edit_expenses = $2, can_view_inventory = $3, can_edit_inventory = $4,
                 can_manage_prices = $5, can_manage_offers = $6, can_view_investments = $7, can_edit_investments = $8,
                 can_manage_customers = $9, can_manage_tasks = $10, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $11`,
            [
              permissions.can_view_expenses || false,
              permissions.can_edit_expenses || false,
              permissions.can_view_inventory !== false,
              permissions.can_edit_inventory || false,
              permissions.can_manage_prices || false,
              permissions.can_manage_offers || false,
              permissions.can_view_investments || false,
              permissions.can_edit_investments || false,
              permissions.can_manage_customers !== false,
              permissions.can_manage_tasks !== false,
              id,
            ]
          );
        } else {
          await client.query(
            `INSERT INTO admin_permissions 
             (user_id, can_view_expenses, can_edit_expenses, can_view_inventory, can_edit_inventory,
              can_manage_prices, can_manage_offers, can_view_investments, can_edit_investments,
              can_manage_customers, can_manage_tasks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              id,
              permissions.can_view_expenses || false,
              permissions.can_edit_expenses || false,
              permissions.can_view_inventory !== false,
              permissions.can_edit_inventory || false,
              permissions.can_manage_prices || false,
              permissions.can_manage_offers || false,
              permissions.can_view_investments || false,
              permissions.can_edit_investments || false,
              permissions.can_manage_customers !== false,
              permissions.can_manage_tasks !== false,
            ]
          );
        }
      }

      await client.query('COMMIT');

      const newUser = { ...oldUser, username, email, full_name, role, is_active };
      await logAudit(req, 'update', 'user', parseInt(id), oldUser, newUser, `Updated user: ${username}`);

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password (main admin only - can reset any user's password)
router.post('/:id/reset-password', authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const userResult = await query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      id,
    ]);

    await logAudit(req, 'password_reset', 'user', parseInt(id), null, null, `Password reset for user: ${user.username}`);

    // Send email notification for password reset
    // For main admin, send to admin email; for others, send to their email
    try {
      const emailToSend = user.role === 'main_admin' 
        ? process.env.ADMIN_EMAIL || 'vishnuprasad1990@gmail.com'
        : user.email;
      
      await sendPasswordResetEmail(emailToSend, {
        username: user.username,
        isMainAdmin: user.role === 'main_admin',
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete/Deactivate user (main admin only)
router.delete('/:id', authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating the main admin
    const userCheck = await query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userCheck.rows[0].role === 'main_admin') {
      return res.status(400).json({ error: 'Cannot deactivate main admin account' });
    }

    const result = await query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );

    await logAudit(req, 'deactivate', 'user', parseInt(id), result.rows[0], null, 'User deactivated');

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


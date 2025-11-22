import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireMainAdmin } from '../middleware/auth';
import { logAudit } from '../utils/audit';
import { sendLoginCodeEmail } from '../utils/email';

const router = express.Router();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const loginCodeTTLMinutes = parseInt(process.env.LOGIN_CODE_TTL_MINUTES || '10', 10);
const JWT_SECRET = (process.env.JWT_SECRET || 'secret') as jwt.Secret;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

// Request login code
router.post('/request-code', async (req, res) => {
  try {
    const rawEmail = req.body.email;
    if (!rawEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const email = normalizeEmail(rawEmail);
    const userResult = await query(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not registered. Contact main admin to create your access.' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive. Contact main admin.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await query(
      `INSERT INTO login_codes (user_id, email, code, expires_at) 
       VALUES ($1, $2, $3, NOW() + ($4 || ' minutes')::interval)`,
      [user.id, user.email.toLowerCase(), code, loginCodeTTLMinutes.toString()]
    );

    // Try to send email, but don't fail the request if email fails
    try {
      await sendLoginCodeEmail(user.email, {
        fullName: user.full_name,
        code,
        expiresInMinutes: loginCodeTTLMinutes,
      });
    } catch (emailError) {
      console.error('Failed to send login code email:', emailError);
      // Continue - code is still saved in database
    }

    res.json({ message: 'Login code sent to your email.' });
  } catch (error) {
    console.error('Request login code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login with code or password
router.post('/login', async (req, res) => {
  try {
    const { email: rawEmail, code, password } = req.body;

    if (!rawEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!code && !password) {
      return res.status(400).json({ error: 'Either code or password is required' });
    }

    if (code && password) {
      return res.status(400).json({ error: 'Provide either code or password, not both' });
    }

    const email = normalizeEmail(rawEmail);
    const result = await query(
      'SELECT id, username, email, full_name, role, is_active, password_hash FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Login with password
    if (password) {
      if (!user.password_hash) {
        return res.status(401).json({ error: 'Password not set. Use login code or contact admin.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }
    // Login with code
    else if (code) {
      const codeResult = await query(
        `SELECT id
         FROM login_codes
         WHERE user_id = $1
           AND code = $2
           AND used = false
           AND expires_at >= NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [user.id, code]
      );

      if (codeResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired code. Request a new one.' });
      }

      await query('UPDATE login_codes SET used = true WHERE id = $1', [codeResult.rows[0].id]);
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, u.is_active,
              ap.*
       FROM users u
       LEFT JOIN admin_permissions ap ON u.id = ap.user_id
       WHERE u.id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      permissions: user.user_id ? {
        can_view_expenses: user.can_view_expenses,
        can_edit_expenses: user.can_edit_expenses,
        can_view_inventory: user.can_view_inventory,
        can_edit_inventory: user.can_edit_inventory,
        can_manage_prices: user.can_manage_prices,
        can_manage_offers: user.can_manage_offers,
        can_view_investments: user.can_view_investments,
        can_edit_investments: user.can_edit_investments,
        can_manage_customers: user.can_manage_customers,
        can_manage_tasks: user.can_manage_tasks,
      } : null,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.id]
    );

    const user = result.rows[0];
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      req.user!.id,
    ]);

    await logAudit(req, 'password_change', 'user', req.user!.id, null, null, 'Password changed');

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


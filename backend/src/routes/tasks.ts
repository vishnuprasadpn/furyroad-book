import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { logAudit } from '../utils/audit';
import { sendTaskReminder, sendTaskActionEmail } from '../utils/email';

const router = express.Router();
const MAIN_ADMIN_EMAIL = process.env.MAIN_ADMIN_EMAIL || 'vishnuprasad1990@gmail.com';

const getUserById = async (id?: number | null) => {
  if (!id) return null;
  const result = await query('SELECT id, email, full_name FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const notifyTaskAction = async (
  task: any,
  action: 'created' | 'updated' | 'completed' | 'deleted',
  actorName?: string
) => {
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : null;

  // Email notifications disabled - only login codes and DB backups send emails
  // try {
  //   if (task.assignee_id) {
  //     const assignee = await getUserById(task.assignee_id);
  //     if (assignee?.email) {
  //       await sendTaskActionEmail(assignee.email, {
  //         title: task.title,
  //         description: task.description || '',
  //         dueDate,
  //         priority: task.priority,
  //         action,
  //         actorName,
  //         audience: 'assignee',
  //       });
  //     }
  //   }

  //   if (MAIN_ADMIN_EMAIL) {
  //     await sendTaskActionEmail(MAIN_ADMIN_EMAIL, {
  //       title: task.title,
  //       description: task.description || '',
  //       dueDate,
  //       priority: task.priority,
  //       action,
  //       actorName,
  //       audience: 'admin',
  //     });
  //   }
  } catch (error) {
    console.error(`Failed to send task ${action} notifications:`, error);
  }
};

// Get all tasks
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, assignee_id, creator_id } = req.query;

    let queryText = `
      SELECT t.*, 
             u1.full_name as assignee_name,
             u2.full_name as creator_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assignee_id = u1.id
      LEFT JOIN users u2 ON t.creator_id = u2.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Staff can only see tasks assigned to them
    if (req.user!.role === 'staff') {
      queryText += ` AND t.assignee_id = $${paramCount}`;
      params.push(req.user!.id);
      paramCount++;
    } else {
      if (assignee_id) {
        queryText += ` AND t.assignee_id = $${paramCount}`;
        params.push(assignee_id);
        paramCount++;
      }

      if (creator_id) {
        queryText += ` AND t.creator_id = $${paramCount}`;
        params.push(creator_id);
        paramCount++;
      }
    }

    if (status) {
      queryText += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    queryText += ' ORDER BY t.due_date ASC, t.created_at DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assignable users (main/secondary admins with permission)
router.get('/assignees', authenticate, checkPermission('manage_tasks'), async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, role 
       FROM users 
       WHERE is_active = true
       ORDER BY full_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get task assignees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT t.*, 
              u1.full_name as assignee_name,
              u2.full_name as creator_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assignee_id = u1.id
       LEFT JOIN users u2 ON t.creator_id = u2.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    const task = result.rows[0];
    if (req.user!.role === 'staff' && task.assignee_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post('/', authenticate, checkPermission('manage_tasks'), async (req: AuthRequest, res) => {
  try {
    const { title, description, assignee_id, due_date, priority } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await query(
      `INSERT INTO tasks (title, description, assignee_id, creator_id, due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || null, assignee_id || null, req.user!.id, due_date || null, priority || 'medium']
    );

    const task = result.rows[0];

    // Create reminders if due_date is set
    if (due_date) {
      const dueDate = new Date(due_date);
      const reminder24h = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
      const reminder1h = new Date(dueDate.getTime() - 60 * 60 * 1000);

      await query(
        `INSERT INTO task_reminders (task_id, reminder_time) VALUES ($1, $2), ($3, $4)`,
        [task.id, reminder24h, task.id, reminder1h]
      );
    }

    await logAudit(req, 'create', 'task', task.id, null, task, `Task created: ${title}`);

    await notifyTaskAction(
      task,
      'created',
      req.user?.full_name || req.user?.username
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignee_id, due_date, priority, status } = req.body;

    const oldResult = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = oldResult.rows[0];

    // Check permissions
    if (req.user!.role === 'staff' && oldTask.assignee_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const completed_at = status === 'completed' && oldTask.status !== 'completed' 
      ? new Date() 
      : status !== 'completed' 
        ? null 
        : oldTask.completed_at;

    const result = await query(
      `UPDATE tasks 
       SET title = $1, description = $2, assignee_id = $3, due_date = $4, priority = $5, 
           status = $6, completed_at = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description || null, assignee_id || null, due_date || null, priority || 'medium', status || 'pending', completed_at, id]
    );

    const updatedTask = result.rows[0];

    await logAudit(req, 'update', 'task', parseInt(id), oldTask, updatedTask, `Task updated: ${title}`);

    const action: 'updated' | 'completed' =
      updatedTask.status === 'completed' ? 'completed' : 'updated';

    await notifyTaskAction(
      updatedTask,
      action,
      req.user?.full_name || req.user?.username
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authenticate, checkPermission('manage_tasks'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const oldResult = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);

    await logAudit(req, 'delete', 'task', parseInt(id), oldResult.rows[0], null, 'Task deleted');

    await notifyTaskAction(
      oldResult.rows[0],
      'deleted',
      req.user?.full_name || req.user?.username
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


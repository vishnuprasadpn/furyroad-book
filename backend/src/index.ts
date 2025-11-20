import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { query } from './db/connection';
import { sendExpenseSummary, sendTaskReminder, sendTaskOverdueEmail, sendDatabaseBackupEmail } from './utils/email';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MAIN_ADMIN_EMAIL = process.env.MAIN_ADMIN_EMAIL || 'vishnuprasad1990@gmail.com';
const execAsync = promisify(exec);

const getDbConnectionString = () => {
  if (process.env.DB_URL) {
    return process.env.DB_URL;
  }

  const user = encodeURIComponent(process.env.DB_USER || 'postgres');
  const password = encodeURIComponent(process.env.DB_PASSWORD || 'postgres');
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const db = process.env.DB_NAME || 'rc_cafe';
  return `postgresql://${user}:${password}@${host}:${port}/${db}`;
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import customerRoutes from './routes/customers';
import serviceRoutes from './routes/services';
import menuRoutes from './routes/menu';
import trackRoutes from './routes/tracks';
import carRoutes from './routes/cars';
import packageRoutes from './routes/packages';
import saleRoutes from './routes/sales';
import expenseRoutes from './routes/expenses';
import taskRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import auditRoutes from './routes/audit';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Scheduled tasks
// Send expense summaries (weekly on Monday at 9 AM)
cron.schedule('0 9 * * 1', async () => {
  try {
    const users = await query(
      `SELECT u.id, u.email, u.role, ns.expense_summary_frequency
       FROM users u
       LEFT JOIN notification_settings ns ON u.id = ns.user_id
       WHERE u.role IN ('main_admin', 'secondary_admin')
       AND (ns.expense_summary_frequency = 'weekly' OR ns.expense_summary_frequency IS NULL)`
    );

    for (const user of users.rows) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekEnd = new Date();

      const expenses = await query(
        `SELECT category, SUM(amount) as total
         FROM expenses
         WHERE date >= $1 AND date <= $2
         GROUP BY category`,
        [weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
      );

      const totalExpenses = expenses.rows.reduce((sum: number, row: any) => sum + parseFloat(row.total), 0);

      if (totalExpenses > 0) {
        await sendExpenseSummary(user.email, {
          period: `Week of ${weekStart.toLocaleDateString()}`,
          totalExpenses,
          categories: expenses.rows.map((r: any) => ({
            category: r.category,
            amount: parseFloat(r.total),
          })),
        });
      }
    }
  } catch (error) {
    console.error('Error sending weekly expense summaries:', error);
  }
});

// Send task reminders (every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const reminders = await query(
      `SELECT tr.*, t.title, t.description, t.due_date, t.priority, u.email, u.full_name
       FROM task_reminders tr
       JOIN tasks t ON tr.task_id = t.id
       JOIN users u ON t.assignee_id = u.id
       WHERE tr.is_sent = false
       AND tr.reminder_time <= NOW()
       AND t.status NOT IN ('completed', 'cancelled')`
    );

    for (const reminder of reminders.rows) {
      try {
        await sendTaskReminder(reminder.email, {
          title: reminder.title,
          description: reminder.description,
          dueDate: new Date(reminder.due_date).toLocaleString(),
          priority: reminder.priority,
        });

        await query(
          'UPDATE task_reminders SET is_sent = true, sent_at = NOW() WHERE id = $1',
          [reminder.id]
        );
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing task reminders:', error);
  }
});

// Overdue task notifications (every 30 minutes)
cron.schedule('*/30 * * * *', async () => {
  try {
    const overdueTasks = await query(
      `SELECT t.*, u.email as assignee_email, u.full_name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.due_date IS NOT NULL
         AND t.status NOT IN ('completed', 'cancelled')
         AND t.due_date < NOW()
         AND NOT EXISTS (
           SELECT 1 FROM overdue_task_notifications otn
           WHERE otn.task_id = t.id
         )`
    );

    for (const task of overdueTasks.rows) {
      try {
        // Notify assignee if available
        if (task.assignee_email) {
          await sendTaskOverdueEmail(task.assignee_email, {
            title: task.title,
            description: task.description || '',
            dueDate: new Date(task.due_date).toLocaleString(),
            priority: task.priority,
            assigneeName: task.assignee_name,
          });
        }

        // Notify main admin
        const mainAdminEmail = process.env.MAIN_ADMIN_EMAIL || 'vishnuprasad1990@gmail.com';
        await sendTaskOverdueEmail(mainAdminEmail, {
          title: task.title,
          description: task.description || '',
          dueDate: new Date(task.due_date).toLocaleString(),
          priority: task.priority,
          isMainAdmin: true,
        });

        await query(
          `INSERT INTO overdue_task_notifications (task_id, assignee_notified, main_admin_notified)
           VALUES ($1, $2, $3)`,
          [task.id, !!task.assignee_email, true]
        );
      } catch (notifyErr) {
        console.error(`Failed to send overdue notifications for task ${task.id}:`, notifyErr);
      }
    }
  } catch (error) {
    console.error('Error sending overdue task notifications:', error);
  }
});

// Database backup every 2 days at 03:00
cron.schedule('0 3 */2 * *', async () => {
  try {
    const connectionString = getDbConnectionString();
    const backupName = `furyroad-db-backup-${new Date().toISOString().split('T')[0]}.sql`;
    const { stdout } = await execAsync(`pg_dump "${connectionString}"`, {
      maxBuffer: 1024 * 1024 * 100, // 100 MB
    });

    await sendDatabaseBackupEmail(MAIN_ADMIN_EMAIL, {
      backupContent: stdout,
      fileName: backupName,
      generatedAt: new Date().toLocaleString(),
    });

    console.log('Database backup emailed to main admin');
  } catch (error) {
    console.error('Error creating/sending database backup:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});


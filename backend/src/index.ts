import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { query } from './db/connection';
import { sendDatabaseBackupEmail } from './utils/email';
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
app.use(cors({
  origin: [
    'https://frontend-1ggbjdd3c-furyroad-rcs-projects.vercel.app',
    'https://furyroad-rcs-projects.vercel.app',
    /\.vercel\.app$/,
    'http://localhost:3000'
  ],
  credentials: true
}));
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
// Disabled: Expense summaries, task reminders, and overdue task notifications
// Only login codes and database backups will send emails

// Database backup weekly (every Monday at 03:00)
cron.schedule('0 3 * * 1', async () => {
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


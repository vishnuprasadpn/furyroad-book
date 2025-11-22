import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

// Middleware
app.use(cors({
  origin: [
    /\.vercel\.app$/,
    /\.fly\.dev$/,
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
// Disabled: Expense summaries, task reminders, overdue task notifications, and database backup emails
// Only login codes, welcome emails, and sale notifications send emails

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});


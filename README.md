# RC Café Management System

A comprehensive web application for managing an RC Café business, including sales, services, inventory, expenses, customer management, and task tracking.

## Features

- **Role-Based Access Control**: Main Admin, Secondary Admin (Partners), and Staff roles with granular permissions
- **Point of Sale (POS)**: Staff-friendly interface for processing sales
- **Customer Management**: Track customer information and visit history
- **Service & Menu Management**: Manage RC tracks, games, and café menu items
- **Sales & Billing**: Complete sales tracking with multiple payment methods
- **Expense Management**: Track and categorize business expenses
- **Task Management**: Create, assign, and track tasks with email reminders
- **Dashboard & Reports**: Visual analytics and business insights
- **Daybook**: Daily financial entries for reconciliation
- **Audit Logs**: Complete audit trail (Main Admin only)
- **Email Notifications**: Automated notifications for sales, expenses, and task reminders

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Nodemailer for email notifications
- Node-cron for scheduled tasks

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts for data visualization
- Axios for API calls

## Setup Instructions

### Quick Start Options

1. **Local Development with Remote Database** (Recommended)
   - Run frontend and backend locally
   - Connect to remote database (Supabase, Railway, etc.)
   - See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed guide

2. **Full Local Setup**
   - Run everything locally including PostgreSQL
   - See instructions below

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher) - OR remote database (Supabase, etc.)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb rc_cafe
```

2. Update database credentials in `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rc_cafe
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Run database migrations:
```bash
cd backend
npm install
npm run migrate
```

This will:
- Create all necessary tables
- Set up indexes
- Create a default admin user (username: `admin`, password: `admin123`)

**⚠️ IMPORTANT: Change the default admin password after first login!**

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rc_cafe
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=RC Café <noreply@rccafe.com>
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Running Both Together

From the root directory:
```bash
npm install
npm run dev
```

This will start both backend and frontend concurrently.

## User Roles & Permissions

### Main Admin
- Full system access
- Create/edit/deactivate users
- Configure permissions for secondary admins
- View audit logs
- All other admin functions

### Secondary Admin (Partner)
- Permissions granted by main admin
- Can view/edit expenses (if permitted)
- Can manage inventory (if permitted)
- Can manage prices and offers (if permitted)
- Can view investments (if permitted)
- Cannot view audit logs
- Cannot manage other admins

### Staff
- Make sales (POS)
- View limited customer information
- View assigned tasks
- Cannot access financial data
- Cannot manage system settings

## Configuration

### Email Notifications

Configure SMTP settings in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=RC Café <noreply@rccafe.com>
```

**For Gmail**: You'll need to generate an App Password:
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate a password for "Mail"

### Notification Settings

Main admin can configure notification preferences:
- Sales notifications (on/off)
- Expense notifications (on/off)
- Expense summary frequency (daily/weekly/monthly/never)

### Task Reminders

Task reminders are automatically sent:
- 24 hours before due date
- 1 hour before due date

Reminders are processed hourly via cron job.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Users (Main Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Sales
- `GET /api/sales` - List sales (with filters)
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create sale

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Menu Items
- `GET /api/menu` - List menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Tasks
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/daybook` - Get daybook entries

### Audit Logs (Main Admin only)
- `GET /api/audit` - List audit logs (with filters)

## Usage Guide

### Creating a Sale (POS)

1. Navigate to **POS** from the sidebar
2. Search for customer (optional) by phone or name
3. Add services:
   - Select a service
   - If service requires a track, select the track
   - Service is added to cart
4. Add menu items:
   - Click on menu items to add to cart
5. Adjust quantities in cart
6. Select payment method
7. Click "Complete Sale"

### Managing Customers

1. Navigate to **Customers**
2. Search for existing customers or click "Add Customer"
3. Fill in customer details
4. Customers can be linked to sales for tracking visit history

### Managing Services & Menu

1. Navigate to **Services** or **Menu**
2. Click "Add Service" or "Add Menu Item"
3. Fill in details:
   - Services: name, type, track (optional), duration, price
   - Menu items: name, category, price, tax rate
4. Set availability/active status

### Recording Expenses

1. Navigate to **Expenses** (Admin only)
2. Click "Add Expense"
3. Fill in:
   - Date
   - Category
   - Amount
   - Vendor (optional)
   - Payment method
   - Description
4. Mark as recurring if applicable

### Managing Tasks

1. Navigate to **Tasks**
2. Click "Add Task"
3. Fill in:
   - Title (required)
   - Description
   - Assignee
   - Due date
   - Priority
4. Tasks automatically create reminders (24h and 1h before due date)

### Viewing Reports

1. Navigate to **Reports** (Admin only)
2. Select date range
3. View:
   - Sales statistics
   - Revenue breakdown
   - Top services
   - Expense summaries

### Daybook

1. Navigate to **Daybook** (Admin only)
2. Select a date
3. View all financial entries for that day:
   - Sales (revenue)
   - Expenses
   - Net amount

### Audit Logs

1. Navigate to **Audit Logs** (Main Admin only)
2. Filter by:
   - Date range
   - Entity type
   - Action type
3. View complete audit trail of all system changes

## Security Best Practices

1. **Change default admin password** immediately after setup
2. **Use strong JWT secret** in production
3. **Enable HTTPS** in production
4. **Regular database backups**
5. **Keep dependencies updated**
6. **Use environment variables** for sensitive data
7. **Implement rate limiting** (already included for auth endpoints)

## Production Deployment

### Backend

1. Build the TypeScript code:
```bash
cd backend
npm run build
```

2. Set `NODE_ENV=production` in `.env`

3. Use a process manager like PM2:
```bash
pm2 start dist/index.js --name rc-cafe-backend
```

### Frontend

1. Build for production:
```bash
cd frontend
npm run build
```

2. Serve the `dist` folder using a web server (nginx, Apache, etc.)

### Database

1. Ensure PostgreSQL is properly configured
2. Set up regular backups
3. Use connection pooling in production

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Email Notifications Not Working
- Verify SMTP credentials
- Check firewall settings
- For Gmail, ensure App Password is used (not regular password)

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET is set
- Check token expiration settings

## License

This project is proprietary software for RC Café management.

## Support

For issues or questions, contact the development team.


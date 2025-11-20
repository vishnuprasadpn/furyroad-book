import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
  attachments?: { filename: string; content: string | Buffer }[]
) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'FuryRoad RC Club <noreply@furyroadrc.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
      attachments,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendSaleNotification = async (
  to: string,
  saleData: {
    saleNumber: string;
    date: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    staff: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">New Sale Recorded</h2>
      <p><strong>Sale Number:</strong> ${saleData.saleNumber}</p>
      <p><strong>Date:</strong> ${saleData.date}</p>
      <p><strong>Staff:</strong> ${saleData.staff}</p>
      <h3>Items:</h3>
      <ul>
        ${saleData.items.map(item => 
          `<li>${item.name} x ${item.quantity} - ₹${item.price.toFixed(2)}</li>`
        ).join('')}
      </ul>
      <p><strong>Total Amount: ₹${saleData.total.toFixed(2)}</strong></p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, `New Sale: ${saleData.saleNumber}`, html);
};

export const sendExpenseNotification = async (
  to: string,
  expenseData: {
    category: string;
    amount: number;
    date: string;
    description?: string;
    enteredBy: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">New Expense Recorded</h2>
      <p><strong>Category:</strong> ${expenseData.category}</p>
      <p><strong>Amount:</strong> ₹${expenseData.amount.toFixed(2)}</p>
      <p><strong>Date:</strong> ${expenseData.date}</p>
      ${expenseData.description ? `<p><strong>Description:</strong> ${expenseData.description}</p>` : ''}
      <p><strong>Entered By:</strong> ${expenseData.enteredBy}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, `New Expense: ${expenseData.category}`, html);
};

export const sendExpenseSummary = async (
  to: string,
  summaryData: {
    period: string;
    totalExpenses: number;
    categories: Array<{ category: string; amount: number }>;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Expense Summary - ${summaryData.period}</h2>
      <p><strong>Total Expenses:</strong> ₹${summaryData.totalExpenses.toFixed(2)}</p>
      <h3>Breakdown by Category:</h3>
      <ul>
        ${summaryData.categories.map(cat => 
          `<li>${cat.category}: ₹${cat.amount.toFixed(2)}</li>`
        ).join('')}
      </ul>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, `Expense Summary - ${summaryData.period}`, html);
};

export const sendTaskReminder = async (
  to: string,
  taskData: {
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Task Reminder</h2>
      <p><strong>Task:</strong> ${taskData.title}</p>
      ${taskData.description ? `<p><strong>Description:</strong> ${taskData.description}</p>` : ''}
      <p><strong>Due Date:</strong> ${taskData.dueDate}</p>
      <p><strong>Priority:</strong> ${taskData.priority}</p>
      <p style="color: #dc2626;">Please complete this task before the deadline.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, `Task Reminder: ${taskData.title}`, html);
};

export const sendTaskOverdueEmail = async (
  to: string,
  data: {
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
    assigneeName?: string;
    isMainAdmin?: boolean;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Task Overdue Alert</h2>
      <p>${data.isMainAdmin ? 'Main Admin,' : data.assigneeName ? `Hello ${data.assigneeName},` : 'Hello,'}</p>
      <p>The following task is past its due time:</p>
      <p><strong>Task:</strong> ${data.title}</p>
      ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
      <p><strong>Due Date:</strong> ${data.dueDate}</p>
      <p><strong>Priority:</strong> ${data.priority}</p>
      <p style="color: #dc2626;"><strong>Please take action immediately.</strong></p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, `Overdue Task: ${data.title}`, html);
};

export const sendTaskActionEmail = async (
  to: string,
  data: {
    title: string;
    description?: string;
    dueDate?: string | null;
    priority?: string;
    action: 'created' | 'updated' | 'completed' | 'deleted';
    actorName?: string;
    audience?: 'assignee' | 'admin';
  }
) => {
  const actionCopy: Record<string, string> = {
    created: 'has been created',
    updated: 'was updated',
    completed: 'has been completed',
    deleted: 'was deleted',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Task ${data.action === 'created' ? 'Created' : data.action === 'updated' ? 'Updated' : data.action === 'completed' ? 'Completed' : 'Deleted'}</h2>
      <p>${data.audience === 'admin' ? 'Main Admin,' : 'Hello,'}</p>
      <p>The task <strong>${data.title}</strong> ${actionCopy[data.action]}${data.actorName ? ` by ${data.actorName}` : ''}.</p>
      ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
      ${data.dueDate ? `<p><strong>Due Date:</strong> ${data.dueDate}</p>` : ''}
      ${data.priority ? `<p><strong>Priority:</strong> ${data.priority}</p>` : ''}
      ${data.action === 'deleted'
        ? '<p style="color:#dc2626;">This task is no longer active.</p>'
        : '<p style="color:#f97316;">Please review and act accordingly.</p>'}
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, `Task ${data.action}: ${data.title}`, html);
};

export const sendUserWelcomeEmail = async (
  to: string,
  userData: {
    username: string;
    fullName: string;
    role: string;
    password?: string;
  }
) => {
  const roleDisplay = userData.role === 'secondary_admin' ? 'Secondary Admin' : 'Staff';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Welcome to FuryRoad RC Club Management System</h2>
      <p>Hello ${userData.fullName},</p>
      <p>Your account has been created successfully!</p>
      <p><strong>Username:</strong> ${userData.username}</p>
      <p><strong>Role:</strong> ${roleDisplay}</p>
      ${userData.password ? `<p><strong>Temporary Password:</strong> ${userData.password}</p><p style="color: #dc2626;"><strong>Please change your password after first login.</strong></p>` : ''}
      <p>You can now access the management system and start using your account.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, 'Welcome to FuryRoad RC Club Management System', html);
};

export const sendCustomerWelcomeEmail = async (
  to: string,
  customerData: {
    name: string;
    phone?: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Welcome to FuryRoad RC Club!</h2>
      <p>Hello ${customerData.name},</p>
      <p>Thank you for registering with FuryRoad RC Club!</p>
      <p>We're excited to have you as part of our community. You can now enjoy our RC car tracks and café services.</p>
      ${customerData.phone ? `<p><strong>Phone:</strong> ${customerData.phone}</p>` : ''}
      <p>Visit us soon for an amazing RC racing experience!</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, 'Welcome to FuryRoad RC Club!', html);
};

export const sendPasswordResetEmail = async (
  to: string,
  resetData: {
    username: string;
    isMainAdmin?: boolean;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Password Reset Notification</h2>
      ${resetData.isMainAdmin ? (
        `<p><strong>Main Admin Account Password Reset</strong></p>
         <p>The password for the main administrator account has been reset.</p>`
      ) : (
        `<p>Hello,</p>
         <p>The password for user <strong>${resetData.username}</strong> has been reset by the main administrator.</p>`
      )}
      <p style="color: #dc2626;"><strong>If you did not request this password reset, please contact the system administrator immediately.</strong></p>
      <p>For security reasons, please change your password after logging in.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, 'Password Reset Notification - FuryRoad RC Club', html);
};

export const sendLoginCodeEmail = async (
  to: string,
  data: {
    fullName?: string;
    code: string;
    expiresInMinutes: number;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Your FuryRoad RC Club Login Code</h2>
      <p>${data.fullName ? `Hello ${data.fullName},` : 'Hello,'}</p>
      <p>Use the verification code below to securely sign in:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #111827; margin: 24px 0;">
        ${data.code}
      </p>
      <p>This code will expire in ${data.expiresInMinutes} minutes. Do not share it with anyone.</p>
      <p>If you did not initiate this request, please contact the main admin immediately.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(to, 'Your FuryRoad RC Club Login Code', html);
};

export const sendDatabaseBackupEmail = async (
  to: string,
  data: {
    backupContent: string;
    fileName: string;
    generatedAt: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Database Backup Ready</h2>
      <p>The latest FuryRoad RC Club database backup is attached.</p>
      <p><strong>Generated At:</strong> ${data.generatedAt}</p>
      <p>Please download and store it securely.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">FuryRoad RC Club Management System</p>
    </div>
  `;

  return sendEmail(
    to,
    `Database Backup - ${data.generatedAt}`,
    html,
    undefined,
    [
      {
        filename: data.fileName,
        content: data.backupContent,
      },
    ]
  );
};


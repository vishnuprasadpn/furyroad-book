import express from 'express';
import { query } from '../db/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;

    const dateFilter = start_date && end_date 
      ? `WHERE s.created_at >= '${start_date}' AND s.created_at <= '${end_date}'`
      : start_date
        ? `WHERE s.created_at >= '${start_date}'`
        : end_date
          ? `WHERE s.created_at <= '${end_date}'`
          : '';

    // Sales stats
    const salesStats = await query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(SUM(discount_amount), 0) as total_discounts,
        COALESCE(SUM(tax_amount), 0) as total_tax
      FROM sales s
      ${dateFilter}
    `);

    // Sales by service type
    const salesByService = await query(`
      SELECT 
        s.type,
        COUNT(ss.id) as count,
        COALESCE(SUM(ss.total_price), 0) as revenue
      FROM sale_services ss
      JOIN services s ON ss.service_id = s.id
      JOIN sales sa ON ss.sale_id = sa.id
      ${dateFilter.replace('s.created_at', 'sa.created_at')}
      GROUP BY s.type
    `);

    // Sales by menu category
    const salesByCategory = await query(`
      SELECT 
        mi.category,
        COUNT(smi.id) as count,
        COALESCE(SUM(smi.total_price), 0) as revenue
      FROM sale_menu_items smi
      JOIN menu_items mi ON smi.menu_item_id = mi.id
      JOIN sales sa ON smi.sale_id = sa.id
      ${dateFilter.replace('s.created_at', 'sa.created_at')}
      GROUP BY mi.category
    `);

    // Top services
    const topServices = await query(`
      SELECT 
        s.name,
        COUNT(ss.id) as count,
        COALESCE(SUM(ss.total_price), 0) as revenue
      FROM sale_services ss
      JOIN services s ON ss.service_id = s.id
      JOIN sales sa ON ss.sale_id = sa.id
      ${dateFilter.replace('s.created_at', 'sa.created_at')}
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
      LIMIT 10
    `);

    // Expenses (if user has permission)
    let expensesStats = null;
    if (req.user!.role === 'main_admin' || 
        (req.user!.role === 'secondary_admin' && await checkPermission('view_expenses')(req, res, () => {}))) {
      const expenseFilter = start_date && end_date 
        ? `WHERE e.date >= '${start_date}' AND e.date <= '${end_date}'`
        : start_date
          ? `WHERE e.date >= '${start_date}'`
          : end_date
            ? `WHERE e.date <= '${end_date}'`
            : '';

      expensesStats = await query(`
        SELECT 
          COALESCE(SUM(amount), 0) as total_expenses,
          COUNT(*) as expense_count
        FROM expenses e
        ${expenseFilter}
      `);
    }

    // Tasks stats - filtered by user role
    const taskConditions: string[] = [];
    const taskParams: any[] = [];
    if (req.user!.role === 'staff') {
      // Staff only see their own tasks
      taskConditions.push(`assignee_id = $${taskParams.length + 1}`);
      taskParams.push(req.user!.id);
    } else if (req.user!.role === 'secondary_admin') {
      // Secondary admins see their own tasks
      taskConditions.push(`assignee_id = $${taskParams.length + 1}`);
      taskParams.push(req.user!.id);
    }
    // Main admin sees all tasks (no filter)
    
    const tasksStats = await query(
      `
        SELECT status, COUNT(*) as count
        FROM tasks
        ${taskConditions.length ? `WHERE ${taskConditions.join(' AND ')}` : ''}
        GROUP BY status
      `,
      taskParams
    );

    // Get pending tasks for the current user (highlighted section)
    const pendingTasksConditions: string[] = [];
    const pendingTasksParams: any[] = [];
    if (req.user!.role === 'staff' || req.user!.role === 'secondary_admin') {
      pendingTasksConditions.push(`assignee_id = $${pendingTasksParams.length + 1}`);
      pendingTasksParams.push(req.user!.id);
    }
    pendingTasksConditions.push(`status IN ($${pendingTasksParams.length + 1}, $${pendingTasksParams.length + 2})`);
    pendingTasksParams.push('pending', 'in_progress');

    const pendingTasks = await query(
      `
        SELECT 
          t.id,
          t.title,
          t.description,
          t.due_date,
          t.priority,
          t.status,
          t.created_at,
          u.full_name as assignee_name
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE ${pendingTasksConditions.join(' AND ')}
        ORDER BY 
          CASE t.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          t.due_date ASC NULLS LAST,
          t.created_at DESC
        LIMIT 10
      `,
      pendingTasksParams
    );

    // Inventory low stock alerts
    let lowStockItems = null;
    if (req.user!.role !== 'staff') {
      lowStockItems = await query(`
        SELECT name, current_stock, min_stock_level
        FROM inventory_items
        WHERE current_stock <= min_stock_level
        ORDER BY (current_stock - min_stock_level) ASC
        LIMIT 10
      `);
    }

    res.json({
      sales: salesStats.rows[0],
      sales_by_service: salesByService.rows,
      sales_by_category: salesByCategory.rows,
      top_services: topServices.rows,
      expenses: expensesStats?.rows[0] || null,
      tasks: tasksStats.rows,
      pending_tasks: pendingTasks.rows,
      low_stock_items: lowStockItems?.rows || null,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get daybook (all financial entries for a day)
router.get('/daybook', authenticate, checkPermission('view_expenses'), async (req: AuthRequest, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Sales for the day
    const sales = await query(`
      SELECT 
        'sale' as type,
        id,
        sale_number as reference,
        final_amount as amount,
        created_at,
        'Revenue' as description
      FROM sales
      WHERE DATE(created_at) = $1
      ORDER BY created_at
    `, [date]);

    // Expenses for the day
    const expenses = await query(`
      SELECT 
        'expense' as type,
        id,
        category as reference,
        amount,
        date as created_at,
        description
      FROM expenses
      WHERE date = $1
      ORDER BY created_at
    `, [date]);

    res.json({
      date,
      entries: [
        ...sales.rows.map((r: any) => ({ ...r, amount: parseFloat(r.amount) })),
        ...expenses.rows.map((r: any) => ({ ...r, amount: -parseFloat(r.amount) })),
      ].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    });
  } catch (error) {
    console.error('Get daybook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


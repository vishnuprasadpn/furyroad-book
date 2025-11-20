export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'main_admin' | 'secondary_admin' | 'staff';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AdminPermissions {
  id: number;
  user_id: number;
  can_view_expenses: boolean;
  can_edit_expenses: boolean;
  can_view_inventory: boolean;
  can_edit_inventory: boolean;
  can_manage_prices: boolean;
  can_manage_offers: boolean;
  can_view_investments: boolean;
  can_edit_investments: boolean;
  can_manage_customers: boolean;
  can_manage_tasks: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  preferred_track?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RCTrack {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: number;
  name: string;
  type: 'track_session' | 'car_rental' | 'package' | 'other';
  track_id?: number;
  duration_minutes?: number;
  base_price: number;
  cost?: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  cost?: number;
  tax_rate: number;
  description?: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Offer {
  id: number;
  name: string;
  type: 'percentage' | 'fixed' | 'bundle';
  discount_value: number;
  applicable_to: 'service' | 'menu_item' | 'both' | 'all';
  service_ids?: number[];
  menu_item_ids?: number[];
  min_purchase_amount?: number;
  valid_from?: Date;
  valid_until?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  staff_id: number;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  payment_method: 'cash' | 'upi' | 'card' | 'other';
  payment_reference?: string;
  notes?: string;
  created_at: Date;
}

export interface SaleService {
  id: number;
  sale_id: number;
  service_id: number;
  track_id?: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  duration_minutes?: number;
  notes?: string;
}

export interface SaleMenuItem {
  id: number;
  sale_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  unit_cost?: number;
  supplier?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryMovement {
  id: number;
  inventory_item_id: number;
  movement_type: 'purchase' | 'consumption' | 'wastage' | 'adjustment' | 'sale';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_by: number;
  created_at: Date;
}

export interface Expense {
  id: number;
  date: Date;
  category: string;
  amount: number;
  description?: string;
  vendor?: string;
  payment_method?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface Investment {
  id: number;
  partner_id: number;
  transaction_type: 'investment' | 'withdrawal' | 'profit_distribution';
  amount: number;
  description?: string;
  reference_number?: string;
  created_by: number;
  created_at: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  assignee_id?: number;
  creator_id: number;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action_type: string;
  entity_type: string;
  entity_id?: number;
  old_values?: any;
  new_values?: any;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface NotificationSettings {
  id: number;
  user_id: number;
  notify_on_sale: boolean;
  notify_on_expense: boolean;
  expense_summary_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  last_summary_sent?: Date;
  created_at: Date;
  updated_at: Date;
}


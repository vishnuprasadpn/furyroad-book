import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  BarChart3, 
  CheckSquare, 
  ArrowRight,
  Calendar,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeLabel = () => {
    const today = new Date();
    switch (dateRange) {
      case 'today':
        return `Today (${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`;
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'This Month';
      default:
        return 'All Time';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-fury-orange border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#f97316', '#ea580c', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6'];

  const totalRevenue = parseFloat(stats?.sales?.total_revenue || 0);
  const totalExpenses = parseFloat(stats?.expenses?.total_expenses || 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, <span className="text-fury-orange font-semibold">{user?.full_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  dateRange === range
                    ? 'bg-fury-orange text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fury-orange/50">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-fury-orange/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-fury-orange" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Revenue</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">
              ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-400">{getDateRangeLabel()}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">{stats?.sales?.total_sales || 0} transactions</span>
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-blue-500/50">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sales</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">
              {stats?.sales?.total_sales || 0}
            </p>
            <p className="text-xs text-gray-400">Total transactions</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">Active sales</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        {stats?.expenses && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-red-500/50">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Expenses</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">
                ₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-400">{stats.expenses.expense_count || 0} entries</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-gray-400">Tracked expenses</span>
              </div>
            </div>
          </div>
        )}

        {/* Net Profit Card */}
        {stats?.expenses && (
          <div className={`bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all ${
            netProfit >= 0 
              ? 'border-green-500/50 hover:border-green-500/70' 
              : 'border-red-500/50 hover:border-red-500/70'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <TrendingUp className={`w-6 h-6 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Net Profit</span>
            </div>
            <div className="space-y-1">
              <p className={`text-3xl font-bold ${
                netProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-400">Margin: {profitMargin}%</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className={`w-4 h-4 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-gray-400">Profit analysis</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Tasks - Priority Section */}
      {stats?.pending_tasks && stats.pending_tasks.length > 0 && (
        <div className="bg-gradient-to-br from-orange-500/10 via-gray-800 to-gray-800 rounded-xl p-6 border border-orange-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/20 rounded-lg">
                <CheckSquare className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pending Tasks</h2>
                <p className="text-sm text-gray-400">Requires your attention</p>
              </div>
              <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                {stats.pending_tasks.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="btn-primary text-sm flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.pending_tasks.slice(0, 4).map((task: any) => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();
              const priorityConfig: Record<string, { color: string; bg: string; border: string }> = {
                urgent: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500' },
                high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500' },
                medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
                low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500' },
              };
              const config = priorityConfig[task.priority] || priorityConfig.medium;
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${config.border} ${config.bg} ${
                    isOverdue ? 'animate-pulse border-red-500 bg-red-500/20' : ''
                  } hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm flex-1">{task.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ml-2 ${
                      task.priority === 'urgent' ? 'bg-red-500 text-white' :
                      task.priority === 'high' ? 'bg-orange-500 text-white' :
                      task.priority === 'medium' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-300 mb-2 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className={isOverdue ? 'text-red-400 font-semibold' : ''}>
                          {new Date(task.due_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    {isOverdue && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500 text-white">
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Service Type */}
        {stats?.sales_by_service && stats.sales_by_service.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-fury-orange/20 rounded-lg">
                  <PieChart className="w-5 h-5 text-fury-orange" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sales by Service Type</h2>
                  <p className="text-xs text-gray-400">Revenue distribution</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.sales_by_service}
                  dataKey="revenue"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.type}: ₹${entry.revenue.toFixed(0)}`}
                  labelLine={false}
                >
                  {stats.sales_by_service.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb',
                    padding: '12px'
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Services */}
        {stats?.top_services && stats.top_services.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Top Performing Services</h2>
                  <p className="text-xs text-gray-400">Revenue leaders</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_services} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb',
                    padding: '12px'
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#f97316" 
                  radius={[8, 8, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Overview */}
        {stats?.tasks && stats.tasks.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-500/20 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tasks Overview</h2>
                <p className="text-xs text-gray-400">Status breakdown</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.tasks.map((task: any) => (
                <div key={task.status} className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-all">
                  <p className="text-2xl font-bold text-white mb-1">{task.count}</p>
                  <p className="text-xs text-gray-400 capitalize font-medium">{task.status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {stats?.low_stock_items && stats.low_stock_items.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/10 via-gray-800 to-gray-800 rounded-xl p-6 border border-yellow-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Low Stock Alerts</h2>
                <p className="text-xs text-gray-400">Requires restocking</p>
              </div>
            </div>
            <div className="space-y-2">
              {stats.low_stock_items.slice(0, 5).map((item: any) => (
                <div key={item.name} className="flex justify-between items-center p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/10 transition-all">
                  <span className="font-medium text-white text-sm">{item.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-yellow-400">
                      {item.current_stock}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      / {item.min_stock_level} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

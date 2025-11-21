import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, BarChart3, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const COLORS = ['#f97316', '#ea580c', '#fbbf24', '#ef4444', '#e5e7eb'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="FuryRoad RC Club" 
            className="w-14 h-14 object-contain rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            loading="eager"
          />
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.full_name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-fury-orange hover:shadow-lg hover:shadow-fury-orange/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Total Revenue</p>
              <p className="text-4xl font-bold text-fury-orange mb-1">
                ₹{parseFloat(stats?.sales?.total_revenue || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-fury-orange/20 to-fury-orange/10 rounded-xl">
              <DollarSign className="w-10 h-10 text-fury-orange" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-fury-yellow hover:shadow-lg hover:shadow-fury-yellow/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Total Sales</p>
              <p className="text-4xl font-bold text-white mb-1">
                {stats?.sales?.total_sales || 0}
              </p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-fury-yellow/20 to-fury-yellow/10 rounded-xl">
              <ShoppingCart className="w-10 h-10 text-fury-yellow" />
            </div>
          </div>
        </div>

        {stats?.expenses && (
          <div className="card border-l-4 border-fury-red hover:shadow-lg hover:shadow-fury-red/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Total Expenses</p>
                <p className="text-4xl font-bold text-fury-red mb-1">
                  ₹{parseFloat(stats.expenses.total_expenses || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">All expenses</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-fury-red/20 to-fury-red/10 rounded-xl">
                <TrendingUp className="w-10 h-10 text-fury-red" />
              </div>
            </div>
          </div>
        )}

        {stats?.expenses && (
          <div className="card border-l-4 border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Net Profit</p>
                <p className="text-4xl font-bold text-green-500 mb-1">
                  ₹{(
                    parseFloat(stats?.sales?.total_revenue || 0) -
                    parseFloat(stats?.expenses?.total_expenses || 0)
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Revenue - Expenses</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.sales_by_service && stats.sales_by_service.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-fury-orange/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-fury-orange" />
              </div>
              <h2 className="text-xl font-bold text-white">Sales by Service Type</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.sales_by_service}
                  dataKey="revenue"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry: any) => `${entry.type}: ₹${entry.revenue.toFixed(2)}`}
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
                    color: '#f9fafb'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.top_services && stats.top_services.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-fury-yellow/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-fury-yellow" />
              </div>
              <h2 className="text-xl font-bold text-white">Top Services</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.top_services}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tasks Overview & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.tasks && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Tasks Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.tasks.map((task: any) => (
                <div key={task.status} className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <p className="text-3xl font-bold text-white mb-1">{task.count}</p>
                  <p className="text-xs text-gray-400 capitalize font-medium">{task.status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {stats?.low_stock_items && stats.low_stock_items.length > 0 && (
          <div className="card border-l-4 border-fury-yellow">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-fury-yellow/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-fury-yellow" />
              </div>
              <h2 className="text-xl font-bold text-white">Low Stock Alerts</h2>
            </div>
            <div className="space-y-3">
              {stats.low_stock_items.map((item: any) => (
                <div key={item.name} className="flex justify-between items-center p-3 bg-gradient-to-r from-fury-yellow/10 to-fury-yellow/5 rounded-lg border border-fury-yellow/30">
                  <span className="font-semibold text-white">{item.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-fury-yellow">
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


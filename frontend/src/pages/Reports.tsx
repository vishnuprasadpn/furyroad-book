import { useState, useEffect } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/dashboard/stats?${params.toString()}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <div className="flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            placeholder="From Date"
            title="From Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            placeholder="To Date"
            title="To Date"
          />
        </div>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold">{stats.sales?.total_sales || 0}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{parseFloat(stats.sales?.total_revenue || 0).toFixed(2)}
              </p>
            </div>
            {stats.expenses && (
              <>
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{parseFloat(stats.expenses.total_expenses || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-400">Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(stats.sales?.total_revenue || 0) - parseFloat(stats.expenses.total_expenses || 0) >= 0
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{(
                      parseFloat(stats.sales?.total_revenue || 0) -
                      parseFloat(stats.expenses.total_expenses || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.sales_by_service && stats.sales_by_service.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Sales by Service Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.sales_by_service}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.sales_by_category && stats.sales_by_category.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Sales by Menu Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.sales_by_category}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#ea580c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.top_services && stats.top_services.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Top Services</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.top_services}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#fbbf24" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function Daybook() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDaybook = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const response = await api.get(`/dashboard/daybook?date=${date}`);
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error('Failed to fetch daybook:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaybook();
  }, [date]);

  const totalRevenue = entries
    .filter((e) => e.type === 'sale')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalExpenses = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + Math.abs(parseFloat(e.amount)), 0);
  const netAmount = totalRevenue - totalExpenses;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Daybook</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
          style={{ maxWidth: '200px', width: '200px' }}
          placeholder="Select Date"
          title="Select Date"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-400">Net Amount</p>
          <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{netAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(entry.created_at), 'HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 ${
                      entry.type === 'sale' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.type === 'sale' ? (
                        <ArrowUpCircle className="w-4 h-4" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4" />
                      )}
                      {entry.type === 'sale' ? 'Sale' : 'Expense'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.reference}</td>
                  <td className="px-6 py-4 text-sm">{entry.description || '-'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    entry.type === 'sale' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.type === 'sale' ? '+' : '-'}₹{Math.abs(parseFloat(entry.amount)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No entries for this date
            </div>
          )}
        </div>
      )}
    </div>
  );
}


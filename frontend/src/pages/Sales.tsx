import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import { Search, Eye, Receipt } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/sales?${params.toString()}`);
      setSales(response.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleDetails = async (id: number) => {
    try {
      const response = await api.get(`/sales/${id}`);
      setSelectedSale(response.data);
    } catch (error) {
      console.error('Failed to fetch sale details:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Sales</h1>
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

      {sales.length === 0 ? (
        <EmptyState
          title="No sales in this range"
          description="Adjust the date filters or create a new POS order to see transactions here."
          icon={<Receipt className="w-12 h-12" />}
        />
      ) : (
        <div className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sale #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sale.sale_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sale.customer_name || 'Walk-in'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sale.staff_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fury-orange">₹{parseFloat(sale.final_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-300">{sale.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => fetchSaleDetails(sale.id)}
                      className="btn-icon"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Sale Details</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-500 hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p><strong>Sale Number:</strong> {selectedSale.sale_number}</p>
                <p><strong>Date:</strong> {format(new Date(selectedSale.created_at), 'MMM dd, yyyy HH:mm')}</p>
                <p><strong>Customer:</strong> {selectedSale.customer_name || 'Walk-in'}</p>
                <p><strong>Staff:</strong> {selectedSale.staff_name}</p>
              </div>
              {selectedSale.services && selectedSale.services.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Services</h3>
                  {selectedSale.services.map((s: any) => (
                    <div key={s.id} className="border-b pb-2 mb-2">
                      <p>{s.service_name} - {s.track_name}</p>
                      <p className="text-sm text-gray-400">Qty: {s.quantity} × ₹{s.unit_price} = ₹{s.total_price}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedSale.menu_items && selectedSale.menu_items.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Menu Items</h3>
                  {selectedSale.menu_items.map((m: any) => (
                    <div key={m.id} className="border-b pb-2 mb-2">
                      <p>{m.menu_item_name}</p>
                      <p className="text-sm text-gray-400">Qty: {m.quantity} × ₹{m.unit_price} = ₹{m.total_price}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-2">
                <p><strong>Total:</strong> ₹{parseFloat(selectedSale.final_amount).toFixed(2)}</p>
                <p><strong>Payment Method:</strong> {selectedSale.payment_method}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


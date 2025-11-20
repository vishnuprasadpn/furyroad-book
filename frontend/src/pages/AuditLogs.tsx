import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    entity_type: '',
    action_type: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.entity_type) params.append('entity_type', filters.entity_type);
      if (filters.action_type) params.append('action_type', filters.action_type);
      
      const response = await api.get(`/audit?${params.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="input-field"
            placeholder="From Date"
            title="From Date"
          />
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="input-field"
            placeholder="To Date"
            title="To Date"
          />
          <input
            type="text"
            value={filters.entity_type}
            onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            className="input-field"
            placeholder="Entity Type"
          />
          <input
            type="text"
            value={filters.action_type}
            onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
            className="input-field"
            placeholder="Action Type"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.full_name || log.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {log.action_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.entity_type} {log.entity_id && `#${log.entity_id}`}
                </td>
                <td className="px-6 py-4 text-sm">{log.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No audit logs found
          </div>
        )}
      </div>
    </div>
  );
}


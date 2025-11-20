import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Key } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [passwordUser, setPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
    is_active: true,
    permissions: {
      can_view_expenses: false,
      can_edit_expenses: false,
      can_view_inventory: true,
      can_edit_inventory: false,
      can_manage_prices: false,
      can_manage_offers: false,
      can_view_investments: false,
      can_edit_investments: false,
      can_manage_customers: true,
      can_manage_tasks: true,
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        password: editingUser ? undefined : formData.password,
      };

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', data);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'staff',
        is_active: true,
        permissions: {
          can_view_expenses: false,
          can_edit_expenses: false,
          can_view_inventory: true,
          can_edit_inventory: false,
          can_manage_prices: false,
          can_manage_offers: false,
          can_view_investments: false,
          can_edit_investments: false,
          can_manage_customers: true,
          can_manage_tasks: true,
        },
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      permissions: {
        can_view_expenses: user.can_view_expenses || false,
        can_edit_expenses: user.can_edit_expenses || false,
        can_view_inventory: user.can_view_inventory !== false,
        can_edit_inventory: user.can_edit_inventory || false,
        can_manage_prices: user.can_manage_prices || false,
        can_manage_offers: user.can_manage_offers || false,
        can_view_investments: user.can_view_investments || false,
        can_edit_investments: user.can_edit_investments || false,
        can_manage_customers: user.can_manage_customers !== false,
        can_manage_tasks: user.can_manage_tasks !== false,
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to deactivate user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await api.post(`/users/${passwordUser.id}/reset-password`, { newPassword });
      toast.success('Password reset successfully');
      setShowPasswordModal(false);
      setPasswordUser(null);
      setNewPassword('');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              username: '',
              email: '',
              password: '',
              full_name: '',
              role: 'staff',
              is_active: true,
              permissions: {
                can_view_expenses: false,
                can_edit_expenses: false,
                can_view_inventory: true,
                can_edit_inventory: false,
                can_manage_prices: false,
                can_manage_offers: false,
                can_view_investments: false,
                can_edit_investments: false,
                can_manage_customers: true,
                can_manage_tasks: true,
              },
            });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{user.role.replace('_', ' ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-icon"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPasswordUser(user);
                        setNewPassword('');
                        setShowPasswordModal(true);
                      }}
                      className="btn-icon"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    {user.role !== 'main_admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn-danger p-2 text-white"
                        title="Deactivate User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    disabled={editingUser?.role === 'main_admin'}
                  >
                    <option value="staff">Staff</option>
                    <option value="secondary_admin">Secondary Admin</option>
                    {editingUser?.role === 'main_admin' && (
                      <option value="main_admin">Main Admin</option>
                    )}
                  </select>
                  {editingUser?.role === 'main_admin' && (
                    <p className="text-xs text-gray-400 mt-1">Main admin role cannot be changed</p>
                  )}
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingUser}
                  />
                </div>
              )}
              {formData.role === 'secondary_admin' && (
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-2">Permissions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                  disabled={editingUser?.role === 'main_admin'}
                />
                <label className="text-sm font-medium">
                  Active
                  {editingUser?.role === 'main_admin' && (
                    <span className="text-xs text-gray-400 ml-2">(Main admin is always active)</span>
                  )}
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Reset Password for {passwordUser?.username}
            </h2>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="New Password (min 6 characters)"
                  title="New Password"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetPassword}
                  className="btn-primary"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordUser(null);
                    setNewPassword('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Coffee } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Menu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    tax_rate: '0',
    description: '',
    is_available: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        tax_rate: parseFloat(formData.tax_rate),
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, data);
        toast.success('Menu item updated successfully');
      } else {
        await api.post('/menu', data);
        toast.success('Menu item created successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        cost: '',
        tax_rate: '0',
        description: '',
        is_available: true,
      });
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save menu item');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      cost: item.cost?.toString() || '',
      tax_rate: item.tax_rate.toString(),
      description: item.description || '',
      is_available: item.is_available,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete menu item');
    }
  };

  if (loading) return <div>Loading...</div>;

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Menu Items</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: '',
              category: '',
              price: '',
              cost: '',
              tax_rate: '0',
              description: '',
              is_available: true,
            });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
      </div>

      {menuItems.length === 0 ? (
        <EmptyState
          title="No menu items yet"
          description="Add café items or outsourced combos so staff can bill food orders alongside RC services."
          icon={<Coffee className="w-12 h-12" />}
          action={
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  name: '',
                  category: '',
                  price: '',
                  cost: '',
                  tax_rate: '0',
                  description: '',
                  is_available: true,
                });
                setShowModal(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Menu Item
            </button>
          }
        />
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-6">
            <h2 className="text-xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter(item => item.category === category)
                .map((item) => (
                  <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-400">{item.description || 'No description provided'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn-icon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-danger p-2 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-fury-orange">₹{item.price}</p>
                    {item.tax_rate > 0 && (
                      <p className="text-sm text-gray-400">Tax: {item.tax_rate}%</p>
                    )}
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Available</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
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
    </div>
  );
}


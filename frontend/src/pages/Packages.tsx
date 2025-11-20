import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Boxes } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Packages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    track_id: '',
    car_id: '',
    base_price: '',
    duration_minutes: '',
    discount_percentage: '0',
    is_active: true,
  });
  const [selectedMenuItems, setSelectedMenuItems] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesRes, tracksRes, carsRes, menuRes] = await Promise.all([
        api.get('/packages'),
        api.get('/tracks'),
        api.get('/cars'),
        api.get('/menu'),
      ]);
      setPackages(packagesRes.data);
      setTracks(tracksRes.data);
      setCars(carsRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarsForTrack = async (trackId: string) => {
    if (!trackId) {
      setCars([]);
      return;
    }
    try {
      const response = await api.get(`/cars?track_id=${trackId}`);
      setCars(response.data);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        track_id: formData.track_id ? parseInt(formData.track_id) : null,
        car_id: formData.car_id ? parseInt(formData.car_id) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        menu_items: selectedMenuItems,
      };

      if (editingPackage) {
        await api.put(`/packages/${editingPackage.id}`, data);
        toast.success('Package updated successfully');
      } else {
        await api.post('/packages', data);
        toast.success('Package created successfully');
      }
      setShowModal(false);
      setEditingPackage(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save package');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      track_id: '',
      car_id: '',
      base_price: '',
      duration_minutes: '',
      discount_percentage: '0',
      is_active: true,
    });
    setSelectedMenuItems([]);
    setCars([]);
  };

  const handleEdit = async (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      track_id: pkg.track_id?.toString() || '',
      car_id: pkg.car_id?.toString() || '',
      base_price: pkg.base_price.toString(),
      duration_minutes: pkg.duration_minutes?.toString() || '',
      discount_percentage: (pkg.discount_percentage || 0).toString(),
      is_active: pkg.is_active,
    });
    setSelectedMenuItems(pkg.menu_items || []);
    if (pkg.track_id) {
      await fetchCarsForTrack(pkg.track_id.toString());
    }
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.delete(`/packages/${id}`);
      toast.success('Package deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete package');
    }
  };

  const addMenuItem = () => {
    setSelectedMenuItems([...selectedMenuItems, { menu_item_id: '', quantity: 1 }]);
  };

  const removeMenuItem = (index: number) => {
    setSelectedMenuItems(selectedMenuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    const updated = [...selectedMenuItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMenuItems(updated);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Packages</h1>
        <button
          onClick={() => {
            setEditingPackage(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="No packages created"
          description="Bundle tracks, RC cars, and café items to create irresistible offers for members."
          icon={<Boxes className="w-12 h-12" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{pkg.name}</h3>
                  {pkg.track_name && <p className="text-sm text-gray-400">Track: {pkg.track_name}</p>}
                  {pkg.car_name && (
                    <p className="text-sm text-gray-400">
                      Car: {pkg.car_name} {pkg.car_model ? `(${pkg.car_model})` : ''}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="btn-icon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="btn-danger p-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-lg font-bold text-fury-orange mb-2">₹{pkg.base_price}</p>
              {pkg.discount_percentage > 0 && (
                <p className="text-sm text-green-400 mb-2">{pkg.discount_percentage}% discount</p>
              )}
              {pkg.menu_items && pkg.menu_items.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">Includes:</p>
                  {pkg.menu_items.slice(0, 3).map((item: any, idx: number) => (
                    <p key={idx} className="text-xs text-gray-300">
                      • {item.menu_item_name} (x{item.quantity})
                    </p>
                  ))}
                  {pkg.menu_items.length > 3 && (
                    <p className="text-xs text-gray-400">+{pkg.menu_items.length - 3} more</p>
                  )}
                </div>
              )}
              {pkg.duration_minutes && <p className="text-sm text-gray-400">Duration: {pkg.duration_minutes} min</p>}
              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {pkg.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingPackage ? 'Edit Package' : 'Add Package'}
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Track</label>
                  <select
                    value={formData.track_id}
                    onChange={async (e) => {
                      setFormData({ ...formData, track_id: e.target.value, car_id: '' });
                      await fetchCarsForTrack(e.target.value);
                    }}
                    className="input-field"
                  >
                    <option value="">Select Track</option>
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.track_id && (
                  <div>
                    <label className="block text-sm font-medium mb-1">RC Car (Optional)</label>
                    <select
                      value={formData.car_id}
                      onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">No specific car</option>
                      {cars.filter(c => c.track_id === parseInt(formData.track_id)).map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.name} {car.model ? `(${car.model})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Café Menu Items</label>
                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="btn-secondary text-sm py-1 px-3"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedMenuItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-700 p-2 rounded">
                      <select
                        value={item.menu_item_id}
                        onChange={(e) => updateMenuItem(index, 'menu_item_id', e.target.value)}
                        className="input-field flex-1"
                        required
                      >
                        <option value="">Select Menu Item</option>
                        {menuItems.map((menuItem) => (
                          <option key={menuItem.id} value={menuItem.id}>
                            {menuItem.name} - ₹{menuItem.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateMenuItem(index, 'quantity', parseInt(e.target.value))}
                        className="input-field w-20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeMenuItem(index)}
                        className="btn-danger p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {selectedMenuItems.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No menu items added. Click "Add Item" to include café items.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingPackage ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                    resetForm();
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


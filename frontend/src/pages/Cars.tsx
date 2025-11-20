import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Cars() {
  const [cars, setCars] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    track_id: '',
    base_price: '',
    duration_minutes: '',
    description: '',
    image_url: '',
    is_active: true,
    china_rate_usd: '',
    indian_conversion: '',
    shipping_cost: '',
    available_units: '',
    total_units: '',
    our_rate: '',
    rate_difference: '',
    hourly_charge: '',
    max_minutes: '',
    play_minutes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsRes, tracksRes] = await Promise.all([
        api.get('/cars'),
        api.get('/tracks'),
      ]);
      setCars(carsRes.data);
      setTracks(tracksRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        track_id: formData.track_id ? parseInt(formData.track_id) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        base_price: parseFloat(formData.base_price),
        china_rate_usd: formData.china_rate_usd ? parseFloat(formData.china_rate_usd) : null,
        indian_conversion: formData.indian_conversion ? parseFloat(formData.indian_conversion) : null,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
        available_units: formData.available_units ? parseInt(formData.available_units) : null,
        total_units: formData.total_units ? parseInt(formData.total_units) : null,
        our_rate: formData.our_rate ? parseFloat(formData.our_rate) : null,
        rate_difference: formData.rate_difference ? parseFloat(formData.rate_difference) : null,
        hourly_charge: formData.hourly_charge ? parseFloat(formData.hourly_charge) : null,
        max_minutes: formData.max_minutes ? parseInt(formData.max_minutes) : null,
        play_minutes: formData.play_minutes ? parseInt(formData.play_minutes) : null,
      };

      if (editingCar) {
        await api.put(`/cars/${editingCar.id}`, data);
        toast.success('Car updated successfully');
      } else {
        await api.post('/cars', data);
        toast.success('Car created successfully');
      }
      setShowModal(false);
      setEditingCar(null);
      setFormData({
        name: '',
        model: '',
        track_id: '',
        base_price: '',
        duration_minutes: '',
        description: '',
        image_url: '',
        is_active: true,
        china_rate_usd: '',
        indian_conversion: '',
        shipping_cost: '',
        available_units: '',
        total_units: '',
        our_rate: '',
        rate_difference: '',
        hourly_charge: '',
        max_minutes: '',
        play_minutes: '',
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save car');
    }
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      model: car.model || '',
      track_id: car.track_id?.toString() || '',
      base_price: car.base_price?.toString() || '',
      duration_minutes: car.duration_minutes?.toString() || '',
      description: car.description || '',
      image_url: car.image_url || '',
      is_active: car.is_active,
      china_rate_usd: car.china_rate_usd?.toString() || '',
      indian_conversion: car.indian_conversion?.toString() || '',
      shipping_cost: car.shipping_cost?.toString() || '',
      available_units: car.available_units?.toString() || '',
      total_units: car.total_units?.toString() || '',
      our_rate: car.our_rate?.toString() || '',
      rate_difference: car.rate_difference?.toString() || '',
      hourly_charge: car.hourly_charge?.toString() || '',
      max_minutes: car.max_minutes?.toString() || '',
      play_minutes: car.play_minutes?.toString() || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      await api.delete(`/cars/${id}`);
      toast.success('Car deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete car');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">RC Cars</h1>
        <button
          onClick={() => {
            setEditingCar(null);
            setFormData({
              name: '',
              model: '',
              track_id: '',
              base_price: '',
              duration_minutes: '',
              description: '',
              image_url: '',
              is_active: true,
            });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Car
        </button>
      </div>

      {cars.length === 0 ? (
        <EmptyState
          title="No RC cars on record"
          description="Add the club’s RC car fleet so staff can assign the right models to each track session."
          icon={<Car className="w-12 h-12" />}
        />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div key={car.id} className="bg-gray-800 p-4 rounded-lg shadow space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{car.name}</h3>
                {car.model && <p className="text-sm text-gray-400">Model: {car.model}</p>}
                {car.track_name && <p className="text-sm text-gray-400">Track: {car.track_name}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(car)}
                  className="btn-icon"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(car.id)}
                  className="btn-danger p-2"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-lg font-bold text-fury-orange">₹{car.base_price}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              {car.china_rate_usd && <p>China Rate: ${car.china_rate_usd}</p>}
              {car.indian_conversion && <p>Indian Conversion: ₹{car.indian_conversion}</p>}
              {car.shipping_cost && <p>Shipping: ₹{car.shipping_cost}</p>}
              {car.our_rate && <p>Our Rate: ₹{car.our_rate}</p>}
              {car.rate_difference && <p>Difference: ₹{car.rate_difference}</p>}
              {car.available_units !== null && car.available_units !== undefined && <p>Available: {car.available_units}</p>}
              {car.total_units !== null && car.total_units !== undefined && <p>Total: {car.total_units}</p>}
              {car.hourly_charge && <p>Hourly Charge: ₹{car.hourly_charge}</p>}
              {car.max_minutes && <p>Max Minutes: {car.max_minutes}</p>}
              {car.play_minutes && <p>Play Minutes: {car.play_minutes}</p>}
            </div>
            {car.duration_minutes && <p className="text-sm text-gray-400">Default Duration: {car.duration_minutes} min</p>}
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${car.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {car.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCar ? 'Edit Car' : 'Add Car'}
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
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Track</label>
                <select
                  value={formData.track_id}
                  onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Track (Optional)</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="block text-sm font-medium mb-1">Default Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">China Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.china_rate_usd}
                    onChange={(e) => setFormData({ ...formData, china_rate_usd: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Indian Conversion (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.indian_conversion}
                    onChange={(e) => setFormData({ ...formData, indian_conversion: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shipping_cost}
                    onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Our Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.our_rate}
                    onChange={(e) => setFormData({ ...formData, our_rate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difference (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_difference}
                    onChange={(e) => setFormData({ ...formData, rate_difference: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Charge (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_charge}
                    onChange={(e) => setFormData({ ...formData, hourly_charge: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Minutes Possible</label>
                  <input
                    type="number"
                    value={formData.max_minutes}
                    onChange={(e) => setFormData({ ...formData, max_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Minutes Given to Play</label>
                  <input
                    type="number"
                    value={formData.play_minutes}
                    onChange={(e) => setFormData({ ...formData, play_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Available Units</label>
                  <input
                    type="number"
                    value={formData.available_units}
                    onChange={(e) => setFormData({ ...formData, available_units: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Units</label>
                  <input
                    type="number"
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description / Features</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-field"
                />
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
                  {editingCar ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCar(null);
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


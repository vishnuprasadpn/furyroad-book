import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Gamepad2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'track_session',
    track_id: '',
    car_id: '',
    duration_minutes: '',
    base_price: '',
    cost: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, tracksRes, carsRes] = await Promise.all([
        api.get('/services'),
        api.get('/tracks'),
        api.get('/cars'),
      ]);
      setServices(servicesRes.data);
      setTracks(tracksRes.data);
      setCars(carsRes.data);
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
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
        toast.success('Service updated successfully');
      } else {
        await api.post('/services', data);
        toast.success('Service created successfully');
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({
        name: '',
        type: 'track_session',
        track_id: '',
        car_id: '',
        duration_minutes: '',
        base_price: '',
        cost: '',
        description: '',
        is_active: true,
      });
      setCars([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save service');
    }
  };

  const handleEdit = async (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      type: service.type,
      track_id: service.track_id?.toString() || '',
      car_id: service.car_id?.toString() || '',
      duration_minutes: service.duration_minutes?.toString() || '',
      base_price: service.base_price.toString(),
      cost: service.cost?.toString() || '',
      description: service.description || '',
      is_active: service.is_active,
    });
    if (service.track_id) {
      await fetchCarsForTrack(service.track_id.toString());
    }
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete service');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Services</h1>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({
              name: '',
              type: 'track_session',
              track_id: '',
              car_id: '',
              duration_minutes: '',
              base_price: '',
              cost: '',
              description: '',
              is_active: true,
            });
            setCars([]);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services configured"
          description="Create your first RC track session, rental or café bundle so staff can start billing from the POS."
          icon={<Gamepad2 className="w-12 h-12" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{service.type.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="btn-icon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="btn-danger p-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-lg font-bold text-fury-orange">₹{service.base_price}</p>
              {service.track_name && <p className="text-sm text-gray-400">Track: {service.track_name}</p>}
              {service.car_name && (
                <p className="text-sm text-gray-400">
                  Car: {service.car_name} {service.car_model ? `(${service.car_model})` : ''}
                </p>
              )}
              {service.duration_minutes && <p className="text-sm text-gray-400">Duration: {service.duration_minutes} min</p>}
              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingService ? 'Edit Service' : 'Add Service'}
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
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="track_session">Track Session</option>
                  <option value="car_rental">Car Rental</option>
                  <option value="package">Package</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
                  <label className="block text-sm font-medium mb-1">RC Car/Model (Optional)</label>
                  <select
                    value={formData.car_id}
                    onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">No specific car (use track default)</option>
                    {cars.filter(c => c.track_id === parseInt(formData.track_id)).map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.name} {car.model ? `(${car.model})` : ''} - ₹{car.base_price}
                        {car.duration_minutes ? ` - ${car.duration_minutes} min` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Select a specific car model for this track. If not selected, the service will use track default pricing.
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="input-field"
                />
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
                  {editingService ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
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


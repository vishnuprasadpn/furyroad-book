import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, Trash2, Search, Gamepad2, Coffee, ShoppingBag, Package } from 'lucide-react';

interface CartItem {
  type: 'service' | 'menu' | 'package';
  id: number;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  track_id?: number;
  car_id?: number;
  car_name?: string;
  package_id?: number;
}

export default function POS() {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, packagesRes, menuRes, tracksRes, carsRes] = await Promise.all([
        api.get('/services').catch(() => ({ data: [] })),
        api.get('/packages').catch(() => ({ data: [] })),
        api.get('/menu').catch(() => ({ data: [] })),
        api.get('/tracks').catch(() => ({ data: [] })),
        api.get('/cars').catch(() => ({ data: [] })),
      ]);
      setServices(servicesRes.data.filter((s: any) => s.is_active && !s.package_id));
      setPackages(packagesRes.data.filter((p: any) => p.is_active));
      setMenuItems(menuRes.data.filter((m: any) => m.is_available));
      setTracks(tracksRes.data.filter((t: any) => t.is_active));
      setCars(carsRes.data.filter((c: any) => c.is_active));
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.response?.data?.error || 'Failed to load data');
    }
  };

  const addToCart = (type: 'service' | 'menu' | 'package', item: any, trackId?: number, carId?: number) => {
    const existingItem = cart.find(
      (c) => c.id === item.id && c.type === type && c.track_id === trackId && c.car_id === carId
    );

    if (existingItem) {
      setCart(
        cart.map((c) =>
          c === existingItem ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      const car = carId ? cars.find(c => c.id === carId) : null;
      let itemName = item.name;
      if (car) {
        const carInfo = car.model ? `${car.name} ${car.model}` : car.name;
        itemName += ` (${carInfo})`;
      }
      setCart([
        ...cart,
        {
          type,
          id: item.id,
          name: itemName,
          price: parseFloat(car ? car.base_price : (item.base_price || item.price)),
          quantity: 1,
          track_id: trackId || item.track_id,
          car_id: carId || item.car_id,
          car_name: car?.name || item.car_name,
          package_id: type === 'package' ? item.id : undefined,
        },
      ]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const searchCustomer = async () => {
    if (!customerSearch) return;
    try {
      const response = await api.get(`/customers?search=${customerSearch}`);
      if (response.data.length > 0) {
        setCustomer(response.data[0]);
        toast.success('Customer found');
      } else {
        toast.error('Customer not found');
      }
    } catch {
      toast.error('Failed to search customer');
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
    return { subtotal, discount, total: subtotal - discount };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const { discount } = calculateTotal();

      const saleData = {
        customer_id: customer?.id || null,
        services: cart
          .filter((item) => item.type === 'service')
          .map((item) => ({
            service_id: item.id,
            track_id: item.track_id,
            car_id: item.car_id,
            quantity: item.quantity,
            discount_amount: item.discount || 0,
          })),
        packages: cart
          .filter((item) => item.type === 'package')
          .map((item) => ({
            package_id: item.package_id || item.id,
            track_id: item.track_id,
            car_id: item.car_id,
            quantity: item.quantity,
            discount_amount: item.discount || 0,
          })),
        menu_items: cart
          .filter((item) => item.type === 'menu')
          .map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            discount_amount: item.discount || 0,
          })),
        discount_amount: discount,
        payment_method: paymentMethod,
      };

      await api.post('/sales', saleData);
      toast.success('Sale completed successfully!');
      setCart([]);
      setCustomer(null);
      setCustomerSearch('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="FuryRoad RC Club" 
            className="w-12 h-12 object-contain rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            loading="eager"
          />
          <h1 className="text-4xl font-bold text-white">Point of Sale</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Staff: {user?.full_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Search */}
          <div className="card border-l-4 border-fury-orange">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-fury-orange" />
              <h3 className="text-lg font-semibold text-white">Customer Search</h3>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by phone or name..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                  className="input-field pl-10"
                />
              </div>
              <button
                onClick={searchCustomer}
                className="btn-primary"
                title="Search Customer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            {customer && (
              <div className="mt-3 p-3 bg-gradient-to-r from-fury-orange/20 to-fury-orange/10 rounded-lg border border-fury-orange/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{customer.name}</p>
                    <p className="text-sm text-gray-300">{customer.phone}</p>
                    {customer.email && <p className="text-xs text-gray-400">{customer.email}</p>}
                  </div>
                  <button
                    onClick={() => {
                      setCustomer(null);
                      setCustomerSearch('');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="card border-l-4 border-fury-yellow">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-fury-yellow/20 rounded-lg">
                <Gamepad2 className="w-5 h-5 text-fury-yellow" />
              </div>
              <h2 className="text-xl font-bold text-white">RC Services</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {services.map((service) => {
                const trackCars = service.track_id ? cars.filter(c => c.track_id === service.track_id) : [];
                return (
                  <div key={service.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-fury-orange hover:bg-gray-700 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-sm">{service.name}</h3>
                    </div>
                    <p className="text-lg font-bold text-fury-orange mb-2">
                      ₹{service.base_price}
                      {service.car_name && (
                        <span className="text-xs text-gray-400 block mt-1">
                          {service.car_name} {service.car_model ? `(${service.car_model})` : ''}
                        </span>
                      )}
                    </p>
                    {service.track_id && trackCars.length > 0 ? (
                      <select
                        className="input-field text-sm w-full mb-2"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [trackId, carId] = e.target.value.split('-');
                            addToCart('service', service, parseInt(trackId), parseInt(carId));
                            toast.success(`${service.name} added to cart`);
                          }
                        }}
                      >
                        <option value="">Select Car</option>
                        {trackCars.map((car) => (
                          <option key={car.id} value={`${service.track_id}-${car.id}`}>
                            {car.name} {car.model ? `(${car.model})` : ''} - ₹{car.base_price}
                            {car.duration_minutes ? ` (${car.duration_minutes} min)` : ''}
                          </option>
                        ))}
                      </select>
                    ) : service.track_id ? (
                      <select
                        className="input-field text-sm w-full mb-2"
                        onChange={(e) => {
                          if (e.target.value) {
                            addToCart('service', service, parseInt(e.target.value));
                            toast.success(`${service.name} added to cart`);
                          }
                        }}
                      >
                        <option value="">Select Track</option>
                        {tracks.map((track) => (
                          <option key={track.id} value={track.id}>
                            {track.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart('service', service);
                          toast.success(`${service.name} added to cart`);
                        }}
                        className="btn-primary w-full text-sm py-2"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Packages */}
          {packages.length > 0 && (
            <div className="card border-l-4 border-blue-500/60">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Combo Packages</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-blue-500 hover:bg-gray-700 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-sm">{pkg.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                        {pkg.items_count || 0} items
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-400 mb-2">₹{pkg.base_price}</p>
                    {pkg.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{pkg.description}</p>
                    )}
                    <button
                      onClick={() => {
                        addToCart('package', pkg);
                        toast.success(`${pkg.name} added to cart`);
                      }}
                      className="btn-primary w-full text-sm py-2"
                    >
                      Add Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="card border-l-4 border-fury-red">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-fury-red/20 rounded-lg">
                <Coffee className="w-5 h-5 text-fury-red" />
              </div>
              <h2 className="text-xl font-bold text-white">Menu Items</h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    addToCart('menu', item);
                    toast.success(`${item.name} added to cart`);
                  }}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 hover:border-fury-orange hover:bg-gray-700 transition-all text-left group"
                >
                  <h3 className="font-medium text-white text-sm mb-1 group-hover:text-fury-orange transition-colors">{item.name}</h3>
                  <p className="text-sm font-bold text-fury-orange">₹{item.price}</p>
                  {item.category && (
                    <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="card border-l-4 border-fury-orange sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-fury-orange/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-fury-orange" />
            </div>
            <h2 className="text-xl font-bold text-white">Cart</h2>
            {cart.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-fury-orange text-white text-sm font-bold rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Cart is empty</p>
              <p className="text-sm text-gray-500 mt-1">Add items to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                {cart.map((item, index) => (
                  <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 hover:border-fury-orange transition-all">
                    <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">₹{item.price.toFixed(2)} each</p>
                      {item.car_name && (
                        <p className="text-xs text-fury-orange mt-1">Car: {item.car_name}</p>
                      )}
                    </div>
                      <button
                        onClick={() => {
                          removeFromCart(index);
                          toast.success('Item removed from cart');
                        }}
                        className="btn-danger p-1.5 ml-2"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="btn-icon p-1.5"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-white font-bold px-3 min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="btn-icon p-1.5"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-fury-orange">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-fury-red">
                    <span className="font-medium">Discount:</span>
                    <span className="font-semibold">-₹{totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-fury-orange">₹{totals.total.toFixed(2)}</span>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 UPI</option>
                    <option value="card">💳 Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✓</span>
                      Complete Sale
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


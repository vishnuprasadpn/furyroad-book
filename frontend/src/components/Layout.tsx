import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Users, 
  Gamepad2, 
  Coffee, 
  DollarSign, 
  CheckSquare, 
  BookOpen, 
  BarChart3, 
  UserCog, 
  FileText,
  LogOut,
  Package,
  Car
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/pos', icon: ShoppingCart, label: 'POS', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/sales', icon: Receipt, label: 'Sales', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/customers', icon: Users, label: 'Customers', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/cars', icon: Car, label: 'RC Cars', roles: ['main_admin', 'secondary_admin'] },
    { path: '/services', icon: Gamepad2, label: 'Services', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/packages', icon: Package, label: 'Packages', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/menu', icon: Coffee, label: 'Menu', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/expenses', icon: DollarSign, label: 'Expenses', roles: ['main_admin', 'secondary_admin'] },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['main_admin', 'secondary_admin', 'staff'] },
    { path: '/daybook', icon: BookOpen, label: 'Daybook', roles: ['main_admin', 'secondary_admin'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['main_admin', 'secondary_admin'] },
    { path: '/users', icon: UserCog, label: 'Users', roles: ['main_admin'] },
    { path: '/audit', icon: FileText, label: 'Audit Logs', roles: ['main_admin'] },
  ].filter(item => !user || item.roles.includes(user.role));

  return (
    <div className="h-screen bg-gray-900 overflow-hidden select-none">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 bg-fury-black shadow-2xl h-full flex flex-col border-r border-gray-800 transition-all duration-300">
          <div className="p-6 border-b border-gray-800 flex-shrink-0 bg-gradient-to-br from-fury-black to-gray-900">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src="/logo.jpg" 
                alt="FuryRoad RC Club Logo" 
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-fury-orange tracking-tight">FuryRoad</h1>
                <p className="text-xs text-fury-silver font-medium">RC Club</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
          <nav className="p-4 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-fury-orange text-white font-semibold shadow-lg shadow-fury-orange/30'
                      : 'text-fury-silver hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-gradient-to-t from-fury-black to-gray-900">
            <div className="mb-3 p-3 bg-gray-800 rounded-lg">
              <p className="text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="text-xs text-fury-silver capitalize mt-1">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 text-white bg-gray-800 hover:bg-red-600 rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-900 overflow-y-auto transition-all duration-200">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


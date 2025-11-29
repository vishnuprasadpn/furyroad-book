import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Packages from './pages/Packages';
import Menu from './pages/Menu';
import Expenses from './pages/Expenses';
import Tasks from './pages/Tasks';
import Daybook from './pages/Daybook';
import Reports from './pages/Reports';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Cars from './pages/Cars';
import Layout from './components/Layout';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="sales" element={<Sales />} />
        <Route path="customers" element={<Customers />} />
        <Route path="cars" element={<ProtectedRoute roles={['main_admin', 'secondary_admin']}><Cars /></ProtectedRoute>} />
        <Route path="services" element={<Services />} />
        <Route path="packages" element={<Packages />} />
        <Route path="menu" element={<Menu />} />
        <Route path="expenses" element={<ProtectedRoute roles={['main_admin', 'secondary_admin']}><Expenses /></ProtectedRoute>} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="daybook" element={<ProtectedRoute roles={['main_admin', 'secondary_admin']}><Daybook /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['main_admin', 'secondary_admin']}><Reports /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['main_admin']}><Users /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute roles={['main_admin']}><AuditLogs /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <PWAInstallPrompt />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;


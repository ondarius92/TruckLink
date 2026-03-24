import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import ProtectedRoute from './components/common/ProtectedRoute';
import { UserRole } from './types';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Business Pages
import BusinessDashboard from './pages/business/Dashboard';
import NewOrder from './pages/business/NewOrder';
import OrderHistory from './pages/business/OrderHistory';
import OrderDetail from './pages/business/OrderDetail';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import ActiveOrder from './pages/driver/ActiveOrder';
import Earnings from './pages/driver/Earnings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDisputes from './pages/admin/Disputes';

const App: React.FC = () => {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Business */}
        <Route
          path="/business/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS]}>
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/new-order"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS]}>
              <NewOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/orders"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/orders/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS]}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />

        {/* Driver */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.DRIVER]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/orders"
          element={
            <ProtectedRoute allowedRoles={[UserRole.DRIVER]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/orders/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.DRIVER]}>
              <ActiveOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/earnings"
          element={
            <ProtectedRoute allowedRoles={[UserRole.DRIVER]}>
              <Earnings />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDisputes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

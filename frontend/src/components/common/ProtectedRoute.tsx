import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types';
import { PageLoader } from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const roleHomePage: Record<UserRole, string> = {
  BUSINESS: '/business/dashboard',
  DRIVER: '/driver/dashboard',
  ADMIN: '/admin/dashboard',
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <PageLoader text="מאמת זהות..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={roleHomePage[user.role]}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

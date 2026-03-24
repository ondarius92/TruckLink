import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

const businessLinks = [
  { to: '/business/dashboard', label: 'ראשי', icon: '🏠' },
  { to: '/business/new-order', label: 'הזמנה חדשה', icon: '➕' },
  { to: '/business/orders', label: 'הזמנות', icon: '📋' },
];

const driverLinks = [
  { to: '/driver/dashboard', label: 'ראשי', icon: '🏠' },
  { to: '/driver/orders', label: 'הזמנות', icon: '📋' },
  { to: '/driver/earnings', label: 'הכנסות', icon: '💰' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'ראשי', icon: '🏠' },
  { to: '/admin/users', label: 'משתמשים', icon: '👥' },
  { to: '/admin/orders', label: 'הזמנות', icon: '📋' },
  { to: '/admin/disputes', label: 'מחלוקות', icon: '⚠️' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links =
    user?.role === UserRole.BUSINESS
      ? businessLinks
      : user?.role === UserRole.DRIVER
      ? driverLinks
      : adminLinks;

  const roleLabel =
    user?.role === UserRole.BUSINESS
      ? '🏢 עסק'
      : user?.role === UserRole.DRIVER
      ? '🚛 נהג'
      : '⚙️ אדמין';

  return (
    <nav
      className="bg-white border-b border-gray-100 sticky top-0 z-40"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-600"
          >
            🚛 TruckLink
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${location.pathname === link.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-gray-500">{roleLabel}</span>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <span>🚪</span>
              <span className="hidden md:inline">התנתק</span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium
                  ${location.pathname === link.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

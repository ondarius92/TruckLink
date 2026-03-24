import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrdersService from '../../services/orders.service';
import UsersService from '../../services/users.service';
import PaymentsService from '../../services/payments.service';
import Navbar from '../../components/common/Navbar';
import Card, { MetricCard } from '../../components/common/Card';
import { PageLoader } from '../../components/common/Spinner';

interface AdminStats {
  ordersToday: number;
  gmvToday: number;
  platformRevenueToday: number;
  openDisputes: number;
  activeDrivers: number;
  pendingKyc: number;
  totalUsers: number;
  activeBusinesses: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [orderStats, userStats, revenue] = await Promise.all([
        OrdersService.getAdminStats(),
        UsersService.getDashboardStats(),
        PaymentsService.getPlatformRevenue(),
      ]);

      setStats({
        ordersToday: orderStats.ordersToday,
        gmvToday: orderStats.gmvToday,
        platformRevenueToday: orderStats.platformRevenueToday,
        openDisputes: orderStats.openDisputes,
        activeDrivers: userStats.activeDrivers,
        pendingKyc: userStats.pendingKyc,
        totalUsers: userStats.totalUsers,
        activeBusinesses: userStats.activeBusinesses,
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(p);

  if (isLoading) return <PageLoader text="טוען דאשבורד..." />;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ⚙️ לוח בקרה — אדמין
          </h1>
          <button
            onClick={loadStats}
            className="text-sm text-blue-600 hover:underline"
          >
            🔄 רענן
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="הזמנות היום"
            value={stats?.ordersToday ?? 0}
            icon="📦"
            color="blue"
          />
          <MetricCard
            label="GMV היום"
            value={formatPrice(stats?.gmvToday ?? 0)}
            icon="💳"
            color="green"
          />
          <MetricCard
            label="הכנסת פלטפורמה"
            value={formatPrice(stats?.platformRevenueToday ?? 0)}
            icon="💰"
            color="purple"
          />
          <MetricCard
            label="מחלוקות פתוחות"
            value={stats?.openDisputes ?? 0}
            icon="⚠️"
            color={
              (stats?.openDisputes ?? 0) > 0 ? 'red' : 'green'
            }
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="נהגים מקוונים"
            value={stats?.activeDrivers ?? 0}
            icon="🚛"
            color="blue"
          />
          <MetricCard
            label="ממתין לאישור KYC"
            value={stats?.pendingKyc ?? 0}
            icon="📋"
            color={
              (stats?.pendingKyc ?? 0) > 0 ? 'amber' : 'green'
            }
          />
          <MetricCard
            label="סה״כ משתמשים"
            value={stats?.totalUsers ?? 0}
            icon="👥"
            color="blue"
          />
          <MetricCard
            label="עסקים פעילים"
            value={stats?.activeBusinesses ?? 0}
            icon="🏢"
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            hoverable
            onClick={() => navigate('/admin/users')}
            className="text-center"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              ניהול משתמשים
            </h3>
            <p className="text-sm text-gray-500">
              אישור נהגים, KYC, השעיה
            </p>
            {(stats?.pendingKyc ?? 0) > 0 && (
              <span className="inline-block mt-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                {stats?.pendingKyc} ממתינים לאישור
              </span>
            )}
          </Card>

          <Card
            hoverable
            onClick={() => navigate('/admin/orders')}
            className="text-center"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              ניהול הזמנות
            </h3>
            <p className="text-sm text-gray-500">
              כל ההזמנות, סטטוסים, תשלומים
            </p>
          </Card>

          <Card
            hoverable
            onClick={() => navigate('/admin/disputes')}
            className="text-center"
          >
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              מחלוקות
            </h3>
            <p className="text-sm text-gray-500">
              פתרון סכסוכים בין עסקים לנהגים
            </p>
            {(stats?.openDisputes ?? 0) > 0 && (
              <span className="inline-block mt-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {stats?.openDisputes} פתוחות
              </span>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

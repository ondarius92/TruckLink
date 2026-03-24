import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useOrdersStore } from '../../store/orders.store';
import UsersService from '../../services/users.service';
import PaymentsService from '../../services/payments.service';
import Navbar from '../../components/common/Navbar';
import Card, { MetricCard } from '../../components/common/Card';
import OrderCard from '../../components/common/OrderCard';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import { OrderStatus } from '../../types';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { orders, isLoading, fetchDriverOrders, activeOrder } =
    useOrdersStore();

  const [isOnline, setIsOnline] = useState(
    user?.driver?.isOnline ?? false,
  );
  const [earnings, setEarnings] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
  });
  const [togglingOnline, setTogglingOnline] = useState(false);

  useEffect(() => {
    fetchDriverOrders({ limit: '5' } as any);
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const data = await PaymentsService.getEarnings();
      setEarnings(data);
    } catch {}
  };

  const toggleOnline = async () => {
    try {
      setTogglingOnline(true);
      const newStatus = !isOnline;
      await UsersService.setOnline(newStatus);
      setIsOnline(newStatus);
    } catch {
    } finally {
      setTogglingOnline(false);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(p);

  if (isLoading && orders.length === 0) {
    return <PageLoader text="טוען דאשבורד..." />;
  }

  const recentOrders = orders.filter(
    (o) => o.status === OrderStatus.COMPLETED,
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              שלום, {user?.firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              ⭐ {user?.driver?.rating?.toFixed(1) ?? '—'} ·{' '}
              {user?.driver?.totalTrips ?? 0} הובלות
            </p>
          </div>

          {/* Online Toggle */}
          <button
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold
              transition-all duration-200
              ${isOnline
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            <div
              className={`
                w-3 h-3 rounded-full
                ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-500'}
              `}
            />
            {togglingOnline
              ? 'מעדכן...'
              : isOnline
              ? 'מקוון ✓'
              : 'לא מקוון'}
          </button>
        </div>

        {/* Status Banner */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-amber-800 font-medium">
              ⚠️ אתה לא מקוון — לא תקבל הזמנות חדשות
            </p>
            <p className="text-amber-600 text-sm mt-1">
              לחץ על "לא מקוון" כדי להתחיל לקבל הזמנות
            </p>
          </div>
        )}

        {/* Active Order Banner */}
        {activeOrder && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">
                  🚛 הזמנה פעילה
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {activeOrder.pickupCity} →{' '}
                  {activeOrder.dropoffCity}
                </p>
              </div>
              <Button
                onClick={() =>
                  navigate(`/driver/orders/${activeOrder.id}`)
                }
              >
                המשך →
              </Button>
            </div>
          </div>
        )}

        {/* Earnings Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="היום"
            value={formatPrice(earnings.todayEarnings)}
            icon="📅"
            color="green"
          />
          <MetricCard
            label="השבוע"
            value={formatPrice(earnings.weekEarnings)}
            icon="📆"
            color="blue"
          />
          <MetricCard
            label="החודש"
            value={formatPrice(earnings.monthEarnings)}
            icon="💰"
            color="purple"
          />
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 הזמנות אחרונות
            </h2>
            <button
              onClick={() => navigate('/driver/orders')}
              className="text-sm text-blue-600 hover:underline"
            >
              כל ההזמנות ←
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-4">🚛</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                אין הובלות עדיין
              </h3>
              <p className="text-gray-500">
                עבור למצב מקוון כדי להתחיל לקבל הזמנות
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showBusiness
                  onClick={() =>
                    navigate(`/driver/orders/${order.id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

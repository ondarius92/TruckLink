import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useOrdersStore } from '../../store/orders.store';
import OrdersService from '../../services/orders.service';
import Navbar from '../../components/common/Navbar';
import Card, { MetricCard } from '../../components/common/Card';
import OrderCard from '../../components/common/OrderCard';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import { OrderStatus } from '../../types';

const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    orders,
    isLoading,
    fetchBusinessOrders,
  } = useOrdersStore();

  useEffect(() => {
    fetchBusinessOrders({ limit: '5' } as any);
  }, []);

  const activeOrders = orders.filter((o) =>
    [
      OrderStatus.PENDING,
      OrderStatus.MATCHING,
      OrderStatus.ACCEPTED,
      OrderStatus.PICKUP,
      OrderStatus.IN_TRANSIT,
    ].includes(o.status),
  );

  const completedOrders = orders.filter(
    (o) => o.status === OrderStatus.COMPLETED,
  );

  const totalSpent = completedOrders.reduce(
    (sum, o) => sum + o.total,
    0,
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(price);

  if (isLoading && orders.length === 0) {
    return <PageLoader text="טוען דאשבורד..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              שלום, {user?.firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {user?.business?.companyName}
            </p>
          </div>
          <Button
            onClick={() => navigate('/business/new-order')}
            size="lg"
          >
            ➕ הזמנה חדשה
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="הזמנות פעילות"
            value={activeOrders.length}
            icon="🚛"
            color="blue"
          />
          <MetricCard
            label="הושלמו השבוע"
            value={completedOrders.length}
            icon="✅"
            color="green"
          />
          <MetricCard
            label="סה״כ הוצאות"
            value={formatPrice(totalSpent)}
            icon="💰"
            color="amber"
          />
          <MetricCard
            label="דירוג ממוצע"
            value={user?.business?.rating?.toFixed(1) ?? '—'}
            icon="⭐"
            color="purple"
          />
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🔄 הזמנות פעילות
            </h2>
            <div className="grid gap-3">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showDriver
                  onClick={() =>
                    navigate(`/business/orders/${order.id}`)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 הזמנות אחרונות
            </h2>
            <button
              onClick={() => navigate('/business/orders')}
              className="text-sm text-blue-600 hover:underline"
            >
              כל ההזמנות ←
            </button>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                אין הזמנות עדיין
              </h3>
              <p className="text-gray-500 mb-6">
                צור את ההזמנה הראשונה שלך עכשיו
              </p>
              <Button
                onClick={() => navigate('/business/new-order')}
              >
                ➕ הזמנה ראשונה
              </Button>
            </Card>
          ) : (
            <div className="grid gap-3">
              {orders.slice(0, 5).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showDriver
                  onClick={() =>
                    navigate(`/business/orders/${order.id}`)
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

export default BusinessDashboard;

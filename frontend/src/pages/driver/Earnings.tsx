import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentsService, {
  DriverEarnings,
} from '../../services/payments.service';
import Navbar from '../../components/common/Navbar';
import Card, { MetricCard } from '../../components/common/Card';
import { PageLoader } from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';

const Earnings: React.FC = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<DriverEarnings | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setIsLoading(true);
      const data = await PaymentsService.getEarnings();
      setEarnings(data);
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  if (isLoading) return <PageLoader text="טוען הכנסות..." />;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          💰 הכנסות
        </h1>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <MetricCard
            label="היום"
            value={formatPrice(earnings?.todayEarnings ?? 0)}
            icon="📅"
            color="green"
          />
          <MetricCard
            label="השבוע"
            value={formatPrice(earnings?.weekEarnings ?? 0)}
            icon="📆"
            color="blue"
          />
          <MetricCard
            label="החודש"
            value={formatPrice(earnings?.monthEarnings ?? 0)}
            icon="🗓️"
            color="purple"
          />
          <MetricCard
            label="סה״כ"
            value={formatPrice(earnings?.totalEarnings ?? 0)}
            icon="🏆"
            color="amber"
          />
        </div>

        {/* Recent Orders */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📋 הובלות אחרונות
          </h2>

          {!earnings?.recentOrders?.length ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🚛</div>
              <p className="text-gray-500">אין הובלות עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  onClick={() =>
                    navigate(`/driver/orders/${order.id}`)
                  }
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </span>
                      <StatusBadge
                        status={order.status}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.pickupCity} → {order.dropoffCity}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-600">
                      {formatPrice(order.driverPayout)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {Math.round(order.distanceKm)} ק"מ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="mt-4 bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 טיפים להגדלת הכנסות
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <span>✓</span>
              שמור על דירוג גבוה — נהגים עם 4.8+ מקבלים עדיפות
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              היה מקוון בשעות עומס (8-10, 13-15, 17-19)
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              קבל הזמנות חזרה — חסוך על נסיעות ריקות
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              הוסף רכב עם קירור/מנוף לתוספת של ₪150-200
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Earnings;

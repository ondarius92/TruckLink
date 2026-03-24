import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../store/orders.store';
import Navbar from '../../components/common/Navbar';
import OrderCard from '../../components/common/OrderCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { PageLoader } from '../../components/common/Spinner';
import { OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../constants';

const STATUS_FILTERS = [
  { value: '', label: 'הכל' },
  { value: OrderStatus.PENDING, label: 'ממתין' },
  { value: OrderStatus.MATCHING, label: 'מחפש נהג' },
  { value: OrderStatus.IN_TRANSIT, label: 'בדרך' },
  { value: OrderStatus.COMPLETED, label: 'הושלם' },
  { value: OrderStatus.CANCELLED, label: 'בוטל' },
];

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    total,
    page,
    totalPages,
    isLoading,
    fetchBusinessOrders,
  } = useOrdersStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBusinessOrders({
      status: statusFilter || undefined,
      page: currentPage,
      limit: 10,
    } as any);
  }, [statusFilter, currentPage]);

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.orderNumber.includes(search) ||
          o.pickupCity.includes(search) ||
          o.dropoffCity.includes(search),
      )
    : orders;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            📋 הזמנות
          </h1>
          <Button onClick={() => navigate('/business/new-order')}>
            ➕ הזמנה חדשה
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="חיפוש לפי מספר הזמנה, עיר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span>🔍</span>}
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setCurrentPage(1);
              }}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                transition-all
                ${statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <PageLoader text="טוען הזמנות..." />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              לא נמצאו הזמנות
            </h3>
            <p className="text-gray-500">
              נסה לשנות את הפילטרים
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              → הקודם
            </Button>
            <span className="text-sm text-gray-600">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              הבא ←
            </Button>
          </div>
        )}

        {/* Total */}
        <p className="text-center text-sm text-gray-400 mt-4">
          סה"כ {total} הזמנות
        </p>
      </div>
    </div>
  );
};

export default OrderHistory;

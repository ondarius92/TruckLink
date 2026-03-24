import React from 'react';
import { Order } from '../../types';
import { VEHICLE_TYPE_LABELS } from '../../constants';
import StatusBadge from './StatusBadge';
import Card from './Card';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  showDriver?: boolean;
  showBusiness?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onClick,
  showDriver = false,
  showBusiness = false,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Card hoverable onClick={onClick} className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {order.orderNumber}
          </span>
          <StatusBadge status={order.status} size="sm" />
        </div>
        <span className="text-lg font-bold text-blue-600">
          {formatPrice(order.total)}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="w-0.5 h-6 bg-gray-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="bg-gray-50 rounded-lg px-3 py-1.5">
            <p className="text-sm font-medium text-gray-800">
              {order.pickupCity}
            </p>
            <p className="text-xs text-gray-500">{order.pickupStreet}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-1.5">
            <p className="text-sm font-medium text-gray-800">
              {order.dropoffCity}
            </p>
            <p className="text-xs text-gray-500">
              {order.dropoffStreet}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <span>🚛 {VEHICLE_TYPE_LABELS[order.vehicleTypeRequired]}</span>
          <span>📏 {Math.round(order.distanceKm)} ק"מ</span>
          <span>⚖️ {order.cargoWeightKg} ק"ג</span>
        </div>
        <span>{formatDate(order.scheduledAt)}</span>
      </div>

      {/* Driver info */}
      {showDriver && order.driver && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm">
            🧑
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">
              {order.driver.user?.firstName} {order.driver.user?.lastName}
            </p>
            <p className="text-xs text-gray-500">
              ⭐ {order.driver.rating.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Business info */}
      {showBusiness && order.business && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-sm">
            🏢
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">
              {order.business.companyName}
            </p>
            <p className="text-xs text-gray-500">
              {order.business.city}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrderCard;

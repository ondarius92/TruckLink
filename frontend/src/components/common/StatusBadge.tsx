import React from 'react';
import { OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../constants';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  MATCHING: 'bg-blue-100 text-blue-800 border-blue-200',
  ACCEPTED: 'bg-purple-100 text-purple-800 border-purple-200',
  PICKUP: 'bg-orange-100 text-orange-800 border-orange-200',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  DISPUTED: 'bg-rose-100 text-rose-800 border-rose-200',
};

const statusDots: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500',
  MATCHING: 'bg-blue-500 animate-pulse',
  ACCEPTED: 'bg-purple-500',
  PICKUP: 'bg-orange-500 animate-pulse',
  IN_TRANSIT: 'bg-cyan-500 animate-pulse',
  DELIVERED: 'bg-emerald-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  DISPUTED: 'bg-rose-500',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium
        border rounded-full
        ${statusStyles[status]}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      `}
    >
      <span
        className={`
          rounded-full flex-shrink-0
          ${statusDots[status]}
          ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}
        `}
      />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
};

export default StatusBadge;

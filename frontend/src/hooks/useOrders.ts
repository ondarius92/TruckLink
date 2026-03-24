import { useEffect, useCallback } from 'react';
import { useOrdersStore } from '../store/orders.store';
import { useAuthStore } from '../store/auth.store';
import { OrderFilters } from '../services/orders.service';
import { UserRole } from '../types';

export const useOrders = (filters: OrderFilters = {}) => {
  const { user } = useAuthStore();
  const {
    orders,
    activeOrder,
    selectedOrder,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchBusinessOrders,
    fetchDriverOrders,
    fetchOrderById,
    createOrder,
    acceptOrder,
    updateStatus,
    confirmDelivery,
    cancelOrder,
    clearError,
  } = useOrdersStore();

  const fetchOrders = useCallback(() => {
    if (!user) return;
    if (user.role === UserRole.BUSINESS) {
      fetchBusinessOrders(filters);
    } else if (user.role === UserRole.DRIVER) {
      fetchDriverOrders(filters);
    }
  }, [user, JSON.stringify(filters)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    activeOrder,
    selectedOrder,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    acceptOrder,
    updateStatus,
    confirmDelivery,
    cancelOrder,
    clearError,
  };
};

export const useActiveOrder = () => {
  const { activeOrder, isLoading, updateStatus, setActiveOrder } =
    useOrdersStore();

  const moveToPickup = (orderId: string, lat?: number, lng?: number) =>
    updateStatus(orderId, 'PICKUP', undefined, lat, lng);

  const moveToInTransit = (orderId: string, lat?: number, lng?: number) =>
    updateStatus(orderId, 'IN_TRANSIT', undefined, lat, lng);

  const moveToDelivered = (orderId: string, lat?: number, lng?: number) =>
    updateStatus(orderId, 'DELIVERED', undefined, lat, lng);

  return {
    activeOrder,
    isLoading,
    moveToPickup,
    moveToInTransit,
    moveToDelivered,
    setActiveOrder,
  };
};

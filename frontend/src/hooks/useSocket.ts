import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import { useAuthStore } from '../store/auth.store';
import { useOrdersStore } from '../store/orders.store';
import { Order, OrderStatus } from '../types';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { updateOrderInList, setActiveOrder } = useOrdersStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join', { userId: user.id, role: user.role });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // ---- Order Events ----
    socket.on('order:updated', (order: Order) => {
      updateOrderInList(order);

      const activeStatuses: OrderStatus[] = [
        OrderStatus.ACCEPTED,
        OrderStatus.PICKUP,
        OrderStatus.IN_TRANSIT,
      ];

      if (activeStatuses.includes(order.status)) {
        setActiveOrder(order);
      } else if (
        order.status === OrderStatus.COMPLETED ||
        order.status === OrderStatus.CANCELLED
      ) {
        setActiveOrder(null);
      }
    });

    socket.on('order:new', (order: Order) => {
      console.log('New order received:', order.orderNumber);
    });

    socket.on('driver:location', (data: {
      driverId: string;
      lat: number;
      lng: number;
    }) => {
      console.log('Driver location update:', data);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }, [user]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const emitLocation = useCallback(
    (lat: number, lng: number) => {
      socketRef.current?.emit('driver:location', {
        userId: user?.id,
        lat,
        lng,
      });
    },
    [user],
  );

  const emitOrderUpdate = useCallback(
    (orderId: string, status: string) => {
      socketRef.current?.emit('order:status', { orderId, status });
    },
    [],
  );

  useEffect(() => {
    if (user) connect();
    return () => disconnect();
  }, [user]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emitLocation,
    emitOrderUpdate,
    isConnected: socketRef.current?.connected ?? false,
  };
};

import { create } from 'zustand';
import { Order, OrderStatus } from '../types';
import OrdersService, {
  CreateOrderPayload,
  OrderFilters,
} from '../services/orders.service';

interface OrdersState {
  orders: Order[];
  activeOrder: Order | null;
  selectedOrder: Order | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBusinessOrders: (filters?: OrderFilters) => Promise<void>;
  fetchDriverOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  acceptOrder: (orderId: string, vehicleId: string) => Promise<void>;
  updateStatus: (
    orderId: string,
    status: string,
    note?: string,
    lat?: number,
    lng?: number,
  ) => Promise<void>;
  confirmDelivery: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  setSelectedOrder: (order: Order | null) => void;
  setActiveOrder: (order: Order | null) => void;
  updateOrderInList: (updatedOrder: Order) => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  activeOrder: null,
  selectedOrder: null,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchBusinessOrders: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const res = await OrdersService.getBusinessOrders(filters);
      set({
        orders: res.data,
        total: res.total,
        page: res.page,
        totalPages: res.totalPages,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDriverOrders: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const res = await OrdersService.getDriverOrders(filters);
      set({
        orders: res.data,
        total: res.total,
        page: res.page,
        totalPages: res.totalPages,
      });

      // מצא הזמנה פעילה
      const active = res.data.find((o) =>
        [
          OrderStatus.ACCEPTED,
          OrderStatus.PICKUP,
          OrderStatus.IN_TRANSIT,
        ].includes(o.status),
      );
      set({ activeOrder: active ?? null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (orderId) => {
    try {
      set({ isLoading: true, error: null });
      const order = await OrdersService.getOrderById(orderId);
      set({ selectedOrder: order });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (payload) => {
    try {
      set({ isLoading: true, error: null });
      const order = await OrdersService.createOrder(payload);
      set((state) => ({ orders: [order, ...state.orders] }));
      return order;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  acceptOrder: async (orderId, vehicleId) => {
    try {
      set({ isLoading: true, error: null });
      const order = await OrdersService.acceptOrder(orderId, vehicleId);
      set({ activeOrder: order });
      get().updateOrderInList(order);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (orderId, status, note, lat, lng) => {
    try {
      set({ isLoading: true, error: null });
      const order = await OrdersService.updateStatus(orderId, {
        status,
        note,
        lat,
        lng,
      });
      get().updateOrderInList(order);
      if (
        status === OrderStatus.COMPLETED ||
        status === OrderStatus.CANCELLED
      ) {
        set({ activeOrder: null });
      } else {
        set({ activeOrder: order });
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  confirmDelivery: async (orderId) => {
    try {
      set({ isLoading: true, error: null });
      await OrdersService.confirmDelivery(orderId);
      await get().fetchOrderById(orderId);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      set({ isLoading: true, error: null });
      await OrdersService.cancelOrder(orderId, reason);
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: OrderStatus.CANCELLED }
            : o,
        ),
        activeOrder:
          state.activeOrder?.id === orderId
            ? null
            : state.activeOrder,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  setActiveOrder: (order) => set({ activeOrder: order }),

  updateOrderInList: (updatedOrder) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === updatedOrder.id ? updatedOrder : o,
      ),
      selectedOrder:
        state.selectedOrder?.id === updatedOrder.id
          ? updatedOrder
          : state.selectedOrder,
    })),

  clearError: () => set({ error: null }),
}));

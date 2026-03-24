import api from './api';
import {
  Order,
  PaginatedResponse,
  VehicleType,
  VehicleFeature,
  PaymentMethod,
} from '../types';

export interface CreateOrderPayload {
  pickup: {
    street: string;
    city: string;
    lat: number;
    lng: number;
    notes?: string;
  };
  dropoff: {
    street: string;
    city: string;
    lat: number;
    lng: number;
    notes?: string;
  };
  cargo: {
    description: string;
    weightKg: number;
    volumeCbm?: number;
    isFragile: boolean;
    isHazmat: boolean;
    requiresRefrigeration: boolean;
    estimatedValue?: number;
    notes?: string;
  };
  vehicleTypeRequired: VehicleType;
  featuresRequired: VehicleFeature[];
  scheduledAt: string;
  paymentMethod: PaymentMethod;
  addInsurance?: boolean;
}

export interface OrderFilters {
  status?: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface UpdateStatusPayload {
  status: string;
  note?: string;
  lat?: number;
  lng?: number;
}

export interface PodPayload {
  photos: string[];
  signatureUrl: string;
  recipientName: string;
  signedBy: string;
  notes?: string;
}

const OrdersService = {
  // ---- Business ----
  createOrder: (payload: CreateOrderPayload): Promise<Order> =>
    api.post('/orders', payload),

  getBusinessOrders: (
    filters: OrderFilters = {},
  ): Promise<PaginatedResponse<Order>> =>
    api.get('/orders/business', { params: filters }),

  confirmDelivery: (orderId: string): Promise<{ message: string }> =>
    api.post(`/orders/${orderId}/confirm`),

  // ---- Driver ----
  getDriverOrders: (
    filters: OrderFilters = {},
  ): Promise<PaginatedResponse<Order>> =>
    api.get('/orders/driver', { params: filters }),

  acceptOrder: (
    orderId: string,
    vehicleId: string,
  ): Promise<Order> =>
    api.post(`/orders/${orderId}/accept`, { vehicleId }),

  updateStatus: (
    orderId: string,
    payload: UpdateStatusPayload,
  ): Promise<Order> =>
    api.patch(`/orders/${orderId}/status`, payload),

  submitPod: (
    orderId: string,
    payload: PodPayload,
  ): Promise<{ message: string }> =>
    api.post(`/orders/${orderId}/pod`, payload),

  // ---- Shared ----
  getOrderById: (orderId: string): Promise<Order> =>
    api.get(`/orders/${orderId}`),

  cancelOrder: (
    orderId: string,
    reason: string,
  ): Promise<{ message: string }> =>
    api.post(`/orders/${orderId}/cancel`, { reason }),

  // ---- Admin ----
  getAllOrders: (
    filters: OrderFilters = {},
  ): Promise<PaginatedResponse<Order>> =>
    api.get('/orders/admin/all', { params: filters }),

  getAdminStats: (): Promise<{
    ordersToday: number;
    gmvToday: number;
    platformRevenueToday: number;
    openDisputes: number;
  }> => api.get('/orders/admin/stats'),

  // ---- Matching Preview ----
  getAvailableDrivers: (params: {
    lat: number;
    lng: number;
    vehicleType: VehicleType;
    features: VehicleFeature[];
  }): Promise<any[]> =>
    api.get('/matching/preview', {
      params: {
        ...params,
        features: params.features.join(','),
      },
    }),
};

export default OrdersService;

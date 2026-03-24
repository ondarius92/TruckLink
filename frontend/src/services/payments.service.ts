import api from './api';

export interface DriverEarnings {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  recentOrders: any[];
}

export interface PlatformRevenue {
  totalOrders: number;
  gmv: number;
  platformRevenue: number;
}

const PaymentsService = {
  // ---- Business ----
  chargeOrder: (
    orderId: string,
    cardToken: string,
  ): Promise<{ message: string; transactionId: string }> =>
    api.post(`/payments/${orderId}/charge`, { cardToken }),

  // ---- Driver ----
  getEarnings: (): Promise<DriverEarnings> =>
    api.get('/payments/driver/earnings'),

  // ---- Admin ----
  releasePayment: (
    orderId: string,
  ): Promise<{ message: string; amount: number }> =>
    api.post(`/payments/${orderId}/release`),

  refundOrder: (
    orderId: string,
    reason: string,
  ): Promise<{ message: string; amount: number }> =>
    api.post(`/payments/${orderId}/refund`, { reason }),

  getPlatformRevenue: (
    from?: string,
    to?: string,
  ): Promise<PlatformRevenue> =>
    api.get('/payments/admin/revenue', { params: { from, to } }),
};

export default PaymentsService;

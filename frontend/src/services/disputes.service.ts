import api from './api';
import { Dispute, PaginatedResponse } from '../types';

const DisputesService = {
  openDispute: (
    orderId: string,
    data: {
      reason: string;
      description: string;
      evidenceUrls: string[];
      claimedAmount?: number;
    },
  ): Promise<Dispute> =>
    api.post(`/disputes/${orderId}/open`, data),

  getDisputes: (
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Dispute>> =>
    api.get('/disputes/admin/all', {
      params: { status, page, limit },
    }),

  getDisputeById: (disputeId: string): Promise<Dispute> =>
    api.get(`/disputes/admin/${disputeId}`),

  getDisputeStats: (): Promise<{
    total: number;
    open: number;
    underReview: number;
    resolved: number;
  }> => api.get('/disputes/admin/stats'),

  resolveDispute: (
    disputeId: string,
    resolution: string,
    favor: 'BUSINESS' | 'DRIVER',
    refundAmount?: number,
  ): Promise<{ message: string }> =>
    api.post(`/disputes/admin/${disputeId}/resolve`, {
      resolution,
      favor,
      refundAmount,
    }),
};

export default DisputesService;

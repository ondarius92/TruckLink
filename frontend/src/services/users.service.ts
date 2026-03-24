import api from './api';
import { User, Business, Driver, PaginatedResponse } from '../types';

const UsersService = {
  // ---- Business ----
  getBusinessProfile: (): Promise<Business> =>
    api.get('/users/business/profile'),

  updateBusiness: (data: Partial<Business>): Promise<Business> =>
    api.patch('/users/business/profile', data),

  // ---- Driver ----
  getDriverProfile: (): Promise<Driver> =>
    api.get('/users/driver/profile'),

  updateDriver: (data: Partial<Driver>): Promise<Driver> =>
    api.patch('/users/driver/profile', data),

  updateLocation: (lat: number, lng: number): Promise<void> =>
    api.patch('/users/driver/location', { lat, lng }),

  setOnline: (isOnline: boolean): Promise<void> =>
    api.patch('/users/driver/online', { isOnline }),

  updateBankAccount: (data: {
    bankName: string;
    branchNumber: string;
    accountNumber: string;
    accountHolder: string;
  }): Promise<void> => api.patch('/users/driver/bank', data),

  // ---- Admin ----
  getAllUsers: (
    page = 1,
    limit = 20,
    role?: string,
  ): Promise<PaginatedResponse<User>> =>
    api.get('/users/admin/all', { params: { page, limit, role } }),

  getPendingKyc: (): Promise<Driver[]> =>
    api.get('/users/admin/pending-kyc'),

  approveDriver: (driverId: string): Promise<{ message: string }> =>
    api.post(`/users/admin/approve-driver/${driverId}`),

  suspendUser: (
    userId: string,
    reason: string,
  ): Promise<{ message: string }> =>
    api.post(`/users/admin/suspend/${userId}`, { reason }),

  getDashboardStats: (): Promise<{
    totalUsers: number;
    activeDrivers: number;
    activeBusinesses: number;
    pendingKyc: number;
    ordersToday: number;
  }> => api.get('/users/admin/stats'),
};

export default UsersService;

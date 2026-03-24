// ============================================
// TruckLink — TypeScript Types & Interfaces
// ============================================

export enum UserRole {
  BUSINESS = 'BUSINESS',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum VehicleType {
  VAN = 'VAN',
  SMALL_TRUCK = 'SMALL_TRUCK',
  MEDIUM_TRUCK = 'MEDIUM_TRUCK',
  LARGE_TRUCK = 'LARGE_TRUCK',
  SEMI_TRUCK = 'SEMI_TRUCK',
}

export enum VehicleFeature {
  REFRIGERATED = 'REFRIGERATED',
  CRANE = 'CRANE',
  HAZMAT = 'HAZMAT',
  FLATBED = 'FLATBED',
  TAIL_LIFT = 'TAIL_LIFT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  MATCHING = 'MATCHING',
  ACCEPTED = 'ACCEPTED',
  PICKUP = 'PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

export enum PaymentTerms {
  IMMEDIATE = 'IMMEDIATE',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_BUSINESS = 'RESOLVED_BUSINESS',
  RESOLVED_DRIVER = 'RESOLVED_DRIVER',
  CLOSED = 'CLOSED',
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  business?: Business;
  driver?: Driver;
}

export interface Business {
  id: string;
  userId: string;
  companyName: string;
  businessNumber: string;
  vatNumber?: string;
  industry: string;
  paymentTerms: PaymentTerms;
  creditLimit?: number;
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  contactPerson: string;
  street: string;
  city: string;
  zipCode?: string;
  country: string;
  lat: number;
  lng: number;
  user?: User;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseTypes: string[];
  licenseExpiry: string;
  idNumber: string;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  bankName?: string;
  branchNumber?: string;
  accountNumber?: string;
  accountHolder?: string;
  user?: User;
  vehicles?: Vehicle[];
  documents?: DriverDocument[];
}

export interface DriverDocument {
  id: string;
  driverId: string;
  type: string;
  fileUrl: string;
  expiryDate?: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  features: VehicleFeature[];
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeCbm: number;
  insuranceExpiry: string;
  testExpiry: string;
  photos: string[];
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  lat: number;
  lng: number;
  notes?: string;
}

export interface Cargo {
  description: string;
  weightKg: number;
  volumeCbm?: number;
  isFragile: boolean;
  isHazmat: boolean;
  requiresRefrigeration: boolean;
  estimatedValue?: number;
  notes?: string;
}

export interface OrderPrice {
  basePrice: number;
  distanceFee: number;
  featuresSurcharge: number;
  paymentTermsSurcharge: number;
  platformFee: number;
  insuranceFee: number;
  vatAmount: number;
  total: number;
  driverPayout: number;
}

export interface Payment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  terms: PaymentTerms;
  amount: number;
  platformFee: number;
  driverPayout: number;
  dueDate?: string;
  paidAt?: string;
  releasedAt?: string;
  transactionId?: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  lat?: number;
  lng?: number;
  note?: string;
  createdAt: string;
}

export interface ProofOfDelivery {
  id: string;
  orderId: string;
  photos: string[];
  signatureUrl: string;
  signedBy: string;
  recipientName: string;
  notes?: string;
  signedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  businessId: string;
  driverId?: string;
  vehicleId?: string;
  pickupStreet: string;
  pickupCity: string;
  pickupLat: number;
  pickupLng: number;
  pickupNotes?: string;
  dropoffStreet: string;
  dropoffCity: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffNotes?: string;
  cargoDescription: string;
  cargoWeightKg: number;
  cargoVolumeCbm?: number;
  cargoIsFragile: boolean;
  cargoIsHazmat: boolean;
  cargoRequiresRefrigeration: boolean;
  cargoEstimatedValue?: number;
  vehicleTypeRequired: VehicleType;
  featuresRequired: VehicleFeature[];
  scheduledAt: string;
  distanceKm: number;
  estimatedDurationMin: number;
  basePrice: number;
  distanceFee: number;
  featuresSurcharge: number;
  paymentTermsSurcharge: number;
  platformFee: number;
  insuranceFee: number;
  vatAmount: number;
  total: number;
  driverPayout: number;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  business?: Business;
  driver?: Driver;
  vehicle?: Vehicle;
  payment?: Payment;
  events?: OrderEvent[];
  pod?: ProofOfDelivery;
}

export interface Review {
  id: string;
  orderId: string;
  driverId: string;
  fromRole: UserRole;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  openedBy: UserRole;
  status: DisputeStatus;
  reason: string;
  description: string;
  evidenceUrls: string[];
  claimedAmount?: number;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  order?: Order;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface BusinessDashboardStats {
  totalOrders: number;
  activeOrders: number;
  totalSpent: number;
  avgDeliveryTime: number;
  onTimeRate: number;
}

export interface DriverDashboardStats {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  todayTrips: number;
  weekTrips: number;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeDrivers: number;
  activeBusinesses: number;
  ordersToday: number;
  gmvToday: number;
  platformRevenueToday: number;
  openDisputes: number;
  pendingKyc: number;
}

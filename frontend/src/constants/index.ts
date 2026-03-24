import { VehicleType, VehicleFeature, OrderStatus, PaymentTerms } from '../types';

// ---- API ----
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';

// ---- Vehicle Types ----
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  VAN: 'ואן מסחרי',
  SMALL_TRUCK: 'משאית קטנה (עד 7.5 טון)',
  MEDIUM_TRUCK: 'משאית בינונית (עד 18 טון)',
  LARGE_TRUCK: 'משאית גדולה (עד 30 טון)',
  SEMI_TRUCK: 'שילוב / גרירה (מעל 30 טון)',
};

export const VEHICLE_TYPE_BASE_PRICE: Record<VehicleType, number> = {
  VAN: 180,
  SMALL_TRUCK: 280,
  MEDIUM_TRUCK: 420,
  LARGE_TRUCK: 580,
  SEMI_TRUCK: 780,
};

// ---- Vehicle Features ----
export const VEHICLE_FEATURE_LABELS: Record<VehicleFeature, string> = {
  REFRIGERATED: '❄️ קירור',
  CRANE: '🪝 לוד / מנוף',
  HAZMAT: '⚗️ חומרים מסוכנים (ADR)',
  FLATBED: '📦 פלטה פתוחה',
  TAIL_LIFT: '🔃 מעלית אחורית',
};

export const VEHICLE_FEATURE_SURCHARGE: Record<VehicleFeature, number> = {
  REFRIGERATED: 150,
  CRANE: 200,
  HAZMAT: 300,
  FLATBED: 80,
  TAIL_LIFT: 60,
};

// ---- Order Status ----
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'ממתין',
  MATCHING: 'מחפש נהג',
  ACCEPTED: 'נהג אישר',
  PICKUP: 'נהג בדרך לאיסוף',
  IN_TRANSIT: 'בדרך ליעד',
  DELIVERED: 'נמסר — ממתין לאישור',
  COMPLETED: 'הושלם',
  CANCELLED: 'בוטל',
  DISPUTED: 'במחלוקת',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#F59E0B',
  MATCHING: '#3B82F6',
  ACCEPTED: '#8B5CF6',
  PICKUP: '#F97316',
  IN_TRANSIT: '#06B6D4',
  DELIVERED: '#10B981',
  COMPLETED: '#22C55E',
  CANCELLED: '#EF4444',
  DISPUTED: '#DC2626',
};

// ---- Payment Terms ----
export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  IMMEDIATE: 'מיידי',
  NET_30: 'שוטף + 30',
  NET_60: 'שוטף + 60',
  NET_90: 'שוטף + 90',
};

export const PAYMENT_TERMS_SURCHARGE: Record<PaymentTerms, number> = {
  IMMEDIATE: 0,
  NET_30: 1.5,
  NET_60: 2.5,
  NET_90: 4.0,
};

// ---- Industries ----
export const INDUSTRIES = [
  'בנייה וקבלנות',
  'מזון ומשקאות',
  'ריהוט ועיצוב',
  'אלקטרוניקה',
  'חקלאות',
  'לוגיסטיקה ומחסנאות',
  'יצור ותעשייה',
  'מסחר קמעונאי',
  'ייצוא / ייבוא',
  'אחר',
];

// ---- Israeli Banks ----
export const ISRAELI_BANKS = [
  { code: '10', name: 'בנק לאומי' },
  { code: '11', name: 'בנק דיסקונט' },
  { code: '12', name: 'בנק הפועלים' },
  { code: '13', name: 'בנק אגוד' },
  { code: '14', name: 'בנק אוצר החייל' },
  { code: '17', name: 'בנק מרכנתיל דיסקונט' },
  { code: '20', name: 'בנק מזרחי טפחות' },
  { code: '31', name: 'הבנק הבינלאומי' },
  { code: '46', name: 'בנק מסד' },
  { code: '52', name: 'בנק פועלי אגודת ישראל' },
];

// ---- License Types ----
export const LICENSE_TYPES = [
  { value: 'B', label: 'B — רכב פרטי / ואן' },
  { value: 'C1', label: 'C1 — משאית עד 7.5 טון' },
  { value: 'C', label: 'C — משאית מעל 7.5 טון' },
  { value: 'CE', label: 'CE — שילוב / גרירה' },
  { value: 'D', label: 'D — אוטובוס' },
];

// ---- Dispute Reasons ----
export const DISPUTE_REASONS = [
  'נזק למטען',
  'אובדן מטען',
  'איחור משמעותי',
  'נהג לא הגיע',
  'התנהגות לא הולמת',
  'חיוב שגוי',
  'אחר',
];

// ---- Pagination ----
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// ---- Map ----
export const DEFAULT_MAP_CENTER = { lat: 32.0853, lng: 34.7818 }; // תל אביב
export const DEFAULT_MAP_ZOOM = 12;

// ---- Timeouts ----
export const MATCHING_TIMEOUT_SEC = 90;
export const OTP_EXPIRY_MIN = 5;
export const ESCROW_HOLD_HOURS = 48;

// ---- Platform ----
export const PLATFORM_FEE_PERCENT = 12;
export const VAT_PERCENT = 18;
export const INSURANCE_RATE = 0.5;

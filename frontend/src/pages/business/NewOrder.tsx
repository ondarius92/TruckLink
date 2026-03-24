import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../store/orders.store';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import {
  VehicleType,
  VehicleFeature,
  PaymentMethod,
} from '../../types';
import {
  VEHICLE_TYPE_LABELS,
  VEHICLE_FEATURE_LABELS,
  VEHICLE_FEATURE_SURCHARGE,
  VEHICLE_TYPE_BASE_PRICE,
} from '../../constants';

type Step = 1 | 2 | 3 | 4;

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder, isLoading, error } = useOrdersStore();
  const [step, setStep] = useState<Step>(1);

  const [pickup, setPickup] = useState({
    street: '',
    city: '',
    lat: 32.0853,
    lng: 34.7818,
    notes: '',
  });

  const [dropoff, setDropoff] = useState({
    street: '',
    city: '',
    lat: 31.7683,
    lng: 35.2137,
    notes: '',
  });

  const [cargo, setCargo] = useState({
    description: '',
    weightKg: 0,
    volumeCbm: 0,
    isFragile: false,
    isHazmat: false,
    requiresRefrigeration: false,
    estimatedValue: 0,
    notes: '',
  });

  const [vehicleType, setVehicleType] = useState<VehicleType>(
    VehicleType.SMALL_TRUCK,
  );
  const [features, setFeatures] = useState<VehicleFeature[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CREDIT_CARD,
  );
  const [addInsurance, setAddInsurance] = useState(false);

  const toggleFeature = (f: VehicleFeature) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const estimatedPrice = () => {
    const base = VEHICLE_TYPE_BASE_PRICE[vehicleType];
    const featureSurcharge = features.reduce(
      (sum, f) => sum + (VEHICLE_FEATURE_SURCHARGE[f] ?? 0),
      0,
    );
    const subtotal = base * 2 + featureSurcharge;
    const platform = subtotal * 0.12;
    const vat = (subtotal + platform) * 0.18;
    return Math.round(subtotal + platform + vat);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(p);

  const handleSubmit = async () => {
    try {
      const order = await createOrder({
        pickup,
        dropoff,
        cargo,
        vehicleTypeRequired: vehicleType,
        featuresRequired: features,
        scheduledAt,
        paymentMethod,
        addInsurance,
      });
      navigate(`/business/orders/${order.id}`);
    } catch {}
  };

  const steps = [
    { num: 1, label: 'מסלול' },
    { num: 2, label: 'מטען' },
    { num: 3, label: 'רכב' },
    { num: 4, label: 'אישור' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ➕ הזמנה חדשה
        </h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                  ${step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}
              >
                {step > s.num ? '✓' : s.num} {s.label}
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200" />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Step 1 — Route */}
        {step === 1 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              📍 נקודות איסוף ויעד
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-green-800">
                  🟢 נקודת איסוף
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="רחוב"
                    value={pickup.street}
                    onChange={(e) =>
                      setPickup((p) => ({
                        ...p,
                        street: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    label="עיר"
                    value={pickup.city}
                    onChange={(e) =>
                      setPickup((p) => ({
                        ...p,
                        city: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <Input
                  label="הערות לנהג"
                  value={pickup.notes}
                  onChange={(e) =>
                    setPickup((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="למשל: כניסה מהצד האחורי"
                />
              </div>

              <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-red-800">
                  🔴 יעד
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="רחוב"
                    value={dropoff.street}
                    onChange={(e) =>
                      setDropoff((p) => ({
                        ...p,
                        street: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    label="עיר"
                    value={dropoff.city}
                    onChange={(e) =>
                      setDropoff((p) => ({
                        ...p,
                        city: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <Input
                  label="הערות לנהג"
                  value={dropoff.notes}
                  onChange={(e) =>
                    setDropoff((p) => ({
                      ...p,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="למשל: קומה 3, יש מעלית"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={
                  !pickup.street || !pickup.city ||
                  !dropoff.street || !dropoff.city
                }
              >
                הבא ←
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2 — Cargo */}
        {step === 2 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              📦 פרטי מטען
            </h2>
            <div className="space-y-4">
              <Input
                label="תיאור המטען"
                value={cargo.description}
                onChange={(e) =>
                  setCargo((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="למשל: ריהוט משרדי, 10 ארגזים"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="משקל (ק״ג)"
                  type="number"
                  value={cargo.weightKg || ''}
                  onChange={(e) =>
                    setCargo((p) => ({
                      ...p,
                      weightKg: +e.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label='נפח (מ"ק)'
                  type="number"
                  value={cargo.volumeCbm || ''}
                  onChange={(e) =>
                    setCargo((p) => ({
                      ...p,
                      volumeCbm: +e.target.value,
                    }))
                  }
                />
              </div>
              <Input
                label="שווי מוערך (₪)"
                type="number"
                value={cargo.estimatedValue || ''}
                onChange={(e) =>
                  setCargo((p) => ({
                    ...p,
                    estimatedValue: +e.target.value,
                  }))
                }
                hint="לצורך חישוב ביטוח מטען"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  מאפיינים מיוחדים
                </label>
                {[
                  { key: 'isFragile', label: '🔮 שביר' },
                  { key: 'isHazmat', label: '⚗️ חומרים מסוכנים' },
                  {
                    key: 'requiresRefrigeration',
                    label: '❄️ דורש קירור',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={cargo[item.key as keyof typeof cargo] as boolean}
                      onChange={(e) =>
                        setCargo((p) => ({
                          ...p,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
              >
                → חזרה
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!cargo.description || !cargo.weightKg}
              >
                הבא ←
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3 — Vehicle */}
        {step === 3 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              🚛 סוג רכב ופיצ'רים
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(VEHICLE_TYPE_LABELS).map(
                  ([type, label]) => (
                    <button
                      key={type}
                      onClick={() =>
                        setVehicleType(type as VehicleType)
                      }
                      className={`
                        p-3 rounded-xl border-2 text-right transition-all
                        ${vehicleType === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="text-sm font-medium">
                        {label}
                      </span>
                    </button>
                  ),
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  תוספות נדרשות
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VEHICLE_FEATURE_LABELS).map(
                    ([feat, label]) => (
                      <button
                        key={feat}
                        onClick={() =>
                          toggleFeature(feat as VehicleFeature)
                        }
                        className={`
                          p-2.5 rounded-lg border text-sm text-right
                          transition-all
                          ${features.includes(feat as VehicleFeature)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
              >
                → חזרה
              </Button>
              <Button onClick={() => setStep(4)}>הבא ←</Button>
            </div>
          </Card>
        )}

        {/* Step 4 — Confirm */}
        {step === 4 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              ✅ אישור הזמנה
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">מסלול</span>
                  <span className="font-medium">
                    {pickup.city} → {dropoff.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">מטען</span>
                  <span className="font-medium">
                    {cargo.description} ({cargo.weightKg} ק"ג)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">רכב</span>
                  <span className="font-medium">
                    {VEHICLE_TYPE_LABELS[vehicleType]}
                  </span>
                </div>
              </div>

              <Input
                label="תאריך ושעת הובלה"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  אמצעי תשלום
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CREDIT_CARD">כרטיס אשראי</option>
                  <option value="BANK_TRANSFER">העברה בנקאית</option>
                  <option value="CASH">מזומן</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addInsurance}
                  onChange={(e) => setAddInsurance(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">
                  🛡️ הוסף ביטוח מטען (+0.5% משווי הסחורה)
                </span>
              </label>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    מחיר משוער
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(estimatedPrice())}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  כולל מע"מ ועמלת פלטפורמה
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(3)}
              >
                → חזרה
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={!scheduledAt}
              >
                🚛 שלח הזמנה
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewOrder;

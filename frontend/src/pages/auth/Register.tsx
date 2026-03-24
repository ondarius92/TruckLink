import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { INDUSTRIES, LICENSE_TYPES } from '../../constants';
import { UserRole } from '../../types';

type Step = 'choose-role' | 'business-form' | 'driver-form';

const Register: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone ?? '';
  const { registerBusiness, registerDriver, isLoading, error, clearError } =
    useAuth();

  const [step, setStep] = useState<Step>('choose-role');
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);

  const [businessForm, setBusinessForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    businessNumber: '',
    industry: '',
    contactPerson: '',
    street: '',
    city: '',
  });

  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    idNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
  });

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await registerBusiness({
      ...businessForm,
      phone,
      licenseTypes: [],
    } as any);
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await registerDriver({
      ...driverForm,
      phone,
      licenseTypes: selectedLicenses,
    });
  };

  const toggleLicense = (val: string) => {
    setSelectedLicenses((prev) =>
      prev.includes(val)
        ? prev.filter((l) => l !== val)
        : [...prev, val],
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚛</div>
          <h1 className="text-2xl font-bold text-gray-900">
            הרשמה ל-TruckLink
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Step 1 — Choose Role */}
          {step === 'choose-role' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                אני מצטרף כ...
              </h2>
              <button
                onClick={() => setStep('business-form')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all text-right"
              >
                <div className="text-3xl mb-2">🏢</div>
                <div className="font-semibold text-gray-900">עסק</div>
                <div className="text-sm text-gray-500 mt-1">
                  אני צריך הובלות לעסק שלי
                </div>
              </button>
              <button
                onClick={() => setStep('driver-form')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all text-right"
              >
                <div className="text-3xl mb-2">🚛</div>
                <div className="font-semibold text-gray-900">נהג</div>
                <div className="text-sm text-gray-500 mt-1">
                  אני נהג / בעל רכב מסחרי
                </div>
              </button>
            </div>
          )}

          {/* Step 2 — Business Form */}
          {step === 'business-form' && (
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">פרטי עסק</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="שם פרטי"
                  value={businessForm.firstName}
                  onChange={(e) =>
                    setBusinessForm((p) => ({
                      ...p,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label="שם משפחה"
                  value={businessForm.lastName}
                  onChange={(e) =>
                    setBusinessForm((p) => ({
                      ...p,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <Input
                label="אימייל"
                type="email"
                value={businessForm.email}
                onChange={(e) =>
                  setBusinessForm((p) => ({
                    ...p,
                    email: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="שם החברה"
                value={businessForm.companyName}
                onChange={(e) =>
                  setBusinessForm((p) => ({
                    ...p,
                    companyName: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="מספר עוסק / ח.פ."
                value={businessForm.businessNumber}
                onChange={(e) =>
                  setBusinessForm((p) => ({
                    ...p,
                    businessNumber: e.target.value,
                  }))
                }
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  תחום עיסוק
                </label>
                <select
                  value={businessForm.industry}
                  onChange={(e) =>
                    setBusinessForm((p) => ({
                      ...p,
                      industry: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר תחום</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="איש קשר"
                value={businessForm.contactPerson}
                onChange={(e) =>
                  setBusinessForm((p) => ({
                    ...p,
                    contactPerson: e.target.value,
                  }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="רחוב"
                  value={businessForm.street}
                  onChange={(e) =>
                    setBusinessForm((p) => ({
                      ...p,
                      street: e.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label="עיר"
                  value={businessForm.city}
                  onChange={(e) =>
                    setBusinessForm((p) => ({
                      ...p,
                      city: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('choose-role')}
                  fullWidth
                >
                  חזרה
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                >
                  הרשמה
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 — Driver Form */}
          {step === 'driver-form' && (
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">פרטי נהג</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="שם פרטי"
                  value={driverForm.firstName}
                  onChange={(e) =>
                    setDriverForm((p) => ({
                      ...p,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label="שם משפחה"
                  value={driverForm.lastName}
                  onChange={(e) =>
                    setDriverForm((p) => ({
                      ...p,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <Input
                label="אימייל"
                type="email"
                value={driverForm.email}
                onChange={(e) =>
                  setDriverForm((p) => ({
                    ...p,
                    email: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="תעודת זהות"
                value={driverForm.idNumber}
                onChange={(e) =>
                  setDriverForm((p) => ({
                    ...p,
                    idNumber: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="מספר רישיון נהיגה"
                value={driverForm.licenseNumber}
                onChange={(e) =>
                  setDriverForm((p) => ({
                    ...p,
                    licenseNumber: e.target.value,
                  }))
                }
                required
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  סוגי רישיון
                </label>
                <div className="flex flex-wrap gap-2">
                  {LICENSE_TYPES.map((lt) => (
                    <button
                      key={lt.value}
                      type="button"
                      onClick={() => toggleLicense(lt.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium border
                        transition-all
                        ${selectedLicenses.includes(lt.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }
                      `}
                    >
                      {lt.label}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="תוקף רישיון"
                type="date"
                value={driverForm.licenseExpiry}
                onChange={(e) =>
                  setDriverForm((p) => ({
                    ...p,
                    licenseExpiry: e.target.value,
                  }))
                }
                required
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('choose-role')}
                  fullWidth
                >
                  חזרה
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                >
                  הרשמה
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;

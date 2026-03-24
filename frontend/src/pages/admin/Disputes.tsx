import React, { useEffect, useState } from 'react';
import DisputesService from '../../services/disputes.service';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Spinner';
import { Dispute, DisputeStatus } from '../../types';

const statusColors: Record<DisputeStatus, string> = {
  OPEN: 'bg-red-100 text-red-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  RESOLVED_BUSINESS: 'bg-green-100 text-green-800',
  RESOLVED_DRIVER: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<DisputeStatus, string> = {
  OPEN: 'פתוח',
  UNDER_REVIEW: 'בבדיקה',
  RESOLVED_BUSINESS: 'נפתר לטובת עסק',
  RESOLVED_DRIVER: 'נפתר לטובת נהג',
  CLOSED: 'סגור',
};

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] =
    useState<Dispute | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [favor, setFavor] = useState<'BUSINESS' | 'DRIVER'>(
    'BUSINESS',
  );
  const [resolving, setResolving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('OPEN');

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  const loadDisputes = async () => {
    try {
      setIsLoading(true);
      const res = await DisputesService.getDisputes(statusFilter);
      setDisputes(res.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    try {
      setResolving(true);
      await DisputesService.resolveDispute(
        selectedDispute.id,
        resolution,
        favor,
      );
      setShowResolveModal(false);
      setResolution('');
      await loadDisputes();
    } catch {
    } finally {
      setResolving(false);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(p);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ⚠️ מחלוקות
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'OPEN', label: 'פתוחות' },
            { value: 'UNDER_REVIEW', label: 'בבדיקה' },
            { value: 'RESOLVED_BUSINESS', label: 'נפתרו לעסק' },
            { value: 'RESOLVED_DRIVER', label: 'נפתרו לנהג' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <PageLoader text="טוען מחלוקות..." />
        ) : disputes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-medium text-gray-900">
              אין מחלוקות פתוחות
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`
                          text-xs px-2 py-0.5 rounded-full font-medium
                          ${statusColors[dispute.status]}
                        `}
                      >
                        {statusLabels[dispute.status]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(dispute.createdAt)}
                      </span>
                    </div>

                    {/* Order Info */}
                    {dispute.order && (
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        הזמנה: {dispute.order.orderNumber} ·{' '}
                        {dispute.order.pickupCity} →{' '}
                        {dispute.order.dropoffCity}
                      </p>
                    )}

                    {/* Dispute Details */}
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">סיבה: </span>
                      {dispute.reason}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {dispute.description}
                    </p>

                    {/* Parties */}
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>
                        פתח:{' '}
                        {dispute.openedBy === 'BUSINESS'
                          ? '🏢 עסק'
                          : '🚛 נהג'}
                      </span>
                      {dispute.claimedAmount && (
                        <span>
                          סכום נתבע:{' '}
                          {formatPrice(dispute.claimedAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {(dispute.status === DisputeStatus.OPEN ||
                    dispute.status ===
                      DisputeStatus.UNDER_REVIEW) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowResolveModal(true);
                      }}
                    >
                      פתור
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="פתרון מחלוקת"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowResolveModal(false)}
            >
              ביטול
            </Button>
            <Button
              isLoading={resolving}
              onClick={handleResolve}
              disabled={!resolution}
            >
              אשר פתרון
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              פתרון לטובת
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFavor('BUSINESS')}
                className={`
                  p-3 rounded-xl border-2 text-center transition-all
                  ${favor === 'BUSINESS'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                  }
                `}
              >
                <div className="text-2xl mb-1">🏢</div>
                <p className="text-sm font-medium">העסק</p>
                <p className="text-xs text-gray-500">
                  החזר כסף לעסק
                </p>
              </button>
              <button
                onClick={() => setFavor('DRIVER')}
                className={`
                  p-3 rounded-xl border-2 text-center transition-all
                  ${favor === 'DRIVER'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                  }
                `}
              >
                <div className="text-2xl mb-1">🚛</div>
                <p className="text-sm font-medium">הנהג</p>
                <p className="text-xs text-gray-500">
                  שחרר תשלום לנהג
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              הסבר הפתרון
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="תאר את סיבת הפתרון..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDisputes;

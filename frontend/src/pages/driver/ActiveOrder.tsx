import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../store/orders.store';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Spinner';
import OrdersService from '../../services/orders.service';
import { OrderStatus } from '../../types';

const ActiveOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedOrder: order,
    isLoading,
    fetchOrderById,
    updateStatus,
  } = useOrdersStore();

  const [showPodModal, setShowPodModal] = useState(false);
  const [podData, setPodData] = useState({
    recipientName: '',
    signedBy: '',
    notes: '',
  });
  const [submittingPod, setSubmittingPod] = useState(false);

  useEffect(() => {
    if (id) fetchOrderById(id);
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    if (!order) return;
    if (status === 'DELIVERED') {
      setShowPodModal(true);
      return;
    }
    await updateStatus(order.id, status);
  };

  const handleSubmitPod = async () => {
    if (!order) return;
    try {
      setSubmittingPod(true);
      await OrdersService.submitPod(order.id, {
        photos: [],
        signatureUrl: 'signature-placeholder',
        recipientName: podData.recipientName,
        signedBy: podData.signedBy,
        notes: podData.notes,
      });
      setShowPodModal(false);
      await fetchOrderById(order.id);
    } catch {
    } finally {
      setSubmittingPod(false);
    }
  };

  const openWaze = (address: string, city: string) => {
    const query = encodeURIComponent(`${address}, ${city}`);
    window.open(`https://waze.com/ul?q=${query}&navigate=yes`);
  };

  if (isLoading || !order) {
    return <PageLoader text="טוען הזמנה..." />;
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(p);

  const nextAction = () => {
    switch (order.status) {
      case OrderStatus.ACCEPTED:
        return {
          label: '🚗 יצאתי לאיסוף',
          status: 'PICKUP',
          color: 'primary' as const,
        };
      case OrderStatus.PICKUP:
        return {
          label: '📦 נסעתי עם המטען',
          status: 'IN_TRANSIT',
          color: 'primary' as const,
        };
      case OrderStatus.IN_TRANSIT:
        return {
          label: '✅ מסרתי את המטען',
          status: 'DELIVERED',
          color: 'primary' as const,
        };
      default:
        return null;
    }
  };

  const action = nextAction();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/driver/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              → חזרה
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Main Action Button */}
        {action && (
          <div className="mb-6">
            <Button
              fullWidth
              size="lg"
              variant={action.color}
              isLoading={isLoading}
              onClick={() => handleStatusUpdate(action.status)}
              className="text-lg py-4"
            >
              {action.label}
            </Button>
          </div>
        )}

        {/* Delivered State */}
        {order.status === OrderStatus.DELIVERED && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-green-800">
              המטען נמסר!
            </p>
            <p className="text-sm text-green-600 mt-1">
              ממתין לאישור העסק לשחרור התשלום
            </p>
          </div>
        )}

        {/* Completed State */}
        {order.status === OrderStatus.COMPLETED && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="font-semibold text-blue-800">
              ההובלה הושלמה!
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatPrice(order.driverPayout)}
            </p>
            <p className="text-sm text-blue-600">
              שוחרר לחשבונך
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Pickup */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <p className="font-semibold text-gray-900">
                    איסוף
                  </p>
                </div>
                <p className="text-gray-700">{order.pickupStreet}</p>
                <p className="text-gray-500 text-sm">
                  {order.pickupCity}
                </p>
                {order.pickupNotes && (
                  <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-lg px-2 py-1">
                    💬 {order.pickupNotes}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  openWaze(order.pickupStreet, order.pickupCity)
                }
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                🗺️ Waze
              </button>
            </div>
          </Card>

          {/* Dropoff */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <p className="font-semibold text-gray-900">יעד</p>
                </div>
                <p className="text-gray-700">{order.dropoffStreet}</p>
                <p className="text-gray-500 text-sm">
                  {order.dropoffCity}
                </p>
                {order.dropoffNotes && (
                  <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-lg px-2 py-1">
                    💬 {order.dropoffNotes}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  openWaze(order.dropoffStreet, order.dropoffCity)
                }
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                🗺️ Waze
              </button>
            </div>
          </Card>

          {/* Cargo Details */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              📦 פרטי מטען
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">תיאור</p>
                <p className="font-medium">{order.cargoDescription}</p>
              </div>
              <div>
                <p className="text-gray-500">משקל</p>
                <p className="font-medium">{order.cargoWeightKg} ק"ג</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {order.cargoIsFragile && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  🔮 שביר
                </span>
              )}
              {order.cargoIsHazmat && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  ⚗️ חומ"ס
                </span>
              )}
              {order.cargoRequiresRefrigeration && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  ❄️ קירור
                </span>
              )}
            </div>
          </Card>

          {/* Payout */}
          <Card className="bg-green-50 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">
                  תשלום עבור הובלה זו
                </p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {formatPrice(order.driverPayout)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>

          {/* Business Contact */}
          {order.business && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">לקוח</p>
                  <p className="font-medium text-gray-900">
                    {order.business.companyName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.business.contactPerson}
                  </p>
                </div>
                
                  href={`tel:${order.business.user?.phone}`}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100"
                >
                  📞 התקשר
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* POD Modal */}
      <Modal
        isOpen={showPodModal}
        onClose={() => setShowPodModal(false)}
        title="📋 אישור מסירה"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowPodModal(false)}
            >
              ביטול
            </Button>
            <Button
              isLoading={submittingPod}
              onClick={handleSubmitPod}
              disabled={!podData.recipientName}
            >
              ✅ אשר מסירה
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            מלא את פרטי המסירה לפני האישור
          </p>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              שם מקבל המטען
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={podData.recipientName}
              onChange={(e) =>
                setPodData((p) => ({
                  ...p,
                  recipientName: e.target.value,
                }))
              }
              placeholder="שם מלא"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              חתום על ידי
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={podData.signedBy}
              onChange={(e) =>
                setPodData((p) => ({
                  ...p,
                  signedBy: e.target.value,
                }))
              }
              placeholder="שם החותם"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              הערות
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
              value={podData.notes}
              onChange={(e) =>
                setPodData((p) => ({
                  ...p,
                  notes: e.target.value,
                }))
              }
              placeholder="הערות נוספות..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActiveOrder;

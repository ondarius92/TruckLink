import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../store/orders.store';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Spinner';
import { OrderStatus } from '../../types';
import { VEHICLE_TYPE_LABELS } from '../../constants';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedOrder: order,
    isLoading,
    fetchOrderById,
    confirmDelivery,
    cancelOrder,
  } = useOrdersStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    if (id) fetchOrderById(id);
  }, [id]);

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
      hour: '2-digit',
      minute: '2-digit',
    });

  if (isLoading || !order) return <PageLoader text="טוען הזמנה..." />;

  const canCancel = [
    OrderStatus.PENDING,
    OrderStatus.MATCHING,
    OrderStatus.ACCEPTED,
  ].includes(order.status);

  const canConfirm = order.status === OrderStatus.DELIVERED;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/business/orders')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
            >
              → חזרה להזמנות
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Confirm Delivery Banner */}
        {canConfirm && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">
                📦 המטען נמסר!
              </p>
              <p className="text-sm text-green-600 mt-1">
                אשר את קבלת המטען לשחרור התשלום לנהג
              </p>
            </div>
            <Button
              onClick={() => confirmDelivery(order.id)}
              isLoading={isLoading}
            >
              ✅ אשר אספקה
            </Button>
          </div>
        )}

        <div className="grid gap-4">
          {/* Route */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              📍 מסלול
            </h3>
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="w-0.5 flex-1 bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.pickupCity}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.pickupStreet}
                  </p>
                  {order.pickupNotes && (
                    <p className="text-xs text-blue-600 mt-1">
                      💬 {order.pickupNotes}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {order.dropoffCity}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.dropoffStreet}
                  </p>
                  {order.dropoffNotes && (
                    <p className="text-xs text-blue-600 mt-1">
                      💬 {order.dropoffNotes}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">מרחק</p>
                <p className="font-medium">
                  {Math.round(order.distanceKm)} ק"מ
                </p>
              </div>
            </div>
          </Card>

          {/* Cargo */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
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
              <div>
                <p className="text-gray-500">סוג רכב</p>
                <p className="font-medium">
                  {VEHICLE_TYPE_LABELS[order.vehicleTypeRequired]}
                </p>
              </div>
              <div>
                <p className="text-gray-500">תאריך</p>
                <p className="font-medium">
                  {formatDate(order.scheduledAt)}
                </p>
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

          {/* Driver */}
          {order.driver && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                🚛 פרטי נהג
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                  🧑
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {order.driver.user?.firstName}{' '}
                    {order.driver.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    ⭐ {order.driver.rating.toFixed(1)} ·{' '}
                    {order.driver.totalTrips} הובלות
                  </p>
                </div>
                
                  href={`tel:${order.driver.user?.phone}`}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                >
                  📞 התקשר
                </a>
              </div>
            </Card>
          )}

          {/* Price Breakdown */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              💰 פירוט מחיר
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">מחיר בסיס</span>
                <span>{formatPrice(order.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">תוספת מרחק</span>
                <span>{formatPrice(order.distanceFee)}</span>
              </div>
              {order.featuresSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">תוספות רכב</span>
                  <span>{formatPrice(order.featuresSurcharge)}</span>
                </div>
              )}
              {order.paymentTermsSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">תוספת שוטף+</span>
                  <span>{formatPrice(order.paymentTermsSurcharge)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">עמלת פלטפורמה</span>
                <span>{formatPrice(order.platformFee)}</span>
              </div>
              {order.insuranceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ביטוח מטען</span>
                  <span>{formatPrice(order.insuranceFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">מע"מ</span>
                <span>{formatPrice(order.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>סה"כ לתשלום</span>
                <span className="text-blue-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          {order.events && order.events.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                ⏱️ ציר זמן
              </h3>
              <div className="space-y-3">
                {order.events.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1" />
                      {i < order.events!.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <StatusBadge status={event.status} size="sm" />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(event.createdAt)}
                      </p>
                      {event.note && (
                        <p className="text-xs text-gray-600 mt-1">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {canCancel && (
              <Button
                variant="danger"
                fullWidth
                onClick={() => setShowCancelModal(true)}
              >
                ❌ בטל הזמנה
              </Button>
            )}
            {order.status === OrderStatus.COMPLETED && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowDisputeModal(true)}
              >
                ⚠️ פתח מחלוקת
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="ביטול הזמנה"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              חזרה
            </Button>
            <Button
              variant="danger"
              isLoading={isLoading}
              onClick={async () => {
                await cancelOrder(order.id, cancelReason);
                setShowCancelModal(false);
              }}
              disabled={!cancelReason}
            >
              אשר ביטול
            </Button>
          </>
        }
      >
        <p className="text-gray-600 mb-4">
          האם אתה בטוח שברצונך לבטל את ההזמנה?
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm"
          rows={3}
          placeholder="סיבת הביטול..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="פתיחת מחלוקת"
      >
        <p className="text-gray-600">
          לפתיחת מחלוקת, צור קשר עם התמיכה שלנו או שלח אימייל ל-
          
            href="mailto:support@trucklink.co.il"
            className="text-blue-600"
          >
            support@trucklink.co.il
          </a>
        </p>
      </Modal>
    </div>
  );
};

export default OrderDetail;

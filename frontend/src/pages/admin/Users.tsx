import React, { useEffect, useState } from 'react';
import UsersService from '../../services/users.service';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import { User, UserRole, UserStatus } from '../../types';

const statusColors: Record<UserStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  BANNED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<UserStatus, string> = {
  PENDING: 'ממתין',
  ACTIVE: 'פעיל',
  SUSPENDED: 'מושעה',
  BANNED: 'חסום',
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await UsersService.getAllUsers(
        page,
        20,
        roleFilter || undefined,
      );
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (driverId: string) => {
    try {
      setActionLoading(driverId);
      await UsersService.approveDriver(driverId);
      await loadUsers();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      setActionLoading(userId);
      await UsersService.suspendUser(userId, 'הושעה על ידי אדמין');
      await loadUsers();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            👥 ניהול משתמשים
          </h1>
          <span className="text-sm text-gray-500">
            סה"כ {total} משתמשים
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: '', label: 'הכל' },
            { value: UserRole.DRIVER, label: '🚛 נהגים' },
            { value: UserRole.BUSINESS, label: '🏢 עסקים' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setRoleFilter(f.value);
                setPage(1);
              }}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${roleFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <PageLoader text="טוען משתמשים..." />
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                    {user.role === UserRole.DRIVER ? '🚛' : '🏢'}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <span
                        className={`
                          text-xs px-2 py-0.5 rounded-full font-medium
                          ${statusColors[user.status]}
                        `}
                      >
                        {statusLabels[user.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.phone} · {user.email}
                    </p>
                    {user.role === UserRole.BUSINESS &&
                      user.business && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          🏢 {user.business.companyName} ·{' '}
                          {user.business.city}
                        </p>
                      )}
                    {user.role === UserRole.DRIVER &&
                      user.driver && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ⭐ {user.driver.rating.toFixed(1)} ·{' '}
                          {user.driver.totalTrips} הובלות
                        </p>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {user.status === UserStatus.PENDING &&
                      user.role === UserRole.DRIVER &&
                      user.driver && (
                        <Button
                          size="sm"
                          isLoading={
                            actionLoading === user.driver.id
                          }
                          onClick={() =>
                            handleApprove(user.driver!.id)
                          }
                        >
                          ✅ אשר
                        </Button>
                      )}
                    {user.status === UserStatus.ACTIVE && (
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={actionLoading === user.id}
                        onClick={() => handleSuspend(user.id)}
                      >
                        🚫 השעה
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              → הקודם
            </Button>
            <span className="text-sm text-gray-600">
              עמוד {page} מתוך {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              הבא ←
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

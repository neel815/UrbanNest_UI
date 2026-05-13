'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import BellIcon from '@/assets/icons/bell.svg';
import WrenchIcon from '@/assets/icons/wrench.svg';
import PersonIcon from '@/assets/icons/person.svg';
import RupeeIcon from '@/assets/icons/rupee.svg';
import AnnouncementIcon from '@/assets/icons/announcement.svg';
import IncidentIcon from '@/assets/icons/incident.svg';
import CheckIcon from '@/assets/icons/check.svg';
import UserApprovalIcon from '@/assets/icons/user-approval.svg';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id: string | null;
  related_type: string | null;
  created_at: string;
}

type NotificationListPayload = {
  notifications: Notification[];
  unread_count: number;
};

function timeAgo(value: string) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return '';

  const diffMinutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function iconForType(type: string) {
  const className = 'h-4.5 w-4.5';
  
  if (type.includes('maintenance')) return <WrenchIcon className={className} />;
  if (type.includes('visitor')) return <PersonIcon className={className} />;
  if (type.includes('payment_due')) return <RupeeIcon className={className} />;
  if (type.includes('payment_update') || type.includes('payment_paid') || type.includes('payment_waived')) return <CheckIcon className={className} />;
  if (type.includes('announcement')) return <AnnouncementIcon className={className} />;
  if (type.includes('incident')) return <IncidentIcon className={className} />;
  if (type.includes('approval') || type.includes('resident_approval')) return <UserApprovalIcon className={className} />;
  
  return <BellIcon className={className} />;
}

export default function NotificationBell() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.get(API_ENDPOINTS.notifications.list)) as NotificationListPayload;
      setNotifications(Array.isArray(response?.notifications) ? response.notifications : []);
      setUnreadCount(Number(response?.unread_count || 0));
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getNotificationHref = (notification: Notification) => {
    const relatedId = notification.related_id;
    const relatedType = notification.related_type || notification.type;
    const modulePrefix = pathname?.startsWith('/security')
      ? '/security'
      : pathname?.startsWith('/resident')
        ? '/resident'
        : pathname?.startsWith('/system-admin')
          ? '/system-admin'
          : '/admin';

    if (relatedType.includes('announcement')) {
      return `${modulePrefix}/announcements${relatedId ? `?highlight=${relatedId}` : ''}`;
    }

    if (relatedType.includes('maintenance')) {
      return `${modulePrefix}/maintenance${relatedId ? `?highlight=${relatedId}` : ''}`;
    }

    if (relatedType.includes('payment')) {
      return `${modulePrefix}/payments${relatedId ? `?highlight=${relatedId}` : ''}`;
    }

    if (relatedType.includes('visitor')) {
      return `${modulePrefix}/visitors${relatedId ? `?highlight=${relatedId}` : ''}`;
    }

    if (relatedType.includes('incident')) {
      return `${modulePrefix}/incidents${relatedId ? `?highlight=${relatedId}` : ''}`;
    }

    return modulePrefix;
  };

  const openNotification = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await apiClient.patch(API_ENDPOINTS.notifications.markRead(notification.id), {});
      }
      await fetchNotifications();
      setIsOpen(false);
      router.push(getNotificationHref(notification));
    } catch (error) {
      console.error(getApiErrorMessage(error));
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch(API_ENDPOINTS.notifications.markAllRead, {});
      await fetchNotifications();
    } catch (error) {
      console.error(getApiErrorMessage(error));
    }
  };

  const visibleNotifications = notifications.slice(0, 10);
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#E6E0CF] bg-[#FBF8EF] shadow-[0_8px_24px_rgba(23,51,38,0.04)] transition hover:-translate-y-0.5"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-5 w-5 text-[#173326]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#D14C4C] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[#FBF8EF]">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] shadow-[0_24px_60px_rgba(23,51,38,0.16)]">
          <div className="flex items-center justify-between border-b border-[#E6E0CF] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-[#173326]">Notifications</p>
              <p className="mt-0.5 text-xs text-[#7A7F70]">{loading ? 'Refreshing...' : `${notifications.length} recent`}</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#0F5B35] transition hover:bg-[#EAF3E8]"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-3">
            {visibleNotifications.length > 0 ? (
              <div className="space-y-2.5">
                {visibleNotifications.map((notification) => {
                  const isUnread = !notification.is_read;
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={[
                        'flex w-full items-start gap-3.5 rounded-2xl px-4 py-3.5 text-left transition',
                        isUnread ? 'bg-white shadow-sm' : 'bg-[#F4F1E8] hover:bg-[#EEE9DC]',
                      ].join(' ')}
                    >
                      <div className={[
                        'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                        isUnread ? 'bg-[#0F5B35] text-white' : 'bg-[#E5E1D4] text-[#5C6457]',
                      ].join(' ')}>
                        {iconForType(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className={['text-sm', isUnread ? 'font-semibold text-[#173326]' : 'font-medium text-[#324039]'].join(' ')}>
                            {notification.title}
                          </p>
                          <span className="shrink-0 pt-0.5 text-[11px] text-[#7A7F70]">{timeAgo(notification.created_at)}</span>
                        </div>
                        <p className="mt-2 max-w-full overflow-hidden text-ellipsis text-sm text-[#637062]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {notification.message}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#E8E2D3] text-[#7A7F70]">
                  <BellIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#173326]">No notifications yet</p>
                  <p className="mt-1 text-xs text-[#7A7F70]">Updates from the society will appear here.</p>
                </div>
              </div>
            )}
          </div>

          {notifications.length > 10 ? (
            <div className="border-t border-[#E6E0CF] px-4 py-3 text-xs font-medium text-[#7A7F70]">Showing latest 10</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
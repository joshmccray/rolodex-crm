import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/client';

export function useNotifications(options = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifData, countData] = await Promise.all([
        notificationsApi.getAll(options),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(notifData.notifications);
      setTotal(notifData.total);
      setUnreadCount(countData.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.unreadOnly, options.limit, options.offset]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    await notificationsApi.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotal((prev) => prev - 1);
    if (notif && !notif.readAt) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    total,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

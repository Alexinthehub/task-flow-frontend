import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { Bell, Check, Clock } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const handleNew = () => fetchNotifications();
    window.addEventListener('notificationCreated', handleNew);
    return () => window.removeEventListener('notificationCreated', handleNew);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
      window.dispatchEvent(new CustomEvent('notificationMarkedRead'));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications([]);
      window.dispatchEvent(new CustomEvent('notificationMarkedRead'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Check size={18} /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No unread notifications. You're all caught up! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{notification.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm px-3 py-1 border border-blue-300 dark:border-blue-500/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-400/10 transition"
              >
                Mark as Read
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
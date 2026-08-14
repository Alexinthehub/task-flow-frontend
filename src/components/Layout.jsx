import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  ListTodo, 
  Bell, 
  User, 
  LogOut 
} from 'lucide-react';
import TrashBin from './TrashBin';
import { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const handleNew = () => fetchUnreadCount();
    window.addEventListener('notificationCreated', handleNew);
    window.addEventListener('notificationMarkedRead', handleNew);
    return () => {
      window.removeEventListener('notificationCreated', handleNew);
      window.removeEventListener('notificationMarkedRead', handleNew);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setTimeout(() => {
      navigate('/login');
      setIsLoggingOut(false);
    }, 3000);
  };

  if (isLoggingOut) {
    return <LoadingSpinner />;
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/tasks', icon: ListTodo, label: t('tasks') },
    { path: '/notifications', icon: Bell, label: t('notifications'), badge: unreadCount },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  // Build avatar URL with cache buster
  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar + '?v=' + Date.now();
    }
    return null;
  };

  const getInitial = () => {
    const email = user?.email || '';
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TaskFlow</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your tasks</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition mt-auto"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto relative bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.textContent = getInitial();
                  }}
                />
              ) : (
                <span>{getInitial()}</span>
              )}
            </div>
          </div>
        </div>
        {children}
        <TrashBin />
      </main>
    </div>
  );
};

export default Layout;
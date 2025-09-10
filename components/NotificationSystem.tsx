'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast = ({ notification, onClose }: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          icon: '✅',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-200'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          icon: '❌',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          icon: '⚠️',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          icon: 'ℹ️',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          icon: 'ℹ️',
          iconColor: 'text-gray-600 dark:text-gray-400',
          titleColor: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.iconColor} mr-3 mt-0.5`}>
          <span className="text-lg">{styles.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.titleColor} mb-1`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {notification.message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Utility functions for common notification types
export const showSuccess = (addNotification: NotificationContextType['addNotification']) => 
  (title: string, message?: string) => {
    addNotification({ type: 'success', title, message });
  };

export const showError = (addNotification: NotificationContextType['addNotification']) => 
  (title: string, message?: string) => {
    addNotification({ type: 'error', title, message });
  };

export const showWarning = (addNotification: NotificationContextType['addNotification']) => 
  (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message });
  };

export const showInfo = (addNotification: NotificationContextType['addNotification']) => 
  (title: string, message?: string) => {
    addNotification({ type: 'info', title, message });
  };

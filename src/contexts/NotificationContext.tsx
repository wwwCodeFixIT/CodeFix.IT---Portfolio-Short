import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    const duration = notification.duration || 5000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl flex items-start gap-3"
            >
              <div className={`w-8 h-8 rounded-full ${getColor(notification.type)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                {notification.message && (
                  <p className="text-zinc-400 text-xs mt-1">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

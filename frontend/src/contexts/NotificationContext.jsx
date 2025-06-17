import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection for real-time notifications
    // In production, this would be a real WebSocket connection
    const simulateConnection = () => {
      setIsConnected(true);
      
      // Simulate periodic notifications
      const interval = setInterval(() => {
        const notificationTypes = [
          {
            type: 'election_started',
            title: 'Elección Iniciada',
            message: 'La elección "Elección de Prueba 2024" ha comenzado',
            priority: 'info'
          },
          {
            type: 'high_participation',
            title: 'Alta Participación',
            message: 'Se ha alcanzado el 75% de participación en la elección actual',
            priority: 'success'
          },
          {
            type: 'system_alert',
            title: 'Alerta del Sistema',
            message: 'Carga alta detectada en el servidor. Monitoreando...',
            priority: 'warning'
          },
          {
            type: 'election_closing',
            title: 'Elección Cerrando',
            message: 'La elección cerrará en 30 minutos',
            priority: 'info'
          }
        ];

        // Randomly show a notification every 30-60 seconds
        if (Math.random() > 0.7) {
          const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          addNotification(randomNotification);
        }
      }, 45000); // Every 45 seconds

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = simulateConnection();
    return cleanup;
  }, []);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50

    // Auto-remove after 10 seconds for non-critical notifications
    if (notification.priority !== 'error') {
      setTimeout(() => {
        removeNotification(id);
      }, 10000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};


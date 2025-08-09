import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Get data from localStorage-based mock storage
const getMockRealtimeStorage = (path: string): any[] => {
  try {
    const key = `mock_${path}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.warn('Error loading mock realtime storage:', error);
    return [];
  }
};

// Save data to localStorage-based mock storage
const saveMockRealtimeStorage = (path: string, data: any[]) => {
  try {
    const key = `mock_${path}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving mock realtime storage:', error);
  }
};

export const useRealtimeDb = <T extends Record<string, any>>(
  path: string,
  userId?: string
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();

  const currentUserId = userId || userData?.id;

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        // Get data from localStorage-based mock storage
        let items = getMockRealtimeStorage(path);
        
        // Filter by userId if provided
        if (currentUserId) {
          items = items.filter(item => item.userId === currentUserId);
        }

        setData(items as T[]);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Mock RealtimeDB error:', err);
        setError(err.message);
        setLoading(false);
      }
    }, 300); // Simulate network delay

    return () => clearTimeout(timer);
  }, [path, currentUserId, userData]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const newItem = {
        ...item,
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUserId,
        timestamp: new Date().toISOString(),
      };
      
      const currentItems = getMockRealtimeStorage(path);
      const updatedItems = [...currentItems, newItem];
      saveMockRealtimeStorage(path, updatedItems);
      setData(prev => [...prev, newItem as T]);
      
      return newItem.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const currentItems = getMockRealtimeStorage(path);
      const index = currentItems.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      );
      saveMockRealtimeStorage(path, updatedItems);
      
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const currentItems = getMockRealtimeStorage(path);
      const index = currentItems.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      const updatedItems = currentItems.filter(item => item.id !== id);
      saveMockRealtimeStorage(path, updatedItems);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await update(id, { read: true, readAt: new Date().toISOString() } as Partial<T>);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addNotification = async (notification: {
    type: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    try {
      const newNotification = {
        userId: currentUserId,
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      };

      const currentItems = getMockRealtimeStorage('notifications');
      const notificationId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullNotification = {
        ...newNotification,
        id: notificationId
      };

      const updatedItems = [...currentItems, fullNotification];
      saveMockRealtimeStorage('notifications', updatedItems);
      return notificationId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateHealthMetrics = async (metrics: Record<string, any>) => {
    try {
      const currentItems = getMockRealtimeStorage('health_metrics');
      const existingIndex = currentItems.findIndex(
        item => item.userId === currentUserId
      );

      const updatedMetrics = {
        userId: currentUserId,
        ...metrics,
        updatedAt: new Date().toISOString(),
      };

      let updatedItems;
      if (existingIndex !== -1) {
        updatedItems = currentItems.map((item, index) => 
          index === existingIndex ? updatedMetrics : item
        );
      } else {
        updatedItems = [...currentItems, updatedMetrics];
      }
      
      saveMockRealtimeStorage('health_metrics', updatedItems);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addHealthAlert = async (alert: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }) => {
    try {
      const newAlert = {
        userId: currentUserId,
        ...alert,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };

      const currentItems = getMockRealtimeStorage('health_alerts');
      const alertId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullAlert = {
        ...newAlert,
        id: alertId
      };

      const updatedItems = [...currentItems, fullAlert];
      saveMockRealtimeStorage('health_alerts', updatedItems);
      return alertId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const acknowledgeAlert = async (id: string) => {
    try {
      await update(id, { acknowledged: true, acknowledgedAt: new Date().toISOString() } as Partial<T>);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    data, 
    loading, 
    error, 
    add, 
    update, 
    remove, 
    markAsRead,
    addNotification,
    updateHealthMetrics,
    addHealthAlert,
    acknowledgeAlert
  };
};

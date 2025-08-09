import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Get data from localStorage-based mock storage
const getMockStorage = (collectionName: string): any[] => {
  try {
    const key = `mock_${collectionName}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.warn('Error loading mock storage:', error);
    return [];
  }
};

// Save data to localStorage-based mock storage
const saveMockStorage = (collectionName: string, data: any[]) => {
  try {
    const key = `mock_${collectionName}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving mock storage:', error);
  }
};

export const useFirestore = <T extends Record<string, any>>(
  collectionName: string,
  filters?: { field: string; operator: any; value: any }[]
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (!userData) {
      setLoading(false);
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        // Get data from localStorage-based mock storage
        let items = getMockStorage(collectionName);
        
        // Apply filters if provided
        if (filters && filters.length > 0) {
          items = items.filter(item => {
            return filters.every(filter => {
              const itemValue = item[filter.field];
              switch (filter.operator) {
                case '==':
                  return itemValue === filter.value;
                case '!=':
                  return itemValue !== filter.value;
                case '>':
                  return itemValue > filter.value;
                case '<':
                  return itemValue < filter.value;
                case '>=':
                  return itemValue >= filter.value;
                case '<=':
                  return itemValue <= filter.value;
                case 'array-contains':
                  return Array.isArray(itemValue) && itemValue.includes(filter.value);
                default:
                  return true;
              }
            });
          });
        }

        setData(items as T[]);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Mock Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, [collectionName, JSON.stringify(filters), userData]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const newItem = {
        ...item,
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      
      const currentItems = getMockStorage(collectionName);
      const updatedItems = [...currentItems, newItem];
      saveMockStorage(collectionName, updatedItems);
      setData(prev => [...prev, newItem as T]);
      
      return newItem.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const currentItems = getMockStorage(collectionName);
      const index = currentItems.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      );
      saveMockStorage(collectionName, updatedItems);
      
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
      const currentItems = getMockStorage(collectionName);
      const index = currentItems.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      const updatedItems = currentItems.filter(item => item.id !== id);
      saveMockStorage(collectionName, updatedItems);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getById = async (id: string): Promise<T | null> => {
    try {
      const currentItems = getMockStorage(collectionName);
      const item = currentItems.find(item => item.id === id);
      return item ? item as T : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const refresh = () => {
    setLoading(true);
  };

  return { 
    data, 
    loading, 
    error, 
    add, 
    update, 
    remove, 
    getById, 
    refresh 
  };
};

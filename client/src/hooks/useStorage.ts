import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!userData) {
      throw new Error('User not authenticated');
    }

    setUploading(true);
    setError(null);

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock download URL
      const mockDownloadURL = `https://mock-storage.example.com/${path}/${userData.id}/${file.name}`;
      return mockDownloadURL;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string) => {
    try {
      // Simulate file deletion delay
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Mock file deleted:', path);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { uploadFile, deleteFile, uploading, error };
};

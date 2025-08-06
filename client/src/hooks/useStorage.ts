import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
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
      const fileRef = ref(storage, `${path}/${userData.id}/${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string) => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { uploadFile, deleteFile, uploading, error };
};

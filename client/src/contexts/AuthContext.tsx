import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db, DEMO_USERS } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'lab';
  plan: 'personal' | 'family';
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: string, plan?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle demo users with custom authentication
      if (DEMO_USERS[email as keyof typeof DEMO_USERS] && password === 'password123') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createError: any) {
          if (createError.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: string, plan = 'personal') => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userDoc = {
        id: user.uid,
        email: user.email!,
        role: role as 'patient' | 'doctor' | 'lab',
        plan: plan as 'personal' | 'family',
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const fetchUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData({
          id: user.uid,
          email: user.email!,
          role: data.role,
          plan: data.plan,
        });
      } else {
        // Handle demo users
        const demoUser = DEMO_USERS[user.email as keyof typeof DEMO_USERS];
        if (demoUser) {
          const userDoc = {
            id: user.uid,
            email: user.email!,
            role: demoUser.role as 'patient' | 'doctor' | 'lab',
            plan: demoUser.plan as 'personal' | 'family',
            createdAt: serverTimestamp(),
          };
          
          await setDoc(userDocRef, userDoc);
          setUserData({
            id: user.uid,
            email: user.email!,
            role: demoUser.role as 'patient' | 'doctor' | 'lab',
            plan: demoUser.plan as 'personal' | 'family',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

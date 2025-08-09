import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateDemoData } from '@/lib/demoData';

// Mock User interface to replace Firebase User
interface MockUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerId: string;
  metadata: any;
  providerData: any[];
  refreshToken: string;
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => any;
}

interface UserData {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'lab';
  plan: 'personal' | 'family';
  name?: string;
  age?: number;
  phone?: string;
  specialization?: string;
  address?: string;
}

interface AuthContextType {
  currentUser: MockUser | null;
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

// Demo users configuration
const DEMO_USERS = {
  'patient@demo.com': {
    role: 'patient',
    plan: 'family',
    name: 'John Smith',
    age: 35,
    phone: '+1-555-0123',
    address: '123 Health St, Medical City, MC 12345'
  },
  'doctor@demo.com': {
    role: 'doctor',
    plan: 'personal',
    name: 'Dr. Sarah Johnson',
    age: 42,
    phone: '+1-555-0124',
    specialization: 'Cardiology',
    address: '456 Medical Ave, Health Town, HT 67890'
  },
  'lab@demo.com': {
    role: 'lab',
    plan: 'personal',
    name: 'Dr. Michael Chen',
    age: 38,
    phone: '+1-555-0125',
    specialization: 'Laboratory Sciences',
    address: '789 Test Blvd, Lab City, LC 11111'
  }
};

// Mock user for demo purposes
const createMockUser = (email: string): MockUser => ({
  uid: `demo-${email.split('@')[0]}-${Date.now()}`,
  email,
  emailVerified: true,
  displayName: null,
  photoURL: null,
  phoneNumber: null,
  providerId: 'password',
  metadata: {} as any,
  providerData: [],
  refreshToken: 'mock-refresh-token',
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      // Check if it's a demo user
      if (DEMO_USERS[email as keyof typeof DEMO_USERS] && password === 'password123') {
        const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
        const mockUser = createMockUser(email);
        
        // Set user data immediately for demo users
        const userData: UserData = {
          id: mockUser.uid,
          email: email,
          role: demoUser.role as 'patient' | 'doctor' | 'lab',
          plan: demoUser.plan as 'personal' | 'family',
          name: demoUser.name,
          age: demoUser.age,
          phone: demoUser.phone,
          specialization: demoUser.specialization,
          address: demoUser.address,
        };
        
        setCurrentUser(mockUser);
        setUserData(userData);
        
        // Store in localStorage for persistence
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        localStorage.setItem('demoUserData', JSON.stringify(userData));
        
        // Initialize demo data
        try {
          console.log('Initializing demo data for new user...');
          await generateDemoData(mockUser.uid, userData.role, email);
          toast({
            title: 'Demo Data Loaded',
            description: 'Your demo data has been initialized successfully!',
            variant: 'default',
          });
        } catch (error) {
          console.error('Error initializing demo data:', error);
          toast({
            title: 'Demo Data Error',
            description: 'Failed to initialize demo data. Please try refreshing the page.',
            variant: 'destructive',
          });
        }
        
        return;
      }

      // For non-demo users, show error since we're in demo mode
      throw new Error('Only demo accounts are available. Please use one of the demo accounts provided.');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear demo user data
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoUserData');
      
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: string, plan = 'personal') => {
    try {
      // For demo mode, only allow demo user signup
      if (!DEMO_USERS[email as keyof typeof DEMO_USERS]) {
        throw new Error('Only demo accounts are available. Please use one of the demo accounts provided.');
      }
      
      // Use the login function for demo users
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const fetchUserData = async (user: MockUser) => {
    try {
      // Check if it's a demo user
      const demoUser = DEMO_USERS[user.email as keyof typeof DEMO_USERS];
      if (demoUser) {
        const userData: UserData = {
          id: user.uid,
          email: user.email!,
          role: demoUser.role as 'patient' | 'doctor' | 'lab',
          plan: demoUser.plan as 'personal' | 'family',
          name: demoUser.name,
          age: demoUser.age,
          phone: demoUser.phone,
          specialization: demoUser.specialization,
          address: demoUser.address,
        };
        setUserData(userData);
        
        // Initialize demo data
        try {
          console.log('Initializing demo data for existing user...');
          await generateDemoData(user.uid, userData.role, user.email!);
        } catch (error) {
          console.error('Error initializing demo data:', error);
          toast({
            title: 'Demo Data Error',
            description: 'Failed to initialize demo data. Please try refreshing the page.',
            variant: 'destructive',
          });
        }
        
        return;
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
    // Check for demo user in localStorage first
    const demoUser = localStorage.getItem('demoUser');
    const demoUserData = localStorage.getItem('demoUserData');
    
    if (demoUser && demoUserData) {
      try {
        const user = JSON.parse(demoUser);
        const userData = JSON.parse(demoUserData);
        
        // Validate that we have the required data
        if (user && user.uid && userData && userData.role) {
          // Ensure email field is present
          if (!userData.email && user.email) {
            userData.email = user.email;
          }
          
          // Ensure all required fields are present
          const completeUserData: UserData = {
            id: user.uid,
            email: userData.email || user.email || 'patient@demo.com',
            role: userData.role,
            plan: userData.plan || 'personal',
            name: userData.name,
            age: userData.age,
            phone: userData.phone,
            specialization: userData.specialization,
            address: userData.address,
          };
          
          setCurrentUser(user);
          setUserData(completeUserData);
          setLoading(false);
          
          // Initialize demo data for restored demo user
          setTimeout(async () => {
            try {
              console.log('Initializing demo data for restored user...');
              await generateDemoData(user.uid, completeUserData.role, completeUserData.email);
            } catch (error) {
              console.error('Error initializing demo data for restored user:', error);
              // Don't clear the data on error, just log it
              console.warn('Demo data initialization failed, but continuing with existing data');
            }
          }, 1000);
          
          return;
        } else {
          // Invalid demo user data, clear it
          console.warn('Invalid demo user data found, clearing localStorage');
          localStorage.removeItem('demoUser');
          localStorage.removeItem('demoUserData');
        }
      } catch (error) {
        console.error('Error parsing demo user data:', error);
        // Clear invalid data
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoUserData');
      }
    }

    // For demo mode, we don't need Firebase auth listener
    // Just set loading to false if no demo user found
    setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
};

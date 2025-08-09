import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateDemoData } from '@/lib/demoData';
import { HealthcareLoading } from '@/components/ui/loading';

interface DashboardInitializerProps {
  children: React.ReactNode;
}

const DashboardInitializer: React.FC<DashboardInitializerProps> = ({ children }) => {
  const { userData } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    if (!userData || initializationComplete) return;

    const initializeDashboard = async () => {
      setIsInitializing(true);
      
      try {
        // Set a longer timeout for initialization
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 15000)
        );
        
        // Pass the correct parameters to generateDemoData
        const initPromise = generateDemoData(
          userData.id || 'demo-patient-1', 
          userData.role || 'patient', 
          userData.email
        );
        
        console.log('Starting dashboard initialization...');
        await Promise.race([initPromise, timeoutPromise]);
        console.log('Dashboard initialization completed successfully');
        
        setInitializationComplete(true);
      } catch (error) {
        console.warn('Dashboard initialization failed, continuing with demo mode:', error);
        // Continue with demo mode even if initialization fails
        setInitializationComplete(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, [userData, initializationComplete]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HealthcareLoading text="Initializing dashboard..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardInitializer;

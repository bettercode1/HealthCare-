import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  onShowLogin: () => void;
  onScrollToPlans: () => void;
  onScrollToFeatures: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onShowLogin, onScrollToPlans, onScrollToFeatures }) => {
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="material-icons text-3xl mr-2" style={{ color: 'hsl(207, 90%, 54%)' }}>local_hospital</span>
              <span className="text-xl font-bold text-gray-900">HealthCare Pro</span>
            </div>
          </div>
          
          {currentUser && userData ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-gray-600">account_circle</span>
                <span className="text-gray-700 font-medium">{userData.email}</span>
                <span 
                  className="px-2 py-1 text-white text-xs rounded-full capitalize"
                  style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                >
                  {userData.role}
                </span>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                <span className="material-icons">logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onScrollToPlans} className="text-gray-600 hover:text-gray-900">
                Plans
              </Button>
              <Button variant="ghost" onClick={onScrollToFeatures} className="text-gray-600 hover:text-gray-900">
                Features
              </Button>
              <Button 
                onClick={onShowLogin} 
                className="text-white hover:bg-blue-700"
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

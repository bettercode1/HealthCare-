import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, User, Shield, FlaskConical, Stethoscope } from 'lucide-react';

interface LoginModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const demoUsers = [
    {
      email: 'patient@demo.com',
      password: 'password123',
      role: t('patient'),
      icon: User,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: t('accessPatientDashboard')
    },
    {
      email: 'doctor@demo.com',
      password: 'password123',
      role: t('doctor'),
      icon: Stethoscope,
      color: 'bg-green-600 hover:bg-green-700',
      description: t('accessDoctorDashboard')
    },
    {
      email: 'lab@demo.com',
      password: 'password123',
      role: t('lab'),
      icon: FlaskConical,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: t('accessLabDashboard')
    }
  ];

  const handleDemoLogin = async (demoUser: typeof demoUsers[0]) => {
    setLoading(true);
    setEmail(demoUser.email);
    setPassword(demoUser.password);

    try {
      await login(demoUser.email, demoUser.password);
      onClose();
      setEmail('');
      setPassword('');
      toast({
        title: t('loginSuccessful'),
        description: t('welcomeUser', { role: demoUser.role }),
      });
    } catch (error: any) {
      toast({
        title: t('loginFailed'),
        description: error.message || t('pleaseTryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      setEmail('');
      setPassword('');
      toast({
        title: t('loginSuccessful'),
        description: t('welcomeToHealthcarePro'),
      });
    } catch (error: any) {
      toast({
        title: t('loginFailed'),
        description: error.message || t('checkCredentials'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield size={24} />
              {t('welcomeBack')}
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm mt-1">
              {t('signInToAccess')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* Demo Login Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('quickDemoAccess')}</h3>
            <div className="space-y-3">
              {demoUsers.map((user, index) => {
                const IconComponent = user.icon;
                return (
                  <Button
                    key={index}
                    onClick={() => handleDemoLogin(user)}
                    disabled={loading}
                    className={`w-full ${user.color} text-white font-medium py-4 flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <IconComponent size={18} />
                    <div className="text-left">
                      <div className="font-semibold">{user.role}</div>
                      <div className="text-xs opacity-90">{user.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('orSignInManually')}</span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailAddress')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterYourEmail')}
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterYourPassword')}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800 font-medium py-4 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="material-icons text-white mr-1">medical_services</span>
                  {t('signingIn')}
                </div>
              ) : (
                t('signIn')
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t('demoAccountsUsePassword')}: <span className="font-mono bg-gray-100 px-1 rounded">password123</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;

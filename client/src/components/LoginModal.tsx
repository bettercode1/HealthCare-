import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      setEmail('');
      setPassword('');
      toast({
        title: 'Login successful',
        description: 'Welcome to HealthCare Pro!',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Login</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="focus:ring-2 focus:border-transparent"
              style={{ '--ring': 'hsl(207, 90%, 54%)' } as React.CSSProperties}
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="focus:ring-2 focus:border-transparent"
              style={{ '--ring': 'hsl(207, 90%, 54%)' } as React.CSSProperties}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-white hover:bg-blue-700 font-medium"
            disabled={loading}
            style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>Patient: patient@example.com</p>
            <p>Doctor: doctor@example.com</p>
            <p>Lab: lab@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;

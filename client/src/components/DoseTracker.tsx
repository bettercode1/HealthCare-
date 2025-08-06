import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Dose {
  id: string;
  userId: string;
  memberName: string;
  doseName: string;
  time: string;
  date: string;
  status: 'taken' | 'pending' | 'missed';
  createdAt?: any;
}

const DoseTracker: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  
  const { data: doses, add: addDose, update: updateDose } = useFirestore<Dose>('doses', 
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  // Filter doses for today
  const today = new Date().toISOString().split('T')[0];
  const todayDoses = doses.filter(dose => dose.date === today);

  const markDoseTaken = async (doseId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'taken' ? 'pending' : 'taken';
      await updateDose(doseId, { status: newStatus });
      toast({
        title: 'Success',
        description: `Dose marked as ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update dose status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-500 text-white';
      case 'missed': return 'bg-red-500 text-white';
      default: return 'border-2 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return 'check';
      case 'missed': return 'close';
      default: return 'schedule';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Today's Doses</CardTitle>
          <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons">add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayDoses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No doses scheduled for today</p>
          ) : (
            todayDoses.map((dose) => (
              <div key={dose.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="material-icons text-green-600 text-sm">medication</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dose.doseName}</p>
                    <p className="text-sm text-gray-600">
                      {dose.time}
                      {dose.status === 'pending' && dose.time === '2:30 PM' && ' • Due soon'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markDoseTaken(dose.id, dose.status)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center p-0 ${getStatusColor(dose.status)}`}
                >
                  <span className="material-icons text-xs">
                    {getStatusIcon(dose.status)}
                  </span>
                </Button>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="link" className="w-full text-center p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
            View All Doses →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoseTracker;

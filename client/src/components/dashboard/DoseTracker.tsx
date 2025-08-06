import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDose, setNewDose] = useState({
    memberName: 'Self',
    doseName: '',
    time: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const { data: doses, add: addDose, update: updateDose, loading: dosesLoading } = useFirestore<Dose>('doses', 
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const { data: familyMembers } = useFirestore('family_members',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  // Filter doses for today
  const today = new Date().toISOString().split('T')[0];
  const todayDoses = doses.filter(dose => dose.date === today);

  // Sort doses by time
  const sortedTodayDoses = todayDoses.sort((a, b) => a.time.localeCompare(b.time));

  const markDoseTaken = async (doseId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'taken' ? 'pending' : 'taken';
      await updateDose(doseId, { status: newStatus });
      toast({
        title: 'Success',
        description: `Dose marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Update dose error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dose status',
        variant: 'destructive',
      });
    }
  };

  const handleAddDose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !newDose.doseName || !newDose.time) return;

    try {
      await addDose({
        userId: userData.id,
        memberName: newDose.memberName,
        doseName: newDose.doseName,
        time: newDose.time,
        date: newDose.date,
        status: 'pending',
      });

      setNewDose({
        memberName: 'Self',
        doseName: '',
        time: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);

      toast({
        title: 'Success',
        description: 'Dose added successfully',
      });
    } catch (error) {
      console.error('Add dose error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add dose',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string, time: string) => {
    if (status === 'taken') return 'bg-green-500 text-white';
    if (status === 'missed') return 'bg-red-500 text-white';
    
    // Check if dose is overdue
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    if (time < currentTime) return 'bg-red-100 text-red-600 border-red-300';
    
    return 'border-2 border-gray-300 text-gray-400';
  };

  const getStatusIcon = (status: string, time: string) => {
    if (status === 'taken') return 'check';
    if (status === 'missed') return 'close';
    
    // Check if dose is overdue
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    if (time < currentTime) return 'warning';
    
    return 'schedule';
  };

  const isDueNow = (time: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const doseTime = new Date(`2000-01-01T${time}`);
    const currentDateTime = new Date(`2000-01-01T${currentTime}`);
    const timeDiff = Math.abs(doseTime.getTime() - currentDateTime.getTime());
    return timeDiff <= 30 * 60 * 1000; // Within 30 minutes
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Today's Doses ({sortedTodayDoses.length})
          </CardTitle>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
                <span className="material-icons">add</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Dose</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDose} className="space-y-4">
                <div>
                  <Label htmlFor="memberName">For Member</Label>
                  <Select 
                    value={newDose.memberName} 
                    onValueChange={(value) => setNewDose(prev => ({ ...prev, memberName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self">Self</SelectItem>
                      {familyMembers.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="doseName">Medication Name</Label>
                  <Input
                    id="doseName"
                    value={newDose.doseName}
                    onChange={(e) => setNewDose(prev => ({ ...prev, doseName: e.target.value }))}
                    placeholder="e.g., Lisinopril 10mg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newDose.time}
                    onChange={(e) => setNewDose(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newDose.date}
                    onChange={(e) => setNewDose(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1 text-white hover:bg-blue-700"
                    style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                  >
                    Add Dose
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {dosesLoading ? (
            <Loading text="Loading doses..." />
          ) : sortedTodayDoses.length === 0 ? (
            <div className="text-center py-4">
              <span className="material-icons text-gray-400 text-3xl mb-2">medication</span>
              <p className="text-gray-500">No doses scheduled for today</p>
              <p className="text-sm text-gray-400">Add your first dose to get started</p>
            </div>
          ) : (
            sortedTodayDoses.map((dose) => (
              <div key={dose.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    dose.status === 'taken' ? 'bg-green-100' : 
                    dose.status === 'missed' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <span className={`material-icons text-sm ${
                      dose.status === 'taken' ? 'text-green-600' : 
                      dose.status === 'missed' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      medication
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dose.doseName}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{dose.time}</span>
                      {dose.memberName !== 'Self' && (
                        <>
                          <span>•</span>
                          <span>{dose.memberName}</span>
                        </>
                      )}
                      {isDueNow(dose.time) && dose.status === 'pending' && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600 font-medium">Due now</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markDoseTaken(dose.id, dose.status)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center p-0 ${getStatusColor(dose.status, dose.time)}`}
                  title={dose.status === 'taken' ? 'Mark as pending' : 'Mark as taken'}
                >
                  <span className="material-icons text-xs">
                    {getStatusIcon(dose.status, dose.time)}
                  </span>
                </Button>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Today's Progress</span>
            <span>
              {sortedTodayDoses.filter(d => d.status === 'taken').length} / {sortedTodayDoses.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: 'hsl(153, 72%, 51%)',
                width: sortedTodayDoses.length > 0 
                  ? `${(sortedTodayDoses.filter(d => d.status === 'taken').length / sortedTodayDoses.length) * 100}%`
                  : '0%'
              }}
            ></div>
          </div>
          <Button variant="link" className="w-full text-center mt-2 p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
            View All Doses →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoseTracker;

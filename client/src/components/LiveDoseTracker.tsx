import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Pill, 
  Calendar, 
  TrendingUp, 
  Timer, 
  Info, 
  Activity, 
  Zap, 
  Star, 
  Plus, 
  Target, 
  BarChart3,
  Heart,
  Shield,
  Sparkles,
  Award,
  CalendarDays,
  AlertCircle,
  ChevronRight,
  Edit3,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

interface DoseTracker {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  doseStrength?: string;
  doseForm?: string;
  administrationMethod?: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'pending' | 'taken' | 'skipped' | 'overdue';
  instructions?: string;
  notes?: string;
  doseTaken?: string;
  sideEffects?: string[];
  userId: string;
}

interface MedicationSchedule {
  id: string;
  medicineName: string;
  dosage: string;
  doseStrength?: string;
  doseForm?: string;
  administrationMethod?: string;
  times: string[];
  instructions: string;
  specialInstructions?: string;
  isRunning: boolean;
  totalDoses?: number;
  takenDoses?: number;
  adherenceRate?: number;
  lastTaken?: string;
  nextDose?: string;
  sideEffects?: string[];
  category?: string;
  color?: string;
}

const LiveDoseTracker: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [todayDoses, setTodayDoses] = useState<DoseTracker[]>([]);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDose, setSelectedDose] = useState<DoseTracker | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (currentUser?.uid) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicationsData, dosesData] = await Promise.all([
        api.medications.getMedications(),
        api.doses.getDoseRecords()
      ]);
      
      setMedications(medicationsData);
      
      // Filter today's doses with proper validation
      const today = new Date().toISOString().split('T')[0];
      const todayData = dosesData.filter((dose: DoseTracker) => 
        dose.scheduledTime && 
        typeof dose.scheduledTime === 'string' && 
        dose.scheduledTime.startsWith(today)
      );
      setTodayDoses(todayData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadData'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markDoseAsTaken = async (doseId: string, doseTaken?: string) => {
    try {
      const actualTime = new Date().toISOString();
      await api.doses.updateDoseRecord(doseId, {
        status: 'taken',
        actualTime,
        doseTaken: doseTaken || actualTime
      });

      setTodayDoses(prev => 
        prev.map(dose => 
          dose.id === doseId 
            ? { ...dose, status: 'taken', actualTime, doseTaken: doseTaken || actualTime }
            : dose
        )
      );

      toast({
        title: t('success'),
        description: t('doseMarkedAsTaken'),
      });
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      toast({
        title: t('error'),
        description: t('failedToMarkDose'),
        variant: 'destructive'
      });
    }
  };

  const markDoseAsSkipped = async (doseId: string) => {
    try {
      await api.doses.updateDoseRecord(doseId, {
        status: 'skipped'
      });

      setTodayDoses(prev => 
        prev.map(dose => 
          dose.id === doseId 
            ? { ...dose, status: 'skipped' }
            : dose
        )
      );

      toast({
        title: t('success'),
        description: t('doseMarkedAsSkipped'),
      });
    } catch (error) {
      console.error('Error marking dose as skipped:', error);
      toast({
        title: t('error'),
        description: t('failedToMarkDose'),
        variant: 'destructive'
      });
    }
  };

  const addNoteToDose = async (doseId: string) => {
    try {
      await api.doses.updateDoseRecord(doseId, {
        notes: noteText
      });

      setTodayDoses(prev => 
        prev.map(dose => 
          dose.id === doseId 
            ? { ...dose, notes: noteText }
            : dose
        )
      );

      setIsNoteDialogOpen(false);
      setNoteText('');
      
      toast({
        title: t('success'),
        description: t('noteAddedSuccessfully'),
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: t('error'),
        description: t('failedToAddNote'),
        variant: 'destructive'
      });
    }
  };

  const getCurrentDose = () => {
    try {
      const now = new Date();
      return todayDoses.find(dose => {
        if (!dose.scheduledTime) return false;
        const scheduledTime = new Date(dose.scheduledTime);
        if (isNaN(scheduledTime.getTime())) return false;
        const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
        return dose.status === 'pending' && timeDiff <= 30 * 60 * 1000; // Within 30 minutes
      });
    } catch (error) {
      console.error('Error getting current dose:', error);
      return null;
    }
  };

  const getNextDose = () => {
    try {
      const now = new Date();
      const pendingDoses = todayDoses.filter(dose => {
        if (!dose.scheduledTime) return false;
        const scheduledTime = new Date(dose.scheduledTime);
        return !isNaN(scheduledTime.getTime()) && dose.status === 'pending';
      });
      return pendingDoses.sort((a, b) => {
        const dateA = new Date(a.scheduledTime);
        const dateB = new Date(b.scheduledTime);
        return dateA.getTime() - dateB.getTime();
      })[0];
    } catch (error) {
      console.error('Error getting next dose:', error);
      return null;
    }
  };

  const getAdherenceRate = () => {
    if (todayDoses.length === 0) return 0;
    const takenDoses = todayDoses.filter(dose => dose.status === 'taken').length;
    return Math.round((takenDoses / todayDoses.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'skipped': return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'skipped': return <XCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getDoseFormLabel = (form?: string) => {
    const doseFormOptions = [
      { value: 'tablet', label: 'Tablet' },
      { value: 'capsule', label: 'Capsule' },
      { value: 'liquid', label: 'Liquid' },
      { value: 'injection', label: 'Injection' },
      { value: 'inhaler', label: 'Inhaler' },
      { value: 'cream', label: 'Cream/Ointment' },
      { value: 'drops', label: 'Drops' }
    ];
    const option = doseFormOptions.find(opt => opt.value === form);
    return option ? option.label : form;
  };

  const getAdministrationLabel = (method?: string) => {
    const administrationOptions = [
      { value: 'oral', label: 'Oral (By Mouth)' },
      { value: 'sublingual', label: 'Sublingual (Under Tongue)' },
      { value: 'topical', label: 'Topical (On Skin)' },
      { value: 'inhalation', label: 'Inhalation' },
      { value: 'injection', label: 'Injection' },
      { value: 'rectal', label: 'Rectal' },
      { value: 'nasal', label: 'Nasal' }
    ];
    const option = administrationOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return 'No time set';
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Blood Pressure': return <Heart className="w-4 h-4" />;
      case 'Diabetes': return <Target className="w-4 h-4" />;
      case 'Cholesterol': return <Shield className="w-4 h-4" />;
      case 'Respiratory': return <Activity className="w-4 h-4" />;
      case 'Supplements': return <Star className="w-4 h-4" />;
      case 'Pain Management': return <AlertCircle className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-50 text-green-700 border-green-200';
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getUpcomingDoses = () => {
    try {
      const now = new Date();
      return todayDoses.filter(dose => {
        if (!dose.scheduledTime) return false;
        const scheduledTime = new Date(dose.scheduledTime);
        return !isNaN(scheduledTime.getTime()) && 
               dose.status === 'pending' && 
               scheduledTime > now;
      }).slice(0, 5);
    } catch (error) {
      console.error('Error getting upcoming doses:', error);
      return [];
    }
  };

  const getOverdueDoses = () => {
    try {
      const now = new Date();
      return todayDoses.filter(dose => {
        if (!dose.scheduledTime) return false;
        const scheduledTime = new Date(dose.scheduledTime);
        return !isNaN(scheduledTime.getTime()) && 
               dose.status === 'pending' && 
               scheduledTime < now;
      });
    } catch (error) {
      console.error('Error getting overdue doses:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const adherenceRate = getAdherenceRate();
  const takenDoses = todayDoses.filter(dose => dose.status === 'taken').length;
  const pendingDoses = todayDoses.filter(dose => dose.status === 'pending').length;
  const currentDose = getCurrentDose();
  const nextDose = getNextDose();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-3xl p-8 mb-8 border border-purple-100 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('liveDoseTracker')}</h1>
                <p className="text-xl text-gray-600">{t('realTimeMedicationAdherence')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{todayDoses.length}</div>
                <div className="text-sm text-gray-600">{t('totalDoses')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{adherenceRate}%</div>
                <div className="text-sm text-gray-600">{t('adherenceRate')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{getUpcomingDoses().length}</div>
                <div className="text-sm text-gray-600">{t('upcoming')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 mb-1">{t('overallAdherence')}</p>
                  <p className="text-3xl font-bold text-purple-900">{adherenceRate}%</p>
                  <p className="text-xs text-purple-600 mt-1">{t('thisMonth')}</p>
                </div>
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 mb-1">{t('dosesTaken')}</p>
                  <p className="text-3xl font-bold text-green-900">{takenDoses}</p>
                  <p className="text-xs text-green-600 mt-1">{t('today')}</p>
                </div>
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-600 mb-1">{t('pending')}</p>
                  <p className="text-3xl font-bold text-yellow-900">{pendingDoses}</p>
                  <p className="text-xs text-yellow-600 mt-1">{t('remaining')}</p>
                </div>
                <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 mb-1">{t('overdue')}</p>
                  <p className="text-3xl font-bold text-red-900">{getOverdueDoses().length}</p>
                  <p className="text-xs text-red-600 mt-1">{t('missedDoses')}</p>
                </div>
                <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Dose Alert */}
        {currentDose && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-800 text-xl">
                <Timer className="w-6 h-6" />
                <span>{t('dueNowTakeMedication')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-orange-100 rounded-xl border border-orange-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 text-lg">{currentDose.medicationName}</p>
                    <p className="text-orange-700">
                      {formatTime(currentDose.scheduledTime)} • {currentDose.dosage} {currentDose.doseStrength}
                    </p>
                    <p className="text-sm text-orange-600">{getAdministrationLabel(currentDose.administrationMethod)}</p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => markDoseAsTaken(currentDose.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl text-lg font-semibold"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t('markTaken')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Doses */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">{t('todaysDoses')}</CardTitle>
        <CardDescription className="text-lg">{t('manageMedicationSchedule')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {todayDoses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-10 h-10 text-purple-600" />
                </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('noDosesScheduledToday')}</h3>
        <p className="text-gray-600 text-lg">{t('medicationsWillAppearHere')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayDoses
                  .filter(dose => dose.scheduledTime) // Filter out doses without scheduledTime
                  .sort((a, b) => {
                    try {
                      const dateA = new Date(a.scheduledTime);
                      const dateB = new Date(b.scheduledTime);
                      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                      return dateA.getTime() - dateB.getTime();
                    } catch (error) {
                      console.error('Error sorting doses:', error);
                      return 0;
                    }
                  })
                  .map((dose) => (
                    <div key={dose.id} className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${getStatusColor(dose.status)}`}>
                          {getStatusIcon(dose.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{dose.medicationName}</h3>
                            {dose.status === 'pending' && (() => {
                              try {
                                if (!dose.scheduledTime) return null;
                                const scheduledTime = new Date(dose.scheduledTime);
                                const now = new Date();
                                if (isNaN(scheduledTime.getTime())) return null;
                                return scheduledTime < now ? (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">{t('overdue')}</Badge>
                                ) : null;
                              } catch (error) {
                                console.error('Error checking overdue status:', error);
                                return null;
                              }
                            })()}
                          </div>
                          <p className="text-gray-600 mb-1">
                            {dose.dosage} {dose.doseStrength} {getDoseFormLabel(dose.doseForm)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(dose.scheduledTime)} • {getAdministrationLabel(dose.administrationMethod)}
                          </p>
                          {dose.actualTime && (
                            <p className="text-sm text-green-600 font-semibold">✓ {t('taken')}: {formatTime(dose.actualTime)}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {dose.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => markDoseAsTaken(dose.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t('markTaken')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markDoseAsSkipped(dose.id)}
                              className="border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Skip
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDose(dose);
                            setIsNoteDialogOpen(true);
                          }}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note Dialog */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Info className="w-6 h-6 text-purple-600" />
                Dose Details
              </DialogTitle>
              <DialogDescription className="text-lg">
                Add notes and view dose information
              </DialogDescription>
            </DialogHeader>
            
            {selectedDose && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="font-medium text-gray-900">{t('medication')}</div>
            <div className="text-lg">{selectedDose.medicationName}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="font-medium text-gray-900">{t('dosage')}</div>
            <div className="text-lg">{selectedDose.dosage} {selectedDose.doseStrength}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="font-medium text-gray-900">{t('scheduledTime')}</div>
            <div className="text-lg">{formatTime(selectedDose.scheduledTime)}</div>
                    </div>
                    {selectedDose.actualTime && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="font-medium text-green-900">{t('takenAt')}</div>
            <div className="text-lg text-green-700">{formatTime(selectedDose.actualTime)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {selectedDose.instructions && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="font-medium text-blue-900 mb-2">{t('instructions')}</div>
            <div className="text-sm text-blue-800">{selectedDose.instructions}</div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="note" className="text-sm font-medium">Add Note (Optional)</Label>
                      <Textarea
                        id="note"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add any notes about this dose..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    
                    {selectedDose.notes && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="font-medium text-yellow-900 mb-2">Previous Notes</div>
                        <div className="text-sm text-yellow-800">{selectedDose.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsNoteDialogOpen(false)}
                    className="px-6 py-3 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => addNoteToDose(selectedDose.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LiveDoseTracker;



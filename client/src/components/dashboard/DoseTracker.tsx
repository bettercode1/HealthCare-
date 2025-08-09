import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Pill, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Timer, 
  TrendingUp,
  Activity,
  Target,
  CalendarDays,
  AlertCircle,
  Info,
  Star,
  Award,
  Zap,
  Sparkles,
  Check,
  SkipForward
} from 'lucide-react';

interface Dose {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  doseStrength: string;
  doseForm: string;
  administrationMethod: string;
  scheduledTime: string;
  status: 'taken' | 'pending' | 'missed' | 'overdue';
  instructions: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  sideEffects?: string[];
}

const DoseTracker: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  const [todayDoses, setTodayDoses] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDose, setSelectedDose] = useState<Dose | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [note, setNote] = useState('');
  const [sideEffects, setSideEffects] = useState<string[]>([]);

  useEffect(() => {
    if (userData?.id) {
      loadTodayDoses();
    }
  }, [userData]);

  const loadTodayDoses = async () => {
    try {
      setLoading(true);
      const data = await api.doses.getDoseRecords();
      const today = new Date().toISOString().split('T')[0];
      const todayData = data.filter((dose: Dose) => 
        dose.scheduledTime && dose.scheduledTime.startsWith(today)
      );
      setTodayDoses(todayData);
    } catch (error) {
      console.error('Error loading today doses:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadDoses'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markDoseAsTaken = async (doseId: string) => {
    try {
      await api.doses.updateDoseRecord(doseId, { 
        status: 'taken',
        actualTime: new Date().toISOString(),
        notes: note,
        sideEffects: sideEffects
      });
      
      setTodayDoses(prev => 
        prev.map(dose => 
          dose.id === doseId 
            ? { ...dose, status: 'taken' as const }
            : dose
        )
      );
      
      setNote('');
      setSideEffects([]);
      setShowDetailsModal(false);
      
      toast({
        title: t('success'),
        description: t('doseMarkedAsTaken'),
      });
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      toast({
        title: t('error'),
        description: t('failedToMarkDose'),
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (dose: Dose) => {
    setSelectedDose(dose);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string, time: string) => {
    switch (status) {
      case 'taken': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'missed': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: 
        if (isDueNow(time)) return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const getStatusIcon = (status: string, time: string) => {
    switch (status) {
      case 'taken': return <CheckCircle className="w-5 h-5" />;
      case 'missed': return <XCircle className="w-5 h-5" />;
      default: 
        if (isDueNow(time)) return <AlertTriangle className="w-5 h-5" />;
        return <Clock className="w-5 h-5" />;
    }
  };

  const isDueNow = (time: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const timeDiff = Math.abs(new Date(`2000-01-01T${time}`).getTime() - new Date(`2000-01-01T${currentTime}`).getTime());
    return timeDiff <= 30 * 60 * 1000; // Within 30 minutes
  };

  const getUrgencyBadge = (dose: Dose) => {
    if (dose.status !== 'pending') return null;
    
    if (isDueNow(dose.scheduledTime)) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">Due Now</Badge>;
    }
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    if (new Date(dose.scheduledTime) < now) {
      return <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-medium">Overdue</Badge>;
    }
    
    return <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-medium">Upcoming</Badge>;
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDoseFormLabel = (form: string) => {
    const formLabels: { [key: string]: string } = {
      'tablet': 'Tablet',
      'capsule': 'Capsule',
      'liquid': 'Liquid',
      'injection': 'Injection',
      'inhaler': 'Inhaler',
      'cream': 'Cream/Ointment',
      'drops': 'Drops'
    };
    return formLabels[form] || form;
  };

  const getAdministrationLabel = (method: string) => {
    const methodLabels: { [key: string]: string } = {
      'oral': 'Oral (By Mouth)',
      'sublingual': 'Sublingual (Under Tongue)',
      'topical': 'Topical (On Skin)',
      'inhalation': 'Inhalation',
      'injection': 'Injection',
      'rectal': 'Rectal',
      'nasal': 'Nasal'
    };
    return methodLabels[method] || method;
  };

  const getOverallAdherence = () => {
    if (todayDoses.length === 0) return 0;
    const takenDoses = todayDoses.filter(dose => dose.status === 'taken').length;
    return Math.round((takenDoses / todayDoses.length) * 100);
  };

  const getUpcomingDoses = () => {
    const now = new Date();
    return todayDoses.filter(dose => 
      dose.status === 'pending' && new Date(dose.scheduledTime) > now
    ).slice(0, 3);
  };

  const getOverdueDoses = () => {
    const now = new Date();
    return todayDoses.filter(dose => 
      dose.status === 'pending' && new Date(dose.scheduledTime) < now
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sortedTodayDoses = [...todayDoses].sort((a, b) => 
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 mb-8 border border-emerald-100 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{t('todaysDoses')}</h2>
                <p className="text-xl text-gray-600 mt-2 font-medium">Track your medication adherence with ease</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Enhanced Quick Stats */}
            <div className="hidden md:flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{sortedTodayDoses.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Doses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{getOverallAdherence()}%</div>
                <div className="text-sm text-gray-600 font-medium">Adherence Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600">{getUpcomingDoses().length}</div>
                <div className="text-sm text-gray-600 font-medium">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 min-h-[140px] hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Total Doses</p>
                <p className="text-3xl font-bold text-blue-900 truncate">{sortedTodayDoses.length}</p>
                <p className="text-sm text-blue-700 mt-1">Scheduled for today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Pill className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 min-h-[140px] hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Taken</p>
                <p className="text-3xl font-bold text-emerald-900 truncate">
                  {sortedTodayDoses.filter(d => d.status === 'taken').length}
                </p>
                <p className="text-sm text-emerald-700 mt-1">Successfully completed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 min-h-[140px] hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-600 mb-2 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-amber-900 truncate">
                  {sortedTodayDoses.filter(d => d.status === 'pending').length}
                </p>
                <p className="text-sm text-amber-700 mt-1">Awaiting action</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 min-h-[140px] hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-rose-600 mb-2 uppercase tracking-wide">Missed</p>
                <p className="text-3xl font-bold text-rose-900 truncate">
                  {sortedTodayDoses.filter(d => d.status === 'missed').length}
                </p>
                <p className="text-sm text-rose-700 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Adherence Progress */}
      <Card className="bg-white shadow-lg border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 font-bold">Today's Adherence</CardTitle>
                <CardDescription className="text-gray-600 text-lg">Track your medication compliance progress</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-600">{getOverallAdherence()}%</div>
              <div className="text-sm text-gray-600 font-medium">Adherence Rate</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <Progress value={getOverallAdherence()} className="h-5 bg-gray-100" />
            <div className="flex justify-between text-sm text-gray-600 font-medium">
              <span>{sortedTodayDoses.filter(d => d.status === 'taken').length} taken</span>
              <span>{sortedTodayDoses.length} total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doses List */}
      {sortedTodayDoses.length === 0 ? (
        <Card className="bg-white shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="text-center py-24">
            <div className="w-36 h-36 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Pill className="w-20 h-20 text-emerald-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              {t('noDosesScheduledForToday')}
            </h3>
            <p className="text-gray-600 mb-10 max-w-md mx-auto text-xl leading-relaxed">
              No medications are scheduled for today. Check your medication schedule for upcoming doses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Enhanced Overdue Doses Alert */}
          {getOverdueDoses().length > 0 && (
            <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 rounded-2xl shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-rose-800 text-xl">
                  <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold">Overdue Doses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getOverdueDoses().map((dose) => (
                    <div key={dose.id} className="flex items-center justify-between p-5 bg-rose-100 rounded-xl border border-rose-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-md">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-rose-900 text-lg">{dose.medicationName}</p>
                          <p className="text-sm text-rose-700 font-medium">
                            {formatTime(dose.scheduledTime)} • {dose.dosage} {dose.doseStrength}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="default"
                        onClick={() => handleViewDetails(dose)}
                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Taken
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Redesigned All Doses */}
          <div className="space-y-5">
            {sortedTodayDoses.map((dose) => (
              <Card key={dose.id} className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${getStatusColor(dose.status, dose.scheduledTime)}`}>
                        {getStatusIcon(dose.status, dose.scheduledTime)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 truncate">{dose.medicationName}</h3>
                          {getUrgencyBadge(dose)}
                        </div>
                        <p className="text-gray-700 mb-2 font-medium text-lg">
                          {dose.dosage} {dose.doseStrength} {getDoseFormLabel(dose.doseForm)}
                        </p>
                        <p className="text-gray-500 font-medium">
                          {formatTime(dose.scheduledTime)} • {getAdministrationLabel(dose.administrationMethod)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {dose.status === 'pending' && (
                        <Button
                          size="default"
                          onClick={() => handleViewDetails(dose)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Mark Taken
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleViewDetails(dose)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-3 font-medium hover:border-gray-400 transition-all duration-300"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Dose Details Modal */}
      {selectedDose && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                {selectedDose.medicationName}
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600">
                Dose details and tracking information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="font-semibold text-gray-900 text-lg mb-2">Dosage</div>
                    <div className="text-xl font-medium">{selectedDose.dosage} {selectedDose.doseStrength}</div>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="font-semibold text-gray-900 text-lg mb-2">Form</div>
                    <div className="text-xl font-medium">{getDoseFormLabel(selectedDose.doseForm)}</div>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="font-semibold text-gray-900 text-lg mb-2">Administration</div>
                    <div className="text-xl font-medium">{getAdministrationLabel(selectedDose.administrationMethod)}</div>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="font-semibold text-gray-900 text-lg mb-2">Scheduled Time</div>
                    <div className="text-xl font-medium">{formatTime(selectedDose.scheduledTime)}</div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="p-5 bg-sky-50 rounded-xl border border-sky-200">
                    <div className="font-semibold text-sky-900 text-lg mb-3">Instructions</div>
                    <div className="text-sm text-sky-800 leading-relaxed">{selectedDose.instructions}</div>
                  </div>
                  
                  {selectedDose.status === 'pending' && (
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="note" className="text-sm font-semibold text-gray-700">Add Note (Optional)</Label>
                        <Textarea
                          id="note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Add any notes about this dose..."
                          className="mt-3 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">Side Effects (Optional)</Label>
                        <div className="space-y-3">
                          {['Nausea', 'Dizziness', 'Headache', 'Fatigue', 'Other'].map((effect) => (
                            <label key={effect} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sideEffects.includes(effect)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSideEffects([...sideEffects, effect]);
                                  } else {
                                    setSideEffects(sideEffects.filter(s => s !== effect));
                                  }
                                }}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-gray-700">{effect}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedDose.status === 'pending' && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="px-8 py-3 rounded-full font-medium border-gray-300 hover:border-gray-400 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => markDoseAsTaken(selectedDose.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Taken
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DoseTracker;

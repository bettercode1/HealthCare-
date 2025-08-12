import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sparkles
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
      case 'taken': return 'bg-green-100 text-green-800 border-green-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      default: 
        if (isDueNow(time)) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string, time: string) => {
    switch (status) {
      case 'taken': return <CheckCircle className="w-4 h-4" />;
      case 'missed': return <XCircle className="w-4 h-4" />;
      default: 
        if (isDueNow(time)) return <AlertTriangle className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
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
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">{t('dueNow')}</Badge>;
    }
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    if (new Date(dose.scheduledTime) < now) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">{t('overdue')}</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{t('upcoming')}</Badge>;
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
      'tablet': t('tablet'),
      'capsule': t('capsule'),
      'liquid': t('liquid'),
      'injection': t('injection'),
      'inhaler': t('inhaler'),
      'cream': t('cream'),
      'drops': t('drops')
    };
    return formLabels[form] || form;
  };

  const getAdministrationLabel = (method: string) => {
    const methodLabels: { [key: string]: string } = {
      'oral': t('oral'),
      'sublingual': t('sublingual'),
      'topical': t('topical'),
      'inhalation': t('inhalation'),
      'injection': t('injection'),
      'rectal': t('rectal'),
      'nasal': t('nasal')
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
    <div className="space-y-4">
      {/* Medication Health Summary Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-1">{t('medicationHealthOverview')}</h3>
            <p className="text-purple-700 text-sm">
              {sortedTodayDoses.length > 0 
                ? t('managingDosesToday', { count: sortedTodayDoses.length, adherence: getOverallAdherence() })
                : t('startTrackingMedications')
              }
            </p>
            {sortedTodayDoses.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {sortedTodayDoses.filter(d => d.status === 'taken').length} {t('taken')}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  {sortedTodayDoses.filter(d => d.status === 'pending').length} {t('pending')}
                </span>
                {getOverdueDoses().length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {getOverdueDoses().length} {t('overdue')}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{getOverallAdherence()}%</div>
            <div className="text-xs text-purple-600">{t('adherenceRate')}</div>
          </div>
        </div>
      </div>

      {/* Live Dose Tracker Header */}
      <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">{t('liveDoseTracker')}</CardTitle>
                <p className="text-xs text-gray-600">{t('realTimeMedicationAdherence')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{sortedTodayDoses.length}</div>
                <div className="text-xs text-gray-600">{t('total')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{getOverallAdherence()}%</div>
                <div className="text-xs text-gray-600">{t('rate')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{getUpcomingDoses().length}</div>
                <div className="text-xs text-gray-600">{t('upcoming')}</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-purple-600 mb-1">{t('overallAdherence')}</p>
                <p className="text-xl font-bold text-purple-900">{getOverallAdherence()}%</p>
                <p className="text-xs text-purple-600">{t('thisMonth')}</p>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-600 mb-1">{t('dosesTaken')}</p>
                <p className="text-xl font-bold text-green-900">
                  {sortedTodayDoses.filter(d => d.status === 'taken').length}
                </p>
                <p className="text-xs text-green-600">{t('today')}</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-yellow-600 mb-1">{t('pending')}</p>
                <p className="text-xl font-bold text-yellow-900">
                  {sortedTodayDoses.filter(d => d.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-600">{t('remaining')}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-600 mb-1">{t('overdue')}</p>
                <p className="text-xl font-bold text-red-900">
                  {getOverdueDoses().length}
                </p>
                <p className="text-xs text-red-600">{t('missedDoses')}</p>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Doses Section */}
      <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">{t('todaysDoses')}</CardTitle>
                <p className="text-xs text-gray-600">{t('manageMedicationSchedule')}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 w-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {sortedTodayDoses.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Pill className="w-6 h-6 text-purple-400" />
              </div>
                          <p className="text-gray-500 text-sm font-medium">{t('noDosesScheduledToday')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('medicationsWillAppearHere')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTodayDoses.map((dose) => (
                <div key={dose.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Clock className="w-3 h-3 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-base">{dose.medicationName}</h3>
                          {getUrgencyBadge(dose)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            {dose.dosage} {dose.doseStrength} {getDoseFormLabel(dose.doseForm)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(dose.scheduledTime)} • {getAdministrationLabel(dose.administrationMethod)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                      {dose.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => markDoseAsTaken(dose.id)}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 h-8"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('markTaken')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-sm px-3 py-2 h-8"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('skip')}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(dose)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-3 py-2 h-8"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        {t('details')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dose Details Modal */}
      {selectedDose && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Pill className="w-6 h-6 text-green-600" />
                {selectedDose.medicationName}
              </DialogTitle>
              <DialogDescription className="text-lg">
                {t('doseDetailsAndTrackingInformation')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{t('dosage')}</div>
                    <div className="text-lg">{selectedDose.dosage} {selectedDose.doseStrength}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{t('form')}</div>
                    <div className="text-lg">{getDoseFormLabel(selectedDose.doseForm)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{t('administration')}</div>
                    <div className="text-lg">{getAdministrationLabel(selectedDose.administrationMethod)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{t('scheduledTime')}</div>
                    <div className="text-lg">{formatTime(selectedDose.scheduledTime)}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900 mb-2">{t('instructions')}</div>
                    <div className="text-sm text-blue-800">{selectedDose.instructions}</div>
                  </div>
                  
                  {selectedDose.status === 'pending' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="note" className="text-sm font-medium">{t('addNoteOptional')}</Label>
                        <Textarea
                          id="note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder={t('addAnyNotesAboutThisDose')}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">{t('sideEffectsOptional')}</Label>
                        <div className="mt-2 space-y-2">
                          {[t('nausea'), t('dizziness'), t('headache'), t('fatigue'), t('other')].map((effect) => (
                            <label key={effect} className="flex items-center space-x-2">
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
                                className="rounded"
                              />
                              <span className="text-sm">{effect}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedDose.status === 'pending' && (
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 rounded-xl"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={() => markDoseAsTaken(selectedDose.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                  >
                    {t('markAsTaken')}
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

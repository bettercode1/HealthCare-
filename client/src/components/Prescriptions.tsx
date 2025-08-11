import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, FileText, User, Pill, AlertCircle, Download, Eye, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';

interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  medication: string;
  notes?: string;
  prescribedDate: string;
  refills?: number;
  status?: string;
  sideEffects?: string[];
  interactions?: string[];
  monitoring?: string[];
  createdAt: string;
  updatedAt: string;
}

// Dummy data for immediate display
const DUMMY_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'pres1',
    doctorId: 'demo-doctor-1',
    patientId: 'demo-patient-1',
    diagnosis: 'Hypertension',
    medication: 'Lisinopril 10mg daily',
    notes: 'Take in the morning with food. Monitor blood pressure weekly.',
    prescribedDate: '2024-01-01',
    refills: 3,
    status: 'active',
    sideEffects: ['dizziness', 'dry cough', 'fatigue'],
    interactions: ['NSAIDs', 'lithium'],
    monitoring: ['blood pressure', 'kidney function'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'pres2',
    doctorId: 'demo-doctor-1',
    patientId: 'demo-patient-1',
    diagnosis: 'Type 2 Diabetes',
    medication: 'Metformin 500mg twice daily',
    notes: 'Monitor blood sugar levels. Take with meals.',
    prescribedDate: '2024-01-05',
    refills: 2,
    status: 'active',
    sideEffects: ['nausea', 'diarrhea', 'loss of appetite'],
    interactions: ['alcohol', 'certain antibiotics'],
    monitoring: ['blood sugar', 'kidney function'],
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  },
  {
    id: 'pres3',
    doctorId: 'demo-doctor-2',
    patientId: 'demo-patient-1',
    diagnosis: 'Migraine',
    medication: 'Sumatriptan 50mg as needed',
    notes: 'Take at onset of migraine symptoms. Maximum 2 tablets per day.',
    prescribedDate: '2024-01-10',
    refills: 1,
    status: 'active',
    sideEffects: ['dizziness', 'nausea', 'chest tightness'],
    interactions: ['SSRIs', 'MAOIs'],
    monitoring: ['heart rate', 'blood pressure'],
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  }
];

const Prescriptions: React.FC = () => {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    diagnosis: '',
    medication: '',
    notes: '',
    prescribedDate: '',
    refills: 0,
    status: 'active',
    sideEffects: '',
    interactions: '',
    monitoring: ''
  });
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Try to load from localStorage first
      const storedPrescriptions = localStorage.getItem('mock_prescriptions');
      let prescriptionData: Prescription[] = [];
      
      if (storedPrescriptions) {
        try {
          prescriptionData = JSON.parse(storedPrescriptions);
        } catch (e) {
          console.warn('Error parsing stored prescriptions, using dummy data');
        }
      }
      
      // If no stored data or empty, use dummy data
      if (!prescriptionData || prescriptionData.length === 0) {
        prescriptionData = DUMMY_PRESCRIPTIONS;
        // Store dummy data for future use
        localStorage.setItem('mock_prescriptions', JSON.stringify(DUMMY_PRESCRIPTIONS));
      }
      
      setPrescriptions(prescriptionData);
      console.log('Loaded prescriptions:', prescriptionData.length);
      
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      // Fallback to dummy data on error
      setPrescriptions(DUMMY_PRESCRIPTIONS);
      toast({
        title: t('info'),
        description: t('usingDemoPrescriptionsData'),
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrescriptionsToStorage = (updatedPrescriptions: Prescription[]) => {
    try {
      localStorage.setItem('mock_prescriptions', JSON.stringify(updatedPrescriptions));
      console.log('Saved prescriptions to storage:', updatedPrescriptions.length);
    } catch (error) {
      console.error('Error saving prescriptions to storage:', error);
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.diagnosis || !newPrescription.medication || !newPrescription.prescribedDate) {
      toast({
        title: t('error'),
        description: t('pleaseFillInAllRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    try {
      const prescriptionData: Prescription = {
        id: `pres_${Date.now()}`,
        doctorId: 'demo-doctor-1',
        patientId: currentUser?.uid || 'demo-patient-1',
        diagnosis: newPrescription.diagnosis,
        medication: newPrescription.medication,
        notes: newPrescription.notes,
        prescribedDate: newPrescription.prescribedDate,
        refills: parseInt(newPrescription.refills.toString()),
        status: newPrescription.status,
        sideEffects: newPrescription.sideEffects ? newPrescription.sideEffects.split(',').map(s => s.trim()) : [],
        interactions: newPrescription.interactions ? newPrescription.interactions.split(',').map(s => s.trim()) : [],
        monitoring: newPrescription.monitoring ? newPrescription.monitoring.split(',').map(s => s.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to local state
      const updatedPrescriptions = [...prescriptions, prescriptionData];
      setPrescriptions(updatedPrescriptions);
      
      // Save to localStorage
      savePrescriptionsToStorage(updatedPrescriptions);
      
      // Reset form
      setNewPrescription({
        diagnosis: '',
        medication: '',
        notes: '',
        prescribedDate: '',
        refills: 0,
        status: 'active',
        sideEffects: '',
        interactions: '',
        monitoring: ''
      });
      
      setShowAddForm(false);
      
      toast({
        title: t('success'),
        description: t('prescriptionAddedSuccessfully'),
      });
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast({
        title: t('error'),
        description: t('failedToAddPrescription'),
        variant: "destructive",
      });
    }
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    if (window.confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      try {
        const updatedPrescriptions = prescriptions.filter(p => p.id !== prescriptionId);
        setPrescriptions(updatedPrescriptions);
        savePrescriptionsToStorage(updatedPrescriptions);
        
        toast({
          title: t('success'),
          description: t('prescriptionDeletedSuccessfully'),
        });
      } catch (error) {
        console.error('Error deleting prescription:', error);
        toast({
          title: t('error'),
          description: t('failedToDeletePrescription'),
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'refilled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    toast({
      title: t('download'),
      description: `${t('downloading')} ${t('prescription')} ${t('for')} ${prescription.diagnosis}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('myPrescriptions')}</h2>
          <p className="text-gray-600">{t('viewAndManagePrescriptions')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {prescriptions.length} {prescriptions.length !== 1 ? t('prescriptions') : t('prescription')}
          </Badge>
          <Button 
            variant="outline"
            onClick={loadPrescriptions}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('refresh')}
          </Button>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            {t('addPrescription')}
          </Button>
        </div>
      </div>

      {/* Add Prescription Form */}
      {showAddForm && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-green-900">{t('addNewPrescription')}</CardTitle>
                  <p className="text-sm text-green-700">{t('enterPrescriptionDetails')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('diagnosis')} *
                </label>
                <Input
                  value={newPrescription.diagnosis}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder={t('diagnosisPlaceholder')}
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('medication')} *
                </label>
                <Input
                  value={newPrescription.medication}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder={t('medicationPlaceholder')}
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('prescribedDate')} *
                </label>
                <Input
                  type="date"
                  value={newPrescription.prescribedDate}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, prescribedDate: e.target.value }))}
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('status')}
                </label>
                <Select
                  value={newPrescription.status}
                  onValueChange={(value) => setNewPrescription(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200">
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🟢 {t('active')}</SelectItem>
                    <SelectItem value="expired">🔴 {t('expired')}</SelectItem>
                    <SelectItem value="refilled">🔄 {t('refilled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('refills')}
                </label>
                <Input
                  type="number"
                  value={newPrescription.refills}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, refills: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t('notesAndInstructions')}
              </label>
              <Textarea
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('notesPlaceholder')}
                rows={3}
                className="border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {t('sideEffects')}
                </label>
                <Input
                  value={newPrescription.sideEffects}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, sideEffects: e.target.value }))}
                  placeholder={t('sideEffectsPlaceholder')}
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {t('drugInteractions')}
                </label>
                <Input
                  value={newPrescription.interactions}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, interactions: e.target.value }))}
                  placeholder={t('interactionsPlaceholder')}
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {t('monitoringRequired')}
                </label>
                <Input
                  value={newPrescription.monitoring}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, monitoring: e.target.value }))}
                  placeholder={t('monitoringPlaceholder')}
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleAddPrescription}
                className="flex-1 h-11 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!newPrescription.diagnosis || !newPrescription.medication || !newPrescription.prescribedDate}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addPrescription')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Pill className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noPrescriptionsFound')}</h3>
          <p className="text-gray-600 mb-4">{t('noPrescriptionsDescription')}</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addYourFirstPrescription')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions
            .filter(prescription => prescription && prescription.id && prescription.diagnosis && prescription.medication)
            .map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {prescription.diagnosis}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {prescription.medication}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(prescription.status)}>
                  {prescription.status || t('unknown')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{t('prescribed')}: {formatDate(prescription.prescribedDate)}</span>
                </div>
                
                {prescription.refills !== undefined && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Pill className="h-4 w-4 mr-2" />
                    <span>{t('refills')}: {prescription.refills}</span>
                  </div>
                )}
              </div>

              {prescription.notes && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-1">{t('notes')}:</p>
                  <p>{prescription.notes}</p>
                </div>
              )}

              {prescription.sideEffects && prescription.sideEffects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="font-medium">{t('sideEffects')}:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {prescription.sideEffects.map((effect, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewPrescription(prescription)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('viewDetails')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownloadPrescription(prescription)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('download')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => handleDeletePrescription(prescription.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-95 backdrop-blur-lg flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('prescriptionDetails')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrescription(null)}
                  className="hover:bg-gray-100 rounded-full p-2"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('diagnosis')}</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.diagnosis}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('status')}</label>
                    <Badge className={getStatusColor(selectedPrescription.status)}>
                      {selectedPrescription.status || t('unknown')}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('prescribedDate')}</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedPrescription.prescribedDate)}
                    </p>
                  </div>
                  {selectedPrescription.refills !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('refills')}</label>
                      <p className="text-sm text-gray-900">{selectedPrescription.refills}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">{t('medication')}</label>
                  <p className="text-sm text-gray-900">{selectedPrescription.medication}</p>
                </div>

                {selectedPrescription.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('notes')}</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.notes}</p>
                  </div>
                )}

                {selectedPrescription.sideEffects && selectedPrescription.sideEffects.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('sideEffects')}</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPrescription.sideEffects.map((effect, index) => (
                        <Badge key={index} variant="outline">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPrescription.interactions && selectedPrescription.interactions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('drugInteractions')}</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPrescription.interactions.map((interaction, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                          {interaction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPrescription.monitoring && selectedPrescription.monitoring.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('monitoringRequired')}</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPrescription.monitoring.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedPrescription(null)}
                >
                  {t('close')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleDownloadPrescription(selectedPrescription)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('downloadPrescription')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;


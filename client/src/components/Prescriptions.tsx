import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, FileText, User, Pill, AlertCircle, Download, Eye, Plus, X } from 'lucide-react';
import { prescriptionAPI } from '../lib/api';
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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(DUMMY_PRESCRIPTIONS);
  const [loading, setLoading] = useState(false);
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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionAPI.getPrescriptions(user?.uid);
      console.log('Loaded prescriptions data:', data);
      
      // If API returns data, use it; otherwise, use dummy data
      if (data && Array.isArray(data) && data.length > 0) {
        setPrescriptions(data);
      } else {
        // Keep dummy data if API doesn't return anything
        console.log('Using dummy prescriptions data');
        setPrescriptions(DUMMY_PRESCRIPTIONS);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      // Fallback to dummy data on error
      setPrescriptions(DUMMY_PRESCRIPTIONS);
      toast({
        title: "Info",
        description: "Using demo prescriptions data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.diagnosis || !newPrescription.medication || !newPrescription.prescribedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const prescriptionData = {
        doctorId: 'demo-doctor-1',
        patientId: user?.uid || 'demo-patient-1',
        diagnosis: newPrescription.diagnosis,
        medication: newPrescription.medication,
        notes: newPrescription.notes,
        prescribedDate: newPrescription.prescribedDate,
        refills: parseInt(newPrescription.refills.toString()),
        status: newPrescription.status,
        sideEffects: newPrescription.sideEffects ? newPrescription.sideEffects.split(',').map(s => s.trim()) : [],
        interactions: newPrescription.interactions ? newPrescription.interactions.split(',').map(s => s.trim()) : [],
        monitoring: newPrescription.monitoring ? newPrescription.monitoring.split(',').map(s => s.trim()) : []
      };

      const createdPrescription = await prescriptionAPI.createPrescription(prescriptionData);
      
      // Add to local state
      setPrescriptions(prev => [...prev, createdPrescription]);
      
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
        title: "Success",
        description: "Prescription added successfully",
      });
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast({
        title: "Error",
        description: "Failed to add prescription",
        variant: "destructive",
      });
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
    // In a real app, this would download the actual prescription file
    toast({
      title: "Download Started",
      description: `Downloading prescription for ${prescription.diagnosis}`,
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
          <h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2>
          <p className="text-gray-600">View and manage prescriptions from your doctors</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
          </Badge>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Prescription
          </Button>
        </div>
      </div>

      {/* Add Prescription Form */}
      {showAddForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Add New Prescription</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Diagnosis *</label>
                <Input
                  value={newPrescription.diagnosis}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g., Hypertension"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Medication *</label>
                <Input
                  value={newPrescription.medication}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder="e.g., Lisinopril 10mg daily"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prescribed Date *</label>
                <Input
                  type="date"
                  value={newPrescription.prescribedDate}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, prescribedDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={newPrescription.status}
                  onValueChange={(value) => setNewPrescription(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="refilled">Refilled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Refills</label>
                <Input
                  type="number"
                  value={newPrescription.refills}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, refills: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the prescription..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Side Effects</label>
                <Input
                  value={newPrescription.sideEffects}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, sideEffects: e.target.value }))}
                  placeholder="dizziness, nausea (comma separated)"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Drug Interactions</label>
                <Input
                  value={newPrescription.interactions}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, interactions: e.target.value }))}
                  placeholder="NSAIDs, alcohol (comma separated)"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Monitoring Required</label>
                <Input
                  value={newPrescription.monitoring}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, monitoring: e.target.value }))}
                  placeholder="blood pressure, kidney function (comma separated)"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPrescription}
                className="flex-1"
              >
                Add Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  {prescription.status || 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Prescribed: {formatDate(prescription.prescribedDate)}</span>
                </div>
                
                {prescription.refills !== undefined && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Pill className="h-4 w-4 mr-2" />
                    <span>Refills: {prescription.refills}</span>
                  </div>
                )}
              </div>

              {prescription.notes && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{prescription.notes}</p>
                </div>
              )}

              {prescription.sideEffects && prescription.sideEffects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="font-medium">Side Effects:</span>
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
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownloadPrescription(prescription)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Prescription Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrescription(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Diagnosis</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.diagnosis}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge className={getStatusColor(selectedPrescription.status)}>
                      {selectedPrescription.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Prescribed Date</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedPrescription.prescribedDate)}
                    </p>
                  </div>
                  {selectedPrescription.refills !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Refills</label>
                      <p className="text-sm text-gray-900">{selectedPrescription.refills}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Medication</label>
                  <p className="text-sm text-gray-900">{selectedPrescription.medication}</p>
                </div>

                {selectedPrescription.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.notes}</p>
                  </div>
                )}

                {selectedPrescription.sideEffects && selectedPrescription.sideEffects.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Side Effects</label>
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
                    <label className="text-sm font-medium text-gray-700">Drug Interactions</label>
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
                    <label className="text-sm font-medium text-gray-700">Monitoring Required</label>
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
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleDownloadPrescription(selectedPrescription)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Prescription
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


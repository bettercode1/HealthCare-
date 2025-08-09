import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Calendar, Clock, Pill, Plus, Edit, Trash2, Search, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  duration: string;
  status: 'active' | 'completed' | 'paused' | 'overdue';
  startDate: string;
  endDate: string;
  instructions: string;
  sideEffects: string[];
  category: 'antibiotic' | 'painkiller' | 'vitamin' | 'chronic' | 'emergency';
  familyMember: string;
  doctor: string;
  pharmacy: string;
  refillDate: string;
  cost: number;
  insurance: string;
  notes: string;
}

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relationship: string;
  avatar: string;
}

const mockFamilyMembers: FamilyMember[] = [
  { id: '1', name: 'John Doe', age: 45, relationship: 'Self', avatar: '👨' },
  { id: '2', name: 'Sarah Doe', age: 42, relationship: 'Spouse', avatar: '👩' },
  { id: '3', name: 'Mike Doe', age: 18, relationship: 'Son', avatar: '👦' },
  { id: '4', name: 'Emma Doe', age: 15, relationship: 'Daughter', avatar: '👧' },
  { id: '5', name: 'Robert Doe', age: 70, relationship: 'Father', avatar: '👴' },
];

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: '3 times daily',
    time: '8:00 AM, 2:00 PM, 8:00 PM',
    duration: '7 days',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    instructions: 'Take with food. Complete the full course.',
    sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
    category: 'antibiotic',
    familyMember: 'John Doe',
    doctor: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    refillDate: '2024-01-22',
    cost: 25.00,
    insurance: 'Blue Cross Blue Shield',
    notes: 'For bacterial infection'
  },
  {
    id: '2',
    name: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'Every 6 hours as needed',
    time: 'As needed',
    duration: 'Until pain subsides',
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2024-01-25',
    instructions: 'Take with food. Do not exceed 3200mg per day.',
    sideEffects: ['Stomach upset', 'Dizziness'],
    category: 'painkiller',
    familyMember: 'Sarah Doe',
    doctor: 'Dr. Johnson',
    pharmacy: 'Walgreens',
    refillDate: '2024-01-25',
    cost: 15.00,
    insurance: 'Blue Cross Blue Shield',
    notes: 'For back pain'
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    time: '9:00 AM',
    duration: 'Ongoing',
    status: 'active',
    startDate: '2024-01-01',
    endDate: 'Ongoing',
    instructions: 'Take with breakfast for better absorption.',
    sideEffects: ['None reported'],
    category: 'vitamin',
    familyMember: 'Mike Doe',
    doctor: 'Dr. Williams',
    pharmacy: 'CVS Pharmacy',
    refillDate: '2024-02-01',
    cost: 20.00,
    insurance: 'Blue Cross Blue Shield',
    notes: 'Daily supplement'
  },
  {
    id: '4',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    time: '8:00 AM, 8:00 PM',
    duration: 'Ongoing',
    status: 'active',
    startDate: '2023-06-01',
    endDate: 'Ongoing',
    instructions: 'Take with meals. Monitor blood sugar levels.',
    sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
    category: 'chronic',
    familyMember: 'Robert Doe',
    doctor: 'Dr. Brown',
    pharmacy: 'Walgreens',
    refillDate: '2024-01-15',
    cost: 35.00,
    insurance: 'Medicare',
    notes: 'Diabetes management'
  },
  {
    id: '5',
    name: 'Albuterol Inhaler',
    dosage: '2 puffs',
    frequency: 'Every 4-6 hours as needed',
    time: 'As needed',
    duration: 'Until symptoms improve',
    status: 'active',
    startDate: '2024-01-05',
    endDate: '2024-01-20',
    instructions: 'Shake well before use. Rinse mouth after use.',
    sideEffects: ['Tremors', 'Increased heart rate', 'Nervousness'],
    category: 'emergency',
    familyMember: 'Emma Doe',
    doctor: 'Dr. Davis',
    pharmacy: 'CVS Pharmacy',
    refillDate: '2024-01-20',
    cost: 45.00,
    insurance: 'Blue Cross Blue Shield',
    notes: 'For asthma symptoms'
  },
  {
    id: '6',
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily',
    time: '8:00 AM',
    duration: 'Ongoing',
    status: 'active',
    startDate: '2023-09-01',
    endDate: 'Ongoing',
    instructions: 'Take 30 minutes before breakfast.',
    sideEffects: ['Headache', 'Diarrhea', 'Stomach pain'],
    category: 'chronic',
    familyMember: 'John Doe',
    doctor: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    refillDate: '2024-01-15',
    cost: 30.00,
    insurance: 'Blue Cross Blue Shield',
    notes: 'For acid reflux'
  },
  {
    id: '7',
    name: 'Cetirizine',
    dosage: '10mg',
    frequency: 'Once daily',
    time: '9:00 PM',
    duration: 'Seasonal',
    status: 'paused',
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    instructions: 'Take in the evening to avoid drowsiness.',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
    category: 'chronic',
    familyMember: 'Sarah Doe',
    doctor: 'Dr. Johnson',
    pharmacy: 'Walgreens',
    refillDate: '2024-02-01',
    cost: 18.00,
    insurance: 'Blue Cross Blue Shield',
    notes: 'Seasonal allergies'
  },
  {
    id: '8',
    name: 'Calcium Carbonate',
    dosage: '1000mg',
    frequency: 'Twice daily',
    time: '9:00 AM, 9:00 PM',
    duration: 'Ongoing',
    status: 'active',
    startDate: '2023-12-01',
    endDate: 'Ongoing',
    instructions: 'Take with food. Do not take with iron supplements.',
    sideEffects: ['Constipation', 'Gas', 'Bloating'],
    category: 'vitamin',
    familyMember: 'Robert Doe',
    doctor: 'Dr. Brown',
    pharmacy: 'Walgreens',
    refillDate: '2024-01-15',
    cost: 22.00,
    insurance: 'Medicare',
    notes: 'Bone health supplement'
  }
];

const AIMedicationsDashboard: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>(mockMedications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFamilyMember, setFilterFamilyMember] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'status' | 'familyMember'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    duration: '',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
    sideEffects: [],
    category: 'painkiller',
    familyMember: '',
    doctor: '',
    pharmacy: '',
    refillDate: '',
    cost: 0,
    insurance: '',
    notes: ''
  });

  // Filter and sort medications
  useEffect(() => {
    let filtered = medications.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.familyMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || med.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
      const matchesFamilyMember = filterFamilyMember === 'all' || med.familyMember === filterFamilyMember;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesFamilyMember;
    });

    // Sort medications
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'startDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMedications(filtered);
  }, [medications, searchTerm, filterStatus, filterCategory, filterFamilyMember, sortBy, sortOrder]);

  // CRUD Operations
  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.familyMember) {
      alert('Please fill in all required fields');
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMedication as Medication
    };

    setMedications([...medications, medication]);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      duration: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      instructions: '',
      sideEffects: [],
      category: 'painkiller',
      familyMember: '',
      doctor: '',
      pharmacy: '',
      refillDate: '',
      cost: 0,
      insurance: '',
      notes: ''
    });
    setIsAddDialogOpen(false);
  };

  const updateMedication = () => {
    if (!editingMedication) return;

    setMedications(medications.map(med => 
      med.id === editingMedication.id ? editingMedication : med
    ));
    setEditingMedication(null);
    setIsEditDialogOpen(false);
  };

  const deleteMedication = (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const toggleMedicationStatus = (id: string, newStatus: Medication['status']) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, status: newStatus } : med
    ));
  };

  const getStatusColor = (status: Medication['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Medication['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <AlertCircle className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medications Dashboard</h1>
          <p className="text-gray-600">Manage medications for your entire family</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="painkiller">Painkiller</SelectItem>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="chronic">Chronic</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Family Member</Label>
              <Select value={filterFamilyMember} onValueChange={setFilterFamilyMember}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {mockFamilyMembers.map(member => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="familyMember">Family Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medications</p>
                <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {medications.filter(m => m.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {medications.filter(m => m.status === 'paused').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {medications.filter(m => m.status === 'overdue').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medications List */}
      <Card>
        <CardHeader>
          <CardTitle>Medications ({filteredMedications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMedications.map((medication) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                          <Badge className={getStatusColor(medication.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(medication.status)}
                              {medication.status}
                            </span>
                          </Badge>
                          <Badge variant="outline">{medication.category}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Dosage:</span> {medication.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {medication.time}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {medication.duration}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Family Member:</span> {medication.familyMember}
                          </div>
                          <div>
                            <span className="font-medium">Doctor:</span> {medication.doctor}
                          </div>
                          <div>
                            <span className="font-medium">Pharmacy:</span> {medication.pharmacy}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span> ${medication.cost}
                          </div>
                        </div>
                        
                        {medication.instructions && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </div>
                        )}
                        
                        {medication.sideEffects.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Side Effects:</span> {medication.sideEffects.join(', ')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMedication(medication);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMedication(medication.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleMedicationStatus(medication.id, 'active')}
                            className={medication.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            Active
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleMedicationStatus(medication.id, 'paused')}
                            className={medication.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleMedicationStatus(medication.id, 'completed')}
                            className={medication.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                          >
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Medication Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Medication Name *</Label>
                <Input
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  placeholder="Enter medication name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Dosage *</Label>
                <Input
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="e.g., 500mg"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Input
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  placeholder="e.g., Twice daily"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                  placeholder="e.g., 8:00 AM, 8:00 PM"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                  placeholder="e.g., 7 days"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newMedication.category} onValueChange={(value: any) => setNewMedication({...newMedication, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antibiotic">Antibiotic</SelectItem>
                    <SelectItem value="painkiller">Painkiller</SelectItem>
                    <SelectItem value="vitamin">Vitamin</SelectItem>
                    <SelectItem value="chronic">Chronic</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Family Member *</Label>
                <Select value={newMedication.familyMember} onValueChange={(value: any) => setNewMedication({...newMedication, familyMember: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFamilyMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newMedication.endDate}
                  onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Input
                  value={newMedication.doctor}
                  onChange={(e) => setNewMedication({...newMedication, doctor: e.target.value})}
                  placeholder="Enter doctor name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pharmacy</Label>
                <Input
                  value={newMedication.pharmacy}
                  onChange={(e) => setNewMedication({...newMedication, pharmacy: e.target.value})}
                  placeholder="Enter pharmacy name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newMedication.cost}
                  onChange={(e) => setNewMedication({...newMedication, cost: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Insurance</Label>
                <Input
                  value={newMedication.insurance}
                  onChange={(e) => setNewMedication({...newMedication, insurance: e.target.value})}
                  placeholder="Enter insurance provider"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                placeholder="Enter medication instructions"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newMedication.notes}
                onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                placeholder="Enter additional notes"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addMedication}>
                Add Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          {editingMedication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medication Name</Label>
                  <Input
                    value={editingMedication.name}
                    onChange={(e) => setEditingMedication({...editingMedication, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    value={editingMedication.dosage}
                    onChange={(e) => setEditingMedication({...editingMedication, dosage: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    value={editingMedication.frequency}
                    onChange={(e) => setEditingMedication({...editingMedication, frequency: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    value={editingMedication.time}
                    onChange={(e) => setEditingMedication({...editingMedication, time: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={editingMedication.duration}
                    onChange={(e) => setEditingMedication({...editingMedication, duration: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editingMedication.status} onValueChange={(value: any) => setEditingMedication({...editingMedication, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editingMedication.category} onValueChange={(value: any) => setEditingMedication({...editingMedication, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="antibiotic">Antibiotic</SelectItem>
                      <SelectItem value="painkiller">Painkiller</SelectItem>
                      <SelectItem value="vitamin">Vitamin</SelectItem>
                      <SelectItem value="chronic">Chronic</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Family Member</Label>
                  <Select value={editingMedication.familyMember} onValueChange={(value: any) => setEditingMedication({...editingMedication, familyMember: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFamilyMembers.map(member => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Input
                    value={editingMedication.doctor}
                    onChange={(e) => setEditingMedication({...editingMedication, doctor: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Pharmacy</Label>
                  <Input
                    value={editingMedication.pharmacy}
                    onChange={(e) => setEditingMedication({...editingMedication, pharmacy: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingMedication.cost}
                    onChange={(e) => setEditingMedication({...editingMedication, cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Insurance</Label>
                  <Input
                    value={editingMedication.insurance}
                    onChange={(e) => setEditingMedication({...editingMedication, insurance: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={editingMedication.instructions}
                  onChange={(e) => setEditingMedication({...editingMedication, instructions: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editingMedication.notes}
                  onChange={(e) => setEditingMedication({...editingMedication, notes: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateMedication}>
                  Update Medication
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIMedicationsDashboard;

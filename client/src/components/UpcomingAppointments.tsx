import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { familyAPI } from '@/lib/api';
import { formatDateAsMonthYear } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  familyMemberId?: string;
  familyMemberName?: string;
  familyMemberRelationship?: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  dateTime: string;
  purpose: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'pending';
  location?: string;
  room?: string;
  notes?: string;
  type?: 'in-person' | 'virtual';
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
  isFamilyAppointment?: boolean;
  scheduledBy?: 'self' | 'doctor' | 'family_member';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  insuranceInfo?: string;
  cost?: number;
  reminderSent?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
}

// Helper function to get status badge
const getStatusBadge = (status: string, t: any) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-800 border-green-200">{t('confirmed')}</Badge>;
    case 'scheduled':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('scheduled')}</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('pending')}</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 border-red-200">{t('cancelled')}</Badge>;
    case 'completed':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t('completed')}</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t('unknown')}</Badge>;
  }
};

// Helper function to get type icon
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'virtual':
      return '🖥️';
    case 'in-person':
      return '🏥';
    default:
      return '📅';
  }
};

// Helper function to get specialty color
const getSpecialtyColor = (specialty: string) => {
  const colors: Record<string, string> = {
    'Cardiology': 'bg-red-100 text-red-800 border-red-200',
    'Endocrinology': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pulmonology': 'bg-green-100 text-green-800 border-green-200',
    'Neurology': 'bg-purple-100 text-purple-800 border-purple-200',
    'Orthopedics': 'bg-orange-100 text-orange-800 border-orange-200',
    'Dermatology': 'bg-pink-100 text-pink-800 border-pink-200',
    'Pediatrics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'General Medicine': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[specialty] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Helper function to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// AppointmentCard Component
interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Appointment['status']) => void;
  isFamily: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  isFamily
}) => {
  return (
    <motion.div 
      className={`p-6 border rounded-xl transition-all duration-300 hover:shadow-lg ${
        isFamily 
          ? 'border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50' 
          : 'border-green-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
      }`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="text-2xl flex-shrink-0">{getTypeIcon(appointment.type || 'in-person')}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-bold text-gray-900 text-lg truncate">{appointment.purpose}</h3>
              {getStatusBadge(appointment.status)}
              {isFamily && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Family
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              {appointment.doctorName && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Doctor:</span> {appointment.doctorName}
                </p>
              )}
              {appointment.specialty && (
                <Badge className={`text-xs ${getSpecialtyColor(appointment.specialty)}`}>
                  {appointment.specialty}
                </Badge>
              )}
              {isFamily && appointment.familyMemberName && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Patient:</span> {appointment.familyMemberName}
                  {appointment.familyMemberRelationship && (
                    <span className="text-gray-500"> ({appointment.familyMemberRelationship})</span>
                  )}
                </p>
              )}
              {appointment.priority && appointment.priority !== 'medium' && (
                <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                  {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)} Priority
                </Badge>
              )}
              {appointment.scheduledBy && appointment.scheduledBy !== 'self' && (
                <p className="text-xs text-gray-600">
                  Scheduled by: {appointment.scheduledBy === 'doctor' ? 'Doctor' : 'Family Member'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-sm font-bold text-gray-900">
            {new Date(appointment.dateTime).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(appointment.dateTime).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          {appointment.duration && (
            <p className="text-xs text-gray-500">{appointment.duration} min</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {appointment.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="material-icons text-sm flex-shrink-0">location_on</span>
            <span className="truncate">{appointment.location}</span>
            {appointment.room && <span className="flex-shrink-0">• Room {appointment.room}</span>}
          </div>
        )}
        {appointment.notes && (
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <span className="material-icons text-sm mt-0.5 flex-shrink-0">note</span>
            <span className="truncate">{appointment.notes}</span>
          </div>
        )}
        {appointment.insuranceInfo && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="material-icons text-sm flex-shrink-0">security</span>
            <span className="truncate">{appointment.insuranceInfo}</span>
          </div>
        )}
        {appointment.cost && appointment.cost > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="material-icons text-sm flex-shrink-0">attach_money</span>
            <span className="truncate">Cost: ${appointment.cost}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {appointment.status === 'pending' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 hover:text-green-700 border-green-200"
            onClick={() => onStatusChange(appointment.id, 'confirmed')}
          >
            <span className="material-icons text-sm mr-1">check</span>
            Confirm
          </Button>
        )}
        
        {appointment.status === 'scheduled' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 border-blue-200"
            onClick={() => onStatusChange(appointment.id, 'confirmed')}
          >
            <span className="material-icons text-sm mr-1">check</span>
            Confirm
          </Button>
        )}
        
        {appointment.status === 'confirmed' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 hover:text-green-700 border-green-200"
            onClick={() => onStatusChange(appointment.id, 'completed')}
          >
            <span className="material-icons text-sm mr-1">done</span>
            Mark Complete
          </Button>
        )}
        
        {appointment.type === 'virtual' && appointment.status === 'confirmed' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 hover:text-green-700 border-green-200"
          >
            <span className="material-icons text-sm mr-1">video_call</span>
            Join Meeting
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(appointment)}
        >
          <span className="material-icons text-sm mr-1">edit</span>
          Edit
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:text-red-700 border-red-200"
          onClick={() => onDelete(appointment.id)}
        >
          <span className="material-icons text-sm mr-1">delete</span>
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

const UpcomingAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'past'>('scheduled');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'family'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    familyMemberId: '',
    doctorName: '',
    specialty: '',
    dateTime: '',
    purpose: '',
    location: '',
    room: '',
    notes: '',
    type: 'in-person' as 'in-person' | 'virtual',
    duration: 30,
    isFamilyAppointment: false,
    scheduledBy: 'self' as 'self' | 'doctor' | 'family_member',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    insuranceInfo: '',
    cost: 0,
    followUpRequired: false,
    followUpDate: ''
  });

  // Component mount effect - ensure loading state is properly managed
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        console.log('Loading sample appointments data...');
        
        // Load sample appointments data
        const savedAppointments = localStorage.getItem('mock_appointments');
        if (savedAppointments) {
          console.log('Using saved appointments from localStorage');
          setAppointments(JSON.parse(savedAppointments));
        } else {
          console.log('Creating new sample appointments data');
          // Initialize with sample data
          const sampleAppointments: Appointment[] = [
            {
              id: 'apt_1',
              patientId: 'user_1',
              patientName: 'You',
              doctorName: 'Dr. Sarah Johnson',
              specialty: 'Cardiology',
              dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
              purpose: 'Annual Heart Checkup',
              status: 'scheduled',
              location: 'City Medical Center',
              room: 'Cardiology Suite 3',
              notes: 'Please bring recent blood work results',
              type: 'in-person',
              duration: 45,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFamilyAppointment: false,
              scheduledBy: 'self',
              priority: 'medium',
              insuranceInfo: 'Blue Cross Blue Shield',
              cost: 150,
              followUpRequired: false
            },
            {
              id: 'apt_2',
              patientId: 'family_1',
              patientName: 'Emma Wilson',
              familyMemberId: 'family_1',
              familyMemberName: 'Emma Wilson',
              familyMemberRelationship: 'Daughter',
              doctorName: 'Dr. Michael Chen',
              specialty: 'Pediatrics',
              dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
              purpose: 'Vaccination Schedule',
              status: 'confirmed',
              location: 'Children\'s Medical Center',
              room: 'Pediatrics 2',
              notes: 'Routine vaccination appointment',
              type: 'in-person',
              duration: 30,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFamilyAppointment: true,
              scheduledBy: 'self',
              priority: 'medium',
              insuranceInfo: 'Family Health Plan',
              cost: 75,
              followUpRequired: false
            },
            {
              id: 'apt_3',
              patientId: 'family_2',
              patientName: 'John Wilson',
              familyMemberId: 'family_2',
              familyMemberName: 'John Wilson',
              familyMemberRelationship: 'Father',
              doctorName: 'Dr. Lisa Rodriguez',
              specialty: 'Orthopedics',
              dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
              purpose: 'Knee Pain Consultation',
              status: 'completed',
              location: 'Orthopedic Institute',
              room: 'Exam Room 5',
              notes: 'Follow-up in 6 weeks if pain persists',
              type: 'in-person',
              duration: 60,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFamilyAppointment: true,
              scheduledBy: 'self',
              priority: 'high',
              insuranceInfo: 'Medicare',
              cost: 200,
              followUpRequired: true,
              followUpDate: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'apt_4',
              patientId: 'user_1',
              patientName: 'You',
              doctorName: 'Dr. David Kim',
              specialty: 'Dermatology',
              dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
              purpose: 'Skin Cancer Screening',
              status: 'completed',
              location: 'Dermatology Associates',
              room: 'Exam Room 2',
              notes: 'All clear, annual follow-up recommended',
              type: 'in-person',
              duration: 30,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFamilyAppointment: false,
              scheduledBy: 'self',
              priority: 'medium',
              insuranceInfo: 'Blue Cross Blue Shield',
              cost: 120,
              followUpRequired: true,
              followUpDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'apt_5',
              patientId: 'user_1',
              patientName: 'You',
              doctorName: 'Dr. Amanda Foster',
              specialty: 'Endocrinology',
              dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
              purpose: 'Diabetes Management',
              status: 'scheduled',
              location: 'Endocrine Center',
              room: 'Virtual',
              notes: 'Virtual consultation - will send meeting link',
              type: 'virtual',
              duration: 45,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFamilyAppointment: false,
              scheduledBy: 'doctor',
              priority: 'high',
              insuranceInfo: 'Blue Cross Blue Shield',
              cost: 180,
              followUpRequired: true
            }
          ];
          setAppointments(sampleAppointments);
          localStorage.setItem('mock_appointments', JSON.stringify(sampleAppointments));
        }

        // Also ensure we have some basic family members data
        const savedFamilyMembers = localStorage.getItem('mock_family_members');
        if (!savedFamilyMembers) {
          console.log('Creating basic family members data');
          const basicFamilyMembers: FamilyMember[] = [
            {
              id: 'family_1',
              name: 'Emma Wilson',
              relationship: 'Daughter',
              age: 8,
              gender: 'Female'
            },
            {
              id: 'family_2',
              name: 'John Wilson',
              relationship: 'Father',
              age: 72,
              gender: 'Male'
            }
          ];
          localStorage.setItem('mock_family_members', JSON.stringify(basicFamilyMembers));
          setFamilyMembers(basicFamilyMembers);
        }

        // Load family members if user data is available
        if (userData) {
          console.log('Loading family members for user:', userData.id);
          try {
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Family members loading timeout')), 3000)
            );
            
            const membersPromise = familyAPI.getFamilyMembers(userData.id);
            const members = await Promise.race([membersPromise, timeoutPromise]);
            console.log('Family members loaded successfully:', members);
            if (members && members.length > 0) {
              setFamilyMembers(members);
            }
          } catch (error) {
            console.error('Error loading family members:', error);
            // Fallback to localStorage data if API fails
            const savedFamilyMembers = localStorage.getItem('mock_family_members');
            if (savedFamilyMembers) {
              console.log('Using fallback family members from localStorage');
              setFamilyMembers(JSON.parse(savedFamilyMembers));
            }
          }
        }

        console.log('All data loaded successfully');
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [userData]);

  // Filter appointments by date and status
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.dateTime) > new Date() && apt.status !== 'cancelled' && apt.status !== 'completed')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastAppointments = appointments
    .filter(apt => new Date(apt.dateTime) <= new Date() || apt.status === 'completed')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  // Debug logging
  console.log('Appointments loaded:', appointments.length);
  console.log('Upcoming appointments:', upcomingAppointments.length);
  console.log('Past appointments:', pastAppointments.length);

  // Separate family and self appointments
  const familyAppointments = upcomingAppointments.filter(apt => apt.isFamilyAppointment);
  const selfAppointments = upcomingAppointments.filter(apt => !apt.isFamilyAppointment);

  const familyPastAppointments = pastAppointments.filter(apt => apt.isFamilyAppointment);
  const selfPastAppointments = pastAppointments.filter(apt => !apt.isFamilyAppointment);

  // Filter appointments based on active tab and other filters
  const filteredAppointments = useMemo(() => {
    let filtered = activeTab === 'scheduled' ? upcomingAppointments : pastAppointments;

    // Apply type filter
    if (filterType === 'personal') {
      filtered = filtered.filter(apt => !apt.isFamilyAppointment);
    } else if (filterType === 'family') {
      filtered = filtered.filter(apt => apt.isFamilyAppointment);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.familyMemberName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [upcomingAppointments, pastAppointments, activeTab, filterType, searchTerm]);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    // Validate required fields
    if (!newAppointment.purpose || !newAppointment.dateTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate family member selection for family appointments
    if (newAppointment.isFamilyAppointment && !newAppointment.familyMemberId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a family member for family appointments',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get family member details if it's a family appointment
      let familyMemberName = '';
      let familyMemberRelationship = '';
      
      if (newAppointment.isFamilyAppointment && newAppointment.familyMemberId) {
        const familyMember = familyMembers.find(member => member.id === newAppointment.familyMemberId);
        if (familyMember) {
          familyMemberName = familyMember.name;
          familyMemberRelationship = familyMember.relationship;
        }
      }

      const appointment: Appointment = {
        id: `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: newAppointment.isFamilyAppointment ? newAppointment.familyMemberId : userData.id,
        patientName: newAppointment.isFamilyAppointment ? familyMemberName : 'You',
        familyMemberId: newAppointment.isFamilyAppointment ? newAppointment.familyMemberId : undefined,
        familyMemberName: newAppointment.isFamilyAppointment ? familyMemberName : undefined,
        familyMemberRelationship: newAppointment.isFamilyAppointment ? familyMemberRelationship : undefined,
        doctorId: '',
        doctorName: newAppointment.doctorName || '',
        specialty: newAppointment.specialty || '',
        dateTime: newAppointment.dateTime,
        purpose: newAppointment.purpose,
        status: 'scheduled',
        location: newAppointment.location || '',
        room: newAppointment.room || '',
        notes: newAppointment.notes || '',
        type: newAppointment.type || 'in-person',
        duration: newAppointment.duration || 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFamilyAppointment: newAppointment.isFamilyAppointment,
        scheduledBy: newAppointment.scheduledBy,
        priority: newAppointment.priority,
        insuranceInfo: newAppointment.insuranceInfo,
        cost: newAppointment.cost,
        followUpRequired: newAppointment.followUpRequired,
        followUpDate: newAppointment.followUpDate
      };

      // Add to local storage
      const updatedAppointments = [...appointments, appointment];
      setAppointments(updatedAppointments);
      localStorage.setItem('mock_appointments', JSON.stringify(updatedAppointments));

      // Reset form
      resetForm();
      setShowAddModal(false);

      toast({
        title: 'Success',
        description: `Appointment scheduled successfully${newAppointment.isFamilyAppointment ? ` for ${familyMemberName}` : ''}`,
      });
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      patientName: appointment.patientName || '',
      familyMemberId: appointment.familyMemberId || '',
      doctorName: appointment.doctorName || '',
      specialty: appointment.specialty || '',
      dateTime: appointment.dateTime,
      purpose: appointment.purpose,
      location: appointment.location || '',
      room: appointment.room || '',
      notes: appointment.notes || '',
      type: appointment.type || 'in-person',
      duration: appointment.duration || 30,
      isFamilyAppointment: appointment.isFamilyAppointment || false,
      scheduledBy: appointment.scheduledBy || 'self',
      priority: appointment.priority || 'medium',
      insuranceInfo: appointment.insuranceInfo || '',
      cost: appointment.cost || 0,
      followUpRequired: appointment.followUpRequired || false,
      followUpDate: appointment.followUpDate || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAppointment) return;

    try {
      const updatedAppointment: Appointment = {
        ...editingAppointment,
        patientName: newAppointment.isFamilyAppointment ? '' : userData?.name || 'Current User',
        familyMemberId: newAppointment.familyMemberId || undefined,
        familyMemberName: newAppointment.isFamilyAppointment && newAppointment.familyMemberId 
          ? familyMembers.find(m => m.id === newAppointment.familyMemberId)?.name 
          : undefined,
        doctorName: newAppointment.doctorName,
        specialty: newAppointment.specialty,
        dateTime: newAppointment.dateTime,
        purpose: newAppointment.purpose,
        location: newAppointment.location,
        room: newAppointment.room,
        notes: newAppointment.notes,
        type: newAppointment.type,
        duration: newAppointment.duration,
        updatedAt: new Date().toISOString(),
        isFamilyAppointment: newAppointment.isFamilyAppointment,
        scheduledBy: newAppointment.scheduledBy,
        priority: newAppointment.priority,
        insuranceInfo: newAppointment.insuranceInfo,
        cost: newAppointment.cost,
        followUpRequired: newAppointment.followUpRequired,
        followUpDate: newAppointment.followUpDate
      };

      const updatedAppointments = appointments.map(apt => 
        apt.id === editingAppointment.id ? updatedAppointment : apt
      );
      setAppointments(updatedAppointments);
      localStorage.setItem('mock_appointments', JSON.stringify(updatedAppointments));
      
      setShowEditModal(false);
      setEditingAppointment(null);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
      setAppointments(updatedAppointments);
      localStorage.setItem('mock_appointments', JSON.stringify(updatedAppointments));
      
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const updatedAppointments = appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
          : apt
      );
      setAppointments(updatedAppointments);
      localStorage.setItem('mock_appointments', JSON.stringify(updatedAppointments));
      
      toast({
        title: 'Success',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNewAppointment({
      patientName: '',
      familyMemberId: '',
      doctorName: '',
      specialty: '',
      dateTime: '',
      purpose: '',
      location: '',
      room: '',
      notes: '',
      type: 'in-person',
      duration: 30,
      isFamilyAppointment: false,
      scheduledBy: 'self',
      priority: 'medium',
      insuranceInfo: '',
      cost: 0,
      followUpRequired: false,
      followUpDate: ''
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Loading appointments...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Please wait while we load your appointment data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-icons text-white text-xl">event</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">Appointments Management</CardTitle>
              </div>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="material-icons mr-2">add</span>
                    New Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="material-icons text-purple-600 text-xl">event</span>
                        </div>
                        <div>
                          <DialogTitle className="text-2xl font-bold text-purple-900">Schedule New Appointment</DialogTitle>
                          <p className="text-sm text-purple-700">Book your next medical consultation or checkup</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleAddAppointment} className="space-y-6">
                    {/* Appointment Type Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Appointment Type
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isFamilyAppointment"
                          checked={newAppointment.isFamilyAppointment}
                          onCheckedChange={(checked) => setNewAppointment(prev => ({ 
                            ...prev, 
                            isFamilyAppointment: checked as boolean,
                            familyMemberId: checked ? prev.familyMemberId : ''
                          }))}
                        />
                        <Label htmlFor="isFamilyAppointment" className="text-gray-700">This is a family member appointment</Label>
                      </div>
                      
                      {newAppointment.isFamilyAppointment && (
                        <div>
                          <Label htmlFor="familyMemberId" className="text-gray-700">Family Member</Label>
                          <Select 
                            value={newAppointment.familyMemberId} 
                            onValueChange={(value) => setNewAppointment(prev => ({ ...prev, familyMemberId: value }))}
                          >
                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-purple-500">
                              <SelectValue placeholder="Select family member" />
                            </SelectTrigger>
                            <SelectContent>
                              {familyMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name} ({member.relationship})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Appointment Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="purpose" className="text-gray-700">Purpose</Label>
                          <Input
                            id="purpose"
                            value={newAppointment.purpose}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, purpose: e.target.value }))}
                            placeholder="e.g., Regular checkup, Consultation"
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="specialty" className="text-gray-700">Medical Specialty</Label>
                          <Select 
                            value={newAppointment.specialty} 
                            onValueChange={(value) => setNewAppointment(prev => ({ ...prev, specialty: value }))}
                          >
                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-purple-500">
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General Medicine">General Medicine</SelectItem>
                              <SelectItem value="Cardiology">Cardiology</SelectItem>
                              <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                              <SelectItem value="Pulmonology">Pulmonology</SelectItem>
                              <SelectItem value="Neurology">Neurology</SelectItem>
                              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                              <SelectItem value="Dermatology">Dermatology</SelectItem>
                              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="doctorName" className="text-gray-700">Doctor Name</Label>
                          <Input
                            id="doctorName"
                            value={newAppointment.doctorName}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, doctorName: e.target.value }))}
                            placeholder="e.g., Dr. Sarah Johnson"
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration" className="text-gray-700">Duration (minutes)</Label>
                          <Select 
                            value={newAppointment.duration.toString()} 
                            onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: parseInt(value) }))}
                          >
                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-purple-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="90">1.5 hours</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dateTime" className="text-gray-700">Date & Time</Label>
                          <Input
                            id="dateTime"
                            type="datetime-local"
                            value={newAppointment.dateTime}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, dateTime: e.target.value }))}
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="type" className="text-gray-700">Appointment Type</Label>
                          <Select 
                            value={newAppointment.type} 
                            onValueChange={(value: 'in-person' | 'virtual') => setNewAppointment(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-purple-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in-person">In-Person</SelectItem>
                              <SelectItem value="virtual">Virtual/Telemedicine</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Location Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location" className="text-gray-700">Location/Hospital</Label>
                          <Input
                            id="location"
                            value={newAppointment.location}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., City Medical Center"
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="room" className="text-gray-700">Room Number</Label>
                          <Input
                            id="room"
                            value={newAppointment.room}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, room: e.target.value }))}
                            placeholder="e.g., Room 205"
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Appointment Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Additional Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority" className="text-gray-700">Priority Level</Label>
                          <Select 
                            value={newAppointment.priority} 
                            onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewAppointment(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-purple-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="scheduledBy" className="text-gray-700">Scheduled By</Label>
                          <Select 
                            value={newAppointment.scheduledBy} 
                            onValueChange={(value: 'self' | 'doctor' | 'family_member') => setNewAppointment(prev => ({ ...prev, scheduledBy: value }))}
                          >
                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-purple-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self">Self</SelectItem>
                              <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="family_member">Family Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="insuranceInfo" className="text-gray-700">Insurance Information</Label>
                          <Input
                            id="insuranceInfo"
                            value={newAppointment.insuranceInfo}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, insuranceInfo: e.target.value }))}
                            placeholder="e.g., Blue Cross Blue Shield"
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cost" className="text-gray-700">Estimated Cost ($)</Label>
                          <Input
                            id="cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newAppointment.cost}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="h-11 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="followUpRequired"
                            checked={newAppointment.followUpRequired}
                            onCheckedChange={(checked) => setNewAppointment(prev => ({ 
                              ...prev, 
                              followUpRequired: checked as boolean,
                              followUpDate: checked ? prev.followUpDate : ''
                            }))}
                          />
                          <Label htmlFor="followUpRequired" className="text-gray-700">Follow-up required</Label>
                        </div>
                        
                        {newAppointment.followUpRequired && (
                          <div className="flex-1">
                            <Label htmlFor="followUpDate" className="text-gray-700">Follow-up Date</Label>
                            <Input
                              id="followUpDate"
                              type="date"
                              value={newAppointment.followUpDate}
                              onChange={(e) => setNewAppointment(prev => ({ ...prev, followUpDate: e.target.value }))}
                              className="h-11 focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Additional Information
                      </h3>
                      <div>
                        <Label htmlFor="notes" className="text-gray-700">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newAppointment.notes}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any additional notes or special requirements..."
                          rows={3}
                          className="focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        type="submit" 
                        className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <span className="material-icons mr-2">schedule</span>
                        Schedule Appointment
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 h-11 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Appointment Tabs */}
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={(value: 'scheduled' | 'past') => setActiveTab(value)} className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-white shadow-lg rounded-xl p-1">
                  <TabsTrigger 
                    value="scheduled" 
                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center space-x-2"
                  >
                    <span className="material-icons text-sm">schedule</span>
                    <span className="hidden sm:inline">Upcoming ({upcomingAppointments.length})</span>
                    <span className="sm:hidden">Upcoming ({upcomingAppointments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past" 
                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center space-x-2"
                  >
                    <span className="material-icons text-sm">history</span>
                    <span className="hidden sm:inline">Past ({pastAppointments.length})</span>
                    <span className="sm:hidden">Past ({pastAppointments.length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Filters and Search */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <span className="material-icons text-sm">search</span>
                      </span>
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      />
                    </div>
                    
                    <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Scheduled Appointments Tab */}
                <TabsContent value="scheduled" className="mt-6">
                  {/* Appointments List */}
                  <div className="space-y-6">
                    {/* Family Appointments Section */}
                    {familyAppointments.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Family Appointments</h3>
                          <Badge variant="outline" className="ml-2">{familyAppointments.length}</Badge>
                        </div>
                        <div className="grid gap-4">
                          {familyAppointments.map((appointment) => (
                            <AppointmentCard 
                              key={appointment.id} 
                              appointment={appointment} 
                              onEdit={handleEditAppointment}
                              onDelete={handleDeleteAppointment}
                              onStatusChange={handleStatusChange}
                              isFamily={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Self Appointments Section */}
                    {selfAppointments.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Your Appointments</h3>
                          <Badge variant="outline" className="ml-2">{selfAppointments.length}</Badge>
                        </div>
                        <div className="grid gap-4">
                          {selfAppointments.map((appointment) => (
                            <AppointmentCard 
                              key={appointment.id} 
                              appointment={appointment} 
                              onEdit={handleEditAppointment}
                              onDelete={handleDeleteAppointment}
                              onStatusChange={handleStatusChange}
                              isFamily={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Appointments Message */}
                    {upcomingAppointments.length === 0 && (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="material-icons text-gray-400 text-2xl">event_busy</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                        <p className="text-gray-500 mb-4">Schedule your first appointment to get started</p>
                        <Button onClick={() => setShowAddModal(true)}>
                          <span className="material-icons mr-2">add</span>
                          Schedule Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Past Appointments Tab */}
                <TabsContent value="past" className="mt-6">
                  <div className="space-y-6">
                    {/* Family Past Appointments Section */}
                    {familyPastAppointments.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Family Past Appointments</h3>
                          <Badge variant="outline" className="ml-2">{familyPastAppointments.length}</Badge>
                        </div>
                        <div className="grid gap-4">
                          {familyPastAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="text-xl flex-shrink-0">{getTypeIcon(appointment.type || 'in-person')}</div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="font-semibold text-gray-900 truncate">{appointment.purpose}</h3>
                                      {getStatusBadge(appointment.status)}
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                        Family
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      {appointment.doctorName && (
                                        <p className="text-sm text-gray-600">
                                          <span className="font-semibold">Doctor:</span> {appointment.doctorName}
                                        </p>
                                      )}
                                      {appointment.specialty && (
                                        <Badge className={`text-xs ${getSpecialtyColor(appointment.specialty)}`}>
                                          {appointment.specialty}
                                        </Badge>
                                      )}
                                      {appointment.familyMemberName && (
                                        <p className="text-sm text-gray-600">
                                          <span className="font-semibold">Patient:</span> {appointment.familyMemberName}
                                          {appointment.familyMemberRelationship && (
                                            <span className="text-gray-500"> ({appointment.familyMemberRelationship})</span>
                                          )}
                                        </p>
                                      )}
                                      {appointment.priority && appointment.priority !== 'medium' && (
                                        <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                                          {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)} Priority
                                        </Badge>
                                      )}
                                      {appointment.scheduledBy && appointment.scheduledBy !== 'self' && (
                                        <p className="text-xs text-gray-500">
                                          Scheduled by: {appointment.scheduledBy === 'doctor' ? 'Doctor' : 'Family Member'}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0 ml-4">
                                  <p className="text-sm font-semibold text-gray-700">
                                    {new Date(appointment.dateTime).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(appointment.dateTime).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                  {appointment.duration && (
                                    <p className="text-xs text-gray-400">{appointment.duration} min</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {appointment.location && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm flex-shrink-0">location_on</span>
                                    <span className="truncate">{appointment.location}</span>
                                    {appointment.room && <span className="flex-shrink-0">• Room {appointment.room}</span>}
                                  </div>
                                )}
                                {appointment.notes && (
                                  <div className="flex items-start space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm mt-0.5 flex-shrink-0">note</span>
                                    <span className="truncate">{appointment.notes}</span>
                                  </div>
                                )}
                                {appointment.insuranceInfo && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm flex-shrink-0">security</span>
                                    <span className="truncate">{appointment.insuranceInfo}</span>
                                  </div>
                                )}
                                {appointment.cost && appointment.cost > 0 && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm flex-shrink-0">attach_money</span>
                                    <span className="truncate">Cost: ${appointment.cost}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Self Past Appointments Section */}
                    {selfPastAppointments.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Your Past Appointments</h3>
                          <Badge variant="outline" className="ml-2">{selfPastAppointments.length}</Badge>
                        </div>
                        <div className="grid gap-4">
                          {selfPastAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="text-xl flex-shrink-0">{getTypeIcon(appointment.type || 'in-person')}</div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="font-semibold text-gray-900 truncate">{appointment.purpose}</h3>
                                      {getStatusBadge(appointment.status)}
                                    </div>
                                    
                                    <div className="space-y-1">
                                      {appointment.doctorName && (
                                        <p className="text-sm text-gray-600">
                                          <span className="font-semibold">Doctor:</span> {appointment.doctorName}
                                        </p>
                                      )}
                                      {appointment.specialty && (
                                        <Badge className={`text-xs ${getSpecialtyColor(appointment.specialty)}`}>
                                          {appointment.specialty}
                                        </Badge>
                                      )}
                                      {appointment.priority && appointment.priority !== 'medium' && (
                                        <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                                          {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)} Priority
                                        </Badge>
                                      )}
                                      {appointment.scheduledBy && appointment.scheduledBy !== 'self' && (
                                        <p className="text-xs text-gray-500">
                                          Scheduled by: {appointment.scheduledBy === 'doctor' ? 'Doctor' : 'Family Member'}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0 ml-4">
                                  <p className="text-sm font-semibold text-gray-700">
                                    {new Date(appointment.dateTime).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(appointment.dateTime).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                  {appointment.duration && (
                                    <p className="text-xs text-gray-400">{appointment.duration} min</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {appointment.location && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm flex-shrink-0">location_on</span>
                                    <span className="truncate">{appointment.location}</span>
                                    {appointment.room && <span className="flex-shrink-0">• Room {appointment.room}</span>}
                                  </div>
                                )}
                                {appointment.notes && (
                                  <div className="flex items-start space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm mt-0.5 flex-shrink-0">note</span>
                                    <span className="truncate">{appointment.notes}</span>
                                  </div>
                                )}
                                {appointment.insuranceInfo && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm flex-shrink-0">security</span>
                                    <span className="truncate">{appointment.insuranceInfo}</span>
                                  </div>
                                )}
                                {appointment.cost && appointment.cost > 0 && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="material-icons text-sm flex-shrink-0">attach_money</span>
                                    <span className="truncate">Cost: ${appointment.cost}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Past Appointments Message */}
                    {pastAppointments.length === 0 && (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="material-icons text-gray-400 text-2xl">history</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No past appointments</h3>
                        <p className="text-gray-500">Your appointment history will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Appointment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-orange-600 text-xl">edit</span>
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-orange-900">Edit Appointment</DialogTitle>
                  <p className="text-sm text-orange-700">Modify your appointment details</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <form onSubmit={handleUpdateAppointment} className="space-y-6">
            {/* Same form fields as add modal, but with editingAppointment data */}
            {/* Appointment Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Appointment Type</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsFamilyAppointment"
                  checked={newAppointment.isFamilyAppointment}
                  onCheckedChange={(checked) => setNewAppointment(prev => ({ 
                    ...prev, 
                    isFamilyAppointment: checked as boolean,
                    familyMemberId: checked ? prev.familyMemberId : ''
                  }))}
                />
                <Label htmlFor="editIsFamilyAppointment">This is a family member appointment</Label>
              </div>
              
              {newAppointment.isFamilyAppointment && (
                <div>
                  <Label htmlFor="editFamilyMemberId">Family Member</Label>
                  <Select 
                    value={newAppointment.familyMemberId} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, familyMemberId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family member" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.relationship})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Appointment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPurpose">Purpose</Label>
                  <Input
                    id="editPurpose"
                    value={newAppointment.purpose}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="e.g., Regular checkup, Consultation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editSpecialty">Medical Specialty</Label>
                  <Select 
                    value={newAppointment.specialty} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, specialty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                      <SelectItem value="Pulmonology">Pulmonology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDoctorName">Doctor Name</Label>
                  <Input
                    id="editDoctorName"
                    value={newAppointment.doctorName}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, doctorName: e.target.value }))}
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>
                <div>
                  <Label htmlFor="editDuration">Duration (minutes)</Label>
                  <Select 
                    value={newAppointment.duration.toString()} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDateTime">Date & Time</Label>
                  <Input
                    id="editDateTime"
                    type="datetime-local"
                    value={newAppointment.dateTime}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, dateTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editType">Appointment Type</Label>
                  <Select 
                    value={newAppointment.type} 
                    onValueChange={(value: 'in-person' | 'virtual') => setNewAppointment(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="virtual">Virtual/Telemedicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editLocation">Location/Hospital</Label>
                  <Input
                    id="editLocation"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., City Medical Center"
                  />
                </div>
                <div>
                  <Label htmlFor="editRoom">Room Number</Label>
                  <Input
                    id="editRoom"
                    value={newAppointment.room}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="e.g., Room 205"
                  />
                </div>
              </div>
            </div>

            {/* Additional Appointment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPriority">Priority Level</Label>
                  <Select 
                    value={newAppointment.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewAppointment(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editScheduledBy">Scheduled By</Label>
                  <Select 
                    value={newAppointment.scheduledBy} 
                    onValueChange={(value: 'self' | 'doctor' | 'family_member') => setNewAppointment(prev => ({ ...prev, scheduledBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="family_member">Family Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editInsuranceInfo">Insurance Information</Label>
                  <Input
                    id="editInsuranceInfo"
                    value={newAppointment.insuranceInfo}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, insuranceInfo: e.target.value }))}
                    placeholder="e.g., Blue Cross Blue Shield"
                  />
                </div>
                <div>
                  <Label htmlFor="editCost">Estimated Cost ($)</Label>
                  <Input
                    id="editCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newAppointment.cost}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editFollowUpRequired"
                    checked={newAppointment.followUpRequired}
                    onCheckedChange={(checked) => setNewAppointment(prev => ({ 
                      ...prev, 
                      followUpRequired: checked as boolean,
                      followUpDate: checked ? prev.followUpDate : ''
                    }))}
                  />
                  <Label htmlFor="editFollowUpRequired">Follow-up required</Label>
                </div>
                
                {newAppointment.followUpRequired && (
                  <div className="flex-1">
                    <Label htmlFor="editFollowUpDate">Follow-up Date</Label>
                    <Input
                      id="editFollowUpDate"
                      type="date"
                      value={newAppointment.followUpDate}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, followUpDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or special requirements..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="flex-1 text-white hover:bg-blue-700"
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                Update Appointment
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpcomingAppointments;

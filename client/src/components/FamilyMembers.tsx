import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { familyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import FamilyMemberDetail from './FamilyMemberDetail';

import { generatePatientDemoDataLocal } from '@/lib/demoData';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

/**
 * Enhanced FamilyMembers Component
 * 
 * Features Added:
 * - Quick Actions section with common tasks
 * - Family Health Insights dashboard with AI recommendations
 * - Enhanced time picker with quick presets for reminders
 * - Improved form validation and user feedback
 * - Better accessibility with ARIA labels
 * - Comprehensive family member management
 * - Advanced reminder system for family and self
 * - Health metrics tracking and analytics
 * - Modern UI with smooth animations
 * - Responsive design for all devices
 */

// Custom debounce function to avoid lodash dependency
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Enhanced validation interface
interface ValidationErrors {
  name?: string;
  relationship?: string;
  age?: string;
  gender?: string;
  contactNumber?: string;
  bloodType?: string;
  [key: string]: string | undefined;
}

interface Reminder {
  id: string;
  familyMemberId: string;
  familyMemberName: string;
  title: string;
  description: string;
  type: 'medication' | 'appointment' | 'checkup' | 'vaccination' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  days?: string[];
  isActive: boolean;
  nextReminder: string;
  lastReminder?: string;
  createdAt: string;
  updatedAt: string;
}

interface SelfReminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  medicationName: string;
  dosage: string;
  doseStrength?: string;
  doseForm?: string;
  administrationMethod?: string;
  type: 'medication' | 'appointment' | 'checkup' | 'vaccination' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  times: string[];
  days?: string[];
  isActive: boolean;
  nextReminder: string;
  lastReminder?: string;
  instructions?: string;
  specialInstructions?: string;
  sideEffects?: string[];
  category?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
  contactNumber: string;
  emergencyContact: boolean;
  bloodType: string;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  lastCheckup: string;
  nextCheckup: string;
  profileImage?: string;
  createdAt?: any;
  // Additional comprehensive fields
  height?: number;
  weight?: number;
  bmi?: number;
  occupation?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  preferredHospital?: string;
  preferredDoctor?: string;
  dietaryRestrictions?: string[];
  exerciseRoutine?: string;
  sleepPattern?: string;
  stressLevel?: string;
  familyHistory?: string[];
  vaccinationHistory?: string[];
  lastDentalCheckup?: string;
  nextDentalCheckup?: string;
  visionTest?: string;
  hearingTest?: string;
  mentalHealthStatus?: string;
  lifestyleFactors?: string[];
}

const FamilyMembers: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selfReminders, setSelfReminders] = useState<SelfReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'relationship'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [showSelfReminderModal, setShowSelfReminderModal] = useState(false);
  const [editingSelfReminder, setEditingSelfReminder] = useState<SelfReminder | null>(null);
  const [newReminder, setNewReminder] = useState({
    familyMemberId: '',
    title: '',
    description: '',
    type: 'medication' as Reminder['type'],
    frequency: 'daily' as Reminder['frequency'],
    time: '09:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true
  });
  const [newSelfReminder, setNewSelfReminder] = useState({
    title: '',
    description: '',
    medicationName: '',
    dosage: '',
    doseStrength: '',
    doseForm: '',
    administrationMethod: '',
    type: 'medication' as SelfReminder['type'],
    frequency: 'daily' as SelfReminder['frequency'],
    times: ['09:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    instructions: '',
    specialInstructions: '',
    category: '',
    color: 'blue'
  });
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    age: '',
    gender: '',
    contactNumber: '',
    bloodType: '',
    emergencyContact: false,
    allergies: [] as string[],
    medicalConditions: [] as string[],
    // Additional comprehensive fields
    height: '',
    weight: '',
    bmi: '',
    occupation: '',
    insuranceProvider: '',
    insuranceNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    preferredHospital: '',
    preferredDoctor: '',
    dietaryRestrictions: [] as string[],
    exerciseRoutine: '',
    sleepPattern: '',
    stressLevel: '',
    familyHistory: [] as string[],
    vaccinationHistory: [] as string[],
    lastDentalCheckup: '',
    nextDentalCheckup: '',
    visionTest: '',
    hearingTest: '',
    mentalHealthStatus: '',
    lifestyleFactors: [] as string[]
  });



  // Initialize demo data if it doesn't exist
  const initializeDemoData = useCallback(async () => {
    if (!userData) return;
    
    try {
      console.log('=== INITIALIZE DEMO DATA DEBUG ===');
      console.log('User data:', userData);
      console.log('User ID:', userData.id);
      
      // Check what's in localStorage before generation
      const existingData = localStorage.getItem('mock_family_members');
      console.log('Existing family members data from localStorage:', existingData);
      
      if (!existingData || JSON.parse(existingData).length === 0) {
        console.log('No demo data found, generating...');
        console.log('Calling generatePatientDemoDataLocal with user ID:', userData.id);
        
        // Call the demo data generation
        await generatePatientDemoDataLocal(userData.id);
        
        // Verify the data was generated and stored
        const newData = localStorage.getItem('mock_family_members');
        console.log('New data after generation:', newData);
        
        // Also check if the data is in the mockStorage
        const mockStorageData = JSON.parse(localStorage.getItem('mock_family_members') || '[]');
        console.log('Mock storage data length:', mockStorageData.length);
        console.log('Mock storage data sample:', mockStorageData.slice(0, 2));
        
        return true;
      }
      
      console.log('Demo data already exists, no need to generate');
      const parsedData = JSON.parse(existingData);
      console.log('Existing data length:', parsedData.length);
      console.log('Existing data sample:', parsedData.slice(0, 2));
      return false;
    } catch (error) {
      console.error('Error initializing demo data:', error);
      return false;
    }
  }, [userData]);

  // Generate demo reminders
  const generateDemoReminders = useCallback(() => {
    if (!members.length) return;
    
    const demoReminders: Reminder[] = [];
    const reminderTypes: Reminder['type'][] = ['medication', 'appointment', 'checkup', 'vaccination'];
    const frequencies: Reminder['frequency'][] = ['daily', 'weekly', 'monthly'];
    const times = ['08:00', '12:00', '18:00', '20:00'];
    
    members.forEach((member, index) => {
      // Generate 2-4 reminders per member
      const numReminders = 2 + (index % 3);
      
      for (let i = 0; i < numReminders; i++) {
        const type = reminderTypes[i % reminderTypes.length];
        const frequency = frequencies[i % frequencies.length];
        const time = times[i % times.length];
        
        const reminder: Reminder = {
          id: `reminder_${member.id}_${i}`,
          familyMemberId: member.id,
          familyMemberName: member.name,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Reminder for ${member.name}`,
          description: `Reminder for ${member.name}'s ${type}`,
          type,
          frequency,
          time,
          days: frequency === 'daily' ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] : 
                frequency === 'weekly' ? ['monday', 'wednesday', 'friday'] : ['monday'],
          isActive: Math.random() > 0.2, // 80% active
          nextReminder: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        demoReminders.push(reminder);
      }
    });
    
    setReminders(demoReminders);
  }, [members]);

  // Generate demo self reminders
  const generateDemoSelfReminders = useCallback(() => {
    if (!userData) return;
    
    const demoSelfReminders: SelfReminder[] = [
      {
        id: 'self_reminder_1',
        userId: userData.id,
        title: 'Morning Blood Pressure Medication',
        description: 'Take blood pressure medication with breakfast',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        doseStrength: '10mg',
        doseForm: 'tablet',
        administrationMethod: 'oral',
        type: 'medication',
        frequency: 'daily',
        times: ['08:00'],
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        isActive: true,
        nextReminder: new Date().toISOString(),
        instructions: 'Take with food, avoid grapefruit',
        specialInstructions: 'Monitor blood pressure after taking',
        category: 'cardiovascular',
        color: 'red',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'self_reminder_2',
        userId: userData.id,
        title: 'Evening Diabetes Medication',
        description: 'Take diabetes medication before dinner',
        medicationName: 'Metformin',
        dosage: '500mg',
        doseStrength: '500mg',
        doseForm: 'tablet',
        administrationMethod: 'oral',
        type: 'medication',
        frequency: 'daily',
        times: ['18:00'],
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        isActive: true,
        nextReminder: new Date().toISOString(),
        instructions: 'Take with food to reduce stomach upset',
        specialInstructions: 'Check blood sugar levels regularly',
        category: 'diabetes',
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'self_reminder_3',
        userId: userData.id,
        title: 'Weekly Vitamin D Supplement',
        description: 'Take vitamin D supplement for bone health',
        medicationName: 'Vitamin D3',
        dosage: '2000 IU',
        doseStrength: '2000 IU',
        doseForm: 'capsule',
        administrationMethod: 'oral',
        type: 'medication',
        frequency: 'weekly',
        times: ['09:00'],
        days: ['monday'],
        isActive: true,
        nextReminder: new Date().toISOString(),
        instructions: 'Take with fatty meal for better absorption',
        specialInstructions: 'Get regular sunlight exposure',
        category: 'vitamins',
        color: 'yellow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setSelfReminders(demoSelfReminders);
  }, [userData]);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!userData) return;
      
      try {
        setLoading(true);
        
        console.log('=== FETCH FAMILY MEMBERS DEBUG ===');
        console.log('Fetching family members for user:', userData);
        console.log('User ID being used:', userData.id);
        
        // Initialize demo data if needed
        const demoDataInitialized = await initializeDemoData();
        console.log('Demo data initialized:', demoDataInitialized);
        
        // Check what's in localStorage after initialization
        const localStorageData = localStorage.getItem('mock_family_members');
        console.log('LocalStorage family members data after init:', localStorageData);
        
        // Check what's in the mockStorage object
        const mockStorageData = JSON.parse(localStorage.getItem('mock_family_members') || '[]');
        console.log('Mock storage data before API call:', mockStorageData);
        console.log('Mock storage data length:', mockStorageData.length);
        
        // Pass the user ID to ensure proper filtering
        console.log('Calling familyAPI.getFamilyMembers with user ID:', userData.id);
        const data = await familyAPI.getFamilyMembers(userData.id);
        console.log('Fetched family members from API:', data);
        console.log('API response length:', data?.length || 0);
        
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching family members:', error);
        handleAPIError(error, 'fetch family members');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchFamilyMembers();
    }
  }, [userData, initializeDemoData]);

  useEffect(() => {
    if (members.length > 0) {
      generateDemoReminders();
    }
  }, [members, generateDemoReminders]);

  useEffect(() => {
    if (userData) {
      generateDemoSelfReminders();
    }
  }, [userData, generateDemoSelfReminders]);

  // Ensure demo data exists when component mounts
  useEffect(() => {
    const ensureDemoData = async () => {
      if (userData) {
        const existingData = localStorage.getItem('mock_family_members');
        if (!existingData || JSON.parse(existingData).length === 0) {
          console.log('Ensuring demo data exists...');
          await initializeDemoData();
          // Refresh the data after ensuring demo data exists
          const data = await familyAPI.getFamilyMembers(userData.id);
          setMembers(data || []);
        }
      }
    };

    ensureDemoData();
  }, [userData, initializeDemoData]);



  const refreshData = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      const data = await familyAPI.getFamilyMembers(userData.id);
      console.log('Refreshed family members:', data);
      setMembers(data || []);
      
      toast({
        title: 'Success',
        description: 'Family members refreshed successfully',
      });
    } catch (error) {
      handleAPIError(error, 'refresh family members');
    } finally {
      setLoading(false);
    }
  };

  const regenerateDemoData = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      console.log('Regenerating demo data for user:', userData.id);
      
      // Clear existing data first
      localStorage.removeItem('mock_family_members');
      localStorage.removeItem('mock_medications');
      localStorage.removeItem('mock_reports');

      localStorage.removeItem('mock_health_metrics');
      localStorage.removeItem('mock_disease_analysis');
      localStorage.removeItem('mock_health_trends');
      
      // Generate fresh demo data
      await generatePatientDemoDataLocal(userData.id);
      
      // Refresh the data
      const data = await familyAPI.getFamilyMembers(userData.id);
      console.log('Regenerated family members:', data);
      setMembers(data || []);
      
      // Also regenerate reminders
      generateDemoReminders();
      generateDemoSelfReminders();
      
      toast({
        title: 'Success',
        description: 'Demo data regenerated successfully',
      });
    } catch (error) {
      handleAPIError(error, 'regenerate demo data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced form reset with better state management
  const resetNewMemberForm = useCallback(() => {
    setNewMember({
      name: '',
      relationship: '',
      age: '',
      gender: '',
      contactNumber: '',
      bloodType: '',
      emergencyContact: false,
      allergies: [],
      medicalConditions: [],
      height: '',
      weight: '',
      bmi: '',
      occupation: '',
      insuranceProvider: '',
      insuranceNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      address: '',
      preferredHospital: '',
      preferredDoctor: '',
      dietaryRestrictions: [],
      exerciseRoutine: '',
      sleepPattern: '',
      stressLevel: '',
      familyHistory: [],
      vaccinationHistory: [],
      lastDentalCheckup: '',
      nextDentalCheckup: '',
      visionTest: '',
      hearingTest: '',
      mentalHealthStatus: '',
      lifestyleFactors: []
    });
    
    // Clear form errors when resetting
    setFormErrors({});
    setIsSubmitting(false);
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    // Enhanced form validation with better user feedback
    const validationResult = validateForm(newMember);
    if (!validationResult.isValid) {
      setFormErrors(validationResult.errors);
      
      // Focus on first error field
      const firstErrorField = Object.keys(validationResult.errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (errorElement) {
        errorElement.focus();
      }
      
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const memberData = {
        ...newMember,
        age: parseInt(newMember.age),
        userId: userData.id,
        lastCheckup: new Date().toISOString(),
        nextCheckup: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        medications: [],
        allergies: newMember.allergies || [],
        medicalConditions: newMember.medicalConditions || []
      };

      await familyAPI.createFamilyMember(memberData);
      
      // Refresh the members list
      const updatedMembers = await familyAPI.getFamilyMembers();
      setMembers(updatedMembers || []);
      
      resetNewMemberForm();
      setShowAddModal(false);

      toast({
        title: 'Success',
        description: 'Family member added successfully',
      });
    } catch (error) {
      handleAPIError(error, 'add family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      relationship: member.relationship,
      age: member.age.toString(),
      gender: member.gender,
      contactNumber: member.contactNumber,
      bloodType: member.bloodType,
      emergencyContact: member.emergencyContact,
      allergies: member.allergies || [],
      medicalConditions: member.medicalConditions || [],
      height: member.height?.toString() || '',
      weight: member.weight?.toString() || '',
      bmi: member.bmi?.toString() || '',
      occupation: member.occupation || '',
      insuranceProvider: member.insuranceProvider || '',
      insuranceNumber: member.insuranceNumber || '',
      emergencyContactName: member.emergencyContactName || '',
      emergencyContactPhone: member.emergencyContactPhone || '',
      address: member.address || '',
      preferredHospital: member.preferredHospital || '',
      preferredDoctor: member.preferredDoctor || '',
      dietaryRestrictions: member.dietaryRestrictions || [],
      exerciseRoutine: member.exerciseRoutine || '',
      sleepPattern: member.sleepPattern || '',
      stressLevel: member.stressLevel || '',
      familyHistory: member.familyHistory || [],
      vaccinationHistory: member.vaccinationHistory || [],
      lastDentalCheckup: member.lastDentalCheckup || '',
      nextDentalCheckup: member.nextDentalCheckup || '',
      visionTest: member.visionTest || '',
      hearingTest: member.hearingTest || '',
      mentalHealthStatus: member.mentalHealthStatus || '',
      lifestyleFactors: member.lifestyleFactors || []
    });
    setShowEditModal(true);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !editingMember) return;
    
    // Enhanced form validation with better user feedback
    const validationResult = validateForm(newMember);
    if (!validationResult.isValid) {
      setFormErrors(validationResult.errors);
      
      // Focus on first error field
      const firstErrorField = Object.keys(validationResult.errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (errorElement) {
        errorElement.focus();
      }
      
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedData = {
        ...newMember,
        age: parseInt(newMember.age),
        height: newMember.height ? parseFloat(newMember.height) : undefined,
        weight: newMember.weight ? parseFloat(newMember.weight) : undefined,
        bmi: newMember.bmi ? parseFloat(newMember.bmi) : undefined,
        allergies: newMember.allergies || [],
        medicalConditions: newMember.medicalConditions || [],
        dietaryRestrictions: newMember.dietaryRestrictions || [],
        familyHistory: newMember.familyHistory || [],
        vaccinationHistory: newMember.vaccinationHistory || [],
        lifestyleFactors: newMember.lifestyleFactors || []
      };

      await familyAPI.updateFamilyMember(editingMember.id, updatedData);
      
      // Refresh the members list
      const updatedMembers = await familyAPI.getFamilyMembers();
      setMembers(updatedMembers || []);
      
      setEditingMember(null);
      resetNewMemberForm();
      setShowEditModal(false);

      toast({
        title: 'Success',
        description: 'Family member updated successfully',
      });
    } catch (error) {
      handleAPIError(error, 'update family member');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from your family members?`)) return;

    try {
      await familyAPI.deleteFamilyMember(memberId);
      const updatedMembers = await familyAPI.getFamilyMembers();
      setMembers(updatedMembers || []);
      
      toast({
        title: 'Success',
        description: 'Family member removed successfully',
      });
    } catch (error) {
      handleAPIError(error, 'remove family member');
    }
  };

  const getAvatarColor = (relationship: string | undefined) => {
    if (!relationship) return 'bg-gray-100 text-gray-600';
    
    switch (relationship.toLowerCase()) {
      case 'spouse':
      case 'wife':
      case 'husband':
        return 'bg-purple-100 text-purple-600';
      case 'daughter':
      case 'niece':
        return 'bg-pink-100 text-pink-600';
      case 'son':
      case 'nephew':
        return 'bg-green-100 text-green-600';
      case 'mother':
      case 'mother-in-law':
        return 'bg-red-100 text-red-600';
      case 'father':
      case 'father-in-law':
        return 'bg-indigo-100 text-indigo-600';
      case 'sister':
      case 'sister-in-law':
        return 'bg-orange-100 text-orange-600';
      case 'brother':
      case 'brother-in-law':
        return 'bg-blue-100 text-blue-600';
      case 'grandmother':
        return 'bg-yellow-100 text-yellow-600';
      case 'grandfather':
        return 'bg-teal-100 text-teal-600';
      case 'aunt':
        return 'bg-rose-100 text-rose-600';
      case 'uncle':
        return 'bg-cyan-100 text-cyan-600';
      case 'cousin':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAvatarIcon = (relationship: string | undefined) => {
    if (!relationship) return 'person';
    
    switch (relationship.toLowerCase()) {
      case 'daughter':
      case 'son':
      case 'niece':
      case 'nephew':
        return 'child_care';
      case 'spouse':
      case 'wife':
      case 'husband':
        return 'favorite';
      case 'mother':
      case 'mother-in-law':
      case 'grandmother':
        return 'elderly_woman';
      case 'father':
      case 'father-in-law':
      case 'grandfather':
        return 'elderly';
      case 'sister':
      case 'sister-in-law':
        return 'woman';
      case 'brother':
      case 'brother-in-law':
        return 'man';
      case 'aunt':
        return 'woman';
      case 'uncle':
        return 'man';
      case 'cousin':
        return 'group';
      default:
        return 'person';
    }
  };

  const relationships = [
    'Spouse', 'Wife', 'Husband', 'Mother', 'Father', 
    'Son', 'Daughter', 'Brother', 'Sister', 
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt',
    'Mother-in-law', 'Father-in-law', 'Sister-in-law', 'Brother-in-law',
    'Cousin', 'Nephew', 'Niece', 'Other'
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Enhanced form validation with better error messages and validation rules
  const validateForm = useCallback((data: typeof newMember) => {
    const errors: ValidationErrors = {};
    
    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (data.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.name.trim())) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    // Relationship validation
    if (!data.relationship) {
      errors.relationship = 'Relationship is required';
    }
    
    // Age validation
    if (!data.age) {
      errors.age = 'Age is required';
    } else {
      const ageNum = parseInt(data.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        errors.age = 'Age must be between 0 and 120';
      }
    }
    
    // Contact number validation with international format support
    if (data.contactNumber && !/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/.test(data.contactNumber)) {
      errors.contactNumber = 'Please enter a valid phone number';
    }
    
    // Height validation
    if (data.height) {
      const heightNum = parseFloat(data.height);
      if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
        errors.height = 'Height must be between 50 and 300 cm';
      }
    }
    
    // Weight validation
    if (data.weight) {
      const weightNum = parseFloat(data.weight);
      if (isNaN(weightNum) || weightNum < 1 || weightNum > 500) {
        errors.weight = 'Weight must be between 1 and 500 kg';
      }
    }

    // BMI validation if both height and weight are provided
    if (data.height && data.weight && data.bmi) {
      const heightNum = parseFloat(data.height) / 100; // Convert to meters
      const weightNum = parseFloat(data.weight);
      const calculatedBMI = weightNum / (heightNum * heightNum);
      const inputBMI = parseFloat(data.bmi);
      
      if (Math.abs(calculatedBMI - inputBMI) > 2) {
        errors.bmi = 'BMI should be calculated from height and weight or left empty';
      }
    }

    // Enhanced validation for emergency contact fields
    if (data.emergencyContact) {
      if (!data.emergencyContactName?.trim()) {
        errors.emergencyContactName = 'Emergency contact name is required when marked as emergency contact';
      } else if (data.emergencyContactName.trim().length < 2) {
        errors.emergencyContactName = 'Emergency contact name must be at least 2 characters';
      }
      
      if (!data.emergencyContactPhone?.trim()) {
        errors.emergencyContactPhone = 'Emergency contact phone is required when marked as emergency contact';
      } else if (!/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/.test(data.emergencyContactPhone)) {
        errors.emergencyContactPhone = 'Please enter a valid emergency contact phone number';
      }
    }

    // Validate insurance fields if provided
    if (data.insuranceProvider && !data.insuranceNumber) {
      errors.insuranceNumber = 'Insurance number is required when insurance provider is provided';
    }
    if (data.insuranceNumber && !data.insuranceProvider) {
      errors.insuranceProvider = 'Insurance provider is required when insurance number is provided';
    }
    
    // Address validation
    if (data.address && data.address.trim().length > 200) {
      errors.address = 'Address must be less than 200 characters';
    }
    
    // Occupation validation
    if (data.occupation && data.occupation.trim().length > 100) {
      errors.occupation = 'Occupation must be less than 100 characters';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }, []);

  // Enhanced error handling for API calls with better error categorization and user feedback
  const handleAPIError = useCallback((error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';
    let errorVariant: 'destructive' | 'default' = 'destructive';
    
    // Handle different types of errors
    if (error?.response?.status) {
      const status = error.response.status;
      switch (status) {
        case 400:
          errorTitle = 'Validation Error';
          errorMessage = error.response.data?.message || 'Please check your input and try again';
          break;
        case 401:
          errorTitle = 'Authentication Error';
          errorMessage = 'Please log in again to continue';
          break;
        case 403:
          errorTitle = 'Access Denied';
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorTitle = 'Not Found';
          errorMessage = 'The requested resource was not found';
          break;
        case 409:
          errorTitle = 'Conflict';
          errorMessage = error.response.data?.message || 'This resource already exists or conflicts with existing data';
          break;
        case 422:
          errorTitle = 'Validation Error';
          errorMessage = error.response.data?.message || 'The provided data is invalid';
          break;
        case 429:
          errorTitle = 'Too Many Requests';
          errorMessage = 'Please wait a moment before trying again';
          break;
        case 500:
          errorTitle = 'Server Error';
          errorMessage = 'Our servers are experiencing issues. Please try again later';
          break;
        case 503:
          errorTitle = 'Service Unavailable';
          errorMessage = 'The service is temporarily unavailable. Please try again later';
          break;
        default:
          errorTitle = 'Request Failed';
          errorMessage = error.response.data?.message || `Request failed with status ${status}`;
      }
    } else if (error?.code === 'NETWORK_ERROR') {
      errorTitle = 'Network Error';
      errorMessage = 'Please check your internet connection and try again';
    } else if (error?.code === 'TIMEOUT') {
      errorTitle = 'Request Timeout';
      errorMessage = 'The request took too long. Please try again';
    } else if (error?.message) {
      // Handle specific error messages
      if (error.message.includes('permission') || error.message.includes('access')) {
        errorTitle = 'Access Denied';
        errorMessage = 'You do not have permission to perform this action';
      } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
        errorTitle = 'Not Found';
        errorMessage = 'The requested resource was not found';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorTitle = 'Validation Error';
        errorMessage = error.message;
      } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        errorTitle = 'Duplicate Entry';
        errorMessage = 'This resource already exists';
      } else {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Show error toast
    toast({
      title: errorTitle,
      description: `Failed to ${operation}: ${errorMessage}`,
      variant: errorVariant,
    });
    
    // Log detailed error for debugging
    console.group(`API Error Details - ${operation}`);
    console.error('Error object:', error);
    console.error('Error message:', errorMessage);
    console.error('Error title:', errorTitle);
    console.error('Stack trace:', error?.stack);
    console.groupEnd();
  }, [toast]);

  // Memoized statistics for better performance with enhanced calculations
  const familyStats = useMemo(() => {
    if (members.length === 0) return null;
    
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60 * 1000;
    
    return {
      totalMembers: members.length,
      emergencyContacts: members.filter(m => m.emergencyContact).length,
      recentCheckups: members.filter(m => m.lastCheckup && new Date(m.lastCheckup) > new Date(thirtyDaysAgo)).length,
      upcomingCheckups: members.filter(m => m.nextCheckup && new Date(m.nextCheckup).getTime() > now).length,
      withAllergies: members.filter(m => m.allergies && m.allergies.length > 0).length,
      onMedications: members.filter(m => m.medications && m.medications.length > 0).length,
      averageAge: Math.round(members.reduce((sum, m) => sum + m.age, 0) / members.length),
      ageGroups: {
        children: members.filter(m => m.age < 18).length,
        adults: members.filter(m => m.age >= 18 && m.age < 65).length,
        seniors: members.filter(m => m.age >= 65).length
      },
      healthRiskMembers: members.filter(m => 
        (m.allergies && m.allergies.length > 2) || 
        (m.medicalConditions && m.medicalConditions.length > 1) ||
        (m.medications && m.medications.length > 3)
      ).length
    };
  }, [members]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;

    // Apply search filter with enhanced search across multiple fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.relationship.toLowerCase().includes(searchLower) ||
        member.contactNumber?.includes(searchTerm) ||
        member.occupation?.toLowerCase().includes(searchLower) ||
        member.bloodType?.toLowerCase().includes(searchLower) ||
        member.allergies?.some(allergy => allergy.toLowerCase().includes(searchLower)) ||
        member.medicalConditions?.some(condition => condition.toLowerCase().includes(searchLower)) ||
        member.medications?.some(med => med.toLowerCase().includes(searchLower)) ||
        member.address?.toLowerCase().includes(searchLower) ||
        member.preferredHospital?.toLowerCase().includes(searchLower) ||
        member.preferredDoctor?.toLowerCase().includes(searchLower) ||
        member.emergencyContactName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply relationship filter
    if (filterRelationship !== 'all') {
      filtered = filtered.filter(member => member.relationship === filterRelationship);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'relationship':
          aValue = a.relationship.toLowerCase();
          bValue = b.relationship.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [members, searchTerm, filterRelationship, sortBy, sortOrder]);

  // Reminder CRUD operations
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.familyMemberId || !newReminder.title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const member = members.find(m => m.id === newReminder.familyMemberId);
    if (!member) return;

    const reminder: Reminder = {
      id: `reminder_${Date.now()}`,
      familyMemberId: newReminder.familyMemberId,
      familyMemberName: member.name,
      title: newReminder.title,
      description: newReminder.description,
      type: newReminder.type,
      frequency: newReminder.frequency,
      time: newReminder.time,
      days: newReminder.days,
      isActive: newReminder.isActive,
      nextReminder: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReminders(prev => [...prev, reminder]);
    setShowReminderModal(false);
    setNewReminder({
      familyMemberId: '',
      title: '',
      description: '',
      type: 'medication',
      frequency: 'daily',
      time: '09:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true
    });

    toast({
      title: 'Success',
      description: 'Reminder added successfully',
    });
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setNewReminder({
      familyMemberId: reminder.familyMemberId,
      title: reminder.title,
      description: reminder.description,
      type: reminder.type,
      frequency: reminder.frequency,
      time: reminder.time,
      days: reminder.days || [],
      isActive: reminder.isActive
    });
    setShowReminderModal(true);
  };

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;

    const updatedReminder: Reminder = {
      ...editingReminder,
      title: newReminder.title,
      description: newReminder.description,
      type: newReminder.type,
      frequency: newReminder.frequency,
      time: newReminder.time,
      days: newReminder.days,
      isActive: newReminder.isActive,
      updatedAt: new Date().toISOString()
    };

    setReminders(prev => prev.map(r => r.id === editingReminder.id ? updatedReminder : r));
    setShowReminderModal(false);
    setEditingReminder(null);
    setNewReminder({
      familyMemberId: '',
      title: '',
      description: '',
      type: 'medication',
      frequency: 'daily',
      time: '09:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true
    });

    toast({
      title: 'Success',
      description: 'Reminder updated successfully',
    });
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    setReminders(prev => prev.filter(r => r.id !== reminderId));
    toast({
      title: 'Success',
      description: 'Reminder deleted successfully',
    });
  };

  const toggleReminderStatus = (reminderId: string) => {
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  // Self Reminder CRUD operations
  const handleAddSelfReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !newSelfReminder.title || !newSelfReminder.medicationName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const selfReminder: SelfReminder = {
      id: `self_reminder_${Date.now()}`,
      userId: userData.id,
      title: newSelfReminder.title,
      description: newSelfReminder.description,
      medicationName: newSelfReminder.medicationName,
      dosage: newSelfReminder.dosage,
      doseStrength: newSelfReminder.doseStrength,
      doseForm: newSelfReminder.doseForm,
      administrationMethod: newSelfReminder.administrationMethod,
      type: newSelfReminder.type,
      frequency: newSelfReminder.frequency,
      times: newSelfReminder.times,
      days: newSelfReminder.days,
      isActive: newSelfReminder.isActive,
      nextReminder: new Date().toISOString(),
      instructions: newSelfReminder.instructions,
      specialInstructions: newSelfReminder.specialInstructions,
      category: newSelfReminder.category,
      color: newSelfReminder.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSelfReminders(prev => [...prev, selfReminder]);
    setShowSelfReminderModal(false);
    resetSelfReminderForm();

    toast({
      title: 'Success',
      description: 'Self reminder added successfully',
    });
  };

  const handleEditSelfReminder = (reminder: SelfReminder) => {
    setEditingSelfReminder(reminder);
    setNewSelfReminder({
      title: reminder.title,
      description: reminder.description,
      medicationName: reminder.medicationName,
      dosage: reminder.dosage,
      doseStrength: reminder.doseStrength || '',
      doseForm: reminder.doseForm || '',
      administrationMethod: reminder.administrationMethod || '',
      type: reminder.type,
      frequency: reminder.frequency,
      times: reminder.times,
      days: reminder.days || [],
      isActive: reminder.isActive,
      instructions: reminder.instructions || '',
      specialInstructions: reminder.specialInstructions || '',
      category: reminder.category || '',
      color: reminder.color || 'blue'
    });
    setShowSelfReminderModal(true);
  };

  const handleUpdateSelfReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSelfReminder) return;

    const updatedReminder: SelfReminder = {
      ...editingSelfReminder,
      title: newSelfReminder.title,
      description: newSelfReminder.description,
      medicationName: newSelfReminder.medicationName,
      dosage: newSelfReminder.dosage,
      doseStrength: newSelfReminder.doseStrength,
      doseForm: newSelfReminder.doseForm,
      administrationMethod: newSelfReminder.administrationMethod,
      type: newSelfReminder.type,
      frequency: newSelfReminder.frequency,
      times: newSelfReminder.times,
      days: newSelfReminder.days,
      isActive: newSelfReminder.isActive,
      instructions: newSelfReminder.instructions,
      specialInstructions: newSelfReminder.specialInstructions,
      category: newSelfReminder.category,
      color: newSelfReminder.color,
      updatedAt: new Date().toISOString()
    };

    setSelfReminders(prev => prev.map(r => r.id === editingSelfReminder.id ? updatedReminder : r));
    setShowSelfReminderModal(false);
    setEditingSelfReminder(null);
    resetSelfReminderForm();

    toast({
      title: 'Success',
      description: 'Self reminder updated successfully',
    });
  };

  const handleDeleteSelfReminder = (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this self reminder?')) return;

    setSelfReminders(prev => prev.filter(r => r.id !== reminderId));
    toast({
      title: 'Success',
      description: 'Self reminder deleted successfully',
    });
  };

  const toggleSelfReminderStatus = (reminderId: string) => {
    setSelfReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const resetSelfReminderForm = () => {
    setNewSelfReminder({
      title: '',
      description: '',
      medicationName: '',
      dosage: '',
      doseStrength: '',
      doseForm: '',
      administrationMethod: '',
      type: 'medication',
      frequency: 'daily',
      times: ['09:00'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true,
      instructions: '',
      specialInstructions: '',
      category: '',
      color: 'blue'
    });
  };

  const addTimeSlot = () => {
    setNewSelfReminder(prev => ({
      ...prev,
      times: [...prev.times, '09:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setNewSelfReminder(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, time: string) => {
    setNewSelfReminder(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'medication': return 'medication';
      case 'appointment': return 'event';
      case 'checkup': return 'medical_services';
      case 'vaccination': return 'vaccines';
      default: return 'notifications';
    }
  };

  const getReminderColor = (type: Reminder['type']) => {
    switch (type) {
      case 'medication': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'appointment': return 'bg-green-100 text-green-800 border-green-200';
      case 'checkup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vaccination': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyText = (frequency: Reminder['frequency']) => {
    switch (frequency) {
      case 'once': return 'Once';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Custom';
    }
  };

  const getDaysText = (days: string[]) => {
    if (!days || days.length === 0) return '';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.includes('monday') && days.includes('friday')) return 'Weekdays';
    if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) return 'Weekends';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  const getSelfReminderIcon = (type: SelfReminder['type']) => {
    switch (type) {
      case 'medication': return 'medication';
      case 'appointment': return 'event';
      case 'checkup': return 'medical_services';
      case 'vaccination': return 'vaccines';
      default: return 'notifications';
    }
  };

  const getSelfReminderColor = (type: SelfReminder['type'], color?: string) => {
    if (color) {
      const colorMap: Record<string, string> = {
        'red': 'bg-red-100 text-red-800 border-red-200',
        'blue': 'bg-blue-100 text-blue-800 border-blue-200',
        'green': 'bg-green-100 text-green-800 border-green-200',
        'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'purple': 'bg-purple-100 text-purple-800 border-purple-200',
        'orange': 'bg-orange-100 text-orange-800 border-orange-200'
      };
      return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    switch (type) {
      case 'medication': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'appointment': return 'bg-green-100 text-green-800 border-green-200';
      case 'checkup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vaccination': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDoseFormLabel = (form?: string) => {
    if (!form) return 'Not specified';
    const formLabels: Record<string, string> = {
      'tablet': 'Tablet',
      'capsule': 'Capsule',
      'liquid': 'Liquid',
      'injection': 'Injection',
      'cream': 'Cream',
      'inhaler': 'Inhaler',
      'drops': 'Drops',
      'patch': 'Patch'
    };
    return formLabels[form] || form;
  };

  const getAdministrationLabel = (method?: string) => {
    if (!method) return 'Not specified';
    const methodLabels: Record<string, string> = {
      'oral': 'Oral',
      'topical': 'Topical',
      'injection': 'Injection',
      'rectal': 'Rectal',
      'nasal': 'Nasal',
      'inhalation': 'Inhalation'
    };
    return methodLabels[method] || method;
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return 'medication';
    const categoryIcons: Record<string, string> = {
      'cardiovascular': 'favorite',
      'diabetes': 'monitor_heart',
      'vitamins': 'star',
      'antibiotics': 'healing',
      'pain': 'local_hospital',
      'mental_health': 'psychology',
      'respiratory': 'air',
      'gastrointestinal': 'stomach'
    };
    return categoryIcons[category] || 'medication';
  };

  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const handleCloseDetail = () => {
    setSelectedMember(null);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">{t('familyMembers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" text="Loading family members..." variant="healthcare" />
              <p className="text-gray-400 text-sm text-center mt-4">Please wait while we fetch your family health data</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-icons text-white text-xl">family_restroom</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">{t('familyMembers')}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshData}
                  className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200"
                  title="Refresh Data"
                  disabled={loading}
                >
                  <span className={`material-icons text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={regenerateDemoData}
                  className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200"
                  title="Regenerate Demo Data"
                  disabled={loading}
                >
                  <span className={`material-icons text-sm ${loading ? 'animate-spin' : ''}`}>restart_alt</span>
                </Button>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200"
                    >
                      <span className="material-icons mr-2">person_add</span>
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Family Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={newMember.name}
                            onChange={(e) => {
                              setNewMember(prev => ({ ...prev, name: e.target.value }));
                              if (formErrors.name) {
                                setFormErrors(prev => ({ ...prev, name: '' }));
                              }
                            }}
                            placeholder="Enter full name"
                            required
                            className={formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                          />
                          {formErrors.name && (
                            <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="relationship">Relationship</Label>
                          <Select 
                            value={newMember.relationship} 
                            onValueChange={(value) => {
                              setNewMember(prev => ({ ...prev, relationship: value }));
                              if (formErrors.relationship) {
                                setFormErrors(prev => ({ ...prev, relationship: '' }));
                              }
                            }}
                          >
                            <SelectTrigger className={formErrors.relationship ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {relationships.map((relation) => (
                                <SelectItem key={relation} value={relation}>
                                  {relation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.relationship && (
                            <p className="text-sm text-red-600 mt-1">{formErrors.relationship}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              min="1"
                              max="120"
                              value={newMember.age}
                              onChange={(e) => {
                                setNewMember(prev => ({ ...prev, age: e.target.value }));
                                if (formErrors.age) {
                                  setFormErrors(prev => ({ ...prev, age: '' }));
                                }
                              }}
                              placeholder="Enter age"
                              required
                              className={formErrors.age ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                            />
                            {formErrors.age && (
                              <p className="text-sm text-red-600 mt-1">{formErrors.age}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select 
                              value={newMember.gender} 
                              onValueChange={(value) => setNewMember(prev => ({ ...prev, gender: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="contactNumber">Contact Number</Label>
                          <Input
                            id="contactNumber"
                            value={newMember.contactNumber}
                            onChange={(e) => {
                              setNewMember(prev => ({ ...prev, contactNumber: e.target.value }));
                              if (formErrors.contactNumber) {
                                setFormErrors(prev => ({ ...prev, contactNumber: '' }));
                              }
                            }}
                            placeholder="Enter contact number"
                            className={formErrors.contactNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                          />
                          {formErrors.contactNumber && (
                            <p className="text-sm text-red-600 mt-1">{formErrors.contactNumber}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={newMember.address}
                            onChange={(e) => setNewMember(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input
                            id="occupation"
                            value={newMember.occupation}
                            onChange={(e) => setNewMember(prev => ({ ...prev, occupation: e.target.value }))}
                            placeholder="Enter occupation"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bloodType">Blood Type</Label>
                          <Select 
                            value={newMember.bloodType} 
                            onValueChange={(value) => setNewMember(prev => ({ ...prev, bloodType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                              {bloodTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Physical Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Physical Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              value={newMember.height}
                              onChange={(e) => {
                                setNewMember(prev => ({ ...prev, height: e.target.value }));
                                if (formErrors.height) {
                                  setFormErrors(prev => ({ ...prev, height: '' }));
                                }
                              }}
                              placeholder="Height in cm"
                              className={formErrors.height ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                            />
                            {formErrors.height && (
                              <p className="text-sm text-red-600 mt-1">{formErrors.height}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              value={newMember.weight}
                              onChange={(e) => {
                                setNewMember(prev => ({ ...prev, weight: e.target.value }));
                                if (formErrors.weight) {
                                  setFormErrors(prev => ({ ...prev, weight: '' }));
                                }
                              }}
                              placeholder="Weight in kg"
                              className={formErrors.weight ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                            />
                            {formErrors.weight && (
                              <p className="text-sm text-red-600 mt-1">{formErrors.weight}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="bmi">BMI</Label>
                            <Input
                              id="bmi"
                              type="number"
                              step="0.1"
                              value={newMember.bmi}
                              onChange={(e) => setNewMember(prev => ({ ...prev, bmi: e.target.value }))}
                              placeholder="BMI"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Healthcare Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Healthcare Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                            <Input
                              id="insuranceProvider"
                              value={newMember.insuranceProvider}
                              onChange={(e) => setNewMember(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                              placeholder="Insurance provider"
                            />
                          </div>
                          <div>
                            <Label htmlFor="insuranceNumber">Insurance Number</Label>
                            <Input
                              id="insuranceNumber"
                              value={newMember.insuranceNumber}
                              onChange={(e) => setNewMember(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                              placeholder="Insurance number"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="preferredHospital">Preferred Hospital</Label>
                            <Input
                              id="preferredHospital"
                              value={newMember.preferredHospital}
                              onChange={(e) => setNewMember(prev => ({ ...prev, preferredHospital: e.target.value }))}
                              placeholder="Preferred hospital"
                            />
                          </div>
                          <div>
                            <Label htmlFor="preferredDoctor">Preferred Doctor</Label>
                            <Input
                              id="preferredDoctor"
                              value={newMember.preferredDoctor}
                              onChange={(e) => setNewMember(prev => ({ ...prev, preferredDoctor: e.target.value }))}
                              placeholder="Preferred doctor"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                            <Input
                              id="emergencyContactName"
                              value={newMember.emergencyContactName}
                              onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                              placeholder="Emergency contact name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                            <Input
                              id="emergencyContactPhone"
                              value={newMember.emergencyContactPhone}
                              onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                              placeholder="Emergency contact phone"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="emergencyContact"
                            checked={newMember.emergencyContact}
                            onCheckedChange={(checked) => setNewMember(prev => ({ ...prev, emergencyContact: checked as boolean }))}
                          />
                          <Label htmlFor="emergencyContact">Primary Emergency Contact</Label>
                        </div>
                        
                        {newMember.emergencyContact && (
                          <>
                            <div>
                              <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                              <Input
                                id="emergencyContactName"
                                value={newMember.emergencyContactName}
                                onChange={(e) => {
                                  setNewMember(prev => ({ ...prev, emergencyContactName: e.target.value }));
                                  if (formErrors.emergencyContactName) {
                                    setFormErrors(prev => ({ ...prev, emergencyContactName: '' }));
                                  }
                                }}
                                placeholder="Emergency contact name"
                                className={formErrors.emergencyContactName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                                required
                              />
                              {formErrors.emergencyContactName && (
                                <p className="text-sm text-red-600 mt-1">{formErrors.emergencyContactName}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                              <Input
                                id="emergencyContactPhone"
                                value={newMember.emergencyContactPhone}
                                onChange={(e) => {
                                  setNewMember(prev => ({ ...prev, emergencyContactPhone: e.target.value }));
                                  if (formErrors.emergencyContactPhone) {
                                    setFormErrors(prev => ({ ...prev, emergencyContactPhone: '' }));
                                  }
                                }}
                                placeholder="Emergency contact phone"
                                className={formErrors.emergencyContactPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                                required
                              />
                              {formErrors.emergencyContactPhone && (
                                <p className="text-sm text-red-600 mt-1">{formErrors.emergencyContactPhone}</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          className="flex-1 text-white hover:bg-blue-700"
                          style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="material-icons animate-spin mr-2">hourglass_empty</span>
                              Adding...
                            </>
                          ) : (
                            'Add Member'
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowAddModal(false)}
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Tabs for Members, Reminders, and Self Reminders */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="members" className="flex items-center space-x-2">
                  <span className="material-icons text-sm">family_restroom</span>
                  <span>Family Members ({members.length})</span>
                </TabsTrigger>
                <TabsTrigger value="reminders" className="flex items-center space-x-2">
                  <span className="material-icons text-sm">notifications</span>
                  <span>Reminders ({reminders.filter(r => r.isActive).length})</span>
                </TabsTrigger>
                <TabsTrigger value="selfReminders" className="flex items-center space-x-2">
                  <span className="material-icons text-sm">medication</span>
                  <span>Self Reminders ({selfReminders.filter(r => r.isActive).length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6">
                {/* Search and Filter Section */}
                <motion.div 
                  className="mb-6 space-y-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <span className="material-icons text-sm">search</span>
                      </span>
                      <Input
                        placeholder="Search by name, relationship, allergies, conditions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                        aria-label="Search family members"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Clear search"
                        >
                          <span className="material-icons text-sm">close</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Search Results Summary */}
                    {(searchTerm || filterRelationship !== 'all') && (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="material-icons text-blue-600 text-sm">info</span>
                            <span className="text-sm text-blue-800">
                              Showing {filteredAndSortedMembers.length} of {members.length} members
                              {searchTerm && ` matching "${searchTerm}"`}
                              {filterRelationship !== 'all' && ` in ${filterRelationship} relationship`}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSearchTerm('');
                              setFilterRelationship('all');
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Select value={filterRelationship} onValueChange={setFilterRelationship}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Filter by relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Relationships</SelectItem>
                        {relationships.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="age">Age</SelectItem>
                          <SelectItem value="relationship">Relationship</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="border-gray-200 hover:border-blue-500 transition-all duration-200"
                        aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        <span className="material-icons text-sm">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions Section */}
                <motion.div 
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-900">Quick Actions</h3>
                    <span className="text-sm text-blue-600">Common tasks for your family</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddModal(true)}
                      className="h-auto p-3 flex flex-col items-center space-y-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200"
                    >
                      <span className="material-icons text-blue-600">person_add</span>
                      <span className="text-xs font-medium">Add Member</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReminderModal(true)}
                      className="h-auto p-3 flex flex-col items-center space-y-2 border-green-200 text-green-700 hover:bg-green-50 transition-all duration-200"
                    >
                      <span className="material-icons text-green-600">alarm_add</span>
                      <span className="text-xs font-medium">Add Reminder</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSelfReminderModal(true)}
                      className="h-auto p-3 flex flex-col items-center space-y-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200"
                    >
                      <span className="material-icons text-purple-600">medication</span>
                      <span className="text-xs font-medium">My Medication</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const nextMonth = new Date();
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setMembers(prev => prev.map(m => ({
                          ...m,
                          nextCheckup: nextMonth.toISOString().split('T')[0]
                        })));
                        toast({
                          title: 'Bulk Update Successful',
                          description: 'Updated next checkup dates for all family members',
                        });
                      }}
                      className="h-auto p-3 flex flex-col items-center space-y-2 border-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200"
                    >
                      <span className="material-icons text-orange-600">calendar_today</span>
                      <span className="text-xs font-medium">Schedule Checkups</span>
                    </Button>
                  </div>
                </motion.div>

                {/* Family Members Summary */}
                <motion.div 
                  className="mb-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Family Health Overview</h3>
                      <p className="text-blue-700 text-sm">
                        Managing health for {members.length} family member{members.length !== 1 ? 's' : ''}
                      </p>
                      {familyStats && (
                        <p className="text-blue-600 text-sm mt-1">
                          Average age: {familyStats.averageAge} years
                        </p>
                      )}
                    </div>
                    <motion.div 
                      className="text-center lg:text-right"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-3xl font-bold text-blue-600">{members.length}</div>
                      <div className="text-sm text-blue-600">Total Members</div>
                    </motion.div>
                  </div>
                  
                  {familyStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div 
                        className="text-center p-3 bg-white rounded-lg border border-blue-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="text-2xl font-bold text-blue-600">
                          {familyStats.emergencyContacts}
                        </div>
                        <div className="text-xs text-blue-600">Emergency Contacts</div>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center p-3 bg-white rounded-lg border border-green-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="text-2xl font-bold text-green-600">
                          {familyStats.recentCheckups}
                        </div>
                        <div className="text-xs text-green-600">Recent Checkups</div>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center p-3 bg-white rounded-lg border border-orange-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <div className="text-2xl font-bold text-orange-600">
                          {familyStats.withAllergies}
                        </div>
                        <div className="text-xs text-orange-600">With Allergies</div>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center p-3 bg-white rounded-lg border border-purple-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <div className="text-2xl font-bold text-purple-600">
                          {familyStats.onMedications}
                        </div>
                        <div className="text-xs text-purple-600">On Medications</div>
                      </motion.div>
                    </div>
                  )}
                  
                  {members.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {members.slice(0, 3).map((member, index) => (
                        <motion.span 
                          key={member.id} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                        >
                          {member.name} ({member.relationship})
                        </motion.span>
                      ))}
                      {members.length > 3 && (
                        <motion.span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.3 }}
                        >
                          +{members.length - 3} more
                        </motion.span>
                      )}
                    </div>
                  )}
                </motion.div>
                
                {/* Family Health Insights */}
                {members.length > 0 && (
                  <motion.div 
                    className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">Health Insights & Recommendations</h3>
                        <p className="text-emerald-700 text-sm">AI-powered health insights for your family</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-emerald-600">insights</span>
                        <span className="text-sm font-medium text-emerald-700">AI Analysis</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Upcoming Checkups Alert */}
                      {members.some(m => {
                        const nextCheckup = new Date(m.nextCheckup);
                        const today = new Date();
                        const diffDays = Math.ceil((nextCheckup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return diffDays <= 30 && diffDays >= 0;
                      }) && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <span className="material-icons text-amber-600 text-xl">warning</span>
                            <div>
                              <h4 className="font-semibold text-amber-800 mb-1">Upcoming Checkups</h4>
                              <p className="text-sm text-amber-700">
                                {members.filter(m => {
                                  const nextCheckup = new Date(m.nextCheckup);
                                  const today = new Date();
                                  const diffDays = Math.ceil((nextCheckup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                  return diffDays <= 30 && diffDays >= 0;
                                }).length} family member(s) have checkups within 30 days
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Allergy Awareness */}
                      {members.some(m => m.allergies && m.allergies.length > 0) && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <span className="material-icons text-red-600 text-xl">allergy</span>
                            <div>
                              <h4 className="font-semibold text-red-800 mb-1">Allergy Alert</h4>
                              <p className="text-sm text-red-700">
                                {members.filter(m => m.allergies && m.allergies.length > 0).length} family member(s) have allergies
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                Ensure emergency contacts are updated
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Medication Management */}
                      {members.some(m => m.medications && m.medications.length > 0) && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <span className="material-icons text-blue-600 text-xl">medication</span>
                            <div>
                              <h4 className="font-semibold text-blue-800 mb-1">Medication Management</h4>
                              <p className="text-sm text-blue-700">
                                {members.filter(m => m.medications && m.medications.length > 0).length} family member(s) on medications
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Consider setting up medication reminders
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Health Score */}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="material-icons text-green-600 text-xl">health_and_safety</span>
                          <div>
                            <h4 className="font-semibold text-green-800 mb-1">Family Health Score</h4>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${Math.min(100, Math.max(0, 
                                      (members.filter(m => {
                                        const lastCheckup = new Date(m.lastCheckup);
                                        const today = new Date();
                                        const diffDays = Math.ceil((today.getTime() - lastCheckup.getTime()) / (1000 * 60 * 60 * 24));
                                        return diffDays <= 365;
                                      }).length / members.length) * 100
                                    ))}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-green-700">
                                {Math.round((members.filter(m => {
                                  const lastCheckup = new Date(m.lastCheckup);
                                  const today = new Date();
                                  const diffDays = Math.ceil((today.getTime() - lastCheckup.getTime()) / (1000 * 60 * 60 * 24));
                                  return diffDays <= 365;
                                }).length / members.length) * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                              {members.filter(m => {
                                const lastCheckup = new Date(m.lastCheckup);
                                const today = new Date();
                                const diffDays = Math.ceil((today.getTime() - lastCheckup.getTime()) / (1000 * 60 * 60 * 24));
                                return diffDays <= 365;
                              }).length} of {members.length} members had checkups this year
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Emergency Preparedness */}
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="material-icons text-purple-600 text-xl">emergency</span>
                          <div>
                            <h4 className="font-semibold text-purple-800 mb-1">Emergency Preparedness</h4>
                            <p className="text-sm text-purple-700">
                              {members.filter(m => m.emergencyContact).length} emergency contact(s) configured
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              {members.filter(m => m.emergencyContact).length === members.length ? 'All set!' : 'Consider adding more'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Wellness Tips */}
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="material-icons text-indigo-600 text-xl">tips_and_updates</span>
                          <div>
                            <h4 className="font-semibold text-indigo-800 mb-1">Wellness Tips</h4>
                            <p className="text-sm text-indigo-700">
                              {members.length > 1 ? 'Schedule family wellness activities' : 'Focus on personal wellness goals'}
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                              Regular exercise and healthy eating benefit everyone
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Bulk Actions */}
                <AnimatePresence>
                  {showBulkActions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-blue-900">
                            {bulkSelected.size} member{bulkSelected.size !== 1 ? 's' : ''} selected
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBulkSelected(new Set());
                              setShowBulkActions(false);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Clear Selection
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Bulk edit functionality - mark all selected for next checkup
                              const selectedMembers = members.filter(m => bulkSelected.has(m.id));
                              const nextMonth = new Date();
                              nextMonth.setMonth(nextMonth.getMonth() + 1);
                              
                              setMembers(prev => prev.map(m => 
                                bulkSelected.has(m.id) 
                                  ? { ...m, nextCheckup: nextMonth.toISOString().split('T')[0] }
                                  : m
                              ));
                              
                              toast({
                                title: 'Bulk Update Successful',
                                description: `Updated next checkup date for ${bulkSelected.size} family members`,
                              });
                            }}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <span className="material-icons text-sm mr-2">edit_calendar</span>
                            Update Checkups
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Enhanced bulk export functionality
                              const selectedMembers = members.filter(m => bulkSelected.has(m.id));
                              const exportData = {
                                exportDate: new Date().toISOString(),
                                totalMembers: selectedMembers.length,
                                members: selectedMembers.map(m => ({
                                  name: m.name,
                                  relationship: m.relationship,
                                  age: m.age,
                                  gender: m.gender,
                                  contactNumber: m.contactNumber,
                                  bloodType: m.bloodType,
                                  allergies: m.allergies,
                                  medicalConditions: m.medicalConditions,
                                  medications: m.medications,
                                  lastCheckup: m.lastCheckup,
                                  nextCheckup: m.nextCheckup,
                                  emergencyContact: m.emergencyContact,
                                  emergencyContactName: m.emergencyContactName,
                                  emergencyContactPhone: m.emergencyContactPhone
                                }))
                              };
                              
                              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `family-members-export-${new Date().toISOString().split('T')[0]}.json`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                              
                              toast({
                                title: 'Export Successful',
                                description: `Exported ${bulkSelected.size} family members to JSON file`,
                              });
                            }}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <span className="material-icons text-sm mr-2">download</span>
                            Export JSON
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Enhanced bulk delete functionality
                              if (confirm(`Are you sure you want to remove ${bulkSelected.size} family members? This action cannot be undone.`)) {
                                const selectedIds = Array.from(bulkSelected);
                                const selectedNames = members
                                  .filter(m => bulkSelected.has(m.id))
                                  .map(m => m.name)
                                  .join(', ');
                                
                                // Remove from state
                                setMembers(prev => prev.filter(m => !bulkSelected.has(m.id)));
                                
                                // Clear selection
                                setBulkSelected(new Set());
                                setShowBulkActions(false);
                                
                                toast({
                                  title: 'Bulk Delete Successful',
                                  description: `Removed ${bulkSelected.size} family members: ${selectedNames}`,
                                });
                              }
                            }}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <span className="material-icons text-sm mr-2">delete_sweep</span>
                            Delete Selected
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Members List */}
                <div className="space-y-4">
                  {filteredAndSortedMembers.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={bulkSelected.size === filteredAndSortedMembers.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const allIds = new Set(filteredAndSortedMembers.map(m => m.id));
                              setBulkSelected(allIds);
                              setShowBulkActions(true);
                            } else {
                              setBulkSelected(new Set());
                              setShowBulkActions(false);
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Select All ({filteredAndSortedMembers.length})
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {bulkSelected.size > 0 && `${bulkSelected.size} selected`}
                      </div>
                    </div>
                  )}
                  
                  {filteredAndSortedMembers.length === 0 ? (
                    <motion.div 
                      className="text-center py-16 px-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <span className="material-icons text-blue-500 text-4xl">family_restroom</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {searchTerm || filterRelationship ? 'No matching members found' : 'No Family Members Added Yet'}
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {searchTerm || filterRelationship 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Start building your family health network by adding family members. Track their health records and medications in one place.'
                        }
                      </p>
                      {!searchTerm && !filterRelationship && (
                        <div className="space-y-3 max-w-sm mx-auto">
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="material-icons text-green-500 text-sm">check_circle</span>
                            <span>Centralized health management</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="material-icons text-green-500 text-sm">check_circle</span>
                            <span>Track medications & allergies</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="material-icons text-green-500 text-sm">check_circle</span>
                            <span>Monitor health conditions</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="material-icons text-green-500 text-sm">check_circle</span>
                            <span>Emergency contact management</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {filteredAndSortedMembers.map((member, index) => (
                        <TooltipProvider key={member.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div 
                                className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1 ${
                                  bulkSelected.has(member.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleMemberClick(member)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleMemberClick(member);
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`View ${member.name}'s health profile`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.1 + index * 0.05,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={bulkSelected.has(member.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(bulkSelected);
                                  if (checked) {
                                    newSelected.add(member.id);
                                  } else {
                                    newSelected.delete(member.id);
                                  }
                                  setBulkSelected(newSelected);
                                  setShowBulkActions(newSelected.size > 0);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <motion.div 
                                className={`w-14 h-14 rounded-full flex items-center justify-center ${getAvatarColor(member.relationship)} flex-shrink-0 shadow-md`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span className="material-icons text-xl">{getAvatarIcon(member.relationship)}</span>
                              </motion.div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="font-bold text-gray-900 text-xl">{member.name}</h3>
                                {member.emergencyContact && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                  >
                                    <Badge variant="destructive" className="text-xs animate-pulse">
                                      Emergency Contact
                                    </Badge>
                                  </motion.div>
                                )}
                                <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                                  {member.relationship}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6 mb-4">
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">Age:</span> {member.age} years
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">Gender:</span> {member.gender || 'Not specified'}
                                  </p>
                                  {member.bloodType && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-semibold text-gray-800">Blood Type:</span> 
                                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                        {member.bloodType}
                                      </span>
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {member.contactNumber && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-semibold text-gray-800">Contact:</span> {member.contactNumber}
                                    </p>
                                  )}
                                  {member.occupation && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-semibold text-gray-800">Occupation:</span> {member.occupation}
                                    </p>
                                  )}
                                  {member.address && (
                                    <p className="text-sm text-gray-600 truncate">
                                      <span className="font-semibold text-gray-800">Location:</span> {member.address}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Health Summary */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {member.allergies && member.allergies.length > 0 && (
                                  <motion.span 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <span className="material-icons text-xs mr-1">warning</span>
                                    {member.allergies.length} Allergies
                                  </motion.span>
                                )}
                                {member.medicalConditions && member.medicalConditions.length > 0 && (
                                  <motion.span 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <span className="material-icons text-xs mr-1">medical_services</span>
                                    {member.medicalConditions.length} Conditions
                                  </motion.span>
                                )}
                                {member.medications && member.medications.length > 0 && (
                                  <motion.span 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <span className="material-icons text-xs mr-1">medication</span>
                                    {member.medications.length} Medications
                                  </motion.span>
                                )}
                                {member.lastCheckup && (
                                  <motion.span 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <span className="material-icons text-xs mr-1">event</span>
                                    Last Checkup: {new Date(member.lastCheckup).toLocaleDateString()}
                                  </motion.span>
                                )}
                              </div>

                              {/* Insurance Info */}
                              {member.insuranceProvider && (
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="material-icons text-xs">security</span>
                                  <span>Insured by {member.insuranceProvider}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <motion.div 
                            className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-4"
                            initial={{ opacity: 0, x: 20 }}
                            whileHover={{ opacity: 1, x: 0 }}
                          >
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              title="View Health Profile"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMemberClick(member);
                              }}
                            >
                              <span className="material-icons text-sm">visibility</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMember(member);
                              }}
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-all duration-200"
                              title="Edit Member"
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(member.id, member.name);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              title="Remove Member"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to view {member.name}'s health profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </AnimatePresence>
              )}
            </div>
            
            <motion.div 
              className="mt-6 pt-6 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                variant="link" 
                className="w-full text-center p-0 h-auto hover:text-blue-700 transition-colors duration-200" 
                style={{ color: 'hsl(207, 90%, 54%)' }}
              >
                {t('manageFamily')} →
              </Button>
            </motion.div>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            {/* Reminders Header */}
            <motion.div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h3 className="text-xl font-bold text-blue-900">Health Reminders</h3>
                <p className="text-blue-700 text-sm">
                                          Manage reminders for medications and checkups
                </p>
              </div>
              <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <span className="material-icons mr-2">add_alarm</span>
                    Add Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={editingReminder ? handleUpdateReminder : handleAddReminder} className="space-y-4">
                    <div>
                      <Label htmlFor="familyMember">Family Member</Label>
                      <Select 
                        value={newReminder.familyMemberId} 
                        onValueChange={(value) => setNewReminder(prev => ({ ...prev, familyMemberId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select family member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.relationship})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Reminder Title</Label>
                      <Input
                        id="title"
                        value={newReminder.title}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Take morning medication"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newReminder.description}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details about the reminder"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={newReminder.type} 
                          onValueChange={(value: Reminder['type']) => setNewReminder(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medication">Medication</SelectItem>
                            <SelectItem value="appointment">Appointment</SelectItem>
                            <SelectItem value="checkup">Checkup</SelectItem>
                            <SelectItem value="vaccination">Vaccination</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select 
                          value={newReminder.frequency} 
                          onValueChange={(value: Reminder['frequency']) => setNewReminder(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="time">Time</Label>
                      <div className="space-y-3">
                        <Input
                          id="time"
                          type="time"
                          value={newReminder.time}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full"
                          required
                        />
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500 mr-2">Quick times:</span>
                          {['08:00', '12:00', '18:00', '20:00'].map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setNewReminder(prev => ({ ...prev, time }))}
                              className={`text-xs px-2 py-1 h-auto ${
                                newReminder.time === time 
                                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
                              }`}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {newReminder.frequency === 'weekly' && (
                      <div>
                        <Label>Days of Week</Label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={day}
                                checked={newReminder.days.includes(day)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewReminder(prev => ({ ...prev, days: [...prev.days, day] }));
                                  } else {
                                    setNewReminder(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
                                  }
                                }}
                              />
                              <Label htmlFor={day} className="text-xs capitalize">{day.slice(0, 3)}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={newReminder.isActive}
                        onCheckedChange={(checked) => setNewReminder(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive">Active Reminder</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1">
                        {editingReminder ? 'Update Reminder' : 'Add Reminder'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowReminderModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Reminders List */}
            <div className="space-y-4">
              {reminders.length === 0 ? (
                <motion.div 
                  className="text-center py-16 px-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <span className="material-icons text-blue-500 text-4xl">notifications_off</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Reminders Set</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start setting up health reminders for your family members to ensure they never miss important health-related tasks.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {reminders.map((reminder, index) => (
                    <motion.div 
                      key={reminder.id}
                      className={`p-6 rounded-xl border transition-all duration-300 ${
                        reminder.isActive 
                          ? 'bg-white border-blue-200 hover:border-blue-300 hover:shadow-lg' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.1 + index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getReminderColor(reminder.type)} flex-shrink-0`}>
                            <span className="material-icons text-xl">{getReminderIcon(reminder.type)}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">{reminder.title}</h3>
                              <Badge 
                                variant={reminder.isActive ? "default" : "secondary"}
                                className={`${reminder.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                              >
                                {reminder.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getFrequencyText(reminder.frequency)}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{reminder.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">For:</span> {reminder.familyMemberName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Time:</span> {reminder.time}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Next:</span> {new Date(reminder.nextReminder).toLocaleDateString()}
                                </p>
                                {reminder.days && reminder.days.length > 0 && (
                                  <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Days:</span> {getDaysText(reminder.days)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Visual Reminder Status */}
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${reminder.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-xs text-gray-500">
                                  {reminder.isActive ? 'Reminder Active' : 'Reminder Paused'}
                                </span>
                              </div>
                              
                              {reminder.type === 'medication' && (
                                <div className="flex items-center space-x-1">
                                  <span className="material-icons text-blue-500 text-sm">schedule</span>
                                  <span className="text-xs text-blue-600">Medication Schedule</span>
                                </div>
                              )}
                              
                              {reminder.type === 'appointment' && (
                                <div className="flex items-center space-x-1">
                                  <span className="material-icons text-green-500 text-sm">event</span>
                                  <span className="text-xs text-green-600">Appointment Reminder</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Switch
                            checked={reminder.isActive}
                            onCheckedChange={() => toggleReminderStatus(reminder.id)}
                            className="data-[state=checked]:bg-green-600"
                          />
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditReminder(reminder)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit Reminder"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Reminder"
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Reminders Summary */}
            {reminders.length > 0 && (
              <motion.div 
                className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {reminders.filter(r => r.isActive).length}
                    </div>
                    <div className="text-xs text-green-600">Active Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {reminders.filter(r => r.type === 'medication').length}
                    </div>
                    <div className="text-xs text-blue-600">Medication Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {reminders.filter(r => r.type === 'appointment').length}
                    </div>
                    <div className="text-xs text-purple-600">Appointment Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {reminders.filter(r => r.frequency === 'daily').length}
                    </div>
                    <div className="text-xs text-orange-600">Daily Reminders</div>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Self Reminders Tab */}
          <TabsContent value="selfReminders" className="space-y-6">
            {/* Self Reminders Header */}
            <motion.div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h3 className="text-xl font-bold text-purple-900">Personal Medication Reminders</h3>
                <p className="text-purple-700 text-sm">
                  Manage your own medication reminders with dose-specific settings
                </p>
              </div>
              <Dialog open={showSelfReminderModal} onOpenChange={setShowSelfReminderModal}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <span className="material-icons mr-2">add_alarm</span>
                    Add Self Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSelfReminder ? 'Edit Self Reminder' : 'Add New Self Reminder'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={editingSelfReminder ? handleUpdateSelfReminder : handleAddSelfReminder} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Reminder Title</Label>
                        <Input
                          id="title"
                          value={newSelfReminder.title}
                          onChange={(e) => setNewSelfReminder(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Morning Blood Pressure Medication"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicationName">Medication Name</Label>
                        <Input
                          id="medicationName"
                          value={newSelfReminder.medicationName}
                          onChange={(e) => setNewSelfReminder(prev => ({ ...prev, medicationName: e.target.value }))}
                          placeholder="e.g., Lisinopril"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newSelfReminder.description}
                        onChange={(e) => setNewSelfReminder(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details about the medication reminder"
                      />
                    </div>

                    {/* Dose Information */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={newSelfReminder.dosage}
                          onChange={(e) => setNewSelfReminder(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 10mg"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="doseStrength">Dose Strength</Label>
                        <Input
                          id="doseStrength"
                          value={newSelfReminder.doseStrength}
                          onChange={(e) => setNewSelfReminder(prev => ({ ...prev, doseStrength: e.target.value }))}
                          placeholder="e.g., 10mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doseForm">Dose Form</Label>
                        <Select 
                          value={newSelfReminder.doseForm} 
                          onValueChange={(value) => setNewSelfReminder(prev => ({ ...prev, doseForm: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select form" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="capsule">Capsule</SelectItem>
                            <SelectItem value="liquid">Liquid</SelectItem>
                            <SelectItem value="injection">Injection</SelectItem>
                            <SelectItem value="cream">Cream</SelectItem>
                            <SelectItem value="inhaler">Inhaler</SelectItem>
                            <SelectItem value="drops">Drops</SelectItem>
                            <SelectItem value="patch">Patch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="administrationMethod">Administration Method</Label>
                        <Select 
                          value={newSelfReminder.administrationMethod} 
                          onValueChange={(value) => setNewSelfReminder(prev => ({ ...prev, administrationMethod: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oral">Oral</SelectItem>
                            <SelectItem value="topical">Topical</SelectItem>
                            <SelectItem value="injection">Injection</SelectItem>
                            <SelectItem value="rectal">Rectal</SelectItem>
                            <SelectItem value="nasal">Nasal</SelectItem>
                            <SelectItem value="inhalation">Inhalation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={newSelfReminder.category} 
                          onValueChange={(value) => setNewSelfReminder(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                            <SelectItem value="diabetes">Diabetes</SelectItem>
                            <SelectItem value="vitamins">Vitamins</SelectItem>
                            <SelectItem value="antibiotics">Antibiotics</SelectItem>
                            <SelectItem value="pain">Pain Management</SelectItem>
                            <SelectItem value="mental_health">Mental Health</SelectItem>
                            <SelectItem value="respiratory">Respiratory</SelectItem>
                            <SelectItem value="gastrointestinal">Gastrointestinal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={newSelfReminder.type} 
                          onValueChange={(value: SelfReminder['type']) => setNewSelfReminder(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medication">Medication</SelectItem>
                            <SelectItem value="appointment">Appointment</SelectItem>
                            <SelectItem value="checkup">Checkup</SelectItem>
                            <SelectItem value="vaccination">Vaccination</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select 
                          value={newSelfReminder.frequency} 
                          onValueChange={(value: SelfReminder['frequency']) => setNewSelfReminder(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <Label>Time Slots</Label>
                      <div className="space-y-3">
                        {newSelfReminder.times.map((time, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={time}
                              onChange={(e) => updateTimeSlot(index, e.target.value)}
                              className="flex-1"
                            />
                            {newSelfReminder.times.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeTimeSlot(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <span className="material-icons text-sm">remove</span>
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {/* Quick Time Presets */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500 mr-2">Quick times:</span>
                          {['08:00', '12:00', '18:00', '20:00', '22:00'].map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!newSelfReminder.times.includes(time)) {
                                  addTimeSlot();
                                  setTimeout(() => {
                                    updateTimeSlot(newSelfReminder.times.length, time);
                                  }, 0);
                                }
                              }}
                              className={`text-xs px-2 py-1 h-auto ${
                                newSelfReminder.times.includes(time)
                                  ? 'bg-green-100 border-green-300 text-green-700' 
                                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
                              }`}
                              disabled={newSelfReminder.times.includes(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTimeSlot}
                          className="w-full"
                        >
                          <span className="material-icons text-sm mr-2">add</span>
                          Add Time Slot
                        </Button>
                      </div>
                    </div>

                    {/* Days Selection */}
                    {newSelfReminder.frequency === 'weekly' && (
                      <div>
                        <Label>Days of Week</Label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`self-${day}`}
                                checked={newSelfReminder.days.includes(day)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewSelfReminder(prev => ({ ...prev, days: [...prev.days, day] }));
                                  } else {
                                    setNewSelfReminder(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
                                  }
                                }}
                              />
                              <Label htmlFor={`self-${day}`} className="text-xs capitalize">{day.slice(0, 3)}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={newSelfReminder.instructions}
                          onChange={(e) => setNewSelfReminder(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="e.g., Take with food, avoid grapefruit"
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialInstructions">Special Instructions</Label>
                        <Textarea
                          id="specialInstructions"
                          value={newSelfReminder.specialInstructions}
                          onChange={(e) => setNewSelfReminder(prev => ({ ...prev, specialInstructions: e.target.value }))}
                          placeholder="e.g., Monitor blood pressure after taking"
                        />
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <Label>Reminder Color</Label>
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {['red', 'blue', 'green', 'yellow', 'purple', 'orange'].map((color) => (
                          <div key={color} className="flex items-center space-x-2">
                            <Checkbox
                              id={`color-${color}`}
                              checked={newSelfReminder.color === color}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewSelfReminder(prev => ({ ...prev, color }));
                                }
                              }}
                            />
                            <div className={`w-4 h-4 rounded-full bg-${color}-500`}></div>
                            <Label htmlFor={`color-${color}`} className="text-xs capitalize">{color}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="selfIsActive"
                        checked={newSelfReminder.isActive}
                        onCheckedChange={(checked) => setNewSelfReminder(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="selfIsActive">Active Reminder</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1">
                        {editingSelfReminder ? 'Update Self Reminder' : 'Add Self Reminder'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowSelfReminderModal(false);
                          setEditingSelfReminder(null);
                          resetSelfReminderForm();
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Self Reminders List */}
            <div className="space-y-4">
              {selfReminders.length === 0 ? (
                <motion.div 
                  className="text-center py-16 px-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <span className="material-icons text-purple-500 text-4xl">medication</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Self Reminders Set</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start setting up your personal medication reminders to ensure you never miss a dose.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {selfReminders.map((reminder, index) => (
                    <motion.div 
                      key={reminder.id}
                      className={`p-6 rounded-xl border transition-all duration-300 ${
                        reminder.isActive 
                          ? 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-lg' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.1 + index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getSelfReminderColor(reminder.type, reminder.color)} flex-shrink-0`}>
                            <span className="material-icons text-xl">{getSelfReminderIcon(reminder.type)}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">{reminder.title}</h3>
                              <Badge 
                                variant={reminder.isActive ? "default" : "secondary"}
                                className={`${reminder.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                              >
                                {reminder.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getFrequencyText(reminder.frequency)}
                              </Badge>
                              {reminder.category && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  <span className="material-icons text-xs mr-1">{getCategoryIcon(reminder.category)}</span>
                                  {reminder.category.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">{reminder.description}</p>
                            
                            {/* Medication Details */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Medication:</span> {reminder.medicationName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Dosage:</span> {reminder.dosage}
                                </p>
                                {reminder.doseStrength && (
                                  <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Strength:</span> {reminder.doseStrength}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Form:</span> {getDoseFormLabel(reminder.doseForm)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Method:</span> {getAdministrationLabel(reminder.administrationMethod)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Times:</span> {reminder.times.join(', ')}
                                </p>
                              </div>
                            </div>

                            {/* Instructions */}
                            {(reminder.instructions || reminder.specialInstructions) && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                {reminder.instructions && (
                                  <p className="text-sm text-blue-800 mb-1">
                                    <span className="font-semibold">Instructions:</span> {reminder.instructions}
                                  </p>
                                )}
                                {reminder.specialInstructions && (
                                  <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Special:</span> {reminder.specialInstructions}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Visual Reminder Status */}
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${reminder.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-xs text-gray-500">
                                  {reminder.isActive ? 'Reminder Active' : 'Reminder Paused'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <span className="material-icons text-purple-500 text-sm">schedule</span>
                                <span className="text-xs text-purple-600">Personal Medication</span>
                              </div>
                              
                              {reminder.days && reminder.days.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <span className="material-icons text-blue-500 text-sm">calendar_today</span>
                                  <span className="text-xs text-blue-600">{getDaysText(reminder.days)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Switch
                            checked={reminder.isActive}
                            onCheckedChange={() => toggleSelfReminderStatus(reminder.id)}
                            className="data-[state=checked]:bg-purple-600"
                          />
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditSelfReminder(reminder)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Edit Self Reminder"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSelfReminder(reminder.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Self Reminder"
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Self Reminders Summary */}
            {selfReminders.length > 0 && (
              <motion.div 
                className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {selfReminders.filter(r => r.isActive).length}
                    </div>
                    <div className="text-xs text-purple-600">Active Self Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {selfReminders.filter(r => r.type === 'medication').length}
                    </div>
                    <div className="text-xs text-blue-600">Medication Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {selfReminders.filter(r => r.frequency === 'daily').length}
                    </div>
                    <div className="text-xs text-green-600">Daily Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {selfReminders.filter(r => r.times.length > 1).length}
                    </div>
                    <div className="text-xs text-orange-600">Multiple Times</div>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          

        </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Family Member Detail Popup */}
      <AnimatePresence>
        {selectedMember && (
          <FamilyMemberDetail
            memberId={selectedMember.id}
            isOpen={!!selectedMember}
            onClose={handleCloseDetail}
          />
        )}
      </AnimatePresence>

      {/* Edit Family Member Modal */}
      <AnimatePresence>
        {editingMember && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Family Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateMember} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select 
                      value={newMember.relationship} 
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={newMember.age}
                        onChange={(e) => setNewMember(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Enter age"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={newMember.gender} 
                        onValueChange={(value) => setNewMember(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={newMember.contactNumber}
                      onChange={(e) => setNewMember(prev => ({ ...prev, contactNumber: e.target.value }))}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newMember.address}
                      onChange={(e) => setNewMember(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={newMember.occupation}
                      onChange={(e) => setNewMember(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="Enter occupation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select 
                      value={newMember.bloodType} 
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, bloodType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Physical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Physical Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newMember.height}
                        onChange={(e) => setNewMember(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="Height in cm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newMember.weight}
                        onChange={(e) => setNewMember(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="Weight in kg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bmi">BMI</Label>
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        value={newMember.bmi}
                        onChange={(e) => setNewMember(prev => ({ ...prev, bmi: e.target.value }))}
                        placeholder="BMI"
                      />
                    </div>
                  </div>
                </div>

                {/* Healthcare Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Healthcare Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Input
                        id="insuranceProvider"
                        value={newMember.insuranceProvider}
                        onChange={(e) => setNewMember(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                        placeholder="Insurance provider"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insuranceNumber">Insurance Number</Label>
                      <Input
                        id="insuranceNumber"
                        value={newMember.insuranceNumber}
                        onChange={(e) => setNewMember(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                        placeholder="Insurance number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredHospital">Preferred Hospital</Label>
                      <Input
                        id="preferredHospital"
                        value={newMember.preferredHospital}
                        onChange={(e) => setNewMember(prev => ({ ...prev, preferredHospital: e.target.value }))}
                        placeholder="Preferred hospital"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredDoctor">Preferred Doctor</Label>
                      <Input
                        id="preferredDoctor"
                        value={newMember.preferredDoctor}
                        onChange={(e) => setNewMember(prev => ({ ...prev, preferredDoctor: e.target.value }))}
                        placeholder="Preferred doctor"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={newMember.emergencyContactName}
                        onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={newMember.emergencyContactPhone}
                        onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emergencyContact"
                      checked={newMember.emergencyContact}
                      onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContact: e.target.checked }))}
                    />
                    <Label htmlFor="emergencyContact">Primary Emergency Contact</Label>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1 text-white hover:bg-blue-700"
                    style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                  >
                    Update Member
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
        )}
      </AnimatePresence>
    </>
  );
};

export default FamilyMembers;

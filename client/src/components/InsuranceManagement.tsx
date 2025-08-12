import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Shield, 
  FileText, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Calendar,
  User,
  Users,
  Building,
  Phone,
  Mail,
  Globe,
  Download,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';

interface InsurancePolicy {
  id: string;
  userId: string;
  familyMemberId?: string;
  providerName: string;
  policyNumber: string;
  policyType: 'health' | 'life' | 'dental' | 'vision' | 'disability' | 'other';
  coverageAmount: number;
  coveragePeriod: {
    startDate: string;
    endDate: string;
  };
  coPayments: {
    doctorVisit: number;
    specialist: number;
    emergency: number;
    prescription: number;
  };
  deductibles: {
    individual: number;
    family: number;
  };
  status: 'active' | 'expired' | 'pending_renewal' | 'cancelled';
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annually';
  contactInfo: {
    providerPhone: string;
    providerEmail: string;
    providerWebsite: string;
    claimsPhone: string;
  };
  documents: InsuranceDocument[];
  claims: InsuranceClaim[];
  createdAt: string;
  updatedAt: string;
}

interface InsuranceDocument {
  id: string;
  name: string;
  type: 'policy' | 'card' | 'claim' | 'receipt' | 'other';
  fileUrl: string;
  uploadedAt: string;
  extractedData?: any;
}

interface InsuranceClaim {
  id: string;
  policyId: string;
  claimNumber: string;
  claimType: 'medical' | 'dental' | 'vision' | 'prescription' | 'other';
  claimDate: string;
  amountRequested: number;
  amountApproved?: number;
  status: 'pending' | 'approved' | 'denied' | 'in_review';
  description: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
}

export const InsuranceManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('self');
  const [selectedDocument, setSelectedDocument] = useState<InsuranceDocument | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [newPolicy, setNewPolicy] = useState({
    providerName: '',
    policyNumber: '',
    policyType: 'health' as 'health' | 'life' | 'dental' | 'vision' | 'disability' | 'other',
    coverageAmount: 0,
    startDate: '',
    endDate: '',
    doctorVisit: 0,
    specialist: 0,
    emergency: 0,
    prescription: 0,
    individualDeductible: 0,
    familyDeductible: 0,
    premium: 0,
    premiumFrequency: 'monthly' as 'monthly' | 'quarterly' | 'annually',
    providerPhone: '',
    providerEmail: '',
    providerWebsite: '',
    claimsPhone: ''
  });

  const [newClaim, setNewClaim] = useState({
    policyId: '',
    claimType: 'medical' as const,
    claimDate: '',
    amountRequested: 0,
    description: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Always load demo data by default
        const demoPolicies = generateDemoPolicies();
        localStorage.setItem('mock_insurance_policies', JSON.stringify(demoPolicies));
        setPolicies(demoPolicies);
        
        // Load family members
        const storedMembers = localStorage.getItem('mock_family_members');
        if (storedMembers) {
          try {
            const members = JSON.parse(storedMembers);
            setFamilyMembers(members);
          } catch (e) {
            console.warn('Error parsing family members');
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadInsuranceData = async () => {
    try {
      setLoading(true);
      
      // Load policies from localStorage
      const storedPolicies = localStorage.getItem('mock_insurance_policies');
      let policyData: InsurancePolicy[] = [];
      
      if (storedPolicies) {
        try {
          policyData = JSON.parse(storedPolicies);
        } catch (e) {
          console.warn('Error parsing stored policies, using demo data');
        }
      }
      
      // If no stored data, create demo data
      if (!policyData || policyData.length === 0) {
        policyData = generateDemoPolicies();
        localStorage.setItem('mock_insurance_policies', JSON.stringify(policyData));
      }
      
      setPolicies(policyData);
      
      // Load family members
      const storedMembers = localStorage.getItem('mock_family_members');
      if (storedMembers) {
        try {
          const members = JSON.parse(storedMembers);
          setFamilyMembers(members);
        } catch (e) {
          console.warn('Error parsing family members');
        }
      }
      
    } catch (error) {
      console.error('Error loading insurance data:', error);
      toast({
        title: "Error",
        description: "Failed to load insurance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

    const generateDemoPolicies = (): InsurancePolicy[] => {
    const userId = currentUser?.uid || 'demo-patient-1';
    const now = new Date();
    
    return [
      {
        id: 'policy1',
        userId,
        providerName: 'Star Health Insurance',
        policyNumber: 'STAR-2024-001',
        policyType: 'health',
        coverageAmount: 500000,
        coveragePeriod: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        coPayments: {
          doctorVisit: 500,
          specialist: 1000,
          emergency: 2000,
          prescription: 200
        },
        deductibles: {
          individual: 10000,
          family: 20000
        },
        status: 'active',
        premium: 1200,
        premiumFrequency: 'monthly',
        contactInfo: {
          providerPhone: '1800-425-2255',
          providerEmail: 'support@starhealth.in',
          providerWebsite: 'www.starhealth.in',
          claimsPhone: '1800-425-2256'
        },
        documents: [
          {
            id: 'doc1',
            name: 'Star Health Policy Document.pdf',
            type: 'policy',
            fileUrl: '/demo-insurance/star-health-policy.pdf',
            uploadedAt: now.toISOString(),
            extractedData: null
          }
        ],
        claims: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'policy2',
        userId,
        familyMemberId: 'family1',
        providerName: 'HDFC ERGO Dental',
        policyNumber: 'HDFC-DENTAL-2024',
        policyType: 'dental',
        coverageAmount: 50000,
        coveragePeriod: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        coPayments: {
          doctorVisit: 0,
          specialist: 0,
          emergency: 1000,
          prescription: 0
        },
        deductibles: {
          individual: 2000,
          family: 4000
        },
        status: 'active',
        premium: 800,
        premiumFrequency: 'monthly',
        contactInfo: {
          providerPhone: '1800-266-7780',
          providerEmail: 'dental@hdfcergo.com',
          providerWebsite: 'www.hdfcergo.com',
          claimsPhone: '1800-266-7781'
        },
        documents: [
          {
            id: 'doc2',
            name: 'HDFC Dental Policy.pdf',
            type: 'policy',
            fileUrl: '/demo-insurance/hdfc-dental-policy.pdf',
            uploadedAt: now.toISOString(),
            extractedData: null
          }
        ],
        claims: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'policy3',
        userId,
        providerName: 'ICICI Lombard Vision',
        policyNumber: 'ICICI-VISION-2024',
        policyType: 'vision',
        coverageAmount: 25000,
        coveragePeriod: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        coPayments: {
          doctorVisit: 200,
          specialist: 500,
          emergency: 1000,
          prescription: 100
        },
        deductibles: {
          individual: 1000,
          family: 2000
        },
        status: 'active',
        premium: 450,
        premiumFrequency: 'monthly',
        contactInfo: {
          providerPhone: '1800-266-7780',
          providerEmail: 'vision@icicilombard.com',
          providerWebsite: 'www.icicilombard.com',
          claimsPhone: '1800-266-7781'
        },
        documents: [
          {
            id: 'doc3',
            name: 'ICICI Vision Policy.pdf',
            type: 'policy',
            fileUrl: '/demo-insurance/icici-vision-policy.pdf',
            uploadedAt: now.toISOString(),
            extractedData: null
          }
        ],
        claims: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'policy4',
        userId,
        familyMemberId: 'family2',
        providerName: 'Bajaj Allianz Life',
        policyNumber: 'BAJAJ-LIFE-2024',
        policyType: 'life',
        coverageAmount: 2000000,
        coveragePeriod: {
          startDate: '2024-01-01',
          endDate: '2034-01-01'
        },
        coPayments: {
          doctorVisit: 0,
          specialist: 0,
          emergency: 0,
          prescription: 0
        },
        deductibles: {
          individual: 0,
          family: 0
        },
        status: 'active',
        premium: 2500,
        premiumFrequency: 'monthly',
        contactInfo: {
          providerPhone: '1800-209-5858',
          providerEmail: 'life@bajajallianz.co.in',
          providerWebsite: 'www.bajajallianz.co.in',
          claimsPhone: '1800-209-5859'
        },
        documents: [
          {
            id: 'doc4',
            name: 'Bajaj Life Policy.pdf',
            type: 'policy',
            fileUrl: '/demo-insurance/bajaj-life-policy.pdf',
            uploadedAt: now.toISOString(),
            extractedData: null
          }
        ],
        claims: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'policy5',
        userId,
        providerName: 'Max Bupa Health',
        policyNumber: 'MAX-BUPA-2024',
        policyType: 'health',
        coverageAmount: 750000,
        coveragePeriod: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        coPayments: {
          doctorVisit: 300,
          specialist: 800,
          emergency: 1500,
          prescription: 150
        },
        deductibles: {
          individual: 8000,
          family: 15000
        },
        status: 'pending_renewal',
        premium: 1800,
        premiumFrequency: 'monthly',
        contactInfo: {
          providerPhone: '1800-102-4477',
          providerEmail: 'support@maxbupa.com',
          providerWebsite: 'www.maxbupa.com',
          claimsPhone: '1800-102-4478'
        },
        documents: [
          {
            id: 'doc5',
            name: 'Max Bupa Health Policy.pdf',
            type: 'policy',
            fileUrl: '/demo-insurance/max-bupa-policy.pdf',
            uploadedAt: now.toISOString(),
            extractedData: null
          }
        ],
        claims: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'policy6',
        userId,
        familyMemberId: 'family3',
        providerName: 'Reliance General Disability',
        policyNumber: 'RELIANCE-DISABILITY-2024',
        policyType: 'disability',
        coverageAmount: 1000000,
        coveragePeriod: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        coPayments: {
          doctorVisit: 0,
          specialist: 0,
          emergency: 0,
          prescription: 0
        },
        deductibles: {
          individual: 5000,
          family: 10000
        },
        status: 'active',
        premium: 950,
        premiumFrequency: 'monthly',
        contactInfo: {
          providerPhone: '1800-300-9000',
          providerEmail: 'disability@reliancegeneral.co.in',
          providerWebsite: 'www.reliancegeneral.co.in',
          claimsPhone: '1800-300-9001'
        },
        documents: [
          {
            id: 'doc6',
            name: 'Reliance Disability Policy.pdf',
            type: 'policy',
            fileUrl: '/demo-insurance/reliance-disability-policy.pdf',
            uploadedAt: now.toISOString(),
            extractedData: null
          }
        ],
        claims: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  };

  const savePoliciesToStorage = (updatedPolicies: InsurancePolicy[]) => {
    try {
      localStorage.setItem('mock_insurance_policies', JSON.stringify(updatedPolicies));
      return true;
    } catch (error) {
      console.error('Error saving policies to storage:', error);
      toast({
        title: "Warning",
        description: "Data saved locally but may not persist between sessions",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleAddPolicy = async () => {
    // Enhanced validation
    if (!newPolicy.providerName.trim()) {
      toast({
        title: "Error",
        description: "Provider name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPolicy.policyNumber.trim()) {
      toast({
        title: "Error",
        description: "Policy number is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPolicy.startDate) {
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPolicy.endDate) {
      toast({
        title: "Error",
        description: "End date is required",
        variant: "destructive",
      });
      return;
    }
    
    if (new Date(newPolicy.startDate) >= new Date(newPolicy.endDate)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    if (newPolicy.coverageAmount <= 0) {
      toast({
        title: "Error",
        description: "Coverage amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (newPolicy.premium < 0) {
      toast({
        title: "Error",
        description: "Premium cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      const policyData: InsurancePolicy = {
        id: `policy_${Date.now()}`,
        userId: currentUser?.uid || 'demo-patient-1',
        familyMemberId: selectedMemberId === 'self' ? undefined : selectedMemberId,
        providerName: newPolicy.providerName,
        policyNumber: newPolicy.policyNumber,
        policyType: newPolicy.policyType,
        coverageAmount: newPolicy.coverageAmount,
        coveragePeriod: {
          startDate: newPolicy.startDate,
          endDate: newPolicy.endDate
        },
        coPayments: {
          doctorVisit: newPolicy.doctorVisit,
          specialist: newPolicy.specialist,
          emergency: newPolicy.emergency,
          prescription: newPolicy.prescription
        },
        deductibles: {
          individual: newPolicy.individualDeductible,
          family: newPolicy.familyDeductible
        },
        status: 'active',
        premium: newPolicy.premium,
        premiumFrequency: newPolicy.premiumFrequency,
        contactInfo: {
          providerPhone: newPolicy.providerPhone,
          providerEmail: newPolicy.providerEmail,
          providerWebsite: newPolicy.providerWebsite,
          claimsPhone: newPolicy.claimsPhone
        },
        documents: [],
        claims: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedPolicies = [...policies, policyData];
      setPolicies(updatedPolicies);
      savePoliciesToStorage(updatedPolicies);
      
      // Reset form
      setNewPolicy({
        providerName: '',
        policyNumber: '',
        policyType: 'health',
        coverageAmount: 0,
        startDate: '',
        endDate: '',
        doctorVisit: 0,
        specialist: 0,
        emergency: 0,
        prescription: 0,
        individualDeductible: 0,
        familyDeductible: 0,
        premium: 0,
        premiumFrequency: 'monthly',
        providerPhone: '',
        providerEmail: '',
        providerWebsite: '',
        claimsPhone: ''
      });
      
      setShowAddForm(false);
      
      toast({
        title: "Success",
        description: "Insurance policy added successfully",
      });
    } catch (error) {
      console.error('Error adding policy:', error);
      toast({
        title: "Error",
        description: "Failed to add policy",
        variant: "destructive",
      });
    }
  };

  const handleDeletePolicy = (policyId: string) => {
    if (window.confirm(t('confirmDeleteInsurancePolicy'))) {
      try {
        const updatedPolicies = policies.filter(p => p.id !== policyId);
        setPolicies(updatedPolicies);
        savePoliciesToStorage(updatedPolicies);
        
        // Close any open modals if the deleted policy was selected
        if (selectedPolicy?.id === policyId) {
          setSelectedPolicy(null);
        }
        if (editingPolicy?.id === policyId) {
          setEditingPolicy(null);
          setIsEditing(false);
        }
        
        toast({
          title: t('success'),
          description: t('policyDeletedSuccessfully'),
        });
      } catch (error) {
        console.error('Error deleting policy:', error);
        toast({
          title: t('error'),
          description: t('failedToDeletePolicy'),
          variant: "destructive",
        });
      }
    }
  };

  const handleEditPolicy = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setNewPolicy({
      providerName: policy.providerName,
      policyNumber: policy.policyNumber,
      policyType: policy.policyType,
      coverageAmount: policy.coverageAmount,
      startDate: policy.coveragePeriod.startDate,
      endDate: policy.coveragePeriod.endDate,
      doctorVisit: policy.coPayments.doctorVisit,
      specialist: policy.coPayments.specialist,
      emergency: policy.coPayments.emergency,
      prescription: policy.coPayments.prescription,
      individualDeductible: policy.deductibles.individual,
      familyDeductible: policy.deductibles.family,
      premium: policy.premium,
      premiumFrequency: policy.premiumFrequency,
      providerPhone: policy.contactInfo.providerPhone,
      providerEmail: policy.contactInfo.providerEmail,
      providerWebsite: policy.contactInfo.providerWebsite,
      claimsPhone: policy.contactInfo.claimsPhone
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleUpdatePolicy = async () => {
    if (!editingPolicy) {
      toast({
        title: "Error",
        description: "No policy selected for editing",
        variant: "destructive",
      });
      return;
    }
    
    // Enhanced validation (same as add policy)
    if (!newPolicy.providerName.trim()) {
      toast({
        title: "Error",
        description: "Provider name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPolicy.policyNumber.trim()) {
      toast({
        title: "Error",
        description: "Policy number is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPolicy.startDate) {
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPolicy.endDate) {
      toast({
        title: "Error",
        description: "End date is required",
        variant: "destructive",
      });
      return;
    }
    
    if (new Date(newPolicy.startDate) >= new Date(newPolicy.endDate)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    if (newPolicy.coverageAmount <= 0) {
      toast({
        title: "Error",
        description: "Coverage amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (newPolicy.premium < 0) {
      toast({
        title: "Error",
        description: "Premium cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedPolicy: InsurancePolicy = {
        ...editingPolicy,
        providerName: newPolicy.providerName,
        policyNumber: newPolicy.policyNumber,
        policyType: newPolicy.policyType,
        coverageAmount: newPolicy.coverageAmount,
        coveragePeriod: {
          startDate: newPolicy.startDate,
          endDate: newPolicy.endDate
        },
        coPayments: {
          doctorVisit: newPolicy.doctorVisit,
          specialist: newPolicy.specialist,
          emergency: newPolicy.emergency,
          prescription: newPolicy.prescription
        },
        deductibles: {
          individual: newPolicy.individualDeductible,
          family: newPolicy.familyDeductible
        },
        premium: newPolicy.premium,
        premiumFrequency: newPolicy.premiumFrequency,
        contactInfo: {
          providerPhone: newPolicy.providerPhone,
          providerEmail: newPolicy.providerEmail,
          providerWebsite: newPolicy.providerWebsite,
          claimsPhone: newPolicy.claimsPhone
        },
        updatedAt: new Date().toISOString()
      };

      const updatedPolicies = policies.map(p => 
        p.id === editingPolicy.id ? updatedPolicy : p
      );
      setPolicies(updatedPolicies);
      
      if (savePoliciesToStorage(updatedPolicies)) {
        toast({
          title: "Success",
          description: "Insurance policy updated successfully",
        });
      }
      
      // Reset form and close modal
      setNewPolicy({
        providerName: '',
        policyNumber: '',
        policyType: 'health',
        coverageAmount: 0,
        startDate: '',
        endDate: '',
        doctorVisit: 0,
        specialist: 0,
        emergency: 0,
        prescription: 0,
        individualDeductible: 0,
        familyDeductible: 0,
        premium: 0,
        premiumFrequency: 'monthly',
        providerPhone: '',
        providerEmail: '',
        providerWebsite: '',
        claimsPhone: ''
      });
      
      setShowAddForm(false);
      setIsEditing(false);
      setEditingPolicy(null);
      
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = (policyId: string, newStatus: 'active' | 'expired' | 'pending_renewal' | 'cancelled') => {
    try {
      const updatedPolicies = policies.map(p => 
        p.id === policyId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p
      );
      setPolicies(updatedPolicies);
      
      if (savePoliciesToStorage(updatedPolicies)) {
        toast({
          title: "Success",
          description: `Policy status updated to ${newStatus.replace('_', ' ')}`,
        });
      }
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        title: "Error",
        description: "Failed to update policy status",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = (newStatus: 'active' | 'expired' | 'pending_renewal' | 'cancelled') => {
    if (selectedPolicies.length === 0) {
      toast({
        title: "Warning",
        description: "Please select policies to update",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedPolicies = policies.map(p => 
        selectedPolicies.includes(p.id) ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p
      );
      setPolicies(updatedPolicies);
      
      if (savePoliciesToStorage(updatedPolicies)) {
        toast({
          title: "Success",
          description: `Updated ${selectedPolicies.length} policy status to ${newStatus.replace('_', ' ')}`,
        });
        setSelectedPolicies([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      console.error('Error updating bulk policy status:', error);
      toast({
        title: "Error",
        description: "Failed to update policy statuses",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedPolicies.length === 0) {
      toast({
        title: "Warning",
        description: "Please select policies to delete",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedPolicies.length} insurance policies? This action cannot be undone.`)) {
      try {
        const updatedPolicies = policies.filter(p => !selectedPolicies.includes(p.id));
        setPolicies(updatedPolicies);
        
        if (savePoliciesToStorage(updatedPolicies)) {
          toast({
            title: "Success",
            description: `Deleted ${selectedPolicies.length} policies successfully`,
          });
          setSelectedPolicies([]);
          setShowBulkActions(false);
        }
      } catch (error) {
        console.error('Error deleting bulk policies:', error);
        toast({
          title: "Error",
          description: "Failed to delete policies",
          variant: "destructive",
        });
      }
    }
  };

  const togglePolicySelection = (policyId: string) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const selectAllPolicies = () => {
    const filteredPolicyIds = getFilteredPolicies().map(p => p.id);
    setSelectedPolicies(filteredPolicyIds);
  };

  const clearSelection = () => {
    setSelectedPolicies([]);
    setShowBulkActions(false);
  };

  const exportPolicies = () => {
    try {
      const dataToExport = getFilteredPolicies().map(policy => ({
        Provider: policy.providerName,
        'Policy Number': policy.policyNumber,
        Type: policy.policyType,
        Status: policy.status,
        'Coverage Amount': `₹${policy.coverageAmount.toLocaleString()}`,
        Premium: `₹${policy.premium}/${policy.premiumFrequency}`,
        'Start Date': format(parseISO(policy.coveragePeriod.startDate), 'MMM dd, yyyy'),
        'End Date': format(parseISO(policy.coveragePeriod.endDate), 'MMM dd, yyyy'),
        'Doctor Visit Co-pay': `₹${policy.coPayments.doctorVisit}`,
        'Specialist Co-pay': `₹${policy.coPayments.specialist}`,
        'Emergency Co-pay': `₹${policy.coPayments.emergency}`,
        'Prescription Co-pay': `₹${policy.coPayments.prescription}`,
        'Individual Deductible': `₹${policy.deductibles.individual}`,
        'Family Deductible': `₹${policy.deductibles.family}`,
        'Provider Phone': policy.contactInfo.providerPhone,
        'Provider Email': policy.contactInfo.providerEmail,
        'Provider Website': policy.contactInfo.providerWebsite,
        'Claims Phone': policy.contactInfo.claimsPhone,
        'Created At': format(parseISO(policy.createdAt), 'MMM dd, yyyy'),
        'Updated At': format(parseISO(policy.updatedAt), 'MMM dd, yyyy')
      }));

      const csvContent = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `insurance_policies_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} policies to CSV`,
      });
    } catch (error) {
      console.error('Error exporting policies:', error);
      toast({
        title: "Error",
        description: "Failed to export policies",
        variant: "destructive",
      });
    }
  };

  const importPolicies = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = lines.slice(1).filter(line => line.trim());

        const importedPolicies: InsurancePolicy[] = [];
        const userId = currentUser?.uid || 'demo-patient-1';
        const now = new Date().toISOString();

        data.forEach((line, index) => {
          try {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            const row: any = {};
            headers.forEach((header, i) => {
              row[header] = values[i] || '';
            });

            // Parse and validate the imported data
            const coverageAmount = parseInt(row['Coverage Amount']?.replace(/[^\d]/g, '') || '0');
            const premium = parseInt(row['Premium']?.split('/')[0]?.replace(/[^\d]/g, '') || '0');
            const premiumFrequency = row['Premium']?.split('/')[1] || 'monthly';
            
            const policy: InsurancePolicy = {
              id: `imported_${Date.now()}_${index}`,
              userId,
              providerName: row['Provider'] || 'Imported Provider',
              policyNumber: row['Policy Number'] || `IMPORT-${Date.now()}-${index}`,
              policyType: (row['Type'] || 'health') as any,
              coverageAmount: coverageAmount || 100000,
              coveragePeriod: {
                startDate: row['Start Date'] ? new Date(row['Start Date']).toISOString() : new Date().toISOString(),
                endDate: row['End Date'] ? new Date(row['End Date']).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              },
              coPayments: {
                doctorVisit: parseInt(row['Doctor Visit Co-pay']?.replace(/[^\d]/g, '') || '0'),
                specialist: parseInt(row['Specialist Co-pay']?.replace(/[^\d]/g, '') || '0'),
                emergency: parseInt(row['Emergency Co-pay']?.replace(/[^\d]/g, '') || '0'),
                prescription: parseInt(row['Prescription Co-pay']?.replace(/[^\d]/g, '') || '0')
              },
              deductibles: {
                individual: parseInt(row['Individual Deductible']?.replace(/[^\d]/g, '') || '0'),
                family: parseInt(row['Family Deductible']?.replace(/[^\d]/g, '') || '0')
              },
              status: (row['Status'] || 'active') as any,
              premium: premium || 1000,
              premiumFrequency: (premiumFrequency || 'monthly') as any,
              contactInfo: {
                providerPhone: row['Provider Phone'] || '',
                providerEmail: row['Provider Email'] || '',
                providerWebsite: row['Provider Website'] || '',
                claimsPhone: row['Claims Phone'] || ''
              },
              documents: [],
              claims: [],
              createdAt: now,
              updatedAt: now
            };

            importedPolicies.push(policy);
          } catch (rowError) {
            console.warn(`Error parsing row ${index + 1}:`, rowError);
          }
        });

        if (importedPolicies.length > 0) {
          const updatedPolicies = [...policies, ...importedPolicies];
          setPolicies(updatedPolicies);
          savePoliciesToStorage(updatedPolicies);
          
          toast({
            title: "Success",
            description: `Imported ${importedPolicies.length} policies successfully`,
          });
        } else {
          toast({
            title: "Warning",
            description: "No valid policies found in the CSV file",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
  };



  const handleViewPdf = (document: InsuranceDocument) => {
    setSelectedDocument(document);
    setShowPdfViewer(true);
  };

  const handleDownloadPdf = (doc: InsuranceDocument) => {
    // Create a demo PDF download (in real app, this would be the actual PDF)
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.target = '_blank';
    
    // For demo purposes, create a sample PDF content
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Insurance Policy Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
295
%%EOF`;
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
              title: t('downloadStarted'),
      description: `${doc.name} is being downloaded`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending_renewal':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'health':
        return '🏥';
      case 'dental':
        return '🦷';
      case 'vision':
        return '👁️';
      case 'life':
        return '💙';
      case 'disability':
        return '♿';
      default:
        return '🛡️';
    }
  };

  const getExpiryStatus = (endDate: string) => {
    const end = parseISO(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 30) return { status: 'expiring_soon', days: daysUntilExpiry };
    return { status: 'active', days: daysUntilExpiry };
  };

  const getFilteredPolicies = () => {
    let filtered = policies;
    
    // Filter by member
    if (selectedMemberId === 'self') {
      filtered = filtered.filter(p => !p.familyMemberId);
    } else {
      filtered = filtered.filter(p => p.familyMemberId === selectedMemberId);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.policyType === typeFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.providerName.toLowerCase().includes(term) ||
        p.policyNumber.toLowerCase().includes(term) ||
        p.policyType.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const calculateCoverageStats = () => {
    const filteredPolicies = getFilteredPolicies();
    const activePolicies = filteredPolicies.filter(p => p.status === 'active');
    
    return {
      totalPolicies: filteredPolicies.length,
      activePolicies: activePolicies.length,
      totalCoverage: activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0),
      totalPremium: activePolicies.reduce((sum, p) => sum + p.premium, 0),
      expiringSoon: filteredPolicies.filter(p => {
        const expiry = getExpiryStatus(p.coveragePeriod.endDate);
        return expiry.status === 'expiring_soon';
      }).length,
      totalDocuments: filteredPolicies.reduce((sum, p) => sum + (p.documents ? p.documents.length : 0), 0)
    };
  };

  // Main component render logic
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = calculateCoverageStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Insurance Management
          </h2>
          <p className="text-gray-600">Manage insurance policies for yourself and family members</p>
        </div>
        <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={importPolicies}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="import-csv"
                          />
                          <Button 
                            variant="outline"
                            className="flex items-center gap-2"
                            asChild
                          >
                            <label htmlFor="import-csv">
                              <Upload className="h-4 w-4" />
                              Import CSV
                            </label>
                          </Button>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={exportPolicies}
                          className="flex items-center gap-2"
                          disabled={getFilteredPolicies().length === 0}
                        >
                          <Download className="h-4 w-4" />
                          Export CSV
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={loadInsuranceData}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                        <Button 
                          onClick={() => setShowAddForm(true)} 
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add Policy
                        </Button>
                        </div>
                      </div>

                    {/* Member Selection */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
        <span className="text-sm font-medium text-gray-700">View Policies for:</span>
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="self">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Self
              </div>
            </SelectItem>
            {familyMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {member.name} ({member.relationship})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Coverage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Policies</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalPolicies}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Policies</p>
                <p className="text-2xl font-bold text-green-900">{stats.activePolicies}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Coverage</p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{(stats.totalCoverage / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Monthly Premium</p>
                <p className="text-2xl font-bold text-orange-900">
                  ₹{stats.totalPremium.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Total Documents</p>
                <p className="text-2xl font-bold text-teal-900">
                  {stats.totalDocuments}
                </p>
              </div>
              <FileText className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
                {/* Expiring Policies Alert */}
      {stats.expiringSoon > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {stats.expiringSoon} policy{stats.expiringSoon !== 1 ? 'ies' : ''} expiring soon
                </p>
                <p className="text-sm text-yellow-700">
                  Review and renew your policies to maintain continuous coverage
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => setActiveTab('policies')}
              >
                View Policies
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance Coverage Gap Alert */}
      {stats.totalPolicies === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  No insurance policies found
                </p>
                <p className="text-sm text-blue-700">
                  Add your first insurance policy to start tracking coverage
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => setShowAddForm(true)}
              >
                Add Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

          {/* Policy Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredPolicies().map((policy) => {
              const expiryStatus = getExpiryStatus(policy.coveragePeriod.endDate);
              return (
                <Card key={policy.id} className="hover:shadow-lg transition-shadow border-gray-100">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">{getPolicyTypeIcon(policy.policyType)}</div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {policy.providerName}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                              {policy.policyNumber}
                            </CardDescription>
                          </div>
                        </div>
                        {policy.documents && policy.documents.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <FileText className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">Document Available</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Select
                          value={policy.status}
                          onValueChange={(value: 'active' | 'expired' | 'pending_renewal' | 'cancelled') => 
                            handleStatusUpdate(policy.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8 text-xs font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {policy.documents && policy.documents.length > 0 && (
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                            <FileText className="h-3 w-3 mr-1" />
                            PDF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">₹{(policy.coverageAmount / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-600">Coverage</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">₹{policy.premium}</div>
                        <div className="text-xs text-gray-600">{policy.premiumFrequency}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${
                          expiryStatus.status === 'expired' ? 'text-red-600' : 
                          expiryStatus.status === 'expiring_soon' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {format(parseISO(policy.coveragePeriod.endDate), 'MMM dd')}
                        </div>
                        <div className="text-xs text-gray-600">Expires</div>
                      </div>
                    </div>

                    {expiryStatus.status === 'expiring_soon' && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800 font-medium">
                            Expires in {expiryStatus.days} days
                          </p>
                        </div>
                      </div>
                    )}

                                         <div className="flex gap-2 pt-3">
                       <Button
                         variant="outline"
                         size="sm"
                         className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                         onClick={() => setSelectedPolicy(policy)}
                       >
                         <Eye className="h-4 w-4 mr-2" />
                         View Details
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                         onClick={() => handleEditPolicy(policy)}
                       >
                         <Edit className="h-4 w-4 mr-2" />
                         Edit
                       </Button>
                       {policy.documents && policy.documents.length > 0 && (
                         <Button
                           variant="outline"
                           size="sm"
                           className="flex-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                           onClick={() => handleViewPdf(policy.documents[0])}
                         >
                           <FileText className="h-4 w-4 mr-2" />
                           PDF
                         </Button>
                       )}
                     </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          {/* Add/Edit Policy Form */}
          {showAddForm && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">
                  {isEditing ? 'Edit Insurance Policy' : 'Add New Insurance Policy'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Update policy details for comprehensive coverage tracking' : 'Enter policy details for comprehensive coverage tracking'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Policy Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Provider Name *</label>
                    <Input
                      value={newPolicy.providerName}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, providerName: e.target.value }))}
                      placeholder="e.g., Blue Cross Blue Shield"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Policy Number *</label>
                    <Input
                      value={newPolicy.policyNumber}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, policyNumber: e.target.value }))}
                      placeholder="e.g., BCBS-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Policy Type *</label>
                    <Select
                      value={newPolicy.policyType}
                      onValueChange={(value: any) => setNewPolicy(prev => ({ ...prev, policyType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">🏥 Health Insurance</SelectItem>
                        <SelectItem value="dental">🦷 Dental Insurance</SelectItem>
                        <SelectItem value="vision">👁️ Vision Insurance</SelectItem>
                        <SelectItem value="life">💙 Life Insurance</SelectItem>
                        <SelectItem value="disability">♿ Disability Insurance</SelectItem>
                        <SelectItem value="other">🛡️ Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Coverage Amount *</label>
                                         <Input
                       type="number"
                       value={newPolicy.coverageAmount}
                       onChange={(e) => setNewPolicy(prev => ({ ...prev, coverageAmount: parseInt(e.target.value) || 0 }))}
                       placeholder="500000"
                     />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Start Date *</label>
                    <Input
                      type="date"
                      value={newPolicy.startDate}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">End Date *</label>
                    <Input
                      type="date"
                      value={newPolicy.endDate}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Premium *</label>
                                         <Input
                       type="number"
                       value={newPolicy.premium}
                       onChange={(e) => setNewPolicy(prev => ({ ...prev, premium: parseInt(e.target.value) || 0 }))}
                       placeholder="1200"
                     />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Premium Frequency *</label>
                    <Select
                      value={newPolicy.premiumFrequency}
                      onValueChange={(value: any) => setNewPolicy(prev => ({ ...prev, premiumFrequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Co-payments and Deductibles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Co-payments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Doctor Visit</label>
                                             <Input
                         type="number"
                         value={newPolicy.doctorVisit}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, doctorVisit: parseInt(e.target.value) || 0 }))}
                         placeholder="500"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Specialist</label>
                       <Input
                         type="number"
                         value={newPolicy.specialist}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, specialist: parseInt(e.target.value) || 0 }))}
                         placeholder="1000"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Emergency</label>
                       <Input
                         type="number"
                         value={newPolicy.emergency}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, emergency: parseInt(e.target.value) || 0 }))}
                         placeholder="2000"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Prescription</label>
                       <Input
                         type="number"
                         value={newPolicy.prescription}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, prescription: parseInt(e.target.value) || 0 }))}
                         placeholder="200"
                       />
                    </div>
                  </div>
                </div>

                {/* Deductibles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Deductibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Individual Deductible</label>
                                             <Input
                         type="number"
                         value={newPolicy.individualDeductible}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, individualDeductible: parseInt(e.target.value) || 0 }))}
                         placeholder="10000"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Family Deductible</label>
                       <Input
                         type="number"
                         value={newPolicy.familyDeductible}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, familyDeductible: parseInt(e.target.value) || 0 }))}
                         placeholder="20000"
                       />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Provider Phone</label>
                                             <Input
                         value={newPolicy.providerPhone}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, providerPhone: e.target.value }))}
                         placeholder="1800-425-2255"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Provider Email</label>
                       <Input
                         value={newPolicy.providerEmail}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, providerEmail: e.target.value }))}
                         placeholder="support@starhealth.in"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Provider Website</label>
                       <Input
                         value={newPolicy.providerWebsite}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, providerWebsite: e.target.value }))}
                         placeholder="www.starhealth.in"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm text-gray-600">Claims Phone</label>
                       <Input
                         value={newPolicy.claimsPhone}
                         onChange={(e) => setNewPolicy(prev => ({ ...prev, claimsPhone: e.target.value }))}
                         placeholder="1800-425-2256"
                       />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditing(false);
                      setEditingPolicy(null);
                      // Reset form
                      setNewPolicy({
                        providerName: '',
                        policyNumber: '',
                        policyType: 'health',
                        coverageAmount: 0,
                        startDate: '',
                        endDate: '',
                        doctorVisit: 0,
                        specialist: 0,
                        emergency: 0,
                        prescription: 0,
                        individualDeductible: 0,
                        familyDeductible: 0,
                        premium: 0,
                        premiumFrequency: 'monthly',
                        providerPhone: '',
                        providerEmail: '',
                        providerWebsite: '',
                        claimsPhone: ''
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={isEditing ? handleUpdatePolicy : handleAddPolicy}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!newPolicy.providerName || !newPolicy.policyNumber || !newPolicy.startDate || !newPolicy.endDate}
                  >
                    {isEditing ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Policy
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Policy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search policies by provider, number, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="vision">Vision</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="disability">Disability</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Bulk Actions */}
          {getFilteredPolicies().length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPolicies.length === getFilteredPolicies().length && getFilteredPolicies().length > 0}
                      onChange={(e) => e.target.checked ? selectAllPolicies() : clearSelection()}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedPolicies.length} of {getFilteredPolicies().length} selected
                    </span>
                  </div>
                  {selectedPolicies.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Bulk Actions
                    </Button>
                  )}
                </div>
                {selectedPolicies.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="text-gray-600"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
              
              {showBulkActions && selectedPolicies.length > 0 && (
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Update Status:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('active')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    Active
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('expired')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    Expired
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('pending_renewal')}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                  >
                    Pending Renewal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('cancelled')}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                  >
                    Cancelled
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Policies List */}
          <div className="space-y-4">
            {getFilteredPolicies().length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first insurance policy to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                )}
              </Card>
            ) : (
              getFilteredPolicies().map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPolicies.includes(policy.id)}
                        onChange={() => togglePolicySelection(policy.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="text-3xl">{getPolicyTypeIcon(policy.policyType)}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{policy.providerName}</h3>
                        <p className="text-gray-600 text-sm">{policy.policyNumber}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">₹{(policy.coverageAmount / 1000).toFixed(0)}K</span>
                            <span className="text-gray-500">Coverage</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">₹{policy.premium}</span>
                            <span className="text-gray-500">{policy.premiumFrequency}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">{format(parseISO(policy.coveragePeriod.endDate), 'MMM dd')}</span>
                            <span className="text-gray-500">Expires</span>
                          </div>
                        </div>
                        {policy.documents && policy.documents.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <FileText className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">PDF Document Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                                         <div className="flex items-center gap-2">
                       <Badge className={getStatusColor(policy.status)}>
                         {policy.status.replace('_', ' ')}
                       </Badge>
                       <Button
                         variant="outline"
                         size="sm"
                         className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                         onClick={() => setSelectedPolicy(policy)}
                       >
                         <Eye className="h-4 w-4 mr-2" />
                         View
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                         onClick={() => handleEditPolicy(policy)}
                       >
                         <Edit className="h-4 w-4 mr-2" />
                         Edit
                       </Button>
                       {policy.documents && policy.documents.length > 0 && (
                         <>
                           <Button
                             variant="outline"
                             size="sm"
                             className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                             onClick={() => handleViewPdf(policy.documents[0])}
                           >
                             <FileText className="h-4 w-4 mr-2" />
                             PDF
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             className="bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700"
                             onClick={() => handleDownloadPdf(policy.documents[0])}
                           >
                             <Download className="h-4 w-4 mr-2" />
                             Download
                           </Button>
                         </>
                       )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Claims</CardTitle>
              <CardDescription>Track and manage your insurance claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Claims management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

                 <TabsContent value="documents" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Insurance Documents</CardTitle>
               <CardDescription>View and download insurance policy documents</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {policies.length === 0 ? (
                   <div className="text-center py-8 text-gray-500">
                     <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                     <p>No insurance policies found</p>
                     <p className="text-sm">Add a policy to see its documents</p>
                   </div>
                 ) : (
                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                     {policies.map((policy) => 
                       policy.documents && policy.documents.map((document) => (
                         <Card key={document.id} className="hover:shadow-md transition-shadow">
                           <CardContent className="p-4">
                             <div className="flex items-start justify-between">
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2">
                                   <FileText className="h-5 w-5 text-blue-600" />
                                   <h4 className="font-semibold text-sm">{document.name}</h4>
                                 </div>
                                 <p className="text-xs text-gray-500 mb-2">
                                   Policy: {policy.providerName} - {policy.policyNumber}
                                 </p>
                                 <p className="text-xs text-gray-500">
                                   Uploaded: {format(parseISO(document.uploadedAt), 'MMM dd, yyyy')}
                                 </p>
                               </div>
                               <Badge variant="outline" className="text-xs">
                                 {document.type}
                               </Badge>
                             </div>
                             <div className="flex gap-2 mt-3">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                 onClick={() => handleViewPdf(document)}
                               >
                                 <Eye className="h-3 w-3 mr-1" />
                                 View
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                 onClick={() => handleDownloadPdf(document)}
                               >
                                 <Download className="h-3 w-3 mr-1" />
                                 Download
                               </Button>
                             </div>
                           </CardContent>
                         </Card>
                       ))
                     )}
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
               </Tabs>



         {/* PDF Viewer Modal */}
         {showPdfViewer && selectedDocument && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
               <div className="flex items-center justify-between p-4 border-b">
                 <div>
                   <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
                   <p className="text-sm text-gray-600">
                     Policy Document - {format(parseISO(selectedDocument.uploadedAt), 'MMM dd, yyyy')}
                   </p>
                 </div>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleDownloadPdf(selectedDocument)}
                   >
                     <Download className="h-4 w-4 mr-2" />
                     Download
                   </Button>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                       setShowPdfViewer(false);
                       setSelectedDocument(null);
                     }}
                   >
                     ×
                   </Button>
                 </div>
               </div>
               <div className="p-4 h-[calc(90vh-120px)] overflow-auto">
                 <div className="bg-gray-100 rounded-lg p-8 text-center">
                   <FileText className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                   <h4 className="text-xl font-semibold text-gray-700 mb-2">PDF Document Viewer</h4>
                   <p className="text-gray-600 mb-4">
                     This is a demo PDF viewer. In a real application, this would display the actual PDF content.
                   </p>
                   <div className="bg-white rounded-lg p-6 max-w-md mx-auto text-left">
                     <h5 className="font-semibold mb-3">Document Information:</h5>
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Name:</span>
                         <span className="font-medium">{selectedDocument.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Type:</span>
                         <span className="font-medium capitalize">{selectedDocument.type}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Uploaded:</span>
                         <span className="font-medium">
                           {format(parseISO(selectedDocument.uploadedAt), 'MMM dd, yyyy HH:mm')}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">File Size:</span>
                         <span className="font-medium">~2.5 MB</span>
                       </div>
                     </div>
                   </div>
                   <div className="mt-6">
                     <Button
                       onClick={() => handleDownloadPdf(selectedDocument)}
                       className="bg-blue-600 hover:bg-blue-700 text-white"
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download PDF
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Policy Details</h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPolicy(null)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Provider</label>
                      <p className="font-medium">{selectedPolicy.providerName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Policy Number</label>
                      <p className="font-medium">{selectedPolicy.policyNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Type</label>
                      <p className="font-medium">{selectedPolicy.policyType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <Badge className={getStatusColor(selectedPolicy.status)}>
                        {selectedPolicy.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Coverage Details</h4>
                  <div className="space-y-3">
                                       <div>
                     <label className="text-sm text-gray-600">Coverage Amount</label>
                     <p className="font-medium">₹{selectedPolicy.coverageAmount.toLocaleString()}</p>
                   </div>
                   <div>
                     <label className="text-sm text-gray-600">Premium</label>
                     <p className="font-medium">₹{selectedPolicy.premium}/{selectedPolicy.premiumFrequency}</p>
                   </div>
                    <div>
                      <label className="text-sm text-gray-600">Coverage Period</label>
                      <p className="font-medium">
                        {format(parseISO(selectedPolicy.coveragePeriod.startDate), 'MMM dd, yyyy')} - {format(parseISO(selectedPolicy.coveragePeriod.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

                             <div className="mt-6 pt-6 border-t">
                 <h4 className="font-semibold mb-3">Co-payments & Deductibles</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                       <label className="text-sm text-gray-600">Doctor Visit Co-pay</label>
                       <p className="font-medium">₹{selectedPolicy.coPayments.doctorVisit}</p>
                     </div>
                     <div>
                       <label className="text-sm text-gray-600">Specialist Co-pay</label>
                       <p className="font-medium">₹{selectedPolicy.coPayments.specialist}</p>
                       </div>
                     <div>
                       <label className="text-sm text-gray-600">Emergency Co-pay</label>
                       <p className="font-medium">₹{selectedPolicy.coPayments.emergency}</p>
                     </div>
                     <div>
                       <label className="text-sm text-gray-600">Prescription Co-pay</label>
                       <p className="font-medium">₹{selectedPolicy.coPayments.prescription}</p>
                     </div>
                     <div>
                       <label className="text-sm text-gray-600">Individual Deductible</label>
                       <p className="font-medium">₹{selectedPolicy.deductibles.individual}</p>
                     </div>
                     <div>
                       <label className="text-sm text-gray-600">Family Deductible</label>
                       <p className="font-medium">₹{selectedPolicy.deductibles.family}</p>
                     </div>
                 </div>
               </div>

               <div className="mt-6 pt-6 border-t">
                 <h4 className="font-semibold mb-3">Contact Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm text-gray-600">Provider Phone</label>
                     <p className="font-medium">{selectedPolicy.contactInfo.providerPhone}</p>
                   </div>
                   <div>
                     <label className="text-sm text-gray-600">Claims Phone</label>
                     <p className="font-medium">{selectedPolicy.contactInfo.claimsPhone}</p>
                   </div>
                   <div>
                     <label className="text-sm text-gray-600">Provider Email</label>
                     <p className="font-medium">{selectedPolicy.contactInfo.providerEmail}</p>
                   </div>
                   <div>
                     <label className="text-sm text-gray-600">Website</label>
                     <p className="font-medium">{selectedPolicy.contactInfo.providerWebsite}</p>
                   </div>
                 </div>
               </div>

                             <div className="flex gap-3 mt-6 pt-6 border-t">
                 <Button
                   variant="outline"
                   onClick={() => setSelectedPolicy(null)}
                   className="flex-1"
                 >
                   Close
                 </Button>
                 <Button
                   variant="outline"
                   className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                   onClick={() => {
                     handleEditPolicy(selectedPolicy);
                     setSelectedPolicy(null);
                   }}
                 >
                   <Edit className="h-4 w-4 mr-2" />
                   Edit Policy
                 </Button>
                 {selectedPolicy.documents && selectedPolicy.documents.length > 0 && (
                   <>
                     <Button
                       variant="outline"
                       className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                       onClick={() => handleViewPdf(selectedPolicy.documents[0])}
                     >
                       <FileText className="h-4 w-4 mr-2" />
                       View PDF
                     </Button>
                     <Button
                       variant="outline"
                       className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                       onClick={() => handleDownloadPdf(selectedPolicy.documents[0])}
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download PDF
                     </Button>
                   </>
                 )}
                 <Button
                   className="flex-1"
                   onClick={() => {
                     setShowClaimForm(true);
                     setNewClaim(prev => ({ ...prev, policyId: selectedPolicy.id }));
                     setSelectedPolicy(null);
                   }}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   File Claim
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default InsuranceManagement;
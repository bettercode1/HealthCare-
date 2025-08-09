// Mock API service for immediate CRUD functionality
// This simulates a real API while we fix the server issues

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('demoUser') || '{}');
  return {
    'Content-Type': 'application/json',
    'user-id': user.uid || 'demo-patient-1'
  };
};

// Load demo data from localStorage
const loadDemoData = (userId: string) => {
  try {
    // Since we now store demo data directly in mock_* keys, 
    // we don't need to load from demo_data_${userId} anymore
    // The data is already available in the mock_* keys
    return null; // Return null to skip merging since data is already in correct format
  } catch (error) {
    console.warn('Error loading demo data:', error);
    return null;
  }
};

// Merge demo data with existing mock data
const mergeDemoData = (userId: string) => {
  // Since demo data is now stored directly in mock_* keys,
  // we don't need to merge anymore - the data is already in the correct format
  console.log('Demo data is already stored in correct format, no merging needed');
};

// Demo prescription data
const DEMO_PRESCRIPTIONS = [
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
  },
  {
    id: 'pres4',
    doctorId: 'demo-doctor-3',
    patientId: 'demo-patient-1',
    diagnosis: 'Asthma',
    medication: 'Albuterol inhaler 2 puffs every 4-6 hours as needed',
    notes: 'Use before exercise and when experiencing shortness of breath.',
    prescribedDate: '2024-01-15',
    refills: 2,
    status: 'active',
    sideEffects: ['tremor', 'increased heart rate', 'nervousness'],
    interactions: ['beta-blockers', 'diuretics'],
    monitoring: ['lung function', 'heart rate'],
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'pres5',
    doctorId: 'demo-doctor-1',
    patientId: 'demo-patient-1',
    diagnosis: 'Vitamin D Deficiency',
    medication: 'Vitamin D3 2000 IU daily',
    notes: 'Take with food for better absorption. Recheck levels in 3 months.',
    prescribedDate: '2024-01-20',
    refills: 1,
    status: 'active',
    sideEffects: ['nausea', 'constipation', 'weakness'],
    interactions: ['calcium supplements', 'magnesium'],
    monitoring: ['vitamin D levels', 'calcium levels'],
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 'pres6',
    doctorId: 'demo-doctor-4',
    patientId: 'demo-patient-1',
    diagnosis: 'Seasonal Allergies',
    medication: 'Cetirizine 10mg daily',
    notes: 'Take once daily, preferably in the evening. Avoid alcohol while taking.',
    prescribedDate: '2024-01-25',
    refills: 2,
    status: 'active',
    sideEffects: ['drowsiness', 'dry mouth', 'headache'],
    interactions: ['alcohol', 'sedatives'],
    monitoring: ['allergy symptoms', 'side effects'],
    createdAt: '2024-01-25T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z'
  },
  {
    id: 'pres7',
    doctorId: 'demo-doctor-2',
    patientId: 'demo-patient-1',
    diagnosis: 'Insomnia',
    medication: 'Melatonin 5mg 30 minutes before bedtime',
    notes: 'Take 30 minutes before desired sleep time. Avoid bright lights after taking.',
    prescribedDate: '2024-01-30',
    refills: 1,
    status: 'active',
    sideEffects: ['drowsiness', 'headache', 'dizziness'],
    interactions: ['alcohol', 'sedatives', 'antidepressants'],
    monitoring: ['sleep quality', 'daytime drowsiness'],
    createdAt: '2024-01-30T00:00:00.000Z',
    updatedAt: '2024-01-30T00:00:00.000Z'
  }
];

// Mock storage for immediate functionality
const mockStorage = {
  medications: JSON.parse(localStorage.getItem('mock_medications') || JSON.stringify([])),
  doseRecords: JSON.parse(localStorage.getItem('mock_dose_records') || JSON.stringify([])),
  familyMembers: JSON.parse(localStorage.getItem('mock_family_members') || JSON.stringify([])),
  reports: JSON.parse(localStorage.getItem('mock_reports') || JSON.stringify([])),
  appointments: JSON.parse(localStorage.getItem('mock_appointments') || JSON.stringify([])),
  healthMetrics: JSON.parse(localStorage.getItem('mock_health_metrics') || JSON.stringify([])),
  diseaseAnalysis: JSON.parse(localStorage.getItem('mock_disease_analysis') || JSON.stringify([])),
  healthTrends: JSON.parse(localStorage.getItem('mock_health_trends') || JSON.stringify([])),
  prescriptions: JSON.parse(localStorage.getItem('mock_prescriptions') || JSON.stringify(DEMO_PRESCRIPTIONS))
};

// Initialize prescriptions if they don't exist
if (!localStorage.getItem('mock_prescriptions')) {
  localStorage.setItem('mock_prescriptions', JSON.stringify(DEMO_PRESCRIPTIONS));
  console.log('Initialized demo prescriptions in localStorage');
}

// Save data to localStorage
const saveToStorage = (key: string, data: any) => {
  const storageKey = `mock_${key}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
  // Also update the mockStorage object
  (mockStorage as any)[key] = data;
};

// Disable server availability checking to prevent CORS errors
let serverAvailable = false;

// Generic API request function with fallback to mock
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Always use mock implementation to avoid CORS errors
  return mockApiRequest(endpoint, options);
};

// Mock API implementation
const mockApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Use user ID from headers if provided, otherwise fall back to default
  const userId = (options.headers as any)?.['user-id'] || getAuthHeaders()['user-id'];
  
  // Merge demo data if available
  mergeDemoData(userId);
  
  // Reload mock storage after merging demo data
  const reloadMockStorage = () => {
    try {
      console.log('=== RELOAD MOCK STORAGE DEBUG ===');
      console.log('Reloading mock storage from localStorage...');
      
      const medicationsData = localStorage.getItem('mock_medications');
      const doseRecordsData = localStorage.getItem('mock_dose_records');
      const familyMembersData = localStorage.getItem('mock_family_members');
      const reportsData = localStorage.getItem('mock_reports');
      const appointmentsData = localStorage.getItem('mock_appointments');
      const healthMetricsData = localStorage.getItem('mock_health_metrics');
      const diseaseAnalysisData = localStorage.getItem('mock_disease_analysis');
      const healthTrendsData = localStorage.getItem('mock_health_trends');
      const prescriptionsData = localStorage.getItem('mock_prescriptions');
      
      console.log('Raw localStorage data:');
      console.log('- medications:', medicationsData);
      console.log('- doseRecords:', doseRecordsData);
      console.log('- familyMembers:', familyMembersData);
      console.log('- reports:', reportsData);
      console.log('- appointments:', appointmentsData);
      console.log('- healthMetrics:', healthMetricsData);
      console.log('- diseaseAnalysis:', diseaseAnalysisData);
      console.log('- healthTrends:', healthTrendsData);
      console.log('- prescriptions:', prescriptionsData);
      
      mockStorage.medications = JSON.parse(medicationsData || '[]');
      mockStorage.doseRecords = JSON.parse(doseRecordsData || '[]');
      mockStorage.familyMembers = JSON.parse(familyMembersData || '[]');
      mockStorage.reports = JSON.parse(reportsData || '[]');
      mockStorage.appointments = JSON.parse(appointmentsData || '[]');
      mockStorage.healthMetrics = JSON.parse(healthMetricsData || '[]');
      mockStorage.diseaseAnalysis = JSON.parse(diseaseAnalysisData || '[]');
      mockStorage.healthTrends = JSON.parse(healthTrendsData || '[]');
      mockStorage.prescriptions = JSON.parse(prescriptionsData || JSON.stringify(DEMO_PRESCRIPTIONS));
      
      console.log('Mock storage reloaded:');
      console.log('- medications:', mockStorage.medications.length);
      console.log('- doseRecords:', mockStorage.doseRecords.length);
      console.log('- familyMembers:', mockStorage.familyMembers.length);
      console.log('- reports:', mockStorage.reports.length);
      console.log('- appointments:', mockStorage.appointments.length);
      console.log('- healthMetrics:', mockStorage.healthMetrics.length);
      console.log('- diseaseAnalysis:', mockStorage.diseaseAnalysis.length);
      console.log('- healthTrends:', mockStorage.healthTrends.length);
      console.log('- prescriptions:', mockStorage.prescriptions.length);
      
      // Ensure prescriptions are always available
      if (!mockStorage.prescriptions || mockStorage.prescriptions.length === 0) {
        mockStorage.prescriptions = DEMO_PRESCRIPTIONS;
        localStorage.setItem('mock_prescriptions', JSON.stringify(DEMO_PRESCRIPTIONS));
        console.log('Restored demo prescriptions');
      }
    } catch (error) {
      console.error('Error reloading mock storage:', error);
    }
  };
  
  reloadMockStorage();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Helper function to filter data by user ID, handling both exact matches and demo user patterns
  const filterByUserId = (data: any[], userIdField: string = 'userId') => {
    console.log('=== FILTER BY USER ID DEBUG ===');
    console.log('Filtering data by user ID:', { data, userIdField, userId });
    console.log('Data length:', data.length);
    console.log('Data sample:', data.slice(0, 2));
    
    const filtered = data.filter((item: any) => {
      const itemUserId = item[userIdField];
      const matches = itemUserId === userId || 
                     itemUserId?.startsWith('demo-') || 
                     userId?.startsWith('demo-');
      console.log('Item:', item, 'Item User ID:', itemUserId, 'Target User ID:', userId, 'Matches:', matches);
      return matches;
    });
    
    console.log('Filtered result:', filtered);
    console.log('Filtered result length:', filtered.length);
    return filtered;
  };
  
  if (endpoint.startsWith('/medications') && (options.method === 'GET' || !options.method)) {
    const medications = filterByUserId(mockStorage.medications);
    return medications;
  }
  
  if (endpoint === '/medications' && options.method === 'POST') {
    const medication = JSON.parse(options.body as string);
    const newMedication = {
      ...medication,
      id: `med_${Date.now()}`,
      userId,
      familyMemberId: medication.familyMemberId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedMedications = [...mockStorage.medications, newMedication];
    saveToStorage('medications', updatedMedications);
    return newMedication;
  }
  
  if (endpoint.startsWith('/medications/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedMedications = mockStorage.medications.map((m: any) => 
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    saveToStorage('medications', updatedMedications);
    return updatedMedications.find((m: any) => m.id === id);
  }
  
  if (endpoint.startsWith('/medications/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedMedications = mockStorage.medications.filter((m: any) => m.id !== id);
    saveToStorage('medications', updatedMedications);
    return { success: true };
  }
  
  if (endpoint.startsWith('/dose-records') && (options.method === 'GET' || !options.method)) {
    const doseRecords = filterByUserId(mockStorage.doseRecords);
    
    // Handle date parameter if present
    if (endpoint.includes('?date=')) {
      const dateParam = endpoint.split('?date=')[1];
      if (dateParam) {
        const filteredRecords = doseRecords.filter((d: any) => 
          d.scheduledTime && d.scheduledTime.startsWith(dateParam)
        );
        return filteredRecords;
      }
    }
    
    return doseRecords;
  }
  
  if (endpoint === '/dose-records' && options.method === 'POST') {
    const doseRecord = JSON.parse(options.body as string);
    const newDoseRecord = {
      ...doseRecord,
      id: `dose_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedDoseRecords = [...mockStorage.doseRecords, newDoseRecord];
    saveToStorage('doseRecords', updatedDoseRecords);
    return newDoseRecord;
  }
  
  if (endpoint.startsWith('/dose-records/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedDoseRecords = mockStorage.doseRecords.map((d: any) => 
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    saveToStorage('doseRecords', updatedDoseRecords);
    return updatedDoseRecords.find((d: any) => d.id === id);
  }
  
  if (endpoint.startsWith('/dose-records/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedDoseRecords = mockStorage.doseRecords.filter((d: any) => d.id !== id);
    saveToStorage('doseRecords', updatedDoseRecords);
    return { success: true };
  }
  
  if (endpoint.startsWith('/reports') && (options.method === 'GET' || !options.method)) {
    const reports = filterByUserId(mockStorage.reports);
    return reports;
  }
  
  if (endpoint === '/reports' && options.method === 'POST') {
    const report = JSON.parse(options.body as string);
    const newReport = {
      ...report,
      id: `report_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedReports = [...mockStorage.reports, newReport];
    saveToStorage('reports', updatedReports);
    return newReport;
  }
  
  if (endpoint.startsWith('/reports/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedReports = mockStorage.reports.map((r: any) => 
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    saveToStorage('reports', updatedReports);
    return updatedReports.find((r: any) => r.id === id);
  }
  
  if (endpoint.startsWith('/reports/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedReports = mockStorage.reports.filter((r: any) => r.id !== id);
    saveToStorage('reports', updatedReports);
    return { success: true };
  }
  
  if (endpoint.startsWith('/family-members') && (options.method === 'GET' || !options.method)) {
    // Check if this is a request for a specific family member
    if (endpoint.includes('/') && endpoint.split('/').length > 2) {
      const id = endpoint.split('/').pop();
      const familyMember = mockStorage.familyMembers.find((f: any) => f.id === id);
      if (familyMember) {
        return familyMember;
      }
      return null;
    }
    // Return all family members for the user
    const familyMembers = filterByUserId(mockStorage.familyMembers);
    return familyMembers;
  }
  
  if (endpoint === '/family-members' && options.method === 'POST') {
    const familyMember = JSON.parse(options.body as string);
    const newFamilyMember = {
      ...familyMember,
      id: `family_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedFamilyMembers = [...mockStorage.familyMembers, newFamilyMember];
    saveToStorage('familyMembers', updatedFamilyMembers);
    return newFamilyMember;
  }
  
  if (endpoint.startsWith('/family-members/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedFamilyMembers = mockStorage.familyMembers.map((f: any) => 
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    );
    saveToStorage('familyMembers', updatedFamilyMembers);
    return updatedFamilyMembers.find((f: any) => f.id === id);
  }
  
  if (endpoint.startsWith('/family-members/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedFamilyMembers = mockStorage.familyMembers.filter((f: any) => f.id !== id);
    saveToStorage('familyMembers', updatedFamilyMembers);
    return { success: true };
  }
  
  if (endpoint === '/prescriptions' && (options.method === 'GET' || !options.method)) {
    // For prescriptions, we need to handle both patientId and userId fields
    // Also ensure demo prescriptions are always available
    let prescriptions = mockStorage.prescriptions;
    
    // If we have a specific user ID, filter by it
    if (userId && userId !== 'demo-patient-1') {
      prescriptions = filterByUserId(mockStorage.prescriptions, 'patientId');
    }
    
    // If no prescriptions found, return demo prescriptions
    if (!prescriptions || prescriptions.length === 0) {
      console.log('No prescriptions found, returning demo prescriptions');
      return DEMO_PRESCRIPTIONS;
    }
    
    return prescriptions;
  }
  
  if (endpoint === '/prescriptions' && options.method === 'POST') {
    const prescription = JSON.parse(options.body as string);
    const newPrescription = {
      ...prescription,
      id: `pres_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedPrescriptions = [...mockStorage.prescriptions, newPrescription];
    saveToStorage('prescriptions', updatedPrescriptions);
    return newPrescription;
  }
  
  if (endpoint.startsWith('/prescriptions/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedPrescriptions = mockStorage.prescriptions.map((p: any) => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    saveToStorage('prescriptions', updatedPrescriptions);
    return updatedPrescriptions.find((p: any) => p.id === id);
  }
  
  if (endpoint.startsWith('/prescriptions/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedPrescriptions = mockStorage.prescriptions.filter((p: any) => p.id !== id);
    saveToStorage('prescriptions', updatedPrescriptions);
    return { success: true };
  }
  
  if (endpoint === '/health-metrics' && (options.method === 'GET' || !options.method)) {
    const healthMetrics = filterByUserId(mockStorage.healthMetrics);
    return healthMetrics;
  }
  
  if (endpoint === '/health-metrics' && options.method === 'POST') {
    const healthMetric = JSON.parse(options.body as string);
    const newHealthMetric = {
      ...healthMetric,
      id: `metric_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedHealthMetrics = [...mockStorage.healthMetrics, newHealthMetric];
    saveToStorage('healthMetrics', updatedHealthMetrics);
    return newHealthMetric;
  }
  
  if (endpoint.startsWith('/health-metrics/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedHealthMetrics = mockStorage.healthMetrics.map((h: any) => 
      h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
    );
    saveToStorage('healthMetrics', updatedHealthMetrics);
    return updatedHealthMetrics.find((h: any) => h.id === id);
  }
  
  if (endpoint.startsWith('/health-metrics/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedHealthMetrics = mockStorage.healthMetrics.filter((h: any) => h.id !== id);
    saveToStorage('healthMetrics', updatedHealthMetrics);
    return { success: true };
  }

  if (endpoint === '/disease-analysis' && (options.method === 'GET' || !options.method)) {
    const diseaseAnalysis = filterByUserId(mockStorage.diseaseAnalysis);
    return diseaseAnalysis;
  }

  if (endpoint === '/disease-analysis' && options.method === 'POST') {
    const analysis = JSON.parse(options.body as string);
    const newAnalysis = {
      ...analysis,
      id: `disease_${Date.now()}`,
      userId,
      familyMemberId: analysis.familyMemberId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedAnalysis = [...mockStorage.diseaseAnalysis, newAnalysis];
    saveToStorage('diseaseAnalysis', updatedAnalysis);
    return newAnalysis;
  }

  if (endpoint.startsWith('/disease-analysis/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedAnalysis = mockStorage.diseaseAnalysis.map((a: any) => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    saveToStorage('diseaseAnalysis', updatedAnalysis);
    return updatedAnalysis.find((a: any) => a.id === id);
  }

  if (endpoint.startsWith('/disease-analysis/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedAnalysis = mockStorage.diseaseAnalysis.filter((a: any) => a.id !== id);
    saveToStorage('diseaseAnalysis', updatedAnalysis);
    return { success: true };
  }

  if (endpoint === '/health-trends' && (options.method === 'GET' || !options.method)) {
    const healthTrends = filterByUserId(mockStorage.healthTrends);
    return healthTrends;
  }

  if (endpoint === '/health-trends' && options.method === 'POST') {
    const trend = JSON.parse(options.body as string);
    const newTrend = {
      ...trend,
      id: `trend_${Date.now()}`,
      userId,
      familyMemberId: trend.familyMemberId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedTrends = [...mockStorage.healthTrends, newTrend];
    saveToStorage('healthTrends', updatedTrends);
    return newTrend;
  }

  if (endpoint.startsWith('/health-trends/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedTrends = mockStorage.healthTrends.map((t: any) => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    saveToStorage('healthTrends', updatedTrends);
    return updatedTrends.find((t: any) => t.id === id);
  }

  if (endpoint.startsWith('/health-trends/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedTrends = mockStorage.healthTrends.filter((t: any) => t.id !== id);
    saveToStorage('healthTrends', updatedTrends);
    return { success: true };
  }

  if (endpoint === '/appointments' && (options.method === 'GET' || !options.method)) {
    const appointments = filterByUserId(mockStorage.appointments);
    return appointments;
  }
  
  if (endpoint === '/appointments' && options.method === 'POST') {
    const appointment = JSON.parse(options.body as string);
    const newAppointment = {
      ...appointment,
      id: `apt_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedAppointments = [...mockStorage.appointments, newAppointment];
    saveToStorage('appointments', updatedAppointments);
    return newAppointment;
  }
  
  if (endpoint.startsWith('/appointments/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    const updatedAppointments = mockStorage.appointments.map((a: any) => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    saveToStorage('appointments', updatedAppointments);
    return updatedAppointments.find((a: any) => a.id === id);
  }
  
  if (endpoint.startsWith('/appointments/') && options.method === 'DELETE') {
    const id = endpoint.split('/').pop();
    const updatedAppointments = mockStorage.appointments.filter((a: any) => a.id !== id);
    saveToStorage('appointments', updatedAppointments);
    return { success: true };
  }

  if (endpoint === '/dashboard/stats') {
    return {
      totalMedications: mockStorage.medications.length,
      totalDoses: mockStorage.doseRecords.length,
      totalFamilyMembers: mockStorage.familyMembers.length,
      totalReports: mockStorage.reports.length,
      totalPrescriptions: mockStorage.prescriptions.length,
      totalAppointments: mockStorage.appointments.length
    };
  }

  if (endpoint.startsWith('/users/') && (options.method === 'GET' || !options.method)) {
    const id = endpoint.split('/').pop();
    return {
      id,
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'patient',
      plan: 'premium'
    };
  }

  if (endpoint === '/users' && options.method === 'POST') {
    const user = JSON.parse(options.body as string);
    return {
      ...user,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  }

  if (endpoint.startsWith('/users/') && options.method === 'PUT') {
    const id = endpoint.split('/').pop();
    const updates = JSON.parse(options.body as string);
    return {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  }

  if (endpoint.startsWith('/users/') && options.method === 'DELETE') {
    return { success: true };
  }

  // Default response for unknown endpoints
  console.warn(`Unknown endpoint: ${endpoint}`);
  return { error: 'Endpoint not found' };
};

// Medications API
export const medicationAPI = {
  getMedications: (userId?: string) => apiRequest('/medications', { 
    headers: { 'user-id': userId || '' } 
  }),
  getMedication: (id: string) => apiRequest(`/medications/${id}`),
  createMedication: (medication: any) => apiRequest('/medications', {
    method: 'POST',
    body: JSON.stringify(medication)
  }),
  updateMedication: (id: string, updates: any) => apiRequest(`/medications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteMedication: (id: string) => apiRequest(`/medications/${id}`, {
    method: 'DELETE'
  })
};

// Dose records API
export const doseAPI = {
  getDoseRecords: (userId?: string, date?: string) => {
    const endpoint = date ? `/dose-records?date=${date}` : '/dose-records';
    return apiRequest(endpoint, { 
      headers: { 'user-id': userId || '' } 
    });
  },
  getDoseRecord: (id: string) => apiRequest(`/dose-records/${id}`),
  createDoseRecord: (doseRecord: any) => apiRequest('/dose-records', {
    method: 'POST',
    body: JSON.stringify(doseRecord)
  }),
  updateDoseRecord: (id: string, updates: any) => apiRequest(`/dose-records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteDoseRecord: (id: string) => apiRequest(`/dose-records/${id}`, {
    method: 'DELETE'
  })
};

// Reports API
export const reportAPI = {
  getReports: (userId?: string) => apiRequest('/reports', { 
    headers: { 'user-id': userId || '' } 
  }),
  getReport: (id: string) => apiRequest(`/reports/${id}`),
  createReport: (report: any) => apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(report)
  }),
  updateReport: (id: string, updates: any) => apiRequest(`/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteReport: (id: string) => apiRequest(`/reports/${id}`, {
    method: 'DELETE'
  })
};

// Health metrics API
export const metricsAPI = {
  getHealthMetrics: (userId?: string) => apiRequest('/health-metrics', { 
    headers: { 'user-id': userId || '' } 
  }),
  getHealthMetric: (id: string) => apiRequest(`/health-metrics/${id}`),
  createHealthMetric: (metric: any) => apiRequest('/health-metrics', {
    method: 'POST',
    body: JSON.stringify(metric)
  }),
  updateHealthMetric: (id: string, updates: any) => apiRequest(`/health-metrics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteHealthMetric: (id: string) => apiRequest(`/health-metrics/${id}`, {
    method: 'DELETE'
  })
};

// Disease analysis API
export const diseaseAnalysisAPI = {
  getDiseaseAnalysis: (userId?: string) => apiRequest('/disease-analysis', { 
    headers: { 'user-id': userId || '' } 
  }),
  getDiseaseAnalysisById: (id: string) => apiRequest(`/disease-analysis/${id}`),
  createDiseaseAnalysis: (analysis: any) => apiRequest('/disease-analysis', {
    method: 'POST',
    body: JSON.stringify(analysis)
  }),
  updateDiseaseAnalysis: (id: string, updates: any) => apiRequest(`/disease-analysis/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteDiseaseAnalysis: (id: string) => apiRequest(`/disease-analysis/${id}`, {
    method: 'DELETE'
  })
};

// Health trends API
export const healthTrendsAPI = {
  getHealthTrends: () => apiRequest('/health-trends'),
  createHealthTrend: (trend: any) => apiRequest('/health-trends', {
    method: 'POST',
    body: JSON.stringify(trend)
  }),
  updateHealthTrend: (id: string, updates: any) => apiRequest(`/health-trends/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteHealthTrend: (id: string) => apiRequest(`/health-trends/${id}`, {
    method: 'DELETE'
  })
};

// Family members API
export const familyAPI = {
  getFamilyMembers: (userId?: string) => apiRequest('/family-members', { 
    headers: { 'user-id': userId || '' } 
  }),
  getFamilyMember: (id: string) => apiRequest(`/family-members/${id}`),
  createFamilyMember: (member: any) => apiRequest('/family-members', {
    method: 'POST',
    body: JSON.stringify(member)
  }),
  updateFamilyMember: (id: string, updates: any) => apiRequest(`/family-members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteFamilyMember: (id: string) => apiRequest(`/family-members/${id}`, {
    method: 'DELETE'
  })
};

// Prescriptions API
export const prescriptionAPI = {
  getPrescriptions: (userId?: string) => apiRequest('/prescriptions', { 
    headers: { 'user-id': userId || '' } 
  }),
  getPrescription: (id: string) => apiRequest(`/prescriptions/${id}`),
  createPrescription: (prescription: any) => apiRequest('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescription)
  }),
  updatePrescription: (id: string, updates: any) => apiRequest(`/prescriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deletePrescription: (id: string) => apiRequest(`/prescriptions/${id}`, {
    method: 'DELETE'
  })
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats')
};

// User API
export const userAPI = {
  getUser: (id: string) => apiRequest(`/users/${id}`),
  createUser: (user: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }),
  updateUser: (id: string, updates: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteUser: (id: string) => apiRequest(`/users/${id}`, {
    method: 'DELETE'
  })
};

// Export all APIs
export const api = {
  medications: medicationAPI,
  doses: doseAPI,
  reports: reportAPI,
  metrics: metricsAPI,
  family: familyAPI,
  prescriptions: prescriptionAPI,
  dashboard: dashboardAPI,
  users: userAPI,
  healthMetrics: metricsAPI,
  diseaseAnalysis: diseaseAnalysisAPI,
  healthTrends: healthTrendsAPI
};
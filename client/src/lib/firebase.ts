import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

// Completely disable Firebase for demo mode
const FIREBASE_ENABLED = false;

// Mock Firebase config (not used when disabled)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-DEMO",
  databaseURL: "https://demo-project-default-rtdb.firebaseio.com"
};

// Initialize Firebase services with comprehensive mock fallbacks
let app, auth, db, storage, realtimeDb;

if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    realtimeDb = getDatabase(app);
  } catch (error) {
    console.warn('Firebase initialization failed, using demo mode:', error);
    createMockServices();
  }
} else {
  console.log('Firebase disabled, using demo mode');
  createMockServices();
}

function createMockServices() {
  // Create comprehensive mock services for demo mode
  auth = { 
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
    signOut: () => Promise.resolve(),
    signInAnonymously: () => Promise.resolve({ user: null }),
    createUserWithEmailAndPassword: () => Promise.resolve({ user: null })
  };
  
  db = { 
    collection: (path: string) => ({ 
      add: (data: any) => Promise.resolve({ id: `demo-${Date.now()}` }), 
      get: () => Promise.resolve({ docs: [] }),
      doc: (id: string) => ({ 
        get: () => Promise.resolve({ data: () => null, exists: false }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
      orderBy: () => ({ get: () => Promise.resolve({ docs: [] }) }),
      limit: () => ({ get: () => Promise.resolve({ docs: [] }) })
    }) 
  };
  
  storage = { 
    ref: (path: string) => ({ 
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('demo-url') } }), 
      getDownloadURL: () => Promise.resolve('demo-url'),
      delete: () => Promise.resolve()
    }) 
  };
  
  realtimeDb = { 
    ref: (path: string) => ({ 
      set: () => Promise.resolve(), 
      get: () => Promise.resolve({ val: () => null }),
      push: () => ({ set: () => Promise.resolve() }),
      child: (path: string) => ({ 
        set: () => Promise.resolve(),
        get: () => Promise.resolve({ val: () => null })
      })
    }) 
  };
}

// Export services
export { auth, db, storage, realtimeDb };

// Enhanced demo users with more comprehensive data
export const DEMO_USERS = {
  'patient@example.com': { 
    password: 'password123', 
    role: 'patient', 
    plan: 'family',
    name: 'John Smith',
    age: 35,
    phone: '+1-555-0123',
    healthMetrics: {
      bloodPressure: { systolic: 145, diastolic: 92 },
      bloodSugar: 98,
      cholesterol: 220,
      bmi: 23.5,
      weight: 75,
      height: 175
    }
  },
  'doctor@example.com': { 
    password: 'password123', 
    role: 'doctor', 
    plan: 'personal',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    phone: '+1-555-0124',
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    }
  },
  'lab@example.com': { 
    password: 'password123', 
    role: 'lab', 
    plan: 'personal',
    name: 'MedLab Diagnostics',
    address: '123 Medical Center Dr',
    phone: '+1-555-0125'
  },
  'patient2@example.com': { 
    password: 'password123', 
    role: 'patient', 
    plan: 'personal',
    name: 'Emily Davis',
    age: 28,
    phone: '+1-555-0126',
    healthMetrics: {
      bloodPressure: { systolic: 120, diastolic: 80 },
      bloodSugar: 85,
      cholesterol: 180,
      bmi: 22.0,
      weight: 60,
      height: 165
    }
  },
  'doctor2@example.com': { 
    password: 'password123', 
    role: 'doctor', 
    plan: 'personal',
    name: 'Dr. Michael Chen',
    specialization: 'Neurology',
    phone: '+1-555-0127',
    availability: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' }
    }
  }
};

// Enhanced demo data for reports with more detailed information
export const DEMO_REPORTS = [
  {
    id: 'report1',
    userId: 'demo-patient-1',
    title: 'Blood Test Results',
    fileURL: 'https://example.com/report1.pdf',
    notes: 'All values within normal range. Cholesterol levels improved.',
    createdAt: new Date('2024-01-15'),
    fileType: 'application/pdf',
    fileSize: 2457600,
    labResults: {
      hemoglobin: { value: 14.2, unit: 'g/dL', normal: '12-16' },
      whiteBloodCells: { value: 7.5, unit: 'K/µL', normal: '4.5-11.0' },
      platelets: { value: 250, unit: 'K/µL', normal: '150-450' },
      glucose: { value: 95, unit: 'mg/dL', normal: '70-100' }
    }
  },
  {
    id: 'report2',
    userId: 'demo-patient-1',
    title: 'X-Ray Chest',
    fileURL: 'https://example.com/report2.pdf',
    notes: 'No abnormalities detected. Clear lung fields.',
    createdAt: new Date('2024-01-10'),
    fileType: 'application/pdf',
    fileSize: 3145728,
    labResults: {
      findings: 'Normal chest X-ray',
      impression: 'No acute cardiopulmonary abnormality'
    }
  },
  {
    id: 'report3',
    userId: 'demo-patient-1',
    title: 'ECG Report',
    fileURL: 'https://example.com/report3.pdf',
    notes: 'Normal sinus rhythm. No signs of arrhythmia.',
    createdAt: new Date('2024-01-12'),
    fileType: 'application/pdf',
    fileSize: 2097152,
    labResults: {
      heartRate: { value: 72, unit: 'bpm', normal: '60-100' },
      rhythm: 'Normal sinus rhythm',
      qtInterval: { value: 420, unit: 'ms', normal: '350-450' }
    }
  },
  {
    id: 'report4',
    userId: 'demo-patient-1',
    title: 'MRI Brain Scan',
    fileURL: 'https://example.com/report4.pdf',
    notes: 'Normal brain structure. No lesions detected.',
    createdAt: new Date('2024-01-08'),
    fileType: 'application/pdf',
    fileSize: 5242880,
    labResults: {
      findings: 'Normal brain MRI',
      impression: 'No intracranial abnormality'
    }
  },
  {
    id: 'report5',
    userId: 'demo-patient-2',
    title: 'Urine Analysis',
    fileURL: 'https://example.com/report5.pdf',
    notes: 'Normal composition. No infection detected.',
    createdAt: new Date('2024-01-14'),
    fileType: 'application/pdf',
    fileSize: 1048576,
    labResults: {
      ph: { value: 6.5, normal: '4.5-8.0' },
      specificGravity: { value: 1.020, normal: '1.005-1.030' },
      protein: 'Negative',
      glucose: 'Negative'
    }
  }
];

// Enhanced demo data for appointments with real-time status
export const DEMO_APPOINTMENTS = [
  {
    id: 'apt1',
    patientId: 'demo-patient-1',
    doctorId: 'demo-doctor-1',
    purpose: 'Regular Checkup',
    dateTime: new Date('2024-01-20T10:00:00'),
    status: 'confirmed',
    notes: 'Annual physical examination',
    doctorName: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    duration: 30,
    location: 'Medical Center Building A, Room 201'
  },
  {
    id: 'apt2',
    patientId: 'demo-patient-2',
    doctorId: 'demo-doctor-1',
    purpose: 'Follow-up Consultation',
    dateTime: new Date('2024-01-22T14:30:00'),
    status: 'scheduled',
    notes: 'Review blood pressure medication',
    doctorName: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    duration: 45,
    location: 'Medical Center Building A, Room 201'
  },
  {
    id: 'apt3',
    patientId: 'demo-patient-1',
    doctorId: 'demo-doctor-2',
    purpose: 'Specialist Consultation',
    dateTime: new Date('2024-01-25T09:15:00'),
    status: 'confirmed',
    notes: 'Neurology consultation for headaches',
    doctorName: 'Dr. Michael Chen',
    specialization: 'Neurology',
    duration: 60,
    location: 'Medical Center Building B, Room 305'
  },
  {
    id: 'apt4',
    patientId: 'demo-patient-1',
    doctorId: 'demo-doctor-1',
    purpose: 'Cardiology Review',
    dateTime: new Date('2024-01-28T11:00:00'),
    status: 'scheduled',
    notes: 'Review ECG results',
    doctorName: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    duration: 30,
    location: 'Medical Center Building A, Room 201'
  }
];

// Enhanced demo data for doses with more detailed tracking
export const DEMO_DOSES = [
  {
    id: 'dose1',
    userId: 'demo-patient-1',
    memberName: 'Self',
    doseName: 'Lisinopril 10mg',
    time: '08:00',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    medicationType: 'tablet',
    dosage: '10mg',
    frequency: 'daily',
    instructions: 'Take with food',
    sideEffects: ['dizziness', 'dry cough'],
    refillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'dose2',
    userId: 'demo-patient-1',
    memberName: 'Self',
    doseName: 'Vitamin D 1000IU',
    time: '12:00',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    medicationType: 'tablet',
    dosage: '1000IU',
    frequency: 'daily',
    instructions: 'Take with meal',
    sideEffects: [],
    refillDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'dose3',
    userId: 'demo-patient-1',
    memberName: 'Self',
    doseName: 'Omega-3 1000mg',
    time: '18:00',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    medicationType: 'capsule',
    dosage: '1000mg',
    frequency: 'daily',
    instructions: 'Take with dinner',
    sideEffects: ['fishy aftertaste'],
    refillDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'dose4',
    userId: 'demo-patient-1',
    memberName: 'Sarah Smith',
    doseName: 'Metformin 500mg',
    time: '07:00',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    medicationType: 'tablet',
    dosage: '500mg',
    frequency: 'twice daily',
    instructions: 'Take with breakfast and dinner',
    sideEffects: ['nausea', 'diarrhea'],
    refillDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'dose5',
    userId: 'demo-patient-1',
    memberName: 'Self',
    doseName: 'Aspirin 100mg',
    time: '19:00',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    medicationType: 'tablet',
    dosage: '100mg',
    frequency: 'daily',
    instructions: 'Take after dinner',
    sideEffects: ['stomach upset'],
    refillDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

// Enhanced demo data for prescriptions
export const DEMO_PRESCRIPTIONS = [
  {
    id: 'pres1',
    doctorId: 'demo-doctor-1',
    patientId: 'demo-patient-1',
    diagnosis: 'Hypertension',
    medication: 'Lisinopril 10mg daily',
    notes: 'Take in the morning with food. Monitor blood pressure weekly.',
    prescribedDate: new Date('2024-01-01'),
    refills: 3,
    status: 'active',
    sideEffects: ['dizziness', 'dry cough', 'fatigue'],
    interactions: ['NSAIDs', 'lithium'],
    monitoring: ['blood pressure', 'kidney function']
  },
  {
    id: 'pres2',
    doctorId: 'demo-doctor-1',
    patientId: 'demo-patient-2',
    diagnosis: 'Type 2 Diabetes',
    medication: 'Metformin 500mg twice daily',
    notes: 'Monitor blood sugar levels. Take with meals.',
    prescribedDate: new Date('2024-01-05'),
    refills: 2,
    status: 'active',
    sideEffects: ['nausea', 'diarrhea', 'loss of appetite'],
    interactions: ['alcohol', 'certain antibiotics'],
    monitoring: ['blood sugar', 'kidney function']
  },
  {
    id: 'pres3',
    doctorId: 'demo-doctor-2',
    patientId: 'demo-patient-1',
    diagnosis: 'Migraine',
    medication: 'Sumatriptan 50mg as needed',
    notes: 'Take at onset of migraine symptoms. Maximum 2 tablets per day.',
    prescribedDate: new Date('2024-01-10'),
    refills: 1,
    status: 'active',
    sideEffects: ['dizziness', 'nausea', 'chest tightness'],
    interactions: ['SSRIs', 'MAOIs'],
    monitoring: ['heart rate', 'blood pressure']
  }
];

// Demo notifications for real-time updates
export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif1',
    userId: 'demo-patient-1',
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: 'high'
  },
  {
    id: 'notif2',
    userId: 'demo-patient-1',
    type: 'dose_reminder',
    title: 'Medication Reminder',
    message: 'Time to take your Lisinopril 10mg',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    priority: 'medium'
  },
  {
    id: 'notif3',
    userId: 'demo-patient-1',
    type: 'health_alert',
    title: 'Health Alert',
    message: 'Your blood pressure reading is elevated. Consider scheduling a checkup.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: 'high'
  },
  {
    id: 'notif4',
    userId: 'demo-patient-1',
    type: 'report_ready',
    title: 'Lab Report Ready',
    message: 'Your blood test results are now available for review.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    priority: 'medium'
  }
];

// Demo health metrics for real-time tracking
export const DEMO_HEALTH_METRICS = {
  'demo-patient-1': {
    bloodPressure: [
      { date: '2024-01-01', systolic: 140, diastolic: 90 },
      { date: '2024-01-08', systolic: 145, diastolic: 92 },
      { date: '2024-01-15', systolic: 142, diastolic: 88 }
    ],
    bloodSugar: [
      { date: '2024-01-01', value: 95 },
      { date: '2024-01-08', value: 98 },
      { date: '2024-01-15', value: 96 }
    ],
    weight: [
      { date: '2024-01-01', value: 75.2 },
      { date: '2024-01-08', value: 75.0 },
      { date: '2024-01-15', value: 74.8 }
    ],
    steps: [
      { date: '2024-01-15', value: 8500 },
      { date: '2024-01-14', value: 7200 },
      { date: '2024-01-13', value: 9100 }
    ],
    sleep: [
      { date: '2024-01-15', hours: 7.5, quality: 'good' },
      { date: '2024-01-14', hours: 6.8, quality: 'fair' },
      { date: '2024-01-13', hours: 8.2, quality: 'excellent' }
    ]
  }
};



// Sample report analysis data with enhanced details
const sampleReportAnalysis = {
  parameters: {
    'Hemoglobin': {
      value: 14.2,
      unit: 'g/dL',
      normalRange: '12-16',
      status: 'normal',
      previousValue: 13.8,
      change: 2.9,
      significance: 'minimal'
    },
    'White Blood Cells': {
      value: 7.5,
      unit: 'K/µL',
      normalRange: '4.5-11.0',
      status: 'normal',
      previousValue: 7.2,
      change: 4.2,
      significance: 'minimal'
    },
    'Platelets': {
      value: 250,
      unit: 'K/µL',
      normalRange: '150-450',
      status: 'normal',
      previousValue: 245,
      change: 2.0,
      significance: 'minimal'
    },
    'Glucose': {
      value: 95,
      unit: 'mg/dL',
      normalRange: '70-100',
      status: 'normal',
      previousValue: 92,
      change: 3.3,
      significance: 'minimal'
    },
    'Cholesterol': {
      value: 220,
      unit: 'mg/dL',
      normalRange: '<200',
      status: 'high',
      previousValue: 215,
      change: 2.3,
      significance: 'moderate'
    },
    'Blood Pressure': {
      value: 145,
      unit: 'mmHg',
      normalRange: '<140',
      status: 'high',
      previousValue: 142,
      change: 2.1,
      significance: 'moderate'
    },
    'Creatinine': {
      value: 1.8,
      unit: 'mg/dL',
      normalRange: '0.6-1.2',
      status: 'critical',
      previousValue: 1.6,
      change: 12.5,
      significance: 'significant'
    }
  },
  summary: {
    normalCount: 4,
    abnormalCount: 2,
    criticalCount: 1,
    overallStatus: 'critical',
    riskLevel: 'high',
    recommendations: []
  },
  metadata: {
    labName: 'City Medical Lab',
    doctorName: 'Dr. Sarah Johnson',
    testDate: '2024-01-15',
    reportNumber: 'LAB-2024-001'
  }
};

// Sample medication schedules with detailed information
const sampleMedications = [
  {
    medicineName: 'Lisinopril',
    dosage: '1 tablet',
    doseStrength: '10mg',
    doseForm: 'tablet',
    frequency: 'daily',
    times: ['08:00'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    instructions: 'Take with food in the morning',
    sideEffects: ['dizziness', 'dry cough'],
    administrationMethod: 'oral',
    specialInstructions: 'Avoid salt substitutes containing potassium',
    isRunning: true,
    totalDoses: 30,
    takenDoses: 28,
    adherenceRate: 93.3,
    lastTaken: '2024-01-15T08:00:00Z',
    nextDose: '2024-01-16T08:00:00Z',
    status: 'active'
  },
  {
    medicineName: 'Metformin',
    dosage: '1 tablet',
    doseStrength: '500mg',
    doseForm: 'tablet',
    frequency: 'twiceDaily',
    times: ['08:00', '20:00'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    instructions: 'Take with meals to reduce stomach upset',
    sideEffects: ['nausea', 'diarrhea', 'loss of appetite'],
    administrationMethod: 'oral',
    specialInstructions: 'Take with food, avoid alcohol',
    isRunning: true,
    totalDoses: 60,
    takenDoses: 55,
    adherenceRate: 91.7,
    lastTaken: '2024-01-15T20:00:00Z',
    nextDose: '2024-01-16T08:00:00Z',
    status: 'active'
  },
  {
    medicineName: 'Vitamin D',
    dosage: '1 capsule',
    doseStrength: '1000IU',
    doseForm: 'capsule',
    frequency: 'daily',
    times: ['12:00'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    instructions: 'Take with meal for better absorption',
    sideEffects: [],
    administrationMethod: 'oral',
    specialInstructions: 'Take with fatty meal for better absorption',
    isRunning: true,
    totalDoses: 30,
    takenDoses: 30,
    adherenceRate: 100,
    lastTaken: '2024-01-15T12:00:00Z',
    nextDose: '2024-01-16T12:00:00Z',
    status: 'active'
  },
  {
    medicineName: 'Albuterol',
    dosage: '2 puffs',
    doseStrength: '90mcg',
    doseForm: 'inhaler',
    frequency: 'asNeeded',
    times: ['06:00', '14:00', '22:00'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    instructions: 'Use as needed for shortness of breath',
    sideEffects: ['tremors', 'increased heart rate'],
    administrationMethod: 'inhalation',
    specialInstructions: 'Shake well before use, wait 1 minute between puffs',
    isRunning: true,
    totalDoses: 90,
    takenDoses: 45,
    adherenceRate: 50,
    lastTaken: '2024-01-15T14:00:00Z',
    nextDose: '2024-01-15T22:00:00Z',
    status: 'active'
  },
  {
    medicineName: 'Aspirin',
    dosage: '1 tablet',
    doseStrength: '81mg',
    doseForm: 'tablet',
    frequency: 'daily',
    times: ['07:00'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    instructions: 'Take in the morning with water',
    sideEffects: ['stomach upset', 'bruising'],
    administrationMethod: 'oral',
    specialInstructions: 'Take with food to prevent stomach upset',
    isRunning: true,
    totalDoses: 30,
    takenDoses: 29,
    adherenceRate: 96.7,
    lastTaken: '2024-01-15T07:00:00Z',
    nextDose: '2024-01-16T07:00:00Z',
    status: 'active'
  }
];

// Sample reports with enhanced metadata
const sampleReports = [
  {
    title: 'Blood Test Results - January 2024',
    reportType: 'bloodTest',
    fileUrl: 'https://example.com/report1.pdf',
    analysis: sampleReportAnalysis,
    validTill: 3, // months
    source: 'demo',
    labName: 'City Medical Lab',
    doctorName: 'Dr. Sarah Johnson',
    uploadedAt: new Date('2024-01-15'),
    reminderNeeded: true,
    status: 'active',
    fileSize: '2.4 MB',
    fileType: 'PDF'
  },
  {
    title: 'X-Ray Chest - December 2023',
    reportType: 'xray',
    fileUrl: 'https://example.com/report2.pdf',
    validTill: 6, // months
    source: 'demo',
    labName: 'City Medical Lab',
    doctorName: 'Dr. Michael Chen',
    uploadedAt: new Date('2023-12-20'),
    reminderNeeded: false,
    status: 'active',
    fileSize: '3.1 MB',
    fileType: 'PDF'
  },
  {
    title: 'ECG Report - November 2023',
    reportType: 'ecg',
    fileUrl: 'https://example.com/report3.pdf',
    validTill: 12, // months
    source: 'demo',
    labName: 'City Medical Lab',
    doctorName: 'Dr. Emily Davis',
    uploadedAt: new Date('2023-11-15'),
    reminderNeeded: false,
    status: 'active',
    fileSize: '2.1 MB',
    fileType: 'PDF'
  },
  {
    title: 'Urine Analysis - January 2024',
    reportType: 'urineTest',
    fileUrl: 'https://example.com/report4.pdf',
    analysis: {
      parameters: {
        'pH': {
          value: 6.5,
          unit: '',
          normalRange: '4.5-8.0',
          status: 'normal'
        },
        'Specific Gravity': {
          value: 1.020,
          unit: '',
          normalRange: '1.005-1.030',
          status: 'normal'
        },
        'Protein': {
          value: 0,
          unit: 'mg/dL',
          normalRange: '0-20',
          status: 'normal'
        },
        'Glucose': {
          value: 0,
          unit: 'mg/dL',
          normalRange: '0-15',
          status: 'normal'
        },
        'Ketones': {
          value: 0,
          unit: 'mg/dL',
          normalRange: '0-5',
          status: 'normal'
        }
      },
      summary: {
        normalCount: 5,
        abnormalCount: 0,
        criticalCount: 0,
        overallStatus: 'healthy',
        riskLevel: 'low',
        recommendations: ['All parameters within normal range']
      }
    },
    validTill: 3,
    source: 'demo',
    labName: 'City Medical Lab',
    doctorName: 'Dr. Sarah Johnson',
    uploadedAt: new Date('2024-01-10'),
    reminderNeeded: true,
    status: 'active',
    fileSize: '1.0 MB',
    fileType: 'PDF'
  },
  {
    title: 'MRI Brain Scan - October 2023',
    reportType: 'mri',
    fileUrl: 'https://example.com/report5.pdf',
    validTill: 24, // months
    source: 'demo',
    labName: 'Advanced Imaging Center',
    doctorName: 'Dr. Robert Wilson',
    uploadedAt: new Date('2023-10-05'),
    reminderNeeded: false,
    status: 'active',
    fileSize: '5.2 MB',
    fileType: 'PDF'
  }
];

// Sample prescriptions for the new format
const samplePrescriptions = [
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

// Sample appointments
const sampleAppointments = [
  {
    patientId: 'demo-patient-id',
    doctorId: 'demo-doctor-1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    dateTime: new Date('2024-01-20T10:00:00Z'),
    purpose: 'Follow-up consultation',
    status: 'confirmed',
    location: 'City Medical Center',
    room: 'Room 205',
    notes: 'Discuss blood pressure management and medication adjustments',
    type: 'in-person',
    duration: 30
  },
  {
    patientId: 'demo-patient-id',
    doctorId: 'demo-doctor-2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Endocrinology',
    dateTime: new Date('2024-01-25T14:30:00Z'),
    purpose: 'Diabetes management review',
    status: 'scheduled',
    location: 'City Medical Center',
    room: 'Room 312',
    notes: 'Review blood sugar levels and medication effectiveness',
    type: 'in-person',
    duration: 45
  },
  {
    patientId: 'demo-patient-id',
    doctorId: 'demo-doctor-3',
    doctorName: 'Dr. Emily Davis',
    specialty: 'Pulmonology',
    dateTime: new Date('2024-02-01T09:00:00Z'),
    purpose: 'Asthma check-up',
    status: 'scheduled',
    location: 'City Medical Center',
    room: 'Room 118',
    notes: 'Check asthma control and inhaler technique',
    type: 'in-person',
    duration: 30
  },
  {
    patientId: 'demo-patient-id',
    doctorId: 'demo-doctor-1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    dateTime: new Date('2024-02-10T11:00:00Z'),
    purpose: 'Telemedicine consultation',
    status: 'scheduled',
    location: 'Virtual',
    room: 'Online',
    notes: 'Remote follow-up for medication review',
    type: 'virtual',
    duration: 20
  }
];

// Sample family members with Indian names and comprehensive data
const sampleFamilyMembers = [
  {
    name: 'Priya Sharma',
    relationship: 'Spouse',
    age: 42,
    gender: 'Female',
    contactNumber: '+91-98765-43210',
    emergencyContact: true,
    bloodType: 'O+',
    allergies: ['Penicillin', 'Dairy'],
    medicalConditions: ['Hypertension', 'Diabetes Type 2'],
    medications: ['Metformin', 'Amlodipine', 'Vitamin D'],
    lastCheckup: new Date('2024-01-15'),
    nextCheckup: new Date('2024-07-15'),
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    height: 165,
    weight: 68,
    bmi: 24.9,
    occupation: 'Software Engineer',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'STAR-2024-001',
    emergencyContactName: 'Rajesh Sharma',
    emergencyContactPhone: '+91-98765-43211',
    address: '123 Green Park, New Delhi, Delhi 110016',
    preferredHospital: 'Apollo Hospital',
    preferredDoctor: 'Dr. Meera Patel',
    dietaryRestrictions: ['Vegetarian', 'Low Salt'],
    exerciseRoutine: 'Yoga 3 times/week, Walking daily',
    sleepPattern: '7-8 hours daily',
    stressLevel: 'Moderate',
    familyHistory: ['Diabetes', 'Heart Disease'],
    vaccinationHistory: ['COVID-19', 'Flu', 'Hepatitis B'],
    lastDentalCheckup: new Date('2023-12-10'),
    nextDentalCheckup: new Date('2024-06-10'),
    visionTest: '20/20',
    hearingTest: 'Normal',
    mentalHealthStatus: 'Good',
    lifestyleFactors: ['Regular Exercise', 'Balanced Diet', 'Stress Management']
  },
  {
    name: 'Arjun Sharma',
    relationship: 'Son',
    age: 19,
    gender: 'Male',
    contactNumber: '+91-98765-43212',
    emergencyContact: false,
    bloodType: 'A+',
    allergies: ['Peanuts', 'Shellfish'],
    medicalConditions: ['Asthma', 'Seasonal Allergies'],
    medications: ['Albuterol', 'Cetirizine'],
    lastCheckup: new Date('2023-12-20'),
    nextCheckup: new Date('2024-06-20'),
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    height: 178,
    weight: 72,
    bmi: 22.7,
    occupation: 'College Student',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'STAR-2024-002',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91-98765-43210',
    address: '123 Green Park, New Delhi, Delhi 110016',
    preferredHospital: 'Fortis Hospital',
    preferredDoctor: 'Dr. Amit Kumar',
    dietaryRestrictions: ['Vegetarian'],
    exerciseRoutine: 'Cricket practice, Gym 4 times/week',
    sleepPattern: '6-7 hours daily',
    stressLevel: 'Low',
    familyHistory: ['Asthma'],
    vaccinationHistory: ['COVID-19', 'Flu', 'MMR'],
    lastDentalCheckup: new Date('2023-11-15'),
    nextDentalCheckup: new Date('2024-05-15'),
    visionTest: '20/25',
    hearingTest: 'Normal',
    mentalHealthStatus: 'Excellent',
    lifestyleFactors: ['Sports', 'Regular Exercise', 'Good Sleep']
  },
  {
    name: 'Ananya Sharma',
    relationship: 'Daughter',
    age: 16,
    gender: 'Female',
    contactNumber: '+91-98765-43213',
    emergencyContact: false,
    bloodType: 'B+',
    allergies: ['Dust Mites'],
    medicalConditions: ['Eczema'],
    medications: ['Hydrocortisone Cream'],
    lastCheckup: new Date('2024-01-10'),
    nextCheckup: new Date('2024-07-10'),
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    height: 162,
    weight: 55,
    bmi: 21.0,
    occupation: 'High School Student',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'STAR-2024-003',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91-98765-43210',
    address: '123 Green Park, New Delhi, Delhi 110016',
    preferredHospital: 'Max Hospital',
    preferredDoctor: 'Dr. Sunita Reddy',
    dietaryRestrictions: ['Vegetarian', 'Gluten Free'],
    exerciseRoutine: 'Dance classes, Yoga',
    sleepPattern: '8-9 hours daily',
    stressLevel: 'Low',
    familyHistory: ['Eczema'],
    vaccinationHistory: ['COVID-19', 'Flu', 'HPV'],
    lastDentalCheckup: new Date('2023-10-20'),
    nextDentalCheckup: new Date('2024-04-20'),
    visionTest: '20/20',
    hearingTest: 'Normal',
    mentalHealthStatus: 'Good',
    lifestyleFactors: ['Dance', 'Yoga', 'Healthy Diet']
  },
  {
    name: 'Rajesh Sharma',
    relationship: 'Father',
    age: 68,
    gender: 'Male',
    contactNumber: '+91-98765-43214',
    emergencyContact: true,
    bloodType: 'AB+',
    allergies: ['Sulfa Drugs'],
    medicalConditions: ['Hypertension', 'Arthritis', 'Prostate Issues'],
    medications: ['Lisinopril', 'Ibuprofen', 'Tamsulosin'],
    lastCheckup: new Date('2024-01-05'),
    nextCheckup: new Date('2024-04-05'),
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    height: 170,
    weight: 75,
    bmi: 26.0,
    occupation: 'Retired Bank Manager',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'STAR-2024-004',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91-98765-43210',
    address: '123 Green Park, New Delhi, Delhi 110016',
    preferredHospital: 'AIIMS Delhi',
    preferredDoctor: 'Dr. Rajesh Kumar',
    dietaryRestrictions: ['Low Salt', 'Low Fat'],
    exerciseRoutine: 'Morning walk, Light yoga',
    sleepPattern: '6-7 hours daily',
    stressLevel: 'Low',
    familyHistory: ['Heart Disease', 'Diabetes', 'Arthritis'],
    vaccinationHistory: ['COVID-19', 'Flu', 'Pneumonia', 'Shingles'],
    lastDentalCheckup: new Date('2023-09-15'),
    nextDentalCheckup: new Date('2024-03-15'),
    visionTest: '20/40',
    hearingTest: 'Mild hearing loss',
    mentalHealthStatus: 'Good',
    lifestyleFactors: ['Retirement', 'Regular Checkups', 'Meditation']
  },
  {
    name: 'Lakshmi Sharma',
    relationship: 'Mother',
    age: 65,
    gender: 'Female',
    contactNumber: '+91-98765-43215',
    emergencyContact: false,
    bloodType: 'O-',
    allergies: ['Latex'],
    medicalConditions: ['Diabetes Type 2', 'Osteoporosis'],
    medications: ['Metformin', 'Calcium', 'Vitamin D'],
    lastCheckup: new Date('2024-01-12'),
    nextCheckup: new Date('2024-04-12'),
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    height: 158,
    weight: 62,
    bmi: 24.8,
    occupation: 'Retired Teacher',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'STAR-2024-005',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91-98765-43210',
    address: '123 Green Park, New Delhi, Delhi 110016',
    preferredHospital: 'Safdarjung Hospital',
    preferredDoctor: 'Dr. Meera Singh',
    dietaryRestrictions: ['Vegetarian', 'Low Sugar'],
    exerciseRoutine: 'Morning walk, Light exercises',
    sleepPattern: '7-8 hours daily',
    stressLevel: 'Low',
    familyHistory: ['Diabetes', 'Osteoporosis'],
    vaccinationHistory: ['COVID-19', 'Flu', 'Pneumonia'],
    lastDentalCheckup: new Date('2023-08-25'),
    nextDentalCheckup: new Date('2024-02-25'),
    visionTest: '20/30',
    hearingTest: 'Normal',
    mentalHealthStatus: 'Good',
    lifestyleFactors: ['Retirement', 'Cooking', 'Gardening']
  },
  {
    name: 'Vikram Sharma',
    relationship: 'Brother',
    age: 38,
    gender: 'Male',
    contactNumber: '+91-98765-43216',
    emergencyContact: false,
    bloodType: 'A+',
    allergies: ['Pollen'],
    medicalConditions: ['Migraine'],
    medications: ['Sumatriptan'],
    lastCheckup: new Date('2023-11-30'),
    nextCheckup: new Date('2024-05-30'),
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    height: 175,
    weight: 78,
    bmi: 25.5,
    occupation: 'Business Analyst',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'STAR-2024-006',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91-98765-43210',
    address: '456 Defence Colony, New Delhi, Delhi 110024',
    preferredHospital: 'BLK Hospital',
    preferredDoctor: 'Dr. Anil Gupta',
    dietaryRestrictions: ['Vegetarian'],
    exerciseRoutine: 'Gym 3 times/week, Swimming',
    sleepPattern: '6-7 hours daily',
    stressLevel: 'Moderate',
    familyHistory: ['Migraine'],
    vaccinationHistory: ['COVID-19', 'Flu'],
    lastDentalCheckup: new Date('2023-12-05'),
    nextDentalCheckup: new Date('2024-06-05'),
    visionTest: '20/25',
    hearingTest: 'Normal',
    mentalHealthStatus: 'Good',
    lifestyleFactors: ['Regular Exercise', 'Stress Management', 'Good Diet']
  }
];

// Sample health metrics
const sampleHealthMetrics = [
  {
    date: new Date('2024-01-15'),
    bloodPressure: { systolic: 145, diastolic: 90 },
    heartRate: 72,
    weight: 75.5,
    bloodSugar: 95,
    temperature: 98.6,
    notes: 'Feeling good today',
    type: 'daily_checkup'
  },
  {
    date: new Date('2024-01-14'),
    bloodPressure: { systolic: 142, diastolic: 88 },
    heartRate: 70,
    weight: 75.3,
    bloodSugar: 92,
    temperature: 98.4,
    notes: 'Slight headache in the morning',
    type: 'daily_checkup'
  },
  {
    date: new Date('2024-01-13'),
    bloodPressure: { systolic: 148, diastolic: 92 },
    heartRate: 75,
    weight: 75.7,
    bloodSugar: 98,
    temperature: 98.8,
    notes: 'Stressful day at work',
    type: 'daily_checkup'
  },
  {
    date: new Date('2024-01-12'),
    bloodPressure: { systolic: 140, diastolic: 85 },
    heartRate: 68,
    weight: 75.2,
    bloodSugar: 90,
    temperature: 98.2,
    notes: 'Good sleep last night',
    type: 'daily_checkup'
  },
  {
    date: new Date('2024-01-11'),
    bloodPressure: { systolic: 143, diastolic: 89 },
    heartRate: 71,
    weight: 75.4,
    bloodSugar: 94,
    temperature: 98.5,
    notes: 'Regular exercise routine',
    type: 'daily_checkup'
  }
];

// Sample dose tracking data
const sampleDoseTracking = [
  {
    medicationId: 'lisinopril-1',
    medicationName: 'Lisinopril',
    dosage: '1 tablet',
    doseStrength: '10mg',
    doseForm: 'tablet',
    administrationMethod: 'oral',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T08:00:00.000Z',
    status: 'pending',
    instructions: 'Take with breakfast',
    notes: 'Taken with breakfast',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    medicationId: 'metformin-1',
    medicationName: 'Metformin',
    dosage: '1 tablet',
    doseStrength: '500mg',
    doseForm: 'tablet',
    administrationMethod: 'oral',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T08:00:00.000Z',
    status: 'taken',
    instructions: 'Take with breakfast',
    notes: 'Taken with breakfast',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    medicationId: 'metformin-2',
    medicationName: 'Metformin',
    dosage: '1 tablet',
    doseStrength: '500mg',
    doseForm: 'tablet',
    administrationMethod: 'oral',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T20:00:00.000Z',
    status: 'pending',
    instructions: 'Take with dinner',
    notes: 'Taken with dinner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    medicationId: 'vitamin-d-1',
    medicationName: 'Vitamin D',
    dosage: '1 capsule',
    doseStrength: '1000IU',
    doseForm: 'capsule',
    administrationMethod: 'oral',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z',
    status: 'taken',
    instructions: 'Take with lunch',
    notes: 'Taken with lunch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    medicationId: 'aspirin-1',
    medicationName: 'Aspirin',
    dosage: '1 tablet',
    doseStrength: '81mg',
    doseForm: 'tablet',
    administrationMethod: 'oral',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T07:00:00.000Z',
    status: 'taken',
    instructions: 'Take with water',
    notes: 'Taken with water',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Doctor-specific demo data
const doctorPatients = [
  {
    id: 'demo-patient-1',
    name: 'John Smith',
    age: 35,
    gender: 'Male',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    lastVisit: new Date('2024-01-15'),
    nextAppointment: new Date('2024-01-20T10:00:00Z'),
    conditions: ['Hypertension', 'Diabetes'],
    medications: ['Lisinopril', 'Metformin'],
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'demo-patient-2',
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    email: 'emily.davis@example.com',
    phone: '+1-555-0124',
    lastVisit: new Date('2024-01-10'),
    nextAppointment: new Date('2024-01-25T14:30:00Z'),
    conditions: ['Asthma'],
    medications: ['Albuterol'],
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'demo-patient-3',
    name: 'Robert Wilson',
    age: 65,
    gender: 'Male',
    email: 'robert.wilson@example.com',
    phone: '+1-555-0125',
    lastVisit: new Date('2024-01-08'),
    nextAppointment: new Date('2024-02-01T09:00:00Z'),
    conditions: ['Heart Disease', 'High Cholesterol'],
    medications: ['Aspirin', 'Atorvastatin'],
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
];

// Lab-specific demo data
const labReports = [
  {
    id: 'lab-report-1',
    patientName: 'John Smith',
    patientId: 'demo-patient-1',
    testType: 'Blood Test',
    status: 'completed',
    completedAt: new Date('2024-01-15'),
    results: {
      hemoglobin: { value: 14.2, unit: 'g/dL', normal: '12-16' },
      whiteBloodCells: { value: 7.5, unit: 'K/µL', normal: '4.5-11.0' },
      platelets: { value: 250, unit: 'K/µL', normal: '150-450' }
    },
    notes: 'All values within normal range',
    fileSize: '2.4 MB',
    fileType: 'PDF'
  },
  {
    id: 'lab-report-2',
    patientName: 'Emily Davis',
    patientId: 'demo-patient-2',
    testType: 'X-Ray Chest',
    status: 'completed',
    completedAt: new Date('2024-12-15'),
    results: {
      findings: 'Normal chest X-ray',
      impression: 'No acute cardiopulmonary abnormality'
    },
    notes: 'No abnormalities detected',
    fileSize: '3.1 MB',
    fileType: 'PDF'
  },
  {
    id: 'lab-report-3',
    patientName: 'Robert Wilson',
    patientId: 'demo-patient-3',
    testType: 'ECG',
    status: 'in_progress',
    scheduledAt: new Date('2024-01-16'),
    notes: 'Scheduled for tomorrow',
    fileSize: '2.1 MB',
    fileType: 'PDF'
  }
];

// Enhanced demo data generation with role-specific data
export const generateDemoData = async (userId: string, userRole: string, userEmail: string) => {
  try {
    // Validate input parameters
    if (!userId || !userRole || !userEmail) {
      console.error('Invalid parameters for demo data generation:', { userId, userRole, userEmail });
      throw new Error('Invalid parameters for demo data generation');
    }

    console.log(`Generating demo data for ${userRole} user: ${userEmail}`);

    // Generate data based on user role using localStorage instead of Firebase
    let result;
    switch (userRole) {
      case 'patient':
        result = await generatePatientDemoDataLocal(userId);
        break;
      case 'doctor':
        result = await generateDoctorDemoDataLocal(userId, userEmail);
        break;
      case 'lab':
        result = await generateLabDemoDataLocal(userId, userEmail);
        break;
      default:
        console.log('Unknown user role, skipping demo data generation');
        return null;
    }

    console.log('Demo data generated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error generating demo data:', error);
    // Don't throw error, just log it and continue
    console.log('Continuing without demo data generation');
    return null;
  }
};

// Add missing demo data generation functions
export const generateMedicationsDemoData = (userId: string, familyMembers: any[] = []) => {
  console.log('Generating medications demo data for user:', userId);
  
  const medications = sampleMedications.map((med, index) => {
    // Assign some medications to family members if available
    const familyMemberId = familyMembers.length > 0 && index < familyMembers.length 
      ? familyMembers[index].id 
      : null;
    
    return {
      ...med,
      id: `med_${index + 1}`,
      userId: userId,
      familyMemberId: familyMemberId
    };
  });

  console.log('Generated medications:', medications);
  localStorage.setItem('mock_medications', JSON.stringify(medications));
  console.log('Medications stored in localStorage');
  return medications;
};

export const generateDoseRecordsDemoData = (userId: string, familyMembers: any[] = []) => {
  console.log('Generating dose records demo data for user:', userId);
  
  const doseRecords = sampleDoseTracking.map((record, index) => {
    // Assign some dose records to family members if available
    const familyMemberId = familyMembers.length > 0 && index < familyMembers.length 
      ? familyMembers[index].id 
      : null;
    
    return {
      ...record,
      id: `dose_${index + 1}`,
      userId: userId,
      familyMemberId: familyMemberId
    };
  });

  console.log('Generated dose records:', doseRecords);
  localStorage.setItem('mock_dose_records', JSON.stringify(doseRecords));
  console.log('Dose records stored in localStorage');
  return doseRecords;
};

export const generatePrescriptionsDemoData = (userId: string) => {
  console.log('Generating prescriptions demo data for user:', userId);
  
  const prescriptions = samplePrescriptions.map((prescription, index) => ({
    ...prescription,
    id: `pres_${index + 1}`,
    patientId: userId
  }));

  console.log('Generated prescriptions:', prescriptions);
  localStorage.setItem('mock_prescriptions', JSON.stringify(prescriptions));
  console.log('Prescriptions stored in localStorage');
  return prescriptions;
};

export const generateFamilyMembersDemoData = (userId: string) => {
  console.log('=== GENERATE FAMILY MEMBERS DEMO DATA DEBUG ===');
  console.log('Generating family members demo data for user:', userId);
  console.log('User ID type:', typeof userId);
  console.log('User ID value:', userId);
  console.log('Sample family members:', sampleFamilyMembers);
  console.log('Sample family members length:', sampleFamilyMembers.length);
  
  const familyMembers = sampleFamilyMembers.map((member, index) => {
    const mappedMember = {
      ...member,
      id: `family_${index + 1}`,
      userId: userId
    };
    console.log(`Mapped member ${index + 1}:`, mappedMember);
    return mappedMember;
  });

  console.log('Generated family members with user ID:', familyMembers);
  console.log('Generated family members length:', familyMembers.length);
  console.log('Generated family members sample:', familyMembers.slice(0, 2));
  
  console.log('Storing in localStorage with key: mock_family_members');
  localStorage.setItem('mock_family_members', JSON.stringify(familyMembers));
  console.log('Family members stored in localStorage with key: mock_family_members');
  
  // Verify storage
  const stored = localStorage.getItem('mock_family_members');
  console.log('Verification - stored data:', stored);
  console.log('Verification - stored data parsed:', JSON.parse(stored || '[]'));
  console.log('Verification - stored data length:', JSON.parse(stored || '[]').length);
  
  return familyMembers;
};

export const generateReportsDemoData = (userId: string, familyMembers: any[] = []) => {
  console.log('Generating reports demo data for user:', userId);
  
  const reports = sampleReports.map((report, index) => {
    // Assign some reports to family members if available
    const familyMemberId = familyMembers.length > 0 && index < familyMembers.length 
      ? familyMembers[index].id 
      : null;
    
    return {
      ...report,
      id: `report_${index + 1}`,
      userId: userId,
      familyMemberId: familyMemberId
    };
  });

  console.log('Generated reports:', reports);
  localStorage.setItem('mock_reports', JSON.stringify(reports));
  console.log('Reports stored in localStorage');
  return reports;
};

export const generateAppointmentsDemoData = (userId: string) => {
  const familyMembers = JSON.parse(localStorage.getItem('mock_family_members') || '[]');
  
  // Generate appointments for each family member
  const appointments = [];
  
  familyMembers.forEach((member: any) => {
    const memberAppointments = sampleAppointments.map((appointment, index) => ({
      ...appointment,
      id: `appointment-${member.id}-${index}`,
      userId: userId,
      patientId: member.id,
      patientName: member.name,
      patientType: member.relationship,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    appointments.push(...memberAppointments);
  });
  
  // Add some appointments for the main user
  const userAppointments = sampleAppointments.slice(0, 3).map((appointment, index) => ({
    ...appointment,
    id: `appointment-user-${index}`,
    userId: userId,
    patientId: userId,
    patientName: 'You',
    patientType: 'Self',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  appointments.push(...userAppointments);
  
  localStorage.setItem('mock_appointments', JSON.stringify(appointments));
  return appointments;
};

export const generatePatientDemoDataLocal = async (userId: string) => {
  console.log('=== GENERATE PATIENT DEMO DATA LOCAL DEBUG ===');
  console.log('Generating demo data for patient user:', userId);
  console.log('User ID type:', typeof userId);
  console.log('User ID value:', userId);

  try {
    // Generate family members first
    console.log('Calling generateFamilyMembersDemoData...');
    const familyMembers = generateFamilyMembersDemoData(userId);
    console.log('Generated family members result:', familyMembers);
    console.log('Family members length:', familyMembers.length);
    
    // Generate all types of demo data with family members
    console.log('Generating other demo data...');
    const medications = generateMedicationsDemoData(userId, familyMembers);
    const doseRecords = generateDoseRecordsDemoData(userId, familyMembers);
    const prescriptions = generatePrescriptionsDemoData(userId);
    const reports = generateReportsDemoData(userId, familyMembers);
    const appointments = generateAppointmentsDemoData(userId);
    const healthMetrics = generateHealthMetricsDemoData(userId);
    const diseaseAnalysis = generateDiseaseAnalysisDemoData(userId, familyMembers);
    const healthTrends = generateHealthTrendsDemoData(userId);
    const selfReminders = generateSelfRemindersDemoData(userId, medications, doseRecords);
    
    console.log('Demo data stored in localStorage for user:', userId);
    console.log('Medications:', medications.length);
    console.log('Dose Records:', doseRecords.length);
    console.log('Prescriptions:', prescriptions.length);
    console.log('Family Members:', familyMembers.length);
    console.log('Reports:', reports.length);
    console.log('Appointments:', appointments.length);
    console.log('Health Metrics:', healthMetrics.length);
    console.log('Disease Analysis:', diseaseAnalysis.length);
    console.log('Health Trends:', healthTrends.length);
    console.log('Self Reminders:', selfReminders.length);

    // Verify data was stored
    const storedFamilyMembers = localStorage.getItem('mock_family_members');
    console.log('Stored family members in localStorage:', storedFamilyMembers);
    console.log('Stored family members parsed:', JSON.parse(storedFamilyMembers || '[]'));

    return {
      medications,
      doseRecords,
      prescriptions,
      familyMembers,
      reports,
      appointments,
      healthMetrics,
      diseaseAnalysis,
      healthTrends,
      selfReminders
    };
  } catch (error) {
    console.error('Error in generatePatientDemoDataLocal:', error);
    throw error;
  }
};

const generateDoctorDemoDataLocal = async (userId: string, userEmail: string) => {
  // Doctor-specific demo data
  const patients = [
    {
      id: 'patient_1',
      doctorId: userId,
      name: 'John Smith',
      age: 35,
      phone: '+1-555-0123',
      lastVisit: '2025-01-01T00:00:00',
      nextAppointment: '2025-01-20T10:00:00'
    },
    {
      id: 'patient_2',
      doctorId: userId,
      name: 'Sarah Johnson',
      age: 28,
      phone: '+1-555-0124',
      lastVisit: '2024-12-15T00:00:00',
      nextAppointment: '2025-01-25T14:00:00'
    }
  ];

  const appointments = [
    {
      id: 'apt_1',
      doctorId: userId,
      patientId: 'patient_1',
      purpose: 'Regular Checkup',
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      notes: 'Annual physical examination',
      patientName: 'John Smith',
      duration: 30
    },
    {
      id: 'apt_2',
      doctorId: userId,
      patientId: 'patient_2',
      purpose: 'Follow-up',
      dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      notes: 'Follow-up on diabetes management',
      patientName: 'Sarah Johnson',
      duration: 45
    }
  ];

  // Store data directly in the correct localStorage keys
  localStorage.setItem('mock_patients', JSON.stringify(patients));
  localStorage.setItem('mock_appointments', JSON.stringify(appointments));
  
  console.log('Doctor demo data stored in localStorage for user:', userId);
  console.log('Patients:', patients.length);
  console.log('Appointments:', appointments.length);
};

const generateLabDemoDataLocal = async (userId: string, userEmail: string) => {
  // Lab-specific demo data
  const reports = [
    {
      id: 'report_1',
      labId: userId,
      patientId: 'patient_1',
      title: 'Blood Test Results',
      status: 'completed',
      createdAt: '2025-01-01T00:00:00',
      completedAt: '2025-01-01T08:00:00',
      patientName: 'John Smith',
      labName: 'MedLab Diagnostics'
    },
    {
      id: 'report_2',
      labId: userId,
      patientId: 'patient_2',
      title: 'X-Ray Chest',
      status: 'completed',
      createdAt: '2024-12-15T00:00:00',
      completedAt: '2024-12-15T10:30:00',
      patientName: 'Sarah Johnson',
      labName: 'City Medical Lab'
    }
  ];

  // Store data directly in the correct localStorage keys
  localStorage.setItem('mock_reports', JSON.stringify(reports));
  
  console.log('Lab demo data stored in localStorage for user:', userId);
  console.log('Reports:', reports.length);
};

export const clearDemoData = async (userId: string) => {
  try {
    // This would require batch operations to clear all documents
    // For now, we'll just log that this function exists
    console.log('Demo data clear function called');
  } catch (error) {
    console.error('Error clearing demo data:', error);
  }
};

// Generate health metrics demo data
export const generateHealthMetricsDemoData = (userId: string) => {
  console.log('Generating health metrics demo data for user:', userId);
  
  const healthMetrics = [
    {
      id: `metric_${Date.now()}_1`,
      userId,
      name: 'Blood Pressure',
      value: 145,
      unit: 'mmHg',
      status: 'high',
      trend: 'up',
      lastUpdated: new Date().toISOString(),
      targetRange: { min: 90, max: 140 },
      aiAnalysis: 'Elevated blood pressure detected. Consider lifestyle modifications and consult your doctor.',
      recommendations: ['Reduce salt intake', 'Exercise regularly', 'Monitor daily']
    },
    {
      id: `metric_${Date.now()}_2`,
      userId,
      name: 'Blood Sugar',
      value: 98,
      unit: 'mg/dL',
      status: 'normal',
      trend: 'stable',
      lastUpdated: new Date().toISOString(),
      targetRange: { min: 70, max: 140 },
      aiAnalysis: 'Blood sugar levels are within normal range. Continue current diet and exercise routine.',
      recommendations: ['Maintain current diet', 'Regular exercise', 'Monitor weekly']
    },
    {
      id: `metric_${Date.now()}_3`,
      userId,
      name: 'Cholesterol',
      value: 220,
      unit: 'mg/dL',
      status: 'borderline',
      trend: 'up',
      lastUpdated: new Date().toISOString(),
      targetRange: { min: 0, max: 200 },
      aiAnalysis: 'Cholesterol levels are slightly elevated. Consider dietary changes and increased physical activity.',
      recommendations: ['Reduce saturated fats', 'Increase fiber intake', 'Regular exercise']
    },
    {
      id: `metric_${Date.now()}_4`,
      userId,
      name: 'BMI',
      value: 23.5,
      unit: '',
      status: 'normal',
      trend: 'stable',
      lastUpdated: new Date().toISOString(),
      targetRange: { min: 18.5, max: 25 },
      aiAnalysis: 'BMI is within healthy range. Maintain current weight and lifestyle.',
      recommendations: ['Maintain current weight', 'Regular exercise', 'Balanced diet']
    }
  ];

  console.log('Generated health metrics:', healthMetrics);
  localStorage.setItem('mock_health_metrics', JSON.stringify(healthMetrics));
  console.log('Health metrics stored in localStorage');
  return healthMetrics;
};

// Generate disease analysis demo data
export const generateDiseaseAnalysisDemoData = (userId: string, familyMembers: any[] = []) => {
  console.log('Generating disease analysis demo data for user:', userId);
  
  const diseaseAnalysis = [
    {
      id: `disease_${Date.now()}_1`,
      userId,
      familyMemberId: familyMembers.length > 0 ? familyMembers[0].id : null,
      diseaseName: 'Hypertension',
      riskLevel: 'high',
      probability: 75,
      symptoms: ['High blood pressure', 'Headaches', 'Shortness of breath'],
      aiInsights: 'Based on your blood pressure readings and family history, there is a high risk of developing hypertension. Early intervention is recommended.',
      recommendations: ['Monitor blood pressure daily', 'Reduce salt intake', 'Exercise regularly', 'Consult cardiologist'],
      lastAnalyzed: new Date().toISOString(),
      medications: ['Lisinopril', 'Amlodipine'],
      lifestyleFactors: ['High salt diet', 'Sedentary lifestyle', 'Stress']
    },
    {
      id: `disease_${Date.now()}_2`,
      userId,
      familyMemberId: familyMembers.length > 1 ? familyMembers[1].id : null,
      diseaseName: 'Type 2 Diabetes',
      riskLevel: 'medium',
      probability: 45,
      symptoms: ['Elevated blood sugar', 'Increased thirst', 'Frequent urination'],
      aiInsights: 'Your blood sugar levels are currently normal, but there are risk factors present. Preventive measures are advised.',
      recommendations: ['Monitor blood sugar regularly', 'Maintain healthy diet', 'Exercise regularly', 'Annual checkups'],
      lastAnalyzed: new Date().toISOString(),
      medications: ['Metformin'],
      lifestyleFactors: ['Family history', 'Sedentary lifestyle', 'Poor diet']
    },
    {
      id: `disease_${Date.now()}_3`,
      userId,
      familyMemberId: familyMembers.length > 2 ? familyMembers[2].id : null,
      diseaseName: 'Cardiovascular Disease',
      riskLevel: 'medium',
      probability: 35,
      symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
      aiInsights: 'Risk factors for cardiovascular disease are present. Regular monitoring and lifestyle changes are recommended.',
      recommendations: ['Regular exercise', 'Heart-healthy diet', 'Stress management', 'Regular checkups'],
      lastAnalyzed: new Date().toISOString(),
      medications: ['Aspirin', 'Statins'],
      lifestyleFactors: ['High cholesterol', 'Sedentary lifestyle', 'Stress']
    }
  ];

  console.log('Generated disease analysis:', diseaseAnalysis);
  localStorage.setItem('mock_disease_analysis', JSON.stringify(diseaseAnalysis));
  console.log('Disease analysis stored in localStorage');
  return diseaseAnalysis;
};

// Generate health trends demo data
export const generateHealthTrendsDemoData = (userId: string) => {
  console.log('Generating health trends demo data for user:', userId);
  
  const healthTrends = [
    {
      id: 'trend_1',
      userId: userId,
      month: 'January 2025',
      bloodPressure: { systolic: 140, diastolic: 90, status: 'high' },
      bloodSugar: { fasting: 95, postMeal: 140, status: 'normal' },
      cholesterol: { total: 220, hdl: 45, ldl: 150, status: 'high' },
      weight: { current: 75.2, target: 70, status: 'overweight' }
    },
    {
      id: 'trend_2',
      userId: userId,
      month: 'December 2024',
      bloodPressure: { systolic: 135, diastolic: 85, status: 'normal' },
      bloodSugar: { fasting: 92, postMeal: 135, status: 'normal' },
      cholesterol: { total: 215, hdl: 48, ldl: 145, status: 'high' },
      weight: { current: 76, target: 70, status: 'overweight' }
    },
    {
      id: 'trend_3',
      userId: userId,
      month: 'November 2024',
      bloodPressure: { systolic: 130, diastolic: 80, status: 'normal' },
      bloodSugar: { fasting: 90, postMeal: 130, status: 'normal' },
      cholesterol: { total: 210, hdl: 50, ldl: 140, status: 'high' },
      weight: { current: 77, target: 70, status: 'overweight' }
    }
  ];

  console.log('Generated health trends:', healthTrends);
  localStorage.setItem('mock_health_trends', JSON.stringify(healthTrends));
  console.log('Health trends stored in localStorage');
  return healthTrends;
};

// Generate self reminders demo data with medication synchronization
export const generateSelfRemindersDemoData = (userId: string, medications: any[] = [], doseRecords: any[] = []) => {
  console.log('Generating self reminders demo data for user:', userId);
  
  // Get current date for scheduling
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Create medication-based reminders from existing medications
  const medicationReminders = medications.map((med, index) => {
    const reminderTime = new Date();
    reminderTime.setHours(8 + (index * 4), 0, 0, 0); // Spread times throughout the day
    
    return {
      id: `reminder_med_${Date.now()}_${index}`,
      userId,
      title: `Take ${med.medicationName}`,
      description: `Reminder to take ${med.medicationName} ${med.dosage}`,
      medicationName: med.medicationName,
      dosage: med.dosage,
      doseStrength: med.doseStrength,
      doseForm: med.doseForm,
      administrationMethod: med.administrationMethod || 'oral',
      type: 'medication' as const,
      frequency: med.frequency || 'daily',
      times: [reminderTime.toTimeString().slice(0, 5)],
      days: med.days || [],
      isActive: true,
      nextReminder: reminderTime.toISOString(),
      lastReminder: null,
      instructions: med.instructions || `Take ${med.medicationName} as prescribed`,
      specialInstructions: med.specialInstructions || '',
      sideEffects: med.sideEffects || [],
      category: 'prescription',
      color: ['blue', 'green', 'purple', 'orange'][index % 4],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Create custom health reminders
  const customReminders = [
    {
      id: `reminder_custom_${Date.now()}_1`,
      userId,
      title: 'Blood Pressure Check',
      description: 'Daily blood pressure monitoring reminder',
      medicationName: '',
      dosage: '',
      doseStrength: '',
      doseForm: '',
      administrationMethod: '',
      type: 'checkup' as const,
      frequency: 'daily',
      times: ['07:00'],
      days: [],
      isActive: true,
      nextReminder: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0).toISOString(),
      lastReminder: null,
      instructions: 'Check blood pressure in the morning before taking medications',
      specialInstructions: 'Record readings in health tracker',
      sideEffects: [],
      category: 'health_monitoring',
      color: 'red',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `reminder_custom_${Date.now()}_2`,
      userId,
      title: 'Blood Sugar Test',
      description: 'Monitor blood glucose levels',
      medicationName: '',
      dosage: '',
      doseStrength: '',
      doseForm: '',
      administrationMethod: '',
      type: 'checkup' as const,
      frequency: 'daily',
      times: ['08:00', '18:00'],
      days: [],
      isActive: true,
      nextReminder: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0).toISOString(),
      lastReminder: null,
      instructions: 'Test blood sugar before breakfast and dinner',
      specialInstructions: 'Record in diabetes tracker app',
      sideEffects: [],
      category: 'health_monitoring',
      color: 'yellow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `reminder_custom_${Date.now()}_3`,
      userId,
      title: 'Exercise Reminder',
      description: 'Daily physical activity reminder',
      medicationName: '',
      dosage: '',
      doseStrength: '',
      doseForm: '',
      administrationMethod: '',
      type: 'custom' as const,
      frequency: 'daily',
      times: ['17:00'],
      days: [],
      isActive: true,
      nextReminder: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0).toISOString(),
      lastReminder: null,
      instructions: '30 minutes of moderate exercise (walking, cycling, or swimming)',
      specialInstructions: 'Avoid exercise if blood pressure is high',
      sideEffects: [],
      category: 'lifestyle',
      color: 'green',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `reminder_custom_${Date.now()}_4`,
      userId,
      title: 'Doctor Appointment',
      description: 'Follow-up appointment with cardiologist',
      medicationName: '',
      dosage: '',
      doseStrength: '',
      doseForm: '',
      administrationMethod: '',
      type: 'appointment' as const,
      frequency: 'once',
      times: ['10:00'],
      days: [],
      isActive: true,
      nextReminder: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0, 0).toISOString(),
      lastReminder: null,
      instructions: 'Prepare questions about blood pressure medication',
      specialInstructions: 'Bring recent blood pressure readings',
      sideEffects: [],
      category: 'appointment',
      color: 'purple',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `reminder_custom_${Date.now()}_5`,
      userId,
      title: 'Medication Refill',
      description: 'Refill Lisinopril prescription',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      doseStrength: '10mg',
      doseForm: 'tablet',
      administrationMethod: 'oral',
      type: 'medication' as const,
      frequency: 'once',
      times: ['09:00'],
      days: [],
      isActive: true,
      nextReminder: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 9, 0, 0).toISOString(),
      lastReminder: null,
      instructions: 'Call pharmacy to refill prescription',
      specialInstructions: 'Check if insurance covers refill',
      sideEffects: [],
      category: 'prescription',
      color: 'blue',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Combine all reminders
  const allReminders = [...medicationReminders, ...customReminders];

  console.log('Generated self reminders:', allReminders);
  localStorage.setItem('mock_self_reminders', JSON.stringify(allReminders));
  console.log('Self reminders stored in localStorage');
  return allReminders;
};

// Demo data for self reminders
export const sampleSelfReminders = [
  {
    id: 'reminder1',
    userId: 'demo-patient-1',
    title: 'Morning Blood Pressure Medication',
    description: 'Take your blood pressure medication with breakfast',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    doseStrength: '10mg',
    doseForm: 'tablet',
    administrationMethod: 'oral',
    type: 'medication' as const,
    frequency: 'daily' as const,
    times: ['08:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastReminder: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    instructions: 'Take with food in the morning',
    specialInstructions: 'Avoid salt substitutes containing potassium',
    sideEffects: ['dizziness', 'dry cough'],
    category: 'cardiovascular',
    color: 'blue',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reminder2',
    userId: 'demo-patient-1',
    title: 'Diabetes Medication',
    description: 'Take your diabetes medication with meals',
    medicationName: 'Metformin',
    dosage: '500mg',
    doseStrength: '500mg',
    doseForm: 'tablet',
    administrationMethod: 'oral',
    type: 'medication' as const,
    frequency: 'daily' as const,
    times: ['08:00', '20:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextReminder: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    lastReminder: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    instructions: 'Take with meals to reduce stomach upset',
    specialInstructions: 'Take with food, avoid alcohol',
    sideEffects: ['nausea', 'diarrhea', 'loss of appetite'],
    category: 'diabetes',
    color: 'green',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reminder3',
    userId: 'demo-patient-1',
    title: 'Vitamin Supplement',
    description: 'Take your daily vitamin supplement',
    medicationName: 'Vitamin D',
    dosage: '1000IU',
    doseStrength: '1000IU',
    doseForm: 'capsule',
    administrationMethod: 'oral',
    type: 'medication' as const,
    frequency: 'daily' as const,
    times: ['12:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastReminder: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    instructions: 'Take with meal for better absorption',
    specialInstructions: 'Take with fatty meal for better absorption',
    sideEffects: [],
    category: 'vitamins',
    color: 'yellow',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Simple fallback demo data creation
export const createMinimalDemoData = (userId: string) => {
  console.log('Creating minimal demo data for user:', userId);
  
  try {
    // Create basic health metrics
    const basicHealthMetrics = [
      {
        id: 'basic_1',
        userId,
        name: 'Blood Pressure',
        value: 120,
        unit: 'mmHg',
        status: 'normal',
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
        targetRange: { min: 90, max: 140 }
      }
    ];
    
    // Create basic disease analysis
    const basicDiseaseAnalysis = [
      {
        id: 'basic_1',
        userId,
        diseaseName: 'Hypertension',
        riskLevel: 'low',
        probability: 25,
        symptoms: ['None currently'],
        aiInsights: 'Low risk based on current readings',
        recommendations: ['Monitor blood pressure', 'Maintain healthy lifestyle'],
        lastAnalyzed: new Date().toISOString(),
        medications: [],
        lifestyleFactors: []
      }
    ];
    
    // Create basic health trends
    const basicHealthTrends = [
      {
        id: 'basic_1',
        userId,
        metricName: 'Blood Pressure',
        trend: 'stable',
        change: 0,
        period: '1 month',
        lastUpdated: new Date().toISOString()
      }
    ];
    
    // Store in localStorage
    localStorage.setItem('mock_health_metrics', JSON.stringify(basicHealthMetrics));
    localStorage.setItem('mock_disease_analysis', JSON.stringify(basicDiseaseAnalysis));
    localStorage.setItem('mock_health_trends', JSON.stringify(basicHealthTrends));
    
    console.log('Minimal demo data created successfully');
    return { basicHealthMetrics, basicDiseaseAnalysis, basicHealthTrends };
  } catch (error) {
    console.error('Error creating minimal demo data:', error);
    return null;
  }
};



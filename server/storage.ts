import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// Healthcare data interfaces
export interface Medication {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  doseStrength: string;
  doseForm: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions: string;
  sideEffects: string[];
  administrationMethod: string;
  specialInstructions: string;
  isRunning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoseRecord {
  id: string;
  userId: string;
  medicationId: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'pending' | 'taken' | 'skipped' | 'overdue';
  notes?: string;
  doseTaken?: string;
  sideEffects?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthReport {
  id: string;
  userId: string;
  title: string;
  reportType: string;
  uploadedAt: Date;
  validTill?: Date;
  fileUrl: string;
  analysis?: ReportAnalysis;
  source?: 'uploaded' | 'web' | 'demo';
  labName?: string;
  doctorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAnalysis {
  parameters: {
    [key: string]: {
      value: number;
      unit: string;
      normalRange: string;
      status: 'normal' | 'high' | 'low' | 'critical';
      trend?: 'increasing' | 'decreasing' | 'stable';
      previousValue?: number;
      change?: number;
      significance?: 'significant' | 'moderate' | 'minimal';
    };
  };
  summary: {
    normalCount: number;
    abnormalCount: number;
    criticalCount: number;
    overallStatus: 'healthy' | 'attention' | 'critical';
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  metadata?: {
    labName: string;
    doctorName: string;
    testDate: string;
    reportNumber: string;
  };
}

export interface HealthMetrics {
  id: string;
  userId: string;
  bloodPressure: { systolic: number; diastolic: number };
  bloodSugar: number;
  cholesterol: number;
  bmi: number;
  weight: number;
  height: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  healthConditions?: string[];
  medications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Storage interface with comprehensive CRUD operations
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  // Medication management
  getMedications(userId: string): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  createMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<Medication>;
  deleteMedication(id: string): Promise<boolean>;

  // Dose tracking
  getDoseRecords(userId: string, date?: string): Promise<DoseRecord[]>;
  getDoseRecord(id: string): Promise<DoseRecord | undefined>;
  createDoseRecord(doseRecord: Omit<DoseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DoseRecord>;
  updateDoseRecord(id: string, updates: Partial<DoseRecord>): Promise<DoseRecord>;
  deleteDoseRecord(id: string): Promise<boolean>;

  // Health reports
  getReports(userId: string): Promise<HealthReport[]>;
  getReport(id: string): Promise<HealthReport | undefined>;
  createReport(report: Omit<HealthReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthReport>;
  updateReport(id: string, updates: Partial<HealthReport>): Promise<HealthReport>;
  deleteReport(id: string): Promise<boolean>;

  // Health metrics
  getHealthMetrics(userId: string): Promise<HealthMetrics[]>;
  getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined>;
  createHealthMetrics(metrics: Omit<HealthMetrics, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthMetrics>;
  updateHealthMetrics(id: string, updates: Partial<HealthMetrics>): Promise<HealthMetrics>;
  deleteHealthMetrics(id: string): Promise<boolean>;

  // Family members
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  getFamilyMember(id: string): Promise<FamilyMember | undefined>;
  createFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember>;
  updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember>;
  deleteFamilyMember(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private medications: Map<string, Medication>;
  private doseRecords: Map<string, DoseRecord>;
  private reports: Map<string, HealthReport>;
  private healthMetrics: Map<string, HealthMetrics>;
  private familyMembers: Map<string, FamilyMember>;

  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.doseRecords = new Map();
    this.reports = new Map();
    this.healthMetrics = new Map();
    this.familyMembers = new Map();
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Medication management
  async getMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (med) => med.userId === userId
    );
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
    const id = randomUUID();
    const now = new Date();
    const newMedication: Medication = {
      ...medication,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.medications.set(id, newMedication);
    return newMedication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const medication = this.medications.get(id);
    if (!medication) throw new Error('Medication not found');
    const updatedMedication = { ...medication, ...updates, updatedAt: new Date() };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: string): Promise<boolean> {
    return this.medications.delete(id);
  }

  // Dose tracking
  async getDoseRecords(userId: string, date?: string): Promise<DoseRecord[]> {
    let records = Array.from(this.doseRecords.values()).filter(
      (record) => record.userId === userId
    );
    
    if (date) {
      records = records.filter(record => 
        record.scheduledTime.startsWith(date)
      );
    }
    
    return records;
  }

  async getDoseRecord(id: string): Promise<DoseRecord | undefined> {
    return this.doseRecords.get(id);
  }

  async createDoseRecord(doseRecord: Omit<DoseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DoseRecord> {
    const id = randomUUID();
    const now = new Date();
    const newDoseRecord: DoseRecord = {
      ...doseRecord,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.doseRecords.set(id, newDoseRecord);
    return newDoseRecord;
  }

  async updateDoseRecord(id: string, updates: Partial<DoseRecord>): Promise<DoseRecord> {
    const doseRecord = this.doseRecords.get(id);
    if (!doseRecord) throw new Error('Dose record not found');
    const updatedDoseRecord = { ...doseRecord, ...updates, updatedAt: new Date() };
    this.doseRecords.set(id, updatedDoseRecord);
    return updatedDoseRecord;
  }

  async deleteDoseRecord(id: string): Promise<boolean> {
    return this.doseRecords.delete(id);
  }

  // Health reports
  async getReports(userId: string): Promise<HealthReport[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.userId === userId
    );
  }

  async getReport(id: string): Promise<HealthReport | undefined> {
    return this.reports.get(id);
  }

  async createReport(report: Omit<HealthReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthReport> {
    const id = randomUUID();
    const now = new Date();
    const newReport: HealthReport = {
      ...report,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async updateReport(id: string, updates: Partial<HealthReport>): Promise<HealthReport> {
    const report = this.reports.get(id);
    if (!report) throw new Error('Report not found');
    const updatedReport = { ...report, ...updates, updatedAt: new Date() };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }

  // Health metrics
  async getHealthMetrics(userId: string): Promise<HealthMetrics[]> {
    return Array.from(this.healthMetrics.values()).filter(
      (metrics) => metrics.userId === userId
    );
  }

  async getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined> {
    const metrics = await this.getHealthMetrics(userId);
    return metrics.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];
  }

  async createHealthMetrics(metrics: Omit<HealthMetrics, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthMetrics> {
    const id = randomUUID();
    const now = new Date();
    const newMetrics: HealthMetrics = {
      ...metrics,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.healthMetrics.set(id, newMetrics);
    return newMetrics;
  }

  async updateHealthMetrics(id: string, updates: Partial<HealthMetrics>): Promise<HealthMetrics> {
    const metrics = this.healthMetrics.get(id);
    if (!metrics) throw new Error('Health metrics not found');
    const updatedMetrics = { ...metrics, ...updates, updatedAt: new Date() };
    this.healthMetrics.set(id, updatedMetrics);
    return updatedMetrics;
  }

  async deleteHealthMetrics(id: string): Promise<boolean> {
    return this.healthMetrics.delete(id);
  }

  // Family members
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return Array.from(this.familyMembers.values()).filter(
      (member) => member.userId === userId
    );
  }

  async getFamilyMember(id: string): Promise<FamilyMember | undefined> {
    return this.familyMembers.get(id);
  }

  async createFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> {
    const id = randomUUID();
    const now = new Date();
    const newMember: FamilyMember = {
      ...member,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.familyMembers.set(id, newMember);
    return newMember;
  }

  async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    const member = this.familyMembers.get(id);
    if (!member) throw new Error('Family member not found');
    const updatedMember = { ...member, ...updates, updatedAt: new Date() };
    this.familyMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteFamilyMember(id: string): Promise<boolean> {
    return this.familyMembers.delete(id);
  }
}

export const storage = new MemStorage();

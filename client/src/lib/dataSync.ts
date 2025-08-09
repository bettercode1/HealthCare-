
// Mock data synchronization service for maintaining consistency across user types
export class DataSyncService {
  private static instance: DataSyncService;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // Sync patient data across different user types
  async syncPatientData(patientId: string, dataType: string, data: any) {
    try {
      // Simulate data sync delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Mock data synced for patient ${patientId}, type: ${dataType}`, data);
    } catch (error) {
      console.error('Error syncing patient data:', error);
      throw error;
    }
  }

  // Sync doctor data across different user types
  async syncDoctorData(doctorId: string, dataType: string, data: any) {
    try {
      // Simulate data sync delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Mock data synced for doctor ${doctorId}, type: ${dataType}`, data);
    } catch (error) {
      console.error('Error syncing doctor data:', error);
      throw error;
    }
  }

  // Sync lab data across different user types
  async syncLabData(labId: string, dataType: string, data: any) {
    try {
      // Simulate data sync delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Mock data synced for lab ${labId}, type: ${dataType}`, data);
    } catch (error) {
      console.error('Error syncing lab data:', error);
      throw error;
    }
  }

  // Set up real-time listeners for data synchronization
  setupRealtimeSync(userId: string, userRole: string) {
    const listenerKey = `${userRole}_${userId}`;
    
    if (this.listeners.has(listenerKey)) {
      this.listeners.get(listenerKey)?.();
    }

    // Mock real-time sync - just log the setup
    console.log(`Mock real-time sync setup for ${userRole} ${userId}`);
    
    const mockUnsubscribe = () => {
      console.log(`Mock real-time sync cleanup for ${userRole} ${userId}`);
    };

    this.listeners.set(listenerKey, mockUnsubscribe);
  }

  // Clean up listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Export singleton instance
export const dataSyncService = DataSyncService.getInstance();

// Helper functions for common sync operations
export const syncOperations = {
  // Sync new health metric
  async syncHealthMetric(patientId: string, metric: any) {
    await dataSyncService.syncPatientData(patientId, 'health_metrics', metric);
  },

  // Sync new report
  async syncReport(patientId: string, report: any) {
    await dataSyncService.syncPatientData(patientId, 'reports', report);
  },

  // Sync new prescription
  async syncPrescription(doctorId: string, prescription: any) {
    await dataSyncService.syncDoctorData(doctorId, 'prescriptions', prescription);
  },

  // Sync new appointment
  async syncAppointment(patientId: string, doctorId: string, appointment: any) {
    // Sync to patient
    await dataSyncService.syncPatientData(patientId, 'appointments', appointment);
    // Sync to doctor
    await dataSyncService.syncDoctorData(doctorId, 'appointments', appointment);
  },

  // Sync lab result
  async syncLabResult(labId: string, patientId: string, result: any) {
    await dataSyncService.syncLabData(labId, 'results', result);
  }
};

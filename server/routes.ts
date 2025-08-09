import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, type Medication, type DoseRecord, type HealthReport, type HealthMetrics, type FamilyMember } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticateUser = (req: Request, res: Response, next: Function) => {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    req.userId = userId;
    next();
  };

  // User management routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Medication management routes
  app.get('/api/medications', authenticateUser, async (req: Request, res: Response) => {
    try {
      const medications = await storage.getMedications(req.userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/medications/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const medication = await storage.getMedication(req.params.id);
      if (!medication) {
        return res.status(404).json({ error: 'Medication not found' });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/medications', authenticateUser, async (req: Request, res: Response) => {
    try {
      const medication = await storage.createMedication({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(medication);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/medications/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const medication = await storage.updateMedication(req.params.id, req.body);
      res.json(medication);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/medications/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteMedication(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Medication not found' });
      }
      res.json({ message: 'Medication deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Dose tracking routes
  app.get('/api/dose-records', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const doseRecords = await storage.getDoseRecords(req.userId, date as string);
      res.json(doseRecords);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/dose-records/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const doseRecord = await storage.getDoseRecord(req.params.id);
      if (!doseRecord) {
        return res.status(404).json({ error: 'Dose record not found' });
      }
      res.json(doseRecord);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/dose-records', authenticateUser, async (req: Request, res: Response) => {
    try {
      const doseRecord = await storage.createDoseRecord({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(doseRecord);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/dose-records/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const doseRecord = await storage.updateDoseRecord(req.params.id, req.body);
      res.json(doseRecord);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/dose-records/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteDoseRecord(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Dose record not found' });
      }
      res.json({ message: 'Dose record deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health reports routes
  app.get('/api/reports', authenticateUser, async (req: Request, res: Response) => {
    try {
      const reports = await storage.getReports(req.userId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/reports/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/reports', authenticateUser, async (req: Request, res: Response) => {
    try {
      const report = await storage.createReport({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/reports/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const report = await storage.updateReport(req.params.id, req.body);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/reports/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteReport(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health metrics routes
  app.get('/api/health-metrics', authenticateUser, async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getHealthMetrics(req.userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/health-metrics/latest', authenticateUser, async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getLatestHealthMetrics(req.userId);
      if (!metrics) {
        return res.status(404).json({ error: 'No health metrics found' });
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/health-metrics', authenticateUser, async (req: Request, res: Response) => {
    try {
      const metrics = await storage.createHealthMetrics({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/health-metrics/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const metrics = await storage.updateHealthMetrics(req.params.id, req.body);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/health-metrics/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteHealthMetrics(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Health metrics not found' });
      }
      res.json({ message: 'Health metrics deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Family members routes
  app.get('/api/family-members', authenticateUser, async (req: Request, res: Response) => {
    try {
      const members = await storage.getFamilyMembers(req.userId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/family-members/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const member = await storage.getFamilyMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: 'Family member not found' });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/family-members', authenticateUser, async (req: Request, res: Response) => {
    try {
      const member = await storage.createFamilyMember({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/family-members/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const member = await storage.updateFamilyMember(req.params.id, req.body);
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/family-members/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteFamilyMember(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Family member not found' });
      }
      res.json({ message: 'Family member deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics and dashboard routes
  app.get('/api/dashboard/stats', authenticateUser, async (req: Request, res: Response) => {
    try {
      const [medications, doseRecords, reports, metrics] = await Promise.all([
        storage.getMedications(req.userId),
        storage.getDoseRecords(req.userId),
        storage.getReports(req.userId),
        storage.getLatestHealthMetrics(req.userId)
      ]);

      const activeMedications = medications.filter(m => m.isRunning).length;
      const todayDoses = doseRecords.filter(d => 
        d.scheduledTime.startsWith(new Date().toISOString().split('T')[0])
      );
      const takenDoses = todayDoses.filter(d => d.status === 'taken').length;
      const pendingDoses = todayDoses.filter(d => d.status === 'pending').length;

      res.json({
        activeMedications,
        totalDoses: todayDoses.length,
        takenDoses,
        pendingDoses,
        adherenceRate: todayDoses.length > 0 ? (takenDoses / todayDoses.length) * 100 : 0,
        totalReports: reports.length,
        latestMetrics: metrics
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Bulk operations for dose generation
  app.post('/api/dose-records/generate', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { medicationId, startDate, endDate } = req.body;
      const medication = await storage.getMedication(medicationId);
      
      if (!medication) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      const doses = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        for (const time of medication.times) {
          const scheduledTime = `${date.toISOString().split('T')[0]}T${time}`;
          const doseRecord = await storage.createDoseRecord({
            userId: req.userId,
            medicationId,
            scheduledTime,
            status: 'pending'
          });
          doses.push(doseRecord);
        }
      }

      res.status(201).json({ message: `${doses.length} doses generated`, doses });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}

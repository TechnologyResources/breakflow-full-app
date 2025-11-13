// Reference: javascript_log_in_with_replit integration
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertDepartmentSchema,
  insertShiftSchema,
  insertBreakSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Department routes
  app.get('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get('/api/departments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const validated = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validated);
      res.status(201).json(department);
    } catch (error: any) {
      console.error("Error creating department:", error);
      res.status(400).json({ message: error.message || "Failed to create department" });
    }
  });

  app.patch('/api/departments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.updateDepartment(id, req.body);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete('/api/departments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Shift routes
  app.get('/api/shifts/my-shifts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const shifts = await storage.getShiftsByUser(userId, date);
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching user shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.get('/api/shifts/department/:departmentId', isAuthenticated, async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const shifts = await storage.getShiftsByDepartment(departmentId, date);
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching department shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post('/api/shifts', isAuthenticated, async (req, res) => {
    try {
      const validated = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validated);
      res.status(201).json(shift);
    } catch (error: any) {
      console.error("Error creating shift:", error);
      res.status(400).json({ message: error.message || "Failed to create shift" });
    }
  });

  // Break routes
  app.get('/api/breaks/my-breaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const breaks = await storage.getBreaksByUser(userId, date);
      res.json(breaks);
    } catch (error) {
      console.error("Error fetching user breaks:", error);
      res.status(500).json({ message: "Failed to fetch breaks" });
    }
  });

  app.get('/api/breaks/shift/:shiftId', isAuthenticated, async (req, res) => {
    try {
      const shiftId = parseInt(req.params.shiftId);
      const breaks = await storage.getBreaksByShift(shiftId);
      res.json(breaks);
    } catch (error) {
      console.error("Error fetching shift breaks:", error);
      res.status(500).json({ message: "Failed to fetch breaks" });
    }
  });

  // Business logic validation for break booking
  app.post('/api/breaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertBreakSchema.parse(req.body);

      // Get the shift
      const shift = await storage.getShift(validated.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Verify user owns this shift
      if (shift.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to book breaks for this shift" });
      }

      // Get existing breaks for this shift
      const existingBreaks = await storage.getBreaksByShift(validated.shiftId);

      // Validate break rules
      const validation = validateBreakRules(validated, shift, existingBreaks);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Check concurrent break limit
      const department = await storage.getDepartment(shift.departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      const concurrentCount = await storage.getConcurrentBreaksCount(
        shift.departmentId,
        validated.startTime,
        validated.endTime,
        shift.date
      );

      if (concurrentCount >= department.maxConcurrentBreaks) {
        return res.status(400).json({ 
          message: `Maximum concurrent breaks (${department.maxConcurrentBreaks}) reached for this time slot` 
        });
      }

      // Create the break
      const breakRecord = await storage.createBreak(validated);
      res.status(201).json(breakRecord);
    } catch (error: any) {
      console.error("Error creating break:", error);
      res.status(400).json({ message: error.message || "Failed to create break" });
    }
  });

  app.patch('/api/breaks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Verify ownership
      const existingBreaks = await storage.getBreaksByUser(userId, new Date());
      const existingBreak = existingBreaks.find(b => b.id === id);
      if (!existingBreak) {
        return res.status(404).json({ message: "Break not found or not authorized" });
      }

      const breakRecord = await storage.updateBreak(id, req.body);
      res.json(breakRecord);
    } catch (error) {
      console.error("Error updating break:", error);
      res.status(500).json({ message: "Failed to update break" });
    }
  });

  app.delete('/api/breaks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Verify ownership
      const existingBreaks = await storage.getBreaksByUser(userId, new Date());
      const existingBreak = existingBreaks.find(b => b.id === id);
      if (!existingBreak) {
        return res.status(404).json({ message: "Break not found or not authorized" });
      }

      await storage.deleteBreak(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting break:", error);
      res.status(500).json({ message: "Failed to delete break" });
    }
  });

  // Break availability check endpoint
  app.post('/api/breaks/check-availability', isAuthenticated, async (req, res) => {
    try {
      const { departmentId, startTime, endTime, date } = req.body;
      
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      const concurrentCount = await storage.getConcurrentBreaksCount(
        departmentId,
        startTime,
        endTime,
        new Date(date)
      );

      res.json({
        available: concurrentCount < department.maxConcurrentBreaks,
        current: concurrentCount,
        max: department.maxConcurrentBreaks,
        remaining: department.maxConcurrentBreaks - concurrentCount,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Seed/initialization endpoint (for development)
  app.post('/api/seed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingDepts = await storage.getDepartments();
      
      if (existingDepts.length === 0) {
        // Create the three main departments
        const chatDept = await storage.createDepartment({
          name: 'Chat',
          nameAr: 'الدردشة',
          maxConcurrentBreaks: 5,
          is24Hours: true,
        });

        await storage.createDepartment({
          name: 'SMS',
          nameAr: 'الرسائل',
          maxConcurrentBreaks: 3,
          is24Hours: false,
        });

        await storage.createDepartment({
          name: 'MNP',
          nameAr: 'نقل الأرقام',
          maxConcurrentBreaks: 2,
          is24Hours: false,
        });

        // Create a test shift for the current user (today, 9 AM to 5 PM)
        const today = new Date();
        await storage.createShift({
          userId: userId,
          departmentId: chatDept.id,
          date: today,
          startTime: '09:00:00',
          endTime: '17:00:00',
        });

        res.json({ message: "Database seeded successfully with departments and a test shift" });
      } else {
        res.json({ message: "Database already has data" });
      }
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Business logic validation function
function validateBreakRules(
  newBreak: any,
  shift: any,
  existingBreaks: any[]
): { valid: boolean; error?: string } {
  // Parse times
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const shiftStart = parseTime(shift.startTime);
  const shiftEnd = parseTime(shift.endTime);
  const breakStart = parseTime(newBreak.startTime);
  const breakEnd = parseTime(newBreak.endTime);

  // Rule 1: No breaks in first or last hour
  if (breakStart < shiftStart + 60) {
    return { valid: false, error: "Breaks are not allowed in the first hour of the shift" };
  }
  if (breakEnd > shiftEnd - 60) {
    return { valid: false, error: "Breaks are not allowed in the last hour of the shift" };
  }

  // Rule 2: Sequential break ordering
  const hasFirstBreak = existingBreaks.some(b => b.breakType === 'first');
  const hasSecondBreak = existingBreaks.some(b => b.breakType === 'second');

  if (newBreak.breakType === 'second' && !hasFirstBreak) {
    return { valid: false, error: "You must take the first break (15 min) before the second break" };
  }

  if (newBreak.breakType === 'third' && !hasSecondBreak) {
    return { valid: false, error: "You must take the second break (30 min) before the third break" };
  }

  // Rule 3: Time gaps between breaks
  if (newBreak.breakType === 'second' && hasFirstBreak) {
    const firstBreak = existingBreaks.find(b => b.breakType === 'first');
    const firstBreakEnd = parseTime(firstBreak!.endTime);
    const timeDiff = breakStart - firstBreakEnd;
    
    if (timeDiff < 120) { // 2 hours = 120 minutes
      return { valid: false, error: "There must be at least 2 hours between the first and second break" };
    }
  }

  if (newBreak.breakType === 'third' && hasSecondBreak) {
    const secondBreak = existingBreaks.find(b => b.breakType === 'second');
    const secondBreakEnd = parseTime(secondBreak!.endTime);
    const timeDiff = breakStart - secondBreakEnd;
    
    if (timeDiff < 150) { // 2.5 hours = 150 minutes
      return { valid: false, error: "There must be at least 2.5 hours between the second and third break" };
    }
  }

  if (newBreak.breakType === 'third' && hasFirstBreak) {
    const firstBreak = existingBreaks.find(b => b.breakType === 'first');
    const firstBreakEnd = parseTime(firstBreak!.endTime);
    const timeDiff = breakStart - firstBreakEnd;
    
    if (timeDiff < 270) { // 4.5 hours = 270 minutes
      return { valid: false, error: "There must be at least 4.5 hours between the first and third break" };
    }
  }

  return { valid: true };
}

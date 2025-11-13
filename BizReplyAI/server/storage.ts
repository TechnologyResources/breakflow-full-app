// Reference: javascript_database and javascript_log_in_with_replit integrations
import {
  users,
  departments,
  shiftPatterns,
  shifts,
  breaks,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type ShiftPattern,
  type InsertShiftPattern,
  type Shift,
  type InsertShift,
  type Break,
  type InsertBreak,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<void>;

  // Shift pattern operations
  getShiftPatterns(departmentId: number): Promise<ShiftPattern[]>;
  createShiftPattern(pattern: InsertShiftPattern): Promise<ShiftPattern>;

  // Shift operations
  getShift(id: number): Promise<Shift | undefined>;
  getShiftsByUser(userId: string, date: Date): Promise<Shift[]>;
  getShiftsByDepartment(departmentId: number, date: Date): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;

  // Break operations
  getBreaksByShift(shiftId: number): Promise<Break[]>;
  getBreaksByUser(userId: string, date: Date): Promise<Break[]>;
  createBreak(breakData: InsertBreak): Promise<Break>;
  updateBreak(id: number, breakData: Partial<InsertBreak>): Promise<Break | undefined>;
  deleteBreak(id: number): Promise<void>;
  
  // Break availability checking
  getConcurrentBreaksCount(departmentId: number, startTime: string, endTime: string, date: Date): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updated] = await db
      .update(departments)
      .set({ ...department, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Shift pattern operations
  async getShiftPatterns(departmentId: number): Promise<ShiftPattern[]> {
    return await db.select().from(shiftPatterns).where(eq(shiftPatterns.departmentId, departmentId));
  }

  async createShiftPattern(pattern: InsertShiftPattern): Promise<ShiftPattern> {
    const [created] = await db.insert(shiftPatterns).values(pattern).returning();
    return created;
  }

  // Shift operations
  async getShift(id: number): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift || undefined;
  }

  async getShiftsByUser(userId: string, date: Date): Promise<Shift[]> {
    const dateStr = date.toISOString().split('T')[0];
    return await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.userId, userId),
          sql`DATE(${shifts.date}) = ${dateStr}`
        )
      );
  }

  async getShiftsByDepartment(departmentId: number, date: Date): Promise<Shift[]> {
    const dateStr = date.toISOString().split('T')[0];
    return await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.departmentId, departmentId),
          sql`DATE(${shifts.date}) = ${dateStr}`
        )
      );
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [created] = await db.insert(shifts).values(shift).returning();
    return created;
  }

  // Break operations
  async getBreaksByShift(shiftId: number): Promise<Break[]> {
    return await db.select().from(breaks).where(eq(breaks.shiftId, shiftId));
  }

  async getBreaksByUser(userId: string, date: Date): Promise<Break[]> {
    const dateStr = date.toISOString().split('T')[0];
    const userShifts = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.userId, userId),
          sql`DATE(${shifts.date}) = ${dateStr}`
        )
      );
    
    if (userShifts.length === 0) return [];
    
    return await db
      .select()
      .from(breaks)
      .where(eq(breaks.shiftId, userShifts[0].id));
  }

  async createBreak(breakData: InsertBreak): Promise<Break> {
    const [created] = await db.insert(breaks).values(breakData).returning();
    return created;
  }

  async updateBreak(id: number, breakData: Partial<InsertBreak>): Promise<Break | undefined> {
    const [updated] = await db
      .update(breaks)
      .set({ ...breakData, updatedAt: new Date() })
      .where(eq(breaks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBreak(id: number): Promise<void> {
    await db.delete(breaks).where(eq(breaks.id, id));
  }

  // Break availability checking
  async getConcurrentBreaksCount(
    departmentId: number,
    startTime: string,
    endTime: string,
    date: Date
  ): Promise<number> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get all shifts for this department on this date
    const departmentShifts = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.departmentId, departmentId),
          sql`DATE(${shifts.date}) = ${dateStr}`
        )
      );

    if (departmentShifts.length === 0) return 0;

    // Count breaks that overlap with the requested time
    const overlappingBreaks = await db
      .select()
      .from(breaks)
      .where(
        and(
          sql`${breaks.shiftId} IN (${sql.join(departmentShifts.map(s => sql`${s.id}`), sql`, `)})`,
          sql`${breaks.startTime} < ${endTime}`,
          sql`${breaks.endTime} > ${startTime}`,
          sql`${breaks.status} IN ('scheduled', 'in_progress')`
        )
      );

    return overlappingBreaks.length;
  }
}

export const storage = new DatabaseStorage();

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  time,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("employee"), // 'admin' or 'employee'
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  shifts: many(shifts),
  breaks: many(breaks),
}));

// Departments table
export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }), // Arabic name
  maxConcurrentBreaks: integer("max_concurrent_breaks").notNull().default(2), // How many employees can be on break at once
  is24Hours: boolean("is_24_hours").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  shiftPatterns: many(shiftPatterns),
  shifts: many(shifts),
}));

// Shift patterns (templates for shifts like "9AM-5PM", "8AM-4PM")
export const shiftPatterns = pgTable("shift_patterns", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  departmentId: integer("department_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Morning Shift"
  startTime: time("start_time").notNull(), // e.g., "09:00:00"
  endTime: time("end_time").notNull(), // e.g., "17:00:00"
  createdAt: timestamp("created_at").defaultNow(),
});

export const shiftPatternsRelations = relations(shiftPatterns, ({ one }) => ({
  department: one(departments, {
    fields: [shiftPatterns.departmentId],
    references: [departments.id],
  }),
}));

// Actual shifts for employees on specific dates
export const shifts = pgTable("shifts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  departmentId: integer("department_id").notNull(),
  date: timestamp("date").notNull(), // The date of this shift
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shiftsRelations = relations(shifts, ({ one, many }) => ({
  user: one(users, {
    fields: [shifts.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [shifts.departmentId],
    references: [departments.id],
  }),
  breaks: many(breaks),
}));

// Breaks table
export const breaks = pgTable("breaks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  shiftId: integer("shift_id").notNull(),
  userId: varchar("user_id").notNull(),
  breakType: varchar("break_type", { length: 20 }).notNull(), // 'first' (15min), 'second' (30min), 'third' (15min)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const breaksRelations = relations(breaks, ({ one }) => ({
  shift: one(shifts, {
    fields: [breaks.shiftId],
    references: [shifts.id],
  }),
  user: one(users, {
    fields: [breaks.userId],
    references: [users.id],
  }),
}));

// Insert schemas and types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export const insertShiftPatternSchema = createInsertSchema(shiftPatterns).omit({
  id: true,
  createdAt: true,
});
export type InsertShiftPattern = z.infer<typeof insertShiftPatternSchema>;
export type ShiftPattern = typeof shiftPatterns.$inferSelect;

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;

export const insertBreakSchema = createInsertSchema(breaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBreak = z.infer<typeof insertBreakSchema>;
export type Break = typeof breaks.$inferSelect;

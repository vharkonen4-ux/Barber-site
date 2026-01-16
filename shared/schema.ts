import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export auth models
export * from "./models/auth";

// === Services ===
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  duration: integer("duration").notNull(), // in minutes
  image: text("image").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

// === Barbers ===
export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  image: text("image").notNull(),
  specialties: text("specialties").array(),
  availability: jsonb("availability").$type<{
    days: number[]; // 0-6 (Sun-Sat)
    hours: { start: string; end: string }; // "09:00", "17:00"
  }>().notNull(),
});

export const insertBarberSchema = createInsertSchema(barbers).omit({ id: true });
export type Barber = typeof barbers.$inferSelect;
export type InsertBarber = z.infer<typeof insertBarberSchema>;

// === Appointments ===
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceId: integer("service_id").notNull(),
  barberId: integer("barber_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).default("pending").notNull(),
  notes: text("notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// === Contacts ===
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

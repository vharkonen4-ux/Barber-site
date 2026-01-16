import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  services, barbers, appointments, contacts,
  type Service, type InsertService,
  type Barber, type InsertBarber,
  type Appointment, type InsertAppointment,
  type Contact, type InsertContact
} from "@shared/schema";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth";

export interface IStorage extends IAuthStorage {
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  // Barbers
  getBarbers(): Promise<Barber[]>;
  getBarber(id: number): Promise<Barber | undefined>;
  createBarber(barber: InsertBarber): Promise<Barber>;
  updateBarber(id: number, barber: Partial<InsertBarber>): Promise<Barber | undefined>;
  deleteBarber(id: number): Promise<void>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
}

export class DatabaseStorage implements IStorage {
  // Inherit auth storage methods
  getUser = authStorage.getUser;
  upsertUser = authStorage.upsertUser;

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Barbers
  async getBarbers(): Promise<Barber[]> {
    return await db.select().from(barbers);
  }

  async getBarber(id: number): Promise<Barber | undefined> {
    const [barber] = await db.select().from(barbers).where(eq(barbers.id, id));
    return barber;
  }

  async createBarber(insertBarber: InsertBarber): Promise<Barber> {
    const [barber] = await db.insert(barbers).values(insertBarber).returning();
    return barber;
  }

  async updateBarber(id: number, updates: Partial<InsertBarber>): Promise<Barber | undefined> {
    const [barber] = await db
      .update(barbers)
      .set(updates)
      .where(eq(barbers.id, id))
      .returning();
    return barber;
  }

  async deleteBarber(id: number): Promise<void> {
    await db.delete(barbers).where(eq(barbers.id, id));
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status: status as any })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }
}

export const storage = new DatabaseStorage();

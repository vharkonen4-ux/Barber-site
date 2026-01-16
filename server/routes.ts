import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Services API ===
  app.get(api.services.list.path, async (_req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.get(api.services.get.path, async (req, res) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.services.create.input.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.services.update.path, isAuthenticated, async (req, res) => {
    const input = api.services.update.input.parse(req.body);
    const service = await storage.updateService(Number(req.params.id), input);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.delete(api.services.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.status(204).end();
  });

  // === Barbers API ===
  app.get(api.barbers.list.path, async (_req, res) => {
    const barbers = await storage.getBarbers();
    res.json(barbers);
  });

  app.get(api.barbers.get.path, async (req, res) => {
    const barber = await storage.getBarber(Number(req.params.id));
    if (!barber) return res.status(404).json({ message: "Barber not found" });
    res.json(barber);
  });

  app.post(api.barbers.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.barbers.create.input.parse(req.body);
      const barber = await storage.createBarber(input);
      res.status(201).json(barber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.barbers.update.path, isAuthenticated, async (req, res) => {
    const input = api.barbers.update.input.parse(req.body);
    const barber = await storage.updateBarber(Number(req.params.id), input);
    if (!barber) return res.status(404).json({ message: "Barber not found" });
    res.json(barber);
  });

  app.delete(api.barbers.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteBarber(Number(req.params.id));
    res.status(204).end();
  });

  // === Appointments API ===
  app.get(api.appointments.list.path, isAuthenticated, async (_req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      // Coerce serviceId and barberId since they might come as strings from forms
      const schema = api.appointments.create.input.extend({
        serviceId: z.coerce.number(),
        barberId: z.coerce.number(),
        startTime: z.coerce.date(),
      });
      const input = schema.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.appointments.updateStatus.path, isAuthenticated, async (req, res) => {
    const { status } = req.body;
    const appointment = await storage.updateAppointmentStatus(Number(req.params.id), status);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  });

  // === Contact API ===
  app.post(api.contacts.create.path, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingServices = await storage.getServices();
  if (existingServices.length === 0) {
    console.log("Seeding services...");
    await storage.createService({
      name: "Classic Haircut",
      description: "Traditional scissor cut with hot towel finish.",
      price: 3500, // $35.00
      duration: 30,
      image: "https://images.unsplash.com/photo-1599351431202-6e0005079746?auto=format&fit=crop&q=80",
    });
    await storage.createService({
      name: "Beard Trim",
      description: "Expert shaping and trimming of facial hair.",
      price: 2500, // $25.00
      duration: 20,
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80",
    });
    await storage.createService({
      name: "Royal Shave",
      description: "Straight razor shave with hot lather and oils.",
      price: 4500, // $45.00
      duration: 45,
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80",
    });
  }

  const existingBarbers = await storage.getBarbers();
  if (existingBarbers.length === 0) {
    console.log("Seeding barbers...");
    await storage.createBarber({
      name: "James 'The Blade'",
      bio: "Master barber with 15 years of experience in classic cuts.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80",
      specialties: ["Fades", "Hot Towel Shaves"],
      availability: {
        days: [1, 2, 3, 4, 5, 6], // Mon-Sat
        hours: { start: "09:00", end: "18:00" },
      },
    });
    await storage.createBarber({
      name: "Sarah Styles",
      bio: "Specializing in modern styles and beard grooming.",
      image: "https://images.unsplash.com/photo-1521225099409-8e1efc95321d?auto=format&fit=crop&q=80",
      specialties: ["Beard Trims", "Modern Styles"],
      availability: {
        days: [0, 2, 3, 4, 5], // Sun, Tue-Fri
        hours: { start: "10:00", end: "19:00" },
      },
    });
  }
}

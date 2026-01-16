import { motion } from "framer-motion";
import { Link } from "wouter";
import { Scissors, Calendar, User, Star, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useServices } from "@/hooks/use-services";
import { useBarbers } from "@/hooks/use-barbers";
import { useCreateContact } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/schema";

export default function Home() {
  const { data: services } = useServices();
  const { data: barbers } = useBarbers();
  const { toast } = useToast();
  const createContact = useCreateContact();

  const form = useForm({
    resolver: zodResolver(insertContactSchema),
    defaultValues: { name: "", email: "", message: "" }
  });

  const onSubmit = (data: z.infer<typeof insertContactSchema>) => {
    createContact.mutate(data, {
      onSuccess: () => {
        toast({ title: "Message Sent", description: "We'll get back to you shortly." });
        form.reset();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Unsplash: Barber shop interior dark moody */}
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2074" 
            alt="Barbershop Interior" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
              Est. 2024 • New York City
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight">
              Sharpen Your <br/><span className="text-primary">Style</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Experience the art of traditional grooming in a modern, sophisticated atmosphere. 
              Where precision meets passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book" className="btn-gold px-8 py-4 rounded text-base inline-block">
                  Book Appointment
              </Link>
              <a href="#services" className="px-8 py-4 rounded text-base font-bold text-white border border-white/20 hover:bg-white/5 transition-colors uppercase tracking-wider inline-block">
                  View Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-secondary/20">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-white mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From classic cuts to hot towel shaves, we offer a full range of grooming services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card-vintage group overflow-hidden"
              >
                <div className="h-48 overflow-hidden relative">
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                   <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl text-white group-hover:text-primary transition-colors">{service.name}</h3>
                    <span className="text-primary font-bold font-mono text-lg">${(service.price / 100).toFixed(2)}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground/80">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {service.duration} mins</span>
                    <Link href="/book" className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
                        Book Now <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) || (
              /* Loading Skeletons */
              [1, 2, 3].map(i => (
                <div key={i} className="card-vintage h-80 animate-pulse bg-secondary/50" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section className="py-24">
        <div className="container-width">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl text-white mb-4">Master Barbers</h2>
              <div className="w-24 h-1 bg-primary mb-6" />
              <p className="text-muted-foreground max-w-xl">
                Our team of skilled professionals dedicated to the craft of grooming.
              </p>
            </div>
            <Link href="/book" className="text-primary hover:text-white transition-colors flex items-center gap-2">
                Book a barber <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {barbers?.map((barber, idx) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group text-center"
              >
                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full p-1 border-2 border-primary/30 group-hover:border-primary transition-colors">
                  <img 
                    src={barber.image} 
                    alt={barber.name} 
                    className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="text-xl text-white mb-1">{barber.name}</h3>
                <p className="text-primary text-sm mb-3">Senior Barber</p>
                <div className="flex justify-center gap-2">
                  {barber.specialties?.slice(0, 2).map(spec => (
                    <span key={spec} className="px-2 py-1 bg-secondary rounded text-[10px] text-muted-foreground uppercase tracking-wider border border-white/5">
                      {spec}
                    </span>
                  ))}
                </div>
              </motion.div>
            )) || (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full bg-secondary animate-pulse mb-4" />
                  <div className="w-32 h-6 bg-secondary animate-pulse mb-2" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-secondary/10 border-t border-white/5">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl text-white mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have questions or need a special appointment? Send us a message or drop by.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white text-lg">Appointments</h4>
                    <p className="text-muted-foreground">Book online 24/7 or call us during business hours.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white text-lg">Careers</h4>
                    <p className="text-muted-foreground">We are always looking for talented barbers to join our team.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-vintage p-8 bg-black/40">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                  <input {...form.register("name")} className="w-full input-vintage px-4 py-3 text-white" placeholder="John Doe" />
                  {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                  <input {...form.register("email")} className="w-full input-vintage px-4 py-3 text-white" placeholder="john@example.com" />
                  {form.formState.errors.email && <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Message</label>
                  <textarea {...form.register("message")} className="w-full input-vintage px-4 py-3 text-white min-h-[120px]" placeholder="How can we help?" />
                  {form.formState.errors.message && <p className="text-destructive text-xs mt-1">{form.formState.errors.message.message}</p>}
                </div>
                <button type="submit" disabled={createContact.isPending} className="btn-gold w-full py-3 rounded">
                  {createContact.isPending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

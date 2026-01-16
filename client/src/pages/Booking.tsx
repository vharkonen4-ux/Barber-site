import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, ChevronLeft, ChevronRight, User, Scissors } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useServices } from "@/hooks/use-services";
import { useBarbers } from "@/hooks/use-barbers";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { insertAppointmentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Steps for the wizard
const STEPS = ["Service", "Barber", "Date & Time", "Details", "Confirm"];

export default function Booking() {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: barbers, isLoading: barbersLoading } = useBarbers();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  
  // Local state for selections before form submission
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Final step form
  const form = useForm({
    resolver: zodResolver(
      z.object({
        customerName: z.string().min(2, "Name required"),
        customerEmail: z.string().email("Invalid email"),
        customerPhone: z.string().min(10, "Valid phone required"),
        notes: z.string().optional(),
      })
    )
  });

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  const handleServiceSelect = (id: number) => {
    setSelectedServiceId(id);
    nextStep();
  };

  const handleBarberSelect = (id: number) => {
    setSelectedBarberId(id);
    nextStep();
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) nextStep();
    else toast({ title: "Required", description: "Please select both date and time", variant: "destructive" });
  };

  const onSubmit = (customerData: any) => {
    if (!selectedServiceId || !selectedBarberId || !selectedDate || !selectedTime) return;

    // Combine date and time
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes);

    const payload = {
      ...customerData,
      serviceId: selectedServiceId,
      barberId: selectedBarberId,
      startTime: startTime.toISOString(), // Send as ISO string
      status: "pending" as const,
    };

    createAppointment.mutate(payload, {
      onSuccess: () => nextStep(),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const selectedService = services?.find(s => s.id === selectedServiceId);
  const selectedBarber = barbers?.find(b => b.id === selectedBarberId);

  // Generate simple time slots for demo (real app would check availability)
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
           <div className="flex justify-between items-center relative z-10">
             {STEPS.map((step, idx) => (
               <div key={idx} className="flex flex-col items-center">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 ${
                   idx <= currentStep ? "bg-primary border-primary text-black" : "bg-card border-secondary text-muted-foreground"
                 }`}>
                   {idx + 1}
                 </div>
                 <span className={`mt-2 text-xs uppercase tracking-wider ${idx <= currentStep ? "text-primary" : "text-muted-foreground"}`}>
                   {step}
                 </span>
               </div>
             ))}
           </div>
           {/* Line background */}
           <div className="absolute top-[148px] left-0 w-full h-0.5 bg-secondary -z-0 max-w-5xl mx-auto hidden md:block" />
        </div>

        <div className="card-vintage min-h-[500px] p-6 md:p-10 relative">
          <AnimatePresence mode="wait">
            {/* STEP 1: SERVICES */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-serif text-white mb-6">Select a Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servicesLoading ? <p>Loading services...</p> : services?.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className="cursor-pointer border border-border bg-secondary/30 rounded-xl p-4 hover:border-primary hover:bg-secondary/50 transition-all group"
                    >
                       <div className="flex justify-between items-start mb-3">
                         <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
                         <span className="text-primary font-mono">${(service.price / 100).toFixed(2)}</span>
                       </div>
                       <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                       <div className="flex items-center text-xs text-muted-foreground">
                         <Clock className="w-3 h-3 mr-1" /> {service.duration} mins
                       </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: BARBERS */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={prevStep} className="mb-6 flex items-center text-sm text-muted-foreground hover:text-white"><ChevronLeft className="w-4 h-4 mr-1"/> Back</button>
                <h2 className="text-2xl font-serif text-white mb-6">Choose your Barber</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {barbersLoading ? <p>Loading barbers...</p> : barbers?.map(barber => (
                    <div 
                      key={barber.id}
                      onClick={() => handleBarberSelect(barber.id)}
                      className="cursor-pointer border border-border bg-secondary/30 rounded-xl p-6 hover:border-primary hover:bg-secondary/50 transition-all text-center group"
                    >
                      <img src={barber.image} alt={barber.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-transparent group-hover:border-primary transition-all" />
                      <h3 className="font-bold text-lg text-white mb-1">{barber.name}</h3>
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {barber.specialties?.slice(0, 2).map(s => (
                          <span key={s} className="text-[10px] uppercase bg-background px-2 py-1 rounded text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: DATE & TIME */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={prevStep} className="mb-6 flex items-center text-sm text-muted-foreground hover:text-white"><ChevronLeft className="w-4 h-4 mr-1"/> Back</button>
                <h2 className="text-2xl font-serif text-white mb-6">Select Date & Time</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: new Date() }}
                      className="text-foreground"
                      styles={{
                        caption: { color: 'var(--primary)' },
                        day_selected: { backgroundColor: 'var(--primary)', color: 'black' },
                        day_today: { color: 'var(--primary)', fontWeight: 'bold' }
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-primary"/> Available Slots</h3>
                    {!selectedDate ? (
                      <p className="text-muted-foreground italic">Please select a date first.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                              selectedTime === time 
                                ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" 
                                : "bg-background border-border hover:border-primary/50 text-white"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                   <button 
                    onClick={handleDateTimeSelect} 
                    disabled={!selectedDate || !selectedTime}
                    className="btn-gold px-8 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Next Step
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DETAILS */}
            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 <button onClick={prevStep} className="mb-6 flex items-center text-sm text-muted-foreground hover:text-white"><ChevronLeft className="w-4 h-4 mr-1"/> Back</button>
                 <h2 className="text-2xl font-serif text-white mb-6">Your Details</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <div>
                       <label className="block text-sm mb-1 text-muted-foreground">Full Name</label>
                       <input {...form.register("customerName")} className="w-full input-vintage px-4 py-3 text-white" />
                       {form.formState.errors.customerName && <p className="text-destructive text-xs mt-1">{form.formState.errors.customerName.message}</p>}
                     </div>
                     <div>
                       <label className="block text-sm mb-1 text-muted-foreground">Email Address</label>
                       <input {...form.register("customerEmail")} className="w-full input-vintage px-4 py-3 text-white" />
                       {form.formState.errors.customerEmail && <p className="text-destructive text-xs mt-1">{form.formState.errors.customerEmail.message}</p>}
                     </div>
                     <div>
                       <label className="block text-sm mb-1 text-muted-foreground">Phone Number</label>
                       <input {...form.register("customerPhone")} className="w-full input-vintage px-4 py-3 text-white" />
                       {form.formState.errors.customerPhone && <p className="text-destructive text-xs mt-1">{form.formState.errors.customerPhone.message}</p>}
                     </div>
                     <div>
                       <label className="block text-sm mb-1 text-muted-foreground">Special Requests (Optional)</label>
                       <textarea {...form.register("notes")} className="w-full input-vintage px-4 py-3 text-white h-24" />
                     </div>
                   </form>

                   <div className="bg-secondary/20 p-6 rounded-xl border border-white/5 h-fit">
                     <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4">Booking Summary</h3>
                     <div className="space-y-4 text-sm">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Service</span>
                         <span className="text-white font-medium">{selectedService?.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Barber</span>
                         <span className="text-white font-medium">{selectedBarber?.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Date</span>
                         <span className="text-white font-medium">{selectedDate && format(selectedDate, "MMM dd, yyyy")}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Time</span>
                         <span className="text-white font-medium">{selectedTime}</span>
                       </div>
                       <div className="border-t border-white/10 pt-4 flex justify-between text-lg">
                         <span className="text-white">Total</span>
                         <span className="text-primary font-bold">${selectedService ? (selectedService.price / 100).toFixed(2) : "0.00"}</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="mt-8 flex justify-end">
                   <button 
                    type="submit"
                    form="booking-form"
                    disabled={createAppointment.isPending}
                    className="btn-gold px-8 py-3 rounded disabled:opacity-50"
                   >
                     {createAppointment.isPending ? "Confirming..." : "Confirm Booking"}
                   </button>
                 </div>
              </motion.div>
            )}

            {/* STEP 5: CONFIRMED */}
            {currentStep === 4 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-serif text-white mb-4">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your appointment has been successfully scheduled. We've sent a confirmation email to your inbox.
                </p>
                <button 
                  onClick={() => window.location.href = "/"}
                  className="px-8 py-3 bg-secondary text-white rounded hover:bg-secondary/80 border border-white/10 transition-colors"
                >
                  Return Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

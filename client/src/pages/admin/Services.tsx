import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useServices, useCreateService, useDeleteService } from "@/hooks/use-services";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema, type InsertService } from "@shared/schema";
import { Loader2, Trash2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Services() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: services, isLoading: servicesLoading } = useServices();
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop"
    }
  });

  const onSubmit = (data: InsertService) => {
    createService.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Success", description: "Service created successfully" });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteService.mutate(id, {
        onSuccess: () => toast({ title: "Deleted", description: "Service removed" })
      });
    }
  };

  if (authLoading || servicesLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null; // Router will redirect

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Nav - Reused for consistency, ideally a component */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="font-serif font-bold text-xl">Admin<span className="text-primary">Panel</span></span>
            <div className="flex gap-4 text-sm">
              <Link href="/admin"><span className="text-muted-foreground hover:text-white cursor-pointer">Appointments</span></Link>
              <Link href="/admin/services"><span className="text-primary font-medium cursor-pointer">Services</span></Link>
              <Link href="/admin/barbers"><span className="text-muted-foreground hover:text-white cursor-pointer">Barbers</span></Link>
            </div>
          </div>
           <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin</span>
            <button onClick={() => logout()} className="text-xs border border-white/10 px-3 py-1 rounded hover:bg-white/5">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Manage Services</h1>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="btn-gold px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map(service => (
            <div key={service.id} className="bg-card border border-border rounded-xl overflow-hidden group">
              <div className="h-40 overflow-hidden relative">
                 <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                 <div className="absolute top-2 right-2">
                   <button 
                     onClick={() => handleDelete(service.id)}
                     className="bg-black/50 hover:bg-red-500/80 p-2 rounded-full text-white transition-colors backdrop-blur-sm"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{service.name}</h3>
                  <span className="text-primary font-mono">${(service.price / 100).toFixed(2)}</span>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{service.description}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-muted-foreground">
                  Duration: {service.duration} mins
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add New Service</h3>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Service Name</label>
                <input {...form.register("name")} className="w-full input-vintage px-3 py-2 text-white" />
                {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Description</label>
                <textarea {...form.register("description")} className="w-full input-vintage px-3 py-2 text-white" />
                {form.formState.errors.description && <p className="text-destructive text-xs">{form.formState.errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm text-muted-foreground mb-1">Price (cents)</label>
                  <input type="number" {...form.register("price", { valueAsNumber: true })} className="w-full input-vintage px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Duration (mins)</label>
                  <input type="number" {...form.register("duration", { valueAsNumber: true })} className="w-full input-vintage px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
                <input {...form.register("image")} className="w-full input-vintage px-3 py-2 text-white" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded text-sm hover:bg-white/5 text-white transition-colors">Cancel</button>
                <button type="submit" disabled={createService.isPending} className="btn-gold px-6 py-2 rounded text-sm">
                  {createService.isPending ? "Creating..." : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

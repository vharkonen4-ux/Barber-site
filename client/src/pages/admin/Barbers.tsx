import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useBarbers, useCreateBarber, useDeleteBarber } from "@/hooks/use-barbers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBarberSchema, type InsertBarber } from "@shared/schema";
import { Loader2, Trash2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Barbers() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: barbers, isLoading: barbersLoading } = useBarbers();
  const createBarber = useCreateBarber();
  const deleteBarber = useDeleteBarber();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<InsertBarber>({
    resolver: zodResolver(insertBarberSchema),
    defaultValues: {
      name: "",
      bio: "",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop",
      specialties: ["Haircut", "Shave"],
      availability: {
        days: [1, 2, 3, 4, 5, 6],
        hours: { start: "09:00", end: "18:00" }
      }
    }
  });

  const onSubmit = (data: InsertBarber) => {
    createBarber.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Success", description: "Barber added successfully" });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteBarber.mutate(id, {
        onSuccess: () => toast({ title: "Deleted", description: "Barber removed" })
      });
    }
  };

  if (authLoading || barbersLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null; 

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="font-serif font-bold text-xl">Admin<span className="text-primary">Panel</span></span>
            <div className="flex gap-4 text-sm">
              <Link href="/admin"><span className="text-muted-foreground hover:text-white cursor-pointer">Appointments</span></Link>
              <Link href="/admin/services"><span className="text-muted-foreground hover:text-white cursor-pointer">Services</span></Link>
              <Link href="/admin/barbers"><span className="text-primary font-medium cursor-pointer">Barbers</span></Link>
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
          <h1 className="text-2xl font-bold text-white">Manage Barbers</h1>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="btn-gold px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Barber
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers?.map(barber => (
            <div key={barber.id} className="bg-card border border-border rounded-xl p-6 text-center relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(barber.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <img src={barber.image} alt={barber.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-4 border-2 border-primary" />
              <h3 className="font-bold text-white text-xl mb-1">{barber.name}</h3>
              <p className="text-sm text-primary mb-3">Master Barber</p>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{barber.bio}</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {barber.specialties?.map(s => (
                  <span key={s} className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground uppercase">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* Create Modal - Simplified for brevity */}
       {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-4">Add New Barber</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Name</label>
                <input {...form.register("name")} className="w-full input-vintage px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Bio</label>
                <textarea {...form.register("bio")} className="w-full input-vintage px-3 py-2 text-white" />
              </div>
               <div>
                <label className="block text-sm text-muted-foreground mb-1">Image URL</label>
                <input {...form.register("image")} className="w-full input-vintage px-3 py-2 text-white" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded text-sm hover:bg-white/5 text-white">Cancel</button>
                <button type="submit" disabled={createBarber.isPending} className="btn-gold px-6 py-2 rounded text-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: appointments, isLoading: appsLoading } = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const [, setLocation] = useLocation();

  if (authLoading || appsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Should be handled by router protection, but failsafe
    setLocation("/");
    return null;
  }

  // Calculate stats
  const pendingCount = appointments?.filter(a => a.status === 'pending').length || 0;
  const todayCount = appointments?.filter(a => {
    const appDate = new Date(a.startTime);
    const today = new Date();
    return appDate.toDateString() === today.toDateString();
  }).length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Nav */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="font-serif font-bold text-xl">Admin<span className="text-primary">Panel</span></span>
            <div className="flex gap-4 text-sm">
              <Link href="/admin"><span className="text-primary font-medium cursor-pointer">Appointments</span></Link>
              <Link href="/admin/services"><span className="text-muted-foreground hover:text-white cursor-pointer">Services</span></Link>
              <Link href="/admin/barbers"><span className="text-muted-foreground hover:text-white cursor-pointer">Barbers</span></Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin</span>
            <button onClick={() => logout()} className="text-xs border border-white/10 px-3 py-1 rounded hover:bg-white/5">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-primary">{pendingCount}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Today's Appointments</h3>
            <p className="text-3xl font-bold text-white">{todayCount}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-white">{appointments?.length || 0}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-white">All Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments?.map((app) => (
                  <tr key={app.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{app.customerName}</div>
                      <div className="text-muted-foreground text-xs">{app.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">Service #{app.serviceId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="w-3 h-3 text-primary" />
                        {format(new Date(app.startTime), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(app.startTime), "hh:mm a")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${app.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                          app.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          app.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-yellow-500/10 text-yellow-500'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus.mutate({ id: app.id, status: 'confirmed' })}
                            disabled={updateStatus.isPending}
                            className="text-green-500 hover:bg-green-500/10 p-1 rounded transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateStatus.mutate({ id: app.id, status: 'cancelled' })}
                            disabled={updateStatus.isPending}
                            className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {app.status === 'confirmed' && (
                         <button 
                           onClick={() => updateStatus.mutate({ id: app.id, status: 'completed' })}
                           className="text-blue-500 hover:bg-blue-500/10 px-3 py-1 rounded text-xs border border-blue-500/20"
                         >
                           Complete
                         </button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

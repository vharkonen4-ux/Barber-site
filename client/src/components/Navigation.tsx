import { Link, useLocation } from "wouter";
import { Scissors, Menu, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/book", label: "Book Now" },
  ];

  if (user) {
    navLinks.push({ href: "/admin", label: "Dashboard" });
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="p-2 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Scissors className="h-6 w-6 text-primary rotate-[-45deg]" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tighter text-foreground">
                GENTLEMAN'S <span className="text-primary">CUT</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`cursor-pointer text-sm font-medium tracking-wide transition-colors duration-200 ${
                  location === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                  {link.label.toUpperCase()}
                </span>
              </Link>
            ))}
            {!user ? (
               <a href="/api/login" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                 <ShieldCheck className="w-3 h-3" /> Admin Login
               </a>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Hi, {user.firstName || 'Admin'}</span>
              </div>
            )}
            <Link href="/book">
              <button className="btn-gold px-6 py-2 rounded text-sm">
                Book Appointment
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border/50 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
             {!user && (
               <a href="/api/login" className="block px-3 py-3 text-sm text-muted-foreground">
                 Admin Login
               </a>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}

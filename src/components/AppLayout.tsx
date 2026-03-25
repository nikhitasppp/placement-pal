import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/applications', label: 'Applications', icon: FileText },
  { path: '/resumes', label: 'Resumes', icon: Upload },
  { path: '/reminders', label: 'Reminders', icon: Bell },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 bg-card/60 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="gradient-primary rounded-xl p-2 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Placement Tracker</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full p-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-card/90 backdrop-blur-xl border-b border-border/40 shadow-xl animate-slide-up">
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      <main className="container py-8 animate-fade-in">{children}</main>
    </div>
  );
};
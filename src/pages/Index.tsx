import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BarChart3, Shield, Zap, ArrowRight } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Visual Dashboard', description: 'Track all your applications with beautiful analytics and real-time stats at a glance.' },
  { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and only accessible by you. Full row-level security.' },
  { icon: Zap, title: 'Smart Reminders', description: 'Never miss an interview or deadline with timely notifications and countdowns.' },
];

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/60 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="gradient-primary rounded-xl p-2 shadow-md">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Placement Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-medium">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground btn-glow font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-28 md:py-40 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            🚀 Your career, organized
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Track your placements{' '}
            <span className="gradient-text">smartly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Manage job applications, resumes, and interview schedules in one beautiful, organized platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground px-8 btn-glow text-base font-semibold">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8 text-base font-semibold hover:bg-card/80">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-28">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card p-8 text-center space-y-4 animate-slide-up hover-lift"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © 2026 Placement Tracker. Built for students, by students.
      </footer>
    </div>
  );
};

export default Index;
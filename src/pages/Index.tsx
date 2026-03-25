import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, BarChart3, Shield, Zap } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Visual Dashboard', description: 'Track all your applications with beautiful analytics at a glance.' },
  { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and only accessible by you.' },
  { icon: Zap, title: 'Smart Reminders', description: 'Never miss an interview or deadline with timely notifications.' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-lg p-2">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">PlaceTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-36 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            🚀 Your career, organized
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Track your placements{' '}
            <span className="gradient-text">smartly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Manage job applications, resumes, and interview schedules in one beautiful, organized platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-8 text-center space-y-4 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2026 PlaceTrack. Built for students, by students.
      </footer>
    </div>
  );
};

export default Index;

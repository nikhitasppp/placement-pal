import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Calendar, Trophy, XCircle, Clock, TrendingUp, Target, Search, Building2, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Tables } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);
  const [reminders, setReminders] = useState<Tables<'reminders'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [appsRes, remRes] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('is_completed', false).order('reminder_date', { ascending: true }).limit(5),
      ]);
      setApplications(appsRes.data ?? []);
      setReminders(remRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: FileText, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'Interview').length, icon: Calendar, gradient: 'from-amber-400 to-orange-500' },
    { label: 'Offers', value: applications.filter(a => a.status === 'Offer').length, icon: Trophy, gradient: 'from-emerald-400 to-green-500' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, icon: XCircle, gradient: 'from-rose-400 to-red-500' },
  ];

  const successRate = useMemo(() => {
    if (applications.length === 0) return 0;
    const offers = applications.filter(a => a.status === 'Offer').length;
    return Math.round((offers / applications.length) * 100);
  }, [applications]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeks[key] = 0;
    }
    applications.forEach(app => {
      const d = new Date(app.applied_date);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (key in weeks) weeks[key]++;
      }
    });
    return Object.entries(weeks).map(([day, count]) => ({ day, count }));
  }, [applications]);

  const topCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => { counts[a.company_name] = (counts[a.company_name] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [applications]);

  const priorityApps = useMemo(() => {
    return applications.filter(a => a.status === 'Interview' || a.status === 'Offer').slice(0, 4);
  }, [applications]);

  const upcomingInterviews = useMemo(() => {
    return reminders.filter(r => {
      const d = new Date(r.reminder_date);
      return d > new Date();
    });
  }, [reminders]);

  const filteredApps = useMemo(() => {
    if (!searchQuery) return applications.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return applications.filter(a => a.company_name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)).slice(0, 5);
  }, [applications, searchQuery]);

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    if (diff <= 0) return 'Now';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your placement overview.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-card/60 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={stat.label} className="glass-card hover-lift animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`rounded-xl p-3 bg-gradient-to-br ${stat.gradient} shadow-md`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Row: chart + success rate + countdown */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="glass-card lg:col-span-2 hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}
                    />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(221, 83%, 53%)" />
                        <stop offset="100%" stopColor="hsl(260, 60%, 55%)" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="glass-card hover-lift flex-1">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Target className="h-8 w-8 text-primary mb-2" />
                <p className="text-4xl font-extrabold gradient-text">{successRate}%</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">Success Rate</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift flex-1">
              <CardContent className="p-6">
                <p className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-warning" /> Upcoming Interviews
                </p>
                {upcomingInterviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No upcoming interviews</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingInterviews.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <span className="truncate text-xs font-medium">{r.title}</span>
                        <span className="text-xs font-bold text-primary shrink-0 ml-2">{getCountdown(r.reminder_date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row: priority apps + top companies + recent */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Priority Applications */}
          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" /> Priority Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {priorityApps.length === 0 ? (
                <p className="text-muted-foreground text-sm">No priority applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {priorityApps.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{app.company_name}</p>
                        <p className="text-xs text-muted-foreground">{app.role}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Companies */}
          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCompanies.length === 0 ? (
                <p className="text-muted-foreground text-sm">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {topCompanies.map(([name, count], i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredApps.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">No applications yet — start tracking your placements!</p>
                  <Link to="/applications">
                    <Button size="sm" className="gradient-primary text-primary-foreground btn-glow">Add Application</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{app.company_name}</p>
                        <p className="text-xs text-muted-foreground">{app.role}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Applied: 'bg-primary/10 text-primary',
    Interview: 'bg-warning/10 text-warning',
    Offer: 'bg-success/10 text-success',
    Rejected: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

export default Dashboard;
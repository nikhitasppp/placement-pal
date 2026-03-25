import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Trophy, XCircle, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Tables<'applications'>[]>([]);
  const [reminders, setReminders] = useState<Tables<'reminders'>[]>([]);
  const [loading, setLoading] = useState(true);

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
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'Interview').length, icon: Calendar, color: 'bg-warning/10 text-warning' },
    { label: 'Offers', value: applications.filter(a => a.status === 'Offer').length, icon: Trophy, color: 'bg-success/10 text-success' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, icon: XCircle, color: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your placement overview.</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-24" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={stat.label} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent applications */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-muted-foreground text-sm">No applications yet. Start tracking!</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{app.company_name}</p>
                        <p className="text-xs text-muted-foreground">{app.role}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming reminders */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming reminders.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map(rem => (
                    <div key={rem.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4 text-warning shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{rem.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rem.reminder_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
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
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

export default Dashboard;

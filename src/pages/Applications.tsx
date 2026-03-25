import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, FileText, ArrowUpDown } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'] as const;
type SortKey = 'latest' | 'oldest' | 'company';

const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Tables<'applications'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortKey>('latest');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Tables<'applications'> | null>(null);
  const [form, setForm] = useState({ company_name: '', role: '', status: 'Applied', applied_date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchApps = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('applications').select('*').order('applied_date', { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [user]);

  const openNew = () => {
    setEditingApp(null);
    setForm({ company_name: '', role: '', status: 'Applied', applied_date: new Date().toISOString().split('T')[0], notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (app: Tables<'applications'>) => {
    setEditingApp(app);
    setForm({ company_name: app.company_name, role: app.role, status: app.status, applied_date: app.applied_date, notes: app.notes ?? '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editingApp) {
      const { error } = await supabase.from('applications').update(form).eq('id', editingApp.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Updated!' });
    } else {
      const { error } = await supabase.from('applications').insert({ ...form, user_id: user.id });
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Application added!' });
    }
    setDialogOpen(false);
    fetchApps();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' });
    fetchApps();
  };

  const processed = useMemo(() => {
    let list = filter === 'All' ? apps : apps.filter(a => a.status === filter);
    if (sortBy === 'latest') list = [...list].sort((a, b) => new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime());
    if (sortBy === 'oldest') list = [...list].sort((a, b) => new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime());
    if (sortBy === 'company') list = [...list].sort((a, b) => a.company_name.localeCompare(b.company_name));
    return list;
  }, [apps, filter, sortBy]);

  const statusStyles: Record<string, string> = {
    Applied: 'bg-primary/10 text-primary border-primary/20',
    Interview: 'bg-warning/10 text-warning border-warning/20',
    Offer: 'bg-success/10 text-success border-success/20',
    Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const chipStyles: Record<string, string> = {
    All: 'gradient-primary text-primary-foreground shadow-md',
    Applied: 'bg-primary text-primary-foreground',
    Interview: 'bg-warning text-warning-foreground',
    Offer: 'bg-success text-success-foreground',
    Rejected: 'bg-destructive text-destructive-foreground',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Applications</h1>
            <p className="text-muted-foreground mt-1">Manage your job applications</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground btn-glow" onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" /> Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{editingApp ? 'Edit Application' : 'New Application'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Applied Date</Label>
                    <Input type="date" value={form.applied_date} onChange={e => setForm(f => ({ ...f, applied_date: e.target.value }))} required className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
                </div>
                <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground btn-glow font-semibold">
                  {editingApp ? 'Update' : 'Add Application'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {['All', ...statuses].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  filter === s ? chipStyles[s] + ' border-transparent' : 'bg-card/60 text-muted-foreground border-border/50 hover:bg-muted'
                }`}
              >
                {s} {s !== 'All' && <span className="ml-1 opacity-70">({apps.filter(a => a.status === s).length})</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="bg-card/60 border border-border/50 rounded-lg px-2 py-1 text-xs font-medium"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company name</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="glass-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : processed.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-16 text-center space-y-4">
              <FileText className="h-14 w-14 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No applications yet — start tracking your placements!</p>
              <Button className="gradient-primary text-primary-foreground btn-glow" onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" /> Add Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {processed.map((app, i) => (
              <Card key={app.id} className="glass-card hover-lift animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-base">{app.company_name}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyles[app.status] ?? ''}`}>{app.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{app.role} · Applied {new Date(app.applied_date).toLocaleDateString()}</p>
                    {app.notes && <p className="text-xs text-muted-foreground mt-1.5 truncate max-w-md">{app.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(app)} className="hover:bg-primary/10 hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="hover:bg-destructive/10 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Applications;
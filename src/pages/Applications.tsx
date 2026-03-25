import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'] as const;

const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Tables<'applications'>[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Tables<'applications'> | null>(null);
  const [form, setForm] = useState({ company_name: '', role: '', status: 'Applied', applied_date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchApps = async () => {
    if (!user) return;
    const { data } = await supabase.from('applications').select('*').order('applied_date', { ascending: false });
    setApps(data ?? []);
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

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter);

  const statusStyles: Record<string, string> = {
    Applied: 'bg-primary/10 text-primary',
    Interview: 'bg-warning/10 text-warning',
    Offer: 'bg-success/10 text-success',
    Rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground">Manage your job applications</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground" onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" /> Add Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingApp ? 'Edit Application' : 'New Application'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Applied Date</Label>
                    <Input type="date" value={form.applied_date} onChange={e => setForm(f => ({ ...f, applied_date: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                  {editingApp ? 'Update' : 'Add Application'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['All', ...statuses].map(s => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(s)}
              className={filter === s ? 'gradient-primary text-primary-foreground' : ''}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              No applications found. Add your first one!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((app, i) => (
              <Card key={app.id} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">{app.company_name}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[app.status] ?? ''}`}>{app.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.role} · Applied {new Date(app.applied_date).toLocaleDateString()}</p>
                    {app.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{app.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(app)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

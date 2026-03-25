import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Bell, Trash2, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Reminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Tables<'reminders'>[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', reminder_date: '' });

  const fetchReminders = async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders').select('*').order('reminder_date', { ascending: true });
    setReminders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReminders(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id, title: form.title, description: form.description || null,
      reminder_date: new Date(form.reminder_date).toISOString(),
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Reminder added!' });
    setDialogOpen(false);
    setForm({ title: '', description: '', reminder_date: '' });
    fetchReminders();
  };

  const toggleComplete = async (reminder: Tables<'reminders'>) => {
    await supabase.from('reminders').update({ is_completed: !reminder.is_completed }).eq('id', reminder.id);
    fetchReminders();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchReminders();
  };

  const upcoming = reminders.filter(r => !r.is_completed);
  const completed = reminders.filter(r => r.is_completed);
  const isPast = (date: string) => new Date(date) < new Date();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Reminders</h1>
            <p className="text-muted-foreground mt-1">Never miss an interview or deadline</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground btn-glow">
                <Plus className="h-4 w-4 mr-2" /> Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader><DialogTitle className="text-xl font-bold">New Reminder</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Google Interview" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={form.reminder_date} onChange={e => setForm(f => ({ ...f, reminder_date: e.target.value }))} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Any notes..." />
                </div>
                <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground btn-glow font-semibold">Add Reminder</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="glass-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Upcoming</h2>
                {upcoming.map((rem, i) => (
                  <Card key={rem.id} className={`glass-card hover-lift animate-slide-up ${isPast(rem.reminder_date) ? 'border-destructive/40' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <Checkbox checked={rem.is_completed} onCheckedChange={() => toggleComplete(rem)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{rem.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span className={isPast(rem.reminder_date) ? 'text-destructive font-semibold' : ''}>
                            {new Date(rem.reminder_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {isPast(rem.reminder_date) && ' (overdue)'}
                          </span>
                        </div>
                        {rem.description && <p className="text-xs text-muted-foreground mt-1">{rem.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rem.id)} className="hover:bg-destructive/10 text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-muted-foreground">Completed</h2>
                {completed.map(rem => (
                  <Card key={rem.id} className="glass-card opacity-50">
                    <CardContent className="p-5 flex items-center gap-4">
                      <Checkbox checked onCheckedChange={() => toggleComplete(rem)} />
                      <div className="flex-1">
                        <p className="font-medium text-sm line-through">{rem.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rem.reminder_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rem.id)} className="hover:bg-destructive/10 text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {reminders.length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-16 text-center space-y-4">
                  <Bell className="h-14 w-14 mx-auto text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">No reminders yet. Add one to get started!</p>
                  <Button className="gradient-primary text-primary-foreground btn-glow" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Reminder
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Reminders;
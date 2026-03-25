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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Bell, Trash2, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Reminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Tables<'reminders'>[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', reminder_date: '' });

  const fetchReminders = async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders').select('*').order('reminder_date', { ascending: true });
    setReminders(data ?? []);
  };

  useEffect(() => { fetchReminders(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
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
            <h1 className="text-3xl font-bold">Reminders</h1>
            <p className="text-muted-foreground">Never miss an interview or deadline</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Reminder</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Google Interview" />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={form.reminder_date} onChange={e => setForm(f => ({ ...f, reminder_date: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Any notes..." />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Reminder</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {upcoming.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Bell className="h-4 w-4" /> Upcoming</h2>
            {upcoming.map((rem, i) => (
              <Card key={rem.id} className={`glass-card animate-slide-up ${isPast(rem.reminder_date) ? 'border-destructive/50' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox checked={rem.is_completed} onCheckedChange={() => toggleComplete(rem)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{rem.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className={isPast(rem.reminder_date) ? 'text-destructive font-medium' : ''}>
                        {new Date(rem.reminder_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {isPast(rem.reminder_date) && ' (overdue)'}
                      </span>
                    </div>
                    {rem.description && <p className="text-xs text-muted-foreground mt-1">{rem.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rem.id)} className="text-destructive hover:text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground">Completed</h2>
            {completed.map(rem => (
              <Card key={rem.id} className="glass-card opacity-60">
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox checked onCheckedChange={() => toggleComplete(rem)} />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-through">{rem.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rem.reminder_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rem.id)} className="text-destructive hover:text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {reminders.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No reminders yet. Add one to get started!
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Reminders;

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Resumes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Tables<'resumes'>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    if (!user) return;
    const { data } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
    setResumes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchResumes(); }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file);
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { error: dbError } = await supabase.from('resumes').insert({
      user_id: user.id, file_name: file.name, file_url: filePath, file_size: file.size,
    });
    if (dbError) {
      toast({ title: 'Error', description: dbError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Resume uploaded!' });
      fetchResumes();
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDownload = async (resume: Tables<'resumes'>) => {
    const { data, error } = await supabase.storage.from('resumes').createSignedUrl(resume.file_url, 60);
    if (error || !data) { toast({ title: 'Error', description: 'Could not generate download link', variant: 'destructive' }); return; }
    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (resume: Tables<'resumes'>) => {
    await supabase.storage.from('resumes').remove([resume.file_url]);
    const { error } = await supabase.from('resumes').delete().eq('id', resume.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Resume deleted' });
    fetchResumes();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Resumes</h1>
            <p className="text-muted-foreground mt-1">Upload and manage your resumes</p>
          </div>
          <div>
            <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUpload} />
            <Button className="gradient-primary text-primary-foreground btn-glow" onClick={() => document.getElementById('resume-upload')?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2].map(i => (
              <Card key={i} className="glass-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-16 text-center space-y-4">
              <FileText className="h-14 w-14 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No resumes uploaded yet.</p>
              <Button className="gradient-primary text-primary-foreground btn-glow" onClick={() => document.getElementById('resume-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Upload Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {resumes.map((resume, i) => (
              <Card key={resume.id} className="glass-card hover-lift animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-2.5 shrink-0 shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{resume.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(resume.file_size)} · {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(resume)} className="hover:bg-primary/10 hover:text-primary"><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(resume)} className="hover:bg-destructive/10 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default Resumes;
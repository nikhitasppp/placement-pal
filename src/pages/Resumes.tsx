import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Resumes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Tables<'resumes'>[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchResumes = async () => {
    if (!user) return;
    const { data } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
    setResumes(data ?? []);
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
      user_id: user.id,
      file_name: file.name,
      file_url: filePath,
      file_size: file.size,
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
    if (error || !data) {
      toast({ title: 'Error', description: 'Could not generate download link', variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (resume: Tables<'resumes'>) => {
    await supabase.storage.from('resumes').remove([resume.file_url]);
    const { error } = await supabase.from('resumes').delete().eq('id', resume.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
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
            <h1 className="text-3xl font-bold">Resumes</h1>
            <p className="text-muted-foreground">Upload and manage your resumes</p>
          </div>
          <div>
            <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUpload} />
            <Button className="gradient-primary text-primary-foreground" onClick={() => document.getElementById('resume-upload')?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </div>
        </div>

        {resumes.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No resumes uploaded yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {resumes.map((resume, i) => (
              <Card key={resume.id} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{resume.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(resume.file_size)} · {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(resume)}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(resume)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setUploadStatus('idle');
      } else {
        setFile(null);
        setUploadStatus('error');
      }
    }
  };

  const [jobDescription, setJobDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    // Check minimum 60 characters for job description if attempted
    if (jobDescription.trim().length > 0 && jobDescription.trim().length < 60) {
      setErrorMessage(`Job Description must be at least 60 characters for strict ATS matching (currently ${jobDescription.trim().length} characters).`);
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setUploadStatus('idle');
    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription.trim());
    }

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ats-resume-scanner-wmg2.onrender.com/api').trim().replace(/\/+$/, '');
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/resumes/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));

      if (response.ok && data.id) {
        setUploadStatus('success');
        // Immediately redirect to the scan results page to display scores, analysis summary, and recommendations!
        router.push(`/scans/${data.id}`);
      } else {
        setErrorMessage(data.error || data.message || 'Upload failed. Please try again.');
        setUploadStatus('error');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Connection error. Make sure backend is running.');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Strict JobScan ATS Resume Analyzer</CardTitle>
            <CardDescription>
              Upload your resume and optionally paste a Job Description for targeted ATS score matching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-base font-medium mb-1">
                  {file ? file.name : 'Click or drop your PDF / DOCX resume here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF and DOCX files (max 5MB)
                </p>
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="job-description" className="text-sm font-medium">
                Target Job Description (Optional - Min 60 characters for strict matching)
              </label>
              <textarea
                id="job-description"
                rows={5}
                placeholder="Paste the job description here (minimum 60 characters required for JobScan keyword matching)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 border rounded-md text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {jobDescription.length > 0 && jobDescription.length < 60 && (
                <p className="text-xs text-amber-600 font-medium">
                  Currently {jobDescription.length} characters (minimum 60 characters required).
                </p>
              )}
            </div>

            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Upload successful! Generating ATS score & recommendations...</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>
                  {errorMessage || (file ? 'Upload failed. Please try again.' : 'Please select a valid PDF or DOCX file.')}
                </span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? 'Analyzing Resume & Calculating ATS Score...' : 'Submit & Analyze Resume'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

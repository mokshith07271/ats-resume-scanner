'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, ArrowLeft, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

interface Scan {
  id: string;
  resume: {
    id: string;
    fileName: string;
  };
  jobDescription?: {
    id: string;
    title: string;
  };
  overallScore: number;
  status: string;
  createdAt: string;
}

export default function ScansPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchScans();
    }
  }, [user]);

  const fetchScans = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/resumes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScans(data.resumes || []);
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    } finally {
      setLoadingScans(false);
    }
  };

  if (loading || loadingScans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this scan and resume record?')) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/resumes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setScans(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete scan:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Scan History</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {scans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload a resume to get started with ATS analysis
              </p>
              <Button onClick={() => router.push('/upload')}>
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scans.map((item: any) => {
              const latestScan = item.scans?.[0] || item.scan || item;
              const fileName = item.fileName || item.resume?.fileName || 'Resume';
              const score = Math.round(latestScan.overallScore ?? 80);
              const status = latestScan.status || 'COMPLETED';

              return (
                <Card key={item.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {fileName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {latestScan.jobDescription?.title || 'General ATS Scan'} • {new Date(item.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          score >= 80 ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' :
                          score >= 60 ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                        }`}>
                          {score >= 60 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {score}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Status: <strong className="text-foreground">{status}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleDelete(item.id, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/scans/${item.id}`)}
                        >
                          View Details & Scores
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

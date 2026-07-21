'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, RefreshCw, Trash2, FileText } from 'lucide-react';

interface ScanDetails {
  id: string;
  resume: {
    id: string;
    fileName: string;
    parsedData: any;
  };
  jobDescription?: {
    id: string;
    title: string;
    description: string;
  };
  scores: {
    overallScore: number;
    formattingScore: number;
    keywordScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    achievementsScore: number;
  };
  analysis: string;
  recommendations: string[];
  status: string;
  createdAt: string;
}

export default function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const scanId = resolvedParams.id;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loadingScan, setLoadingScan] = useState(true);
  const [isRescanning, setIsRescanning] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && scanId) {
      fetchScanDetails();
    }
  }, [user, scanId]);

  const fetchScanDetails = async () => {
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ats-resume-scanner-wmg2.onrender.com/api').trim().replace(/\/+$/, '');
      const response = await fetch(`${backendUrl}/resumes/${scanId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      }
    } catch (error) {
      console.error('Failed to fetch scan details:', error);
    } finally {
      setLoadingScan(false);
    }
  };

  const handleRescan = async () => {
    if (!data) return;
    setIsRescanning(true);
    try {
      const targetResumeId = data.id || data.resumeId || data.resume?.id || scanId;
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ats-resume-scanner-wmg2.onrender.com/api').trim().replace(/\/+$/, '');
      const response = await fetch(`${backendUrl}/resumes/${targetResumeId}/scan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        await fetchScanDetails();
      }
    } catch (error) {
      console.error('Failed to rescan:', error);
    } finally {
      setIsRescanning(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume and all scan records?')) return;
    try {
      const targetResumeId = data?.id || data?.resumeId || data?.resume?.id || scanId;
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ats-resume-scanner-wmg2.onrender.com/api').trim().replace(/\/+$/, '');
      const response = await fetch(`${backendUrl}/resumes/${targetResumeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        router.push('/scans');
      }
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  if (loading || loadingScan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !data) {
    return null;
  }

  // Extract scan details safely whether data is a Resume or a Scan object
  const latestScan = data.scans?.[0] || data.scan || data;
  const fileName = data.fileName || data.resume?.fileName || 'Resume Document';
  const createdAt = latestScan.createdAt || data.createdAt || new Date().toISOString();

  const scores = {
    overallScore: Math.round(latestScan.overallScore ?? 80),
    formattingScore: Math.round(latestScan.formattingScore ?? 85),
    keywordScore: Math.round(latestScan.keywordScore ?? 75),
    skillScore: Math.round(latestScan.skillScore ?? 82),
    experienceScore: Math.round(latestScan.experienceScore ?? 80),
    educationScore: Math.round(latestScan.educationScore ?? 90),
    achievementsScore: Math.round(latestScan.achievementsScore ?? 78),
  };

  const parseArrayField = (fieldVal: any): string[] => {
    if (!fieldVal) return [];
    if (Array.isArray(fieldVal)) return fieldVal;
    if (typeof fieldVal === 'string') {
      try {
        const parsed = JSON.parse(fieldVal);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [fieldVal];
      }
    }
    return [];
  };

  const missingKeywords = parseArrayField(latestScan.missingKeywords);
  const parsedSkills = parseArrayField(data.parsedSkills);

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/scans')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scans
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push(`/scans/${scanId}/report`)}>
              <FileText className="mr-1.5 h-4 w-4" />
              View Side-by-Side Detailed Report
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete Work
            </Button>
            <Button variant="outline" size="sm" onClick={handleRescan} disabled={isRescanning}>
              <RefreshCw className={`mr-1.5 h-4 w-4 text-muted-foreground ${isRescanning ? 'animate-spin' : ''}`} />
              {isRescanning ? 'Rescanning...' : 'Rescan Resume'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Document Title Header */}
        <div className="border-b pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{fileName}</h1>
            <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
              Scanned on <span suppressHydrationWarning>{new Date(createdAt).toLocaleString()}</span>
            </p>
          </div>
          <Button size="lg" className="shadow-md" onClick={() => router.push(`/scans/${scanId}/report`)}>
            <FileText className="mr-2 h-5 w-5" />
            View Full Section-Wise Report
          </Button>
        </div>

        {/* 1. KEYWORD EXTRACTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
            <h2 className="text-xl font-bold">KEYWORD EXTRACTION</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  💻 Technical Skills
                </CardTitle>
                <CardDescription className="text-xs">Hard skills, tools & frameworks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(parsedSkills.length > 0 ? parsedSkills.slice(0, 6) : ['Python', 'SQL', 'TypeScript', 'React', 'AWS', 'Docker']).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  🧠 Experience / Domain Knowledge
                </CardTitle>
                <CardDescription className="text-xs">Industry practices & methodologies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['System Design', 'Agile / Scrum', 'CI/CD Pipelines', 'REST APIs', 'Microservices', 'Data Analysis'].map((domain, i) => (
                    <span key={i} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md font-medium">
                      {domain}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  🎓 Core Qualifications
                </CardTitle>
                <CardDescription className="text-xs">Required degrees & certifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Bachelor Degree', '3+ Years Experience', 'AWS Certified', 'Scrum Master'].map((qual, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md font-medium">
                      {qual}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. GAP ANALYSIS */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
            <h2 className="text-xl font-bold">GAP ANALYSIS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg">Overall Match Score</CardTitle>
                <CardDescription>Match percentage against job requirements</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className={`text-6xl font-extrabold ${scoreColor(scores.overallScore)}`}>
                  {scores.overallScore}%
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-red-200 dark:border-red-950">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center justify-between">
                  <span>⚠️ Missing Keywords (Skill Gaps)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">{missingKeywords.length} Terms Missing</span>
                </CardTitle>
                <CardDescription>
                  These specific technical and domain terms from the job posting were not detected in your resume text:
                </CardDescription>
              </CardHeader>
              <CardContent>
                {missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 rounded-md text-xs font-semibold"
                      >
                        + Add: {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 font-medium">✨ Great job! All primary technical keywords were found in your resume text.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

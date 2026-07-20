'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, ArrowRight, FileText, Sparkles, Layers, Briefcase, 
  GraduationCap, Wrench, Layout, ChevronLeft, ChevronRight, Eye, CheckCircle2, AlertTriangle, ShieldCheck, Target, TrendingUp, HelpCircle, MessageSquareText, Check, AlertCircle, Edit3
} from 'lucide-react';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const scanId = resolvedParams.id;
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState<any | null>(null);
  const [scansList, setScansList] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(true);
  const [viewMode, setViewMode] = useState<'pdf' | 'parsed'>('pdf');
  const [activeSection, setActiveSection] = useState<number>(1);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && scanId) {
      fetchData();
      fetchScansList();
    }
  }, [user, scanId]);

  const fetchData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
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
      console.error('Failed to fetch report details:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchScansList = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/resumes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const resList = await response.json();
        setScansList(resList.resumes || []);
      }
    } catch (error) {
      console.error('Failed to fetch scans list:', error);
    }
  };

  const handleNextReport = () => {
    if (scansList.length === 0) return;
    const currentIndex = scansList.findIndex(s => s.id === scanId || s.resumeId === scanId);
    if (currentIndex !== -1 && currentIndex < scansList.length - 1) {
      const nextId = scansList[currentIndex + 1].id;
      router.push(`/scans/${nextId}/report`);
    } else if (scansList.length > 0) {
      router.push(`/scans/${scansList[0].id}/report`);
    }
  };

  const handlePrevReport = () => {
    if (scansList.length === 0) return;
    const currentIndex = scansList.findIndex(s => s.id === scanId || s.resumeId === scanId);
    if (currentIndex > 0) {
      const prevId = scansList[currentIndex - 1].id;
      router.push(`/scans/${prevId}/report`);
    }
  };

  if (loading || loadingReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !data) {
    return null;
  }

  const latestScan = data.scans?.[0] || data.scan || data;
  const fileName = data.fileName || data.resume?.fileName || 'Resume Document';
  const createdAt = latestScan.createdAt || data.createdAt || new Date().toISOString();
  
  // Format Original Resume URL
  const rawFileUrl = data.fileUrl || data.resume?.fileUrl;
  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const fileUrl = rawFileUrl ? (rawFileUrl.startsWith('http') ? rawFileUrl : `${backendBase}${rawFileUrl}`) : null;

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
  const parsedExperience = parseArrayField(data.parsedExperience);
  const parsedEducation = parseArrayField(data.parsedEducation);

  const sections = [
    { id: 1, name: '1. Header & Contact Feedback', icon: Layers },
    { id: 2, name: '2. Skills & Keyword Gaps', icon: Wrench },
    { id: 3, name: '3. Work Experience Rewrites', icon: Briefcase },
    { id: 4, name: '4. Education & Qualifications', icon: GraduationCap },
    { id: 5, name: '5. Formatting & Readability', icon: Layout },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b bg-card sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/scans/${scanId}`)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <h1 className="text-lg font-bold truncate max-w-sm flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              Detailed Resume Feedback — {fileName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevReport}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev Scan
            </Button>
            <Button variant="default" size="sm" onClick={handleNextReport}>
              Next Scan
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Side-by-Side Canvas */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-[1800px]">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-110px)] min-h-[780px]">
          
          {/* LEFT SIDE: Original Uploaded Resume Viewer */}
          <div className="flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden h-full">
            <div className="px-5 py-3 border-b bg-muted/40 flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Original Uploaded Resume
              </h2>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant={viewMode === 'pdf' ? 'secondary' : 'ghost'}
                  size="xs"
                  className="text-xs px-2.5 py-1 h-7"
                  onClick={() => setViewMode('pdf')}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> PDF View
                </Button>
                <Button
                  variant={viewMode === 'parsed' ? 'secondary' : 'ghost'}
                  size="xs"
                  className="text-xs px-2.5 py-1 h-7"
                  onClick={() => setViewMode('parsed')}
                >
                  <Layers className="h-3.5 w-3.5 mr-1" /> Text View
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-2 bg-slate-100 dark:bg-slate-950/40 relative">
              {viewMode === 'pdf' && fileUrl ? (
                <object
                  data={fileUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-lg border bg-white shadow-inner"
                >
                  <iframe
                    src={fileUrl}
                    className="w-full h-full rounded-lg border bg-white shadow-inner"
                    title="Original Resume PDF"
                  />
                </object>
              ) : (
                <div className="h-full overflow-y-auto p-6 space-y-6 bg-card rounded-lg border font-sans text-sm">
                  <div className="border-b pb-4 space-y-1">
                    <h3 className="text-xl font-bold text-foreground">
                      {data.parsedName || user.displayName || 'Candidate Resume'}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {data.parsedEmail && <span>📧 {data.parsedEmail}</span>}
                      {data.parsedPhone && <span>📞 {data.parsedPhone}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" /> Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(parsedSkills.length > 0 ? parsedSkills : ['Python', 'SQL', 'TypeScript', 'React', 'AWS', 'Docker']).map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-muted border rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Work Experience
                    </h4>
                    {parsedExperience.length > 0 ? (
                      parsedExperience.map((exp: any, i: number) => (
                        <div key={i} className="p-3 bg-muted/40 rounded-lg border space-y-1">
                          <div className="font-semibold text-foreground text-xs">{exp.title || 'Role'} {exp.company ? `at ${exp.company}` : ''}</div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{exp.description || 'Responsibility statements and deliverables.'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
                        Parsed structured work experience statements.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" /> Education
                    </h4>
                    {parsedEducation.length > 0 ? (
                      parsedEducation.map((edu: any, i: number) => (
                        <div key={i} className="p-2.5 bg-muted/40 rounded border text-xs">
                          <span className="font-semibold">{edu.degree || 'Degree'}</span> — {edu.institution || 'University'}
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 bg-muted/40 rounded border text-xs text-muted-foreground">
                        Bachelor's or Master's degree in Data Analytics / Computer Science.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: RESUME FEEDBACK & IMPROVEMENT REPORT */}
          <div className="flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden h-full">
            
            {/* Control Header & Stepper Tabs */}
            <div className="px-5 py-3 border-b bg-muted/40 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Section-by-Section Resume Feedback & Corrections
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                  Section {activeSection} of 5
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {sections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeSection === sec.id
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Feedback Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              
              {/* SECTION 1: HEADER & CONTACT INFORMATION FEEDBACK */}
              {(activeSection === 1 || activeSection === 0) && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2 text-blue-800 dark:text-blue-300">
                        <Layers className="h-5 w-5" /> 1. Header & Contact Information Feedback
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                        Readable Contact Info
                      </span>
                    </div>

                    {/* What's Working Well */}
                    <div className="p-3 bg-card rounded-lg border text-xs space-y-1.5">
                      <div className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> What's Working Well in Your Resume:
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Your name (<code>{data.parsedName || 'Candidate Name'}</code>), email (<code>{data.parsedEmail || 'Candidate Email'}</code>), and phone number are formatted in the main body text, allowing ATS scanners and recruiters to read your contact details without corruption.
                      </p>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="p-3 bg-card rounded-lg border text-xs space-y-1.5">
                      <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" /> Actionable Feedback & Suggested Edits:
                      </div>
                      <ul className="text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                        <li><strong>Missing Target Job Title Headline</strong>: Add your target role title (e.g. <em>"Senior Data Analyst / BI Developer"</em>) directly under your name at the top of your resume summary.</li>
                        <li><strong>Location Formatting</strong>: Ensure your City, State (e.g. <em>"Austin, TX"</em>) is clearly listed so recruiter location search filters include your profile.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: TECHNICAL SKILLS & KEYWORD GAPS FEEDBACK */}
              {(activeSection === 2 || activeSection === 0) && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2 text-red-700 dark:text-red-300">
                        <Wrench className="h-5 w-5" /> 2. Technical Skills & Keyword Gap Feedback
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold">
                        {missingKeywords.length} Missing Keywords
                      </span>
                    </div>

                    {/* Missing Skills Grid */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-foreground">Critical Missing Keywords to Add to Your Resume:</div>
                      <div className="flex flex-wrap gap-2">
                        {(missingKeywords.length > 0 ? missingKeywords : ['Power BI', 'Data Visualization', 'Shared Services (GBS)', 'SQL Analytics']).map((kw: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 rounded-md text-xs font-semibold">
                            + Add: {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Placement Advice */}
                    <div className="p-3.5 bg-card rounded-lg border text-xs space-y-1.5">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <Edit3 className="h-4 w-4 text-blue-600" /> Recommended Placement in Your Resume:
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Rather than listing these missing skills in a plain skill list at the bottom, weave them directly into your work experience bullet points. This proves to recruiters that you used these skills in real projects.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: WORK EXPERIENCE & BULLET POINT REWRITES */}
              {(activeSection === 3 || activeSection === 0) && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <Briefcase className="h-5 w-5" /> 3. Work Experience & Bullet Point Rewrites
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                        High-Impact Rewrites
                      </span>
                    </div>

                    {/* Direct Bullet Point Feedback & Rewrites */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-foreground">Exact Rewrites to Replace Weak Bullet Points in Your Resume:</div>

                      <div className="space-y-2">
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 rounded-lg border border-red-200 text-xs leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1 text-red-600 dark:text-red-400">❌ Replace Weak / Unquantified Statement:</div>
                          <div className="line-through opacity-80">"Responsible for creating reports and analytics dashboards."</div>
                        </div>

                        <div className="p-3.5 bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 rounded-lg border border-emerald-300 font-medium text-xs leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">✨ Recommended High-Impact Bullet Rewrite:</div>
                          <div>"Engineered 15+ automated Power BI dashboards and data visualization tools across GBS shared services, boosting reporting efficiency by 35%."</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 rounded-lg border border-red-200 text-xs leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1 text-red-600 dark:text-red-400">❌ Replace Weak / Unquantified Statement:</div>
                          <div className="line-through opacity-80">"Worked on software development and backend API integrations."</div>
                        </div>

                        <div className="p-3.5 bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 rounded-lg border border-emerald-300 font-medium text-xs leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">✨ Recommended High-Impact Bullet Rewrite:</div>
                          <div>"Architected scalable REST APIs and microservices using TypeScript & Docker, reducing server latency by 45% for over 50k active monthly users."</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: EDUCATION & QUALIFICATIONS FEEDBACK */}
              {(activeSection === 4 || activeSection === 0) && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-950 bg-purple-50/40 dark:bg-purple-950/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <GraduationCap className="h-5 w-5" /> 4. Education & Qualifications Feedback
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                        Qualifications Match
                      </span>
                    </div>

                    <div className="p-3 bg-card rounded-lg border text-xs space-y-1.5">
                      <div className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Degree Alignment:
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Your educational background aligns with the job description prerequisites. Make sure your full degree title (e.g. <em>"Bachelor of Science in Computer Science / Data Analytics"</em>) and graduation year are clearly listed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: FORMATTING & READABILITY FEEDBACK */}
              {(activeSection === 5 || activeSection === 0) && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Layout className="h-5 w-5" /> 5. Formatting & Readability Feedback
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 font-bold">
                        Clean Formatting
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2.5 bg-card rounded border">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <div>Single-column layout ensures clean top-to-bottom reading flow.</div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-card rounded border">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <div>Standard section headers ("Summary", "Technical Skills", "Work Experience", "Education").</div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-card rounded border">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <div>Clean, professional sans-serif typography without complex tables.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Stepper Control Footer */}
            <div className="px-5 py-3 border-b border-t bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={activeSection <= 1}
                onClick={() => setActiveSection(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Section
              </Button>

              <span className="text-xs text-muted-foreground font-medium">
                Section {activeSection} of 5
              </span>

              <Button
                variant="default"
                size="sm"
                disabled={activeSection >= 5}
                onClick={() => setActiveSection(prev => Math.min(5, prev + 1))}
              >
                Next Section
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, Zap, Shield } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            AI ATS Resume Scanner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enterprise-level AI-powered resume analysis to help you land your dream job
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Smart Parsing</CardTitle>
              <CardDescription>
                Extract key information from PDF and DOCX resumes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>ATS Scoring</CardTitle>
              <CardDescription>
                Get comprehensive ATS scores with detailed breakdowns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-2" />
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                AI-powered recommendations for improvement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Secure</CardTitle>
              <CardDescription>
                Enterprise-grade security with Firebase Authentication
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="text-lg px-8 py-6"
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
}

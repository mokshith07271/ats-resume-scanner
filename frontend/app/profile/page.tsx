'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, KeyRound, LogOut, Trash2, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type?: 'success' | 'error'; msg?: string }>({});

  const [deleteInputText, setDeleteInputText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', msg: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordStatus({});
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatus({
        type: 'error',
        msg: err.response?.data?.error || err.message || 'Failed to change password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteInputText.toLowerCase().trim() !== 'delete') {
      return;
    }

    try {
      setIsDeletingAccount(true);
      await api.delete('/auth/account');
      await logout();
      router.push('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      setPasswordStatus({ type: 'error', msg: 'Failed to delete account. Please try again.' });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.name || user.email?.split('@')[0] || 'User Profile';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b bg-card sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-lg font-bold">Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        
        {/* User Details Overview Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
              {initial}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground">
                {user.email || 'Registered User'}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password for enhanced security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordStatus.msg && (
              <div className={`p-3 text-xs rounded mb-4 ${
                passwordStatus.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200' 
                  : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200'
              }`}>
                {passwordStatus.msg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Session Management (Log Out Section) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LogOut className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Account Session
            </CardTitle>
            <CardDescription>
              Sign out from your active ATS Resume Scanner session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out / Logout
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Card */}
        <Card className="border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription className="text-red-900/70 dark:text-red-300/70">
              Permanently delete your account, uploaded resumes, and scan history. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            ) : (
              <div className="p-4 bg-card border border-red-300 rounded-lg space-y-3 max-w-md">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                  ⚠️ To confirm deletion, type <span className="underline uppercase font-extrabold text-foreground">"delete"</span> in the text field below:
                </p>

                <div className="space-y-1.5">
                  <Input
                    type="text"
                    placeholder="Type delete to confirm"
                    value={deleteInputText}
                    onChange={(e) => setDeleteInputText(e.target.value)}
                    className="border-red-300 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteInputText.toLowerCase().trim() !== 'delete' || isDeletingAccount}
                  >
                    {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Confirm Account Deletion
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInputText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

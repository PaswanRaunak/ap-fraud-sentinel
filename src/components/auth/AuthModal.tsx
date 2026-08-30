'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/lib/authStore';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AuthModal() {
  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const authModalTab = useAuthStore((s) => s.authModalTab);
  const setAuthModalTab = useAuthStore((s) => s.setAuthModalTab);
  const login = useAuthStore((s) => s.login);
  const demoLogin = useAuthStore((s) => s.demoLogin);
  const register = useAuthStore((s) => s.register);
  const setView = useAppStore((s) => s.setView);
  const { toast } = useToast();

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Controller');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'otp' | 'done'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      toast({ title: 'Email required', description: 'Please enter your work email.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      toast({
        title: 'Authentication Successful',
        description: 'Welcome back to Sentinel Payments Console.',
      });
      setView('dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: res.error || 'Invalid credentials.',
        variant: 'destructive',
      });
    }
  };

  const handleDemoClick = (role: UserRole = 'Controller') => {
    demoLogin(role);
    toast({
      title: 'Demo Mode Activated',
      description: `Signed in as Lead ${role} (Sentinel Payments Corp).`,
    });
    setView('dashboard');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regCompany) {
      toast({ title: 'Incomplete form', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await register(regName, regEmail, regCompany, regRole, regPassword);
    setLoading(false);
    if (res.success) {
      toast({
        title: 'Account Created',
        description: `Welcome to Sentinel Payments, ${regName}!`,
      });
      setView('dashboard');
    } else {
      toast({
        title: 'Registration Failed',
        description: res.error || 'Could not complete registration.',
        variant: 'destructive',
      });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: 'Email required', description: 'Please enter your registered email.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotStep('otp');
      toast({
        title: 'Security Code Dispatched',
        description: `A 6-digit verification code was sent to ${forgotEmail}. (Demo code: 849201)`,
      });
    }, 600);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast({ title: 'Code required', description: 'Please enter the 6-digit OTP.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotStep('done');
      toast({
        title: 'Password Updated',
        description: 'Your security credentials have been updated. You may now sign in.',
      });
    }, 700);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-[#E2E5E8] bg-white text-[#1B1B1F] shadow-2xl rounded-3xl">
        {/* M3 Header Banner */}
        <div className="bg-[#F7F8FA] p-6 border-b border-[#E2E5E8]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C00018] text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-poppins text-base font-extrabold tracking-tight text-[#C00018]">
                  Sentinel <span className="text-[#1B1B1F]">Payments</span>
                </span>
                <span className="rounded-full bg-[#FFDAD6] px-2.5 py-0.5 text-[10px] font-bold text-[#410002]">
                  PORTAL
                </span>
              </div>
              <p className="text-xs text-[#74777F]">Enterprise AP Fraud Sentinel</p>
            </div>
          </div>

          {/* M3 Segmented Button / Tabs */}
          <div className="mt-5 flex rounded-full bg-[#EAECEF] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setForgotStep('request');
              }}
              className={cn(
                'flex-1 py-1.5 rounded-full transition-all cursor-pointer text-center font-poppins',
                authModalTab === 'login'
                  ? 'bg-white text-[#C00018] font-bold shadow-xs'
                  : 'text-[#44474E] hover:text-[#1B1B1F]'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('register');
                setForgotStep('request');
              }}
              className={cn(
                'flex-1 py-1.5 rounded-full transition-all cursor-pointer text-center font-poppins',
                authModalTab === 'register'
                  ? 'bg-white text-[#C00018] font-bold shadow-xs'
                  : 'text-[#44474E] hover:text-[#1B1B1F]'
              )}
            >
              Create Account
            </button>
            {authModalTab === 'forgot' && (
              <button
                type="button"
                className="flex-1 py-1.5 rounded-full bg-white text-amber-700 font-bold shadow-xs font-poppins text-center"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 1. LOGIN TAB */}
            {authModalTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 1-Click Demo M3 Tonal Card */}
                <div className="rounded-2xl border border-[#FFDAD6] bg-[#FFF8F7] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#C00018] fill-[#C00018]" />
                      <span className="text-xs font-bold text-[#410002] font-poppins">Evaluation Access</span>
                    </div>
                    <span className="text-[10px] text-[#C00018] font-mono">1-Click Sign In</span>
                  </div>
                  <p className="mt-1 text-xs text-[#44474E]">
                    Instantly sign in as Lead Controller to test batch screenings.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDemoClick('Controller')}
                      className="h-9 flex-1 gap-1.5 rounded-full bg-[#C00018] text-white font-bold text-xs hover:bg-[#A80015] shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Controller Sign In</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDemoClick('AP Analyst')}
                      className="h-9 rounded-full border-[#C4C7C5] bg-white text-xs font-medium text-[#44474E] hover:bg-[#F1F3F5]"
                    >
                      <span>Auditor</span>
                    </Button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center text-xs uppercase text-[#74777F]">
                  <div className="flex-1 border-t border-[#E2E5E8]" />
                  <span className="px-3 bg-white font-mono text-[10px]">Or enter credentials</span>
                  <div className="flex-1 border-t border-[#E2E5E8]" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#44474E] font-medium">Business Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#74777F]" />
                      <Input
                        type="email"
                        placeholder="controller@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-11 pl-10 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] placeholder:text-[#74777F] focus-visible:border-[#C00018]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#44474E] font-medium">Password</Label>
                      <button
                        type="button"
                        onClick={() => setAuthModalTab('forgot')}
                        className="text-xs text-[#C00018] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#74777F]" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] placeholder:text-[#74777F] focus-visible:border-[#C00018]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#74777F] hover:text-[#1B1B1F]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 gap-2 rounded-full bg-[#C00018] font-bold text-white shadow-xs hover:shadow-md hover:bg-[#A80015] active:scale-[0.99] transition-all"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <p className="text-center text-xs text-[#74777F]">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('register')}
                    className="font-bold text-[#C00018] hover:underline cursor-pointer"
                  >
                    Register new team
                  </button>
                </p>
              </motion.div>
            )}

            {/* 2. REGISTER TAB */}
            {authModalTab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#44474E] font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-[#74777F]" />
                      <Input
                        type="text"
                        placeholder="Jane Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="h-11 pl-10 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] focus-visible:border-[#C00018]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#44474E] font-medium">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3 h-4 w-4 text-[#74777F]" />
                      <Input
                        type="text"
                        placeholder="Acme Global Corp"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        className="h-11 pl-10 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] focus-visible:border-[#C00018]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs text-[#44474E] font-medium">Work Email</Label>
                      <Input
                        type="email"
                        placeholder="jane@company.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="h-11 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-xs text-[#1B1B1F] focus-visible:border-[#C00018]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-[#44474E] font-medium">AP Role</Label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full h-11 rounded-2xl border border-[#C4C7C5] bg-[#F7F8FA] px-3 text-xs text-[#1B1B1F] focus:outline-hidden focus:border-[#C00018]"
                      >
                        <option value="Controller">Lead Controller</option>
                        <option value="AP Analyst">Senior AP Analyst</option>
                        <option value="Internal Auditor">Internal Auditor</option>
                        <option value="CFO">Chief Financial Officer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#44474E] font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#74777F]" />
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="h-11 pl-10 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] focus-visible:border-[#C00018]"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 gap-2 rounded-full bg-[#C00018] font-bold text-white shadow-xs hover:bg-[#A80015] active:scale-[0.99] transition-all"
                  >
                    <span>{loading ? 'Creating...' : 'Create Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <p className="text-center text-xs text-[#74777F]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('login')}
                    className="font-bold text-[#C00018] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD TAB */}
            {authModalTab === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {forgotStep === 'request' && (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                      Enter your corporate email address to receive a 6-digit security OTP code.
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#44474E] font-medium">Registered Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#74777F]" />
                        <Input
                          type="email"
                          placeholder="controller@company.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="h-11 pl-10 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] focus-visible:border-[#C00018]"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 gap-2 rounded-full bg-amber-600 font-bold text-white shadow-xs hover:bg-amber-700"
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>{loading ? 'Dispatching...' : 'Send Verification OTP'}</span>
                    </Button>
                  </form>
                )}

                {forgotStep === 'otp' && (
                  <form onSubmit={handleOtpVerify} className="space-y-4">
                    <div className="rounded-2xl border border-[#CCE8EE] bg-[#F0F9FB] p-3.5 text-xs text-[#006874]">
                      Enter the 6-digit OTP sent to <strong>{forgotEmail}</strong>. (Demo code: <code className="font-bold">849201</code>).
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#44474E] font-medium">6-Digit Verification Code</Label>
                      <Input
                        type="text"
                        placeholder="849201"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="h-11 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-center font-mono text-lg font-bold tracking-widest text-[#1B1B1F] focus-visible:border-[#C00018]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#44474E] font-medium">New Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 rounded-2xl bg-[#F7F8FA] border-[#C4C7C5] text-sm text-[#1B1B1F] focus-visible:border-[#C00018]"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 gap-2 rounded-full bg-[#C00018] font-bold text-white shadow-xs hover:bg-[#A80015]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{loading ? 'Verifying...' : 'Confirm New Password'}</span>
                    </Button>
                  </form>
                )}

                {forgotStep === 'done' && (
                  <div className="text-center py-4 space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#D6E8D6] text-[#1E6827]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold text-[#1B1B1F] font-poppins">Password Updated</h4>
                    <p className="text-xs text-[#44474E]">Your credentials have been securely updated.</p>
                    <Button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setForgotStep('request');
                      }}
                      className="w-full h-11 rounded-full bg-[#C00018] font-bold text-white hover:bg-[#A80015]"
                    >
                      <span>Proceed to Sign In</span>
                    </Button>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setForgotStep('request');
                    }}
                    className="text-xs text-[#74777F] hover:text-[#1B1B1F] hover:underline cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

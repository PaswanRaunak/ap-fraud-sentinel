'use client';

// Portal auth dialog - dark "Ethereal Glass" skin matching the public landing.
// All auth flows unchanged: login, demo sign-in, registration, OTP reset.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
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
  Zap,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/lib/authStore';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.5;
const EASE = [0.32, 0.72, 0, 1] as const;

// Shared dark input treatment.
const inputCls =
  'h-11 rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25 transition-colors duration-300 focus-visible:border-[#C00018]/60 focus-visible:ring-0';

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
      <DialogContent className="sm:max-w-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B0B0E] p-0 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] [&>button]:text-white/40 [&>button]:hover:text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] p-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C00018] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <ShieldCheck className="h-5 w-5" strokeWidth={ICON_STROKE} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight">
                  Sentinel <span className="text-white/40">Payments</span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/50">
                  Portal
                </span>
              </div>
              <p className="text-xs text-white/35">Enterprise AP fraud sentinel</p>
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="mt-5 flex rounded-full border border-white/10 bg-white/[0.03] p-1 text-xs font-medium">
            {(['login', 'register'] as const).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => {
                  setAuthModalTab(tabKey);
                  setForgotStep('request');
                }}
                className={cn(
                  'flex-1 cursor-pointer rounded-full py-1.5 text-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  authModalTab === tabKey
                    ? 'bg-white font-semibold text-black'
                    : 'text-white/50 hover:text-white',
                )}
              >
                {tabKey === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
            {authModalTab === 'forgot' && (
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-full bg-[#C00018]/20 py-1.5 text-center text-xs font-semibold text-red-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tab body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 1. LOGIN */}
            {authModalTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="space-y-4"
              >
                {/* 1-click evaluation access */}
                <div className="rounded-2xl border border-[#C00018]/25 bg-[#C00018]/[0.07] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-red-300" strokeWidth={ICON_STROKE} />
                      <span className="text-xs font-semibold text-red-200">Evaluation access</span>
                    </div>
                    <span className="font-mono text-[10px] text-red-200/50">1-click sign in</span>
                  </div>
                  <p className="mt-1 text-xs text-white/45">
                    Sign in instantly as a lead controller to run batch screenings.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDemoClick('Controller')}
                      className="h-9 flex-1 gap-1.5 rounded-full bg-[#C00018] text-xs font-semibold text-white hover:bg-[#A80015] active:scale-[0.98]"
                    >
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      <span>Controller sign in</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDemoClick('AP Analyst')}
                      className="h-9 rounded-full border-white/10 bg-transparent text-xs font-medium text-white/60 hover:bg-white/[0.06] hover:text-white"
                    >
                      <span>Auditor</span>
                    </Button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="flex-1 border-t border-white/[0.06]" />
                  <span className="bg-[#0B0B0E] px-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                    or enter credentials
                  </span>
                  <div className="flex-1 border-t border-white/[0.06]" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/60">Business email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
                      <Input
                        type="email"
                        placeholder="controller@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={cn(inputCls, 'pl-10')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-white/60">Password</Label>
                      <button
                        type="button"
                        onClick={() => setAuthModalTab('forgot')}
                        className="cursor-pointer text-xs text-white/50 transition-colors hover:text-white"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={cn(inputCls, 'pl-10 pr-10')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-white/30 transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={ICON_STROKE} /> : <Eye className="h-4 w-4" strokeWidth={ICON_STROKE} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/85 active:scale-[0.99] disabled:opacity-60"
                  >
                    <span>{loading ? 'Authenticating…' : 'Sign in to console'}</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
                      strokeWidth={ICON_STROKE}
                    />
                  </button>
                </form>

                <p className="text-center text-xs text-white/35">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('register')}
                    className="cursor-pointer font-semibold text-white/80 transition-colors hover:text-white"
                  >
                    Register your team
                  </button>
                </p>
              </motion.div>
            )}

            {/* 2. REGISTER */}
            {authModalTab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="space-y-4"
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/60">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
                      <Input
                        type="text"
                        placeholder="Dana Whitfield"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className={cn(inputCls, 'pl-10')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/60">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
                      <Input
                        type="text"
                        placeholder="Meridian Logistics Group"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        className={cn(inputCls, 'pl-10')}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/60">Work email</Label>
                      <Input
                        type="email"
                        placeholder="dana@meridianlogistics.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={cn(inputCls, 'text-xs')}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/60">AP role</Label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="h-11 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white transition-colors duration-300 focus:border-[#C00018]/60 focus:outline-none [&>option]:bg-[#0B0B0E]"
                      >
                        <option value="Controller">Lead Controller</option>
                        <option value="AP Analyst">Senior AP Analyst</option>
                        <option value="Internal Auditor">Internal Auditor</option>
                        <option value="CFO">Chief Financial Officer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/60">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className={cn(inputCls, 'pl-10')}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer rounded-full bg-white py-3 text-sm font-semibold text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/85 active:scale-[0.99] disabled:opacity-60"
                  >
                    <span>{loading ? 'Creating…' : 'Create account'}</span>
                  </button>
                </form>

                <p className="text-center text-xs text-white/35">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('login')}
                    className="cursor-pointer font-semibold text-white/80 transition-colors hover:text-white"
                  >
                    Sign in here
                  </button>
                </p>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD */}
            {authModalTab === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="space-y-4"
              >
                {forgotStep === 'request' && (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-3.5 text-xs leading-relaxed text-amber-200/80">
                      Enter your corporate email address to receive a 6-digit security code.
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/60">Registered email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
                        <Input
                          type="email"
                          placeholder="controller@company.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className={cn(inputCls, 'pl-10')}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full gap-2 rounded-full bg-[#C00018] text-xs font-semibold text-white hover:bg-[#A80015] active:scale-[0.99]"
                    >
                      <KeyRound className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      <span>{loading ? 'Dispatching…' : 'Send verification code'}</span>
                    </Button>
                  </form>
                )}

                {forgotStep === 'otp' && (
                  <form onSubmit={handleOtpVerify} className="space-y-4">
                    <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-3.5 text-xs leading-relaxed text-sky-200/80">
                      Enter the 6-digit code sent to <strong>{forgotEmail}</strong>. Demo code:{' '}
                      <code className="font-bold">849201</code>.
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/60">Verification code</Label>
                      <Input
                        type="text"
                        placeholder="849201"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className={cn(inputCls, 'text-center font-mono text-lg font-bold tracking-[0.3em]')}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/60">New password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputCls}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full gap-2 rounded-full bg-white text-sm font-semibold text-black hover:bg-white/85 active:scale-[0.99]"
                    >
                      <CheckCircle2 className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      <span>{loading ? 'Verifying…' : 'Confirm new password'}</span>
                    </Button>
                  </form>
                )}

                {forgotStep === 'done' && (
                  <div className="space-y-4 py-4 text-center">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"
                    >
                      <CheckCircle2 className="h-6 w-6" strokeWidth={ICON_STROKE} />
                    </motion.div>
                    <div>
                      <h4 className="text-base font-semibold tracking-tight">Password updated</h4>
                      <p className="mt-1 text-xs text-white/40">Your credentials have been securely updated.</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setForgotStep('request');
                      }}
                      className="h-11 w-full rounded-full bg-white text-sm font-semibold text-black hover:bg-white/85"
                    >
                      <span>Proceed to sign in</span>
                    </Button>
                  </div>
                )}

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setForgotStep('request');
                    }}
                    className="cursor-pointer text-xs text-white/40 transition-colors hover:text-white"
                  >
                    Back to sign in
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

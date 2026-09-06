'use client';

// AP Payment Fraud Sentinel - Sentinel Payments Corporate Portal & Operations Console.
// Supports full Authentication (Login, Register, Forgot Password, Logout) & seamless transition.

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  LayoutDashboard,
  LogOut,
  Search,
  User as UserIcon,
  Wifi,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger, SidebarNav } from '@/components/dashboard/Sidebar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { DashboardView } from '@/components/views/DashboardView';
import { CasesView } from '@/components/views/CasesView';
import { UploadView } from '@/components/views/UploadView';
import { VendorsView } from '@/components/views/VendorsView';
import { RunsView } from '@/components/views/RunsView';
import { CaseDetailSheet } from '@/components/views/CaseDetailSheet';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useTrace, useWsConnected } from '@/hooks/useTrace';
import { useHealthz } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { CommandMenu } from '@/components/console/CommandMenu';
import { cn } from '@/lib/utils';

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);

  // Keep the WS channel live for the whole session.
  useTrace();
  const wsConnected = useWsConnected();
  const { data: health } = useHealthz();
  const batchStatus = useAppStore((s) => s.batchStatus);
  const { toast } = useToast();

  // Always default to landing page on initial load
  useEffect(() => {
    setView('landing');
  }, [setView]);

  // If view is 'landing', render full-width Public Corporate Portal
  if (view === 'landing') {
    return (
      <main className="min-h-screen bg-white">
        <LandingPage />
        <AuthModal />
        <CaseDetailSheet />
      </main>
    );
  }

  // Otherwise, render Internal Operations Console
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Console header - dark glass */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0B0B0E]/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="mr-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60 transition-colors duration-300 hover:border-white/25 hover:text-white"
              title="Return to Sentinel Payments Corporate Portal"
            >
              <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Website</span>
            </button>

            <span className="text-white/20">/</span>

            <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
              Sentinel <span className="hidden text-[#C00018] sm:inline">Ops Console</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Worker mode chip - reflects real /api/healthz state, not a hardcoded label. */}
          <span
            className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white/60 md:inline-flex"
            title={health ? `Worker mode: ${health.worker?.mode ?? 'unknown'}` : 'Worker unreachable'}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                health ? (health.worker?.mode === 'rocketride' ? 'bg-sky-400' : 'bg-emerald-400') : 'animate-pulse bg-red-400',
              )}
            />
            <span>
              {health ? `WORKER: ${(health.worker?.mode ?? 'local').toUpperCase()}` : 'WORKER OFFLINE'}
            </span>
          </span>

          {/* Batch status chip - mirrors the live pipeline state from the trace store. */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold',
              batchStatus === 'running'
                ? 'border-sky-400/25 bg-sky-400/10 text-sky-300'
                : batchStatus === 'completed'
                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                  : 'border-white/10 bg-white/[0.03] text-white/40',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                batchStatus === 'running'
                  ? 'animate-pulse bg-sky-400'
                  : batchStatus === 'completed'
                    ? 'bg-emerald-400'
                    : 'bg-white/25',
              )}
            />
            {batchStatus === 'running' ? 'RUNNING' : batchStatus === 'completed' ? 'BATCH COMPLETE' : 'IDLE'}
          </span>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('apf:open-command-menu'))}
            className="hidden h-8 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[11px] font-medium text-white/40 transition-colors duration-300 hover:border-white/25 hover:text-white sm:flex"
            title="Open command menu (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="font-mono">Ctrl K</span>
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
            title={wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          >
            <Wifi className={cn('h-4 w-4', wsConnected ? 'text-emerald-400' : 'text-amber-400')} strokeWidth={1.5} />
          </div>

          {/* User Profile / Logout Header Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-2">
              <div className="hidden text-right leading-tight sm:flex sm:flex-col">
                <span className="text-xs font-bold text-white">{user.name}</span>
                <span className="text-[10px] text-white/35">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setView('landing');
                  toast({ title: 'Signed Out', description: 'You have been logged out of Sentinel Console.' });
                }}
                title="Sign Out"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/40 transition-colors duration-300 hover:bg-white/[0.06] hover:text-red-300"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => openAuthModal('login')}
              className="h-8 cursor-pointer rounded-full bg-[#C00018] px-4 text-xs font-bold text-white transition-colors hover:bg-[#A80015]"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Body - sidebar (desktop) + main view container */}
      <div className="flex flex-1">
        <SidebarNav />
        <main className="min-w-0 flex-1 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {view === 'dashboard' && <DashboardView />}
              {view === 'cases' && <CasesView />}
              {view === 'upload' && <UploadView />}
              {view === 'vendors' && <VendorsView />}
              {view === 'runs' && <RunsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Modal & Case Detail Sheet */}
      <AuthModal />
      <CaseDetailSheet />
      <CommandMenu />
    </div>
  );
}

'use client';

// AP Payment Fraud Sentinel — Sentinel Payments Corporate Portal & Operations Console.
// Supports full Authentication (Login, Register, Forgot Password, Logout) & seamless transition.

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  LayoutDashboard,
  LogOut,
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
      {/* Material 3 Top App Bar */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#E2E5E8] bg-white/95 px-4 backdrop-blur sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <SidebarTrigger />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F5] px-3 py-1 text-xs font-semibold text-[#44474E] hover:text-[#C00018] hover:bg-[#FFDAD6] transition-colors cursor-pointer mr-1"
              title="Return to Sentinel Payments Corporate Portal"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Website</span>
            </button>

            <span className="text-[#C4C7C5]">/</span>

            <h1 className="font-poppins text-sm sm:text-base font-bold tracking-tight text-[#1B1B1F]">
              Sentinel <span className="text-[#C00018]">Ops Console</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F5] px-3 py-1 text-[11px] font-semibold text-[#44474E] border border-[#E2E5E8]">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            WORKER: LOCAL
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CCE8EE] px-3 py-1 text-[11px] font-semibold text-[#006874]">
            <span className="h-2 w-2 rounded-full bg-[#006874] animate-pulse" />
            RUNNING
          </span>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F3F5] text-[#44474E]"
            title={wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          >
            <Wifi className={cn('h-4 w-4', wsConnected ? 'text-[#1E6827]' : 'text-amber-600')} />
          </div>

          {/* User Profile / Logout Header Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E5E8]">
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-xs font-bold text-[#1B1B1F]">{user.name}</span>
                <span className="text-[10px] text-[#74777F]">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setView('landing');
                  toast({ title: 'Signed Out', description: 'You have been logged out of Sentinel Console.' });
                }}
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F3F5] text-[#74777F] hover:text-[#C00018] hover:bg-[#FFDAD6] transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => openAuthModal('login')}
              className="h-8 rounded-full bg-[#C00018] px-4 text-xs font-bold text-white hover:bg-[#A80015]"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Body — sidebar (desktop) + main view container */}
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 min-w-0 pb-10">
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
    </div>
  );
}

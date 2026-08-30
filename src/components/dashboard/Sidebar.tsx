'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Globe,
  LayoutDashboard,
  ShieldAlert,
  Upload,
  Building2,
  History,
  Menu,
  ShieldCheck,
  Play,
  Square,
  CheckCircle2,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { useAppStore, type View } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useStartRun } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases Queue', icon: ShieldAlert },
  { id: 'upload', label: 'Invoice Ingestion', icon: Upload },
  { id: 'vendors', label: 'Vendor Master', icon: Building2 },
  { id: 'runs', label: 'Batch Ledger', icon: History },
];

function Brand() {
  const setView = useAppStore((s) => s.setView);
  return (
    <div
      onClick={() => setView('landing')}
      className="flex items-center gap-3 px-3 py-4 cursor-pointer group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C00018] text-white shadow-xs transition-transform group-hover:scale-105">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-poppins text-xs font-black uppercase tracking-wider text-[#C00018]">
          SENTINEL <span className="text-[#1B1B1F]">PAYMENTS</span>
        </span>
        <span className="text-[11px] font-medium text-[#74777F]">AP Fraud Defense</span>
      </div>
    </div>
  );
}

function RunBatchSidebarButton() {
  const startRun = useStartRun();
  const { toast } = useToast();
  const batchStatus = useAppStore((s) => s.batchStatus);
  const setBatchStatus = useAppStore((s) => s.setBatchStatus);
  const resetTrace = useAppStore((s) => s.resetTrace);
  const setActiveRunId = useAppStore((s) => s.setActiveRunId);
  const setView = useAppStore((s) => s.setView);

  const isRunning = batchStatus === 'running';
  const isCompleted = batchStatus === 'completed';

  const onRunBatch = async () => {
    try {
      resetTrace();
      setBatchStatus('running');
      const r = await startRun.mutateAsync({});
      if (r?.run_id) {
        setActiveRunId(r.run_id);
      }
      toast({
        title: 'Batch screening initiated',
        description: `Run ${r.run_id ?? 'queued'} — 141 invoices entering 7-stage pipeline.`,
      });
      setView('dashboard');
    } catch (e) {
      setBatchStatus('idle');
      toast({
        title: 'Run failed',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  const onStopBatch = () => {
    setBatchStatus('idle');
    toast({
      title: 'Batch execution stopped',
      description: 'The pipeline worker will halt further executions.',
      variant: 'default',
    });
  };

  if (isRunning) {
    return (
      <div className="my-3 px-2">
        <Button
          type="button"
          onClick={onStopBatch}
          className="w-full justify-center gap-2 rounded-full bg-[#BA1A1A] py-5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#93000A] active:scale-[0.98] cursor-pointer"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 animate-pulse">
            <Square className="h-3 w-3 fill-white text-white" />
          </div>
          <span>Stop Batch</span>
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="my-3 px-2">
        <Button
          type="button"
          onClick={onRunBatch}
          className="w-full justify-center gap-2 rounded-full bg-[#1E6827] py-5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#144F1C] active:scale-[0.98] cursor-pointer"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span>Screen Again ✓</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="my-3 px-2">
      <Button
        type="button"
        onClick={onRunBatch}
        disabled={startRun.isPending}
        className="w-full justify-center gap-2.5 rounded-full bg-[#C00018] py-5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md hover:bg-[#A80015] active:scale-[0.98] cursor-pointer"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
          <Play className="h-3 w-3 fill-white text-white" />
        </div>
        <span>Run Batch Audit</span>
      </Button>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <nav className="flex flex-col gap-1.5 py-2 relative" aria-label="Primary">
      {NAV.map((item) => {
        const active = view === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setView(item.id);
              onNavigate?.();
            }}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3.5 rounded-full px-4 py-3 text-xs font-bold transition-all duration-200 cursor-pointer select-none',
              active
                ? 'text-[#410002]'
                : 'text-[#44474E] hover:text-[#1B1B1F] hover:bg-[#F1F3F5]'
            )}
          >
            {active && (
              <motion.div
                layoutId="m3-active-nav-indicator"
                className="absolute inset-0 rounded-full bg-[#FFDAD6] shadow-xs"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}

            <Icon
              className={cn(
                'relative z-10 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                active ? 'text-[#C00018]' : 'text-[#74777F] group-hover:text-[#1B1B1F]'
              )}
            />
            <span className="relative z-10 font-medium">
              {item.label}
            </span>

            {active && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative z-10 ml-auto h-2 w-2 rounded-full bg-[#C00018]"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function UserProfileWidget() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const setView = useAppStore((s) => s.setView);
  const { toast } = useToast();

  if (!isAuthenticated || !user) {
    return (
      <div className="mt-auto border-t border-[#E2E5E8] pt-3 px-1">
        <Button
          onClick={() => openAuthModal('login')}
          variant="outline"
          className="w-full justify-center gap-2 rounded-full border-[#C4C7C5] text-xs font-bold text-[#1B1B1F] hover:bg-[#F1F3F5]"
        >
          <User className="h-4 w-4" />
          <span>Sign In to Console</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-[#E2E5E8] pt-3 px-1">
      <div className="flex items-center justify-between rounded-2xl bg-[#F7F8FA] p-3 border border-[#E2E5E8]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C00018] text-xs font-bold text-white shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-[#1B1B1F]">{user.name}</span>
            <span className="truncate text-[10px] text-[#74777F]">{user.role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            setView('landing');
            toast({ title: 'Logged Out', description: 'Session safely closed.' });
          }}
          title="Sign Out"
          className="p-1.5 rounded-full text-[#74777F] hover:text-[#C00018] hover:bg-[#FFDAD6] transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SidebarTrigger() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden rounded-full" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-white p-4 flex flex-col rounded-r-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-5 w-5 text-[#C00018]" />
            SENTINEL PAYMENTS
          </SheetTitle>
          <SheetDescription className="text-xs text-[#74777F]">AP Fraud Defense System</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 flex flex-col">
          <RunBatchSidebarButton />
          <NavItems onNavigate={() => setMobileOpen(false)} />
          <UserProfileWidget />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SidebarNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#E2E5E8] bg-white p-3 lg:flex lg:flex-col">
      <Brand />
      <RunBatchSidebarButton />
      <div className="flex-1 overflow-y-auto">
        <NavItems />
      </div>
      <UserProfileWidget />
    </aside>
  );
}

export function Sidebar() {
  return <SidebarTrigger />;
}

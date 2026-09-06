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
} from 'lucide-react';
import { useAppStore, type View } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useStartRun } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.5;

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
      className="flex cursor-pointer items-center gap-3 px-3 py-4 group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C00018] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
        <ShieldCheck className="h-5 w-5" strokeWidth={ICON_STROKE} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold tracking-tight text-white">
          Sentinel <span className="text-white/40">Payments</span>
        </span>
        <span className="text-[11px] text-white/35">AP Fraud Defense</span>
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
          className="w-full cursor-pointer justify-center gap-2 rounded-full bg-[#BA1A1A] py-5 text-xs font-bold uppercase tracking-wider text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all hover:bg-[#93000A] active:scale-[0.98]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
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
          className="w-full cursor-pointer justify-center gap-2 rounded-full bg-emerald-600 py-5 text-xs font-bold uppercase tracking-wider text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={ICON_STROKE} />
          </div>
          <span>Screen Again</span>
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
        className="group w-full cursor-pointer justify-center gap-2.5 rounded-full bg-[#C00018] py-5 text-xs font-bold uppercase tracking-wider text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#A80015] active:scale-[0.98]"
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
    <nav className="relative flex flex-col gap-1 py-2" aria-label="Primary">
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
              'group relative flex cursor-pointer select-none items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-medium transition-all duration-300',
              active
                ? 'text-white'
                : 'text-white/45 hover:bg-white/[0.04] hover:text-white/85',
            )}
          >
            {active && (
              <motion.div
                layoutId="m3-active-nav-indicator"
                className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.06]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}

            <Icon
              className={cn(
                'relative z-10 h-4 w-4 shrink-0 transition-all duration-300',
                active ? 'text-red-400' : 'text-white/35 group-hover:scale-110 group-hover:text-white/70',
              )}
            />
            <span className="relative z-10">{item.label}</span>

            {active && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-[#C00018]"
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
      <div className="mt-auto border-t border-white/[0.08] px-1 pt-3">
        <Button
          onClick={() => openAuthModal('login')}
          variant="outline"
          className="w-full cursor-pointer justify-center gap-2 rounded-full border-white/15 bg-transparent text-xs font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
        >
          <User className="h-4 w-4" strokeWidth={ICON_STROKE} />
          <span>Sign in to console</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-white/[0.08] px-1 pt-3">
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C00018] text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-semibold text-white">{user.name}</span>
            <span className="truncate text-[10px] text-white/35">{user.role}</span>
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
          className="cursor-pointer rounded-full p-1.5 text-white/40 transition-colors duration-300 hover:bg-white/[0.06] hover:text-red-300"
        >
          <LogOut className="h-4 w-4" strokeWidth={ICON_STROKE} />
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
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-white/15 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" strokeWidth={ICON_STROKE} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col rounded-r-3xl border-white/10 bg-[#0B0B0E] p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sm text-white">
            <ShieldCheck className="h-5 w-5 text-[#C00018]" strokeWidth={ICON_STROKE} />
            Sentinel Payments
          </SheetTitle>
          <SheetDescription className="text-xs text-white/35">AP Fraud Defense System</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-1 flex-col">
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
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#0B0B0E]/60 p-3 lg:flex">
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

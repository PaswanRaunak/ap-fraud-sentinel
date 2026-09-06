'use client';

// CommandMenu — global ⌘K / Ctrl+K palette for the ops console.
// Navigate between views, kick off a batch run, and jump straight to a case
// by searching its ID or vendor. Open programmatically via the window event
// 'apf:open-command-menu' (dispatched by the header ⌘K button).

import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  ShieldAlert,
  Upload,
  Building2,
  History,
  Globe,
  Play,
  FileText,
  CornerDownLeft,
} from 'lucide-react';
import { useAppStore, type View } from '@/lib/store';
import { useStartRun, useCases } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/store';

const ICON_STROKE = 1.5;

const NAV_ITEMS: { view: View; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'cases', label: 'Cases Queue', icon: ShieldAlert },
  { view: 'upload', label: 'Invoice Ingestion', icon: Upload },
  { view: 'vendors', label: 'Vendor Master', icon: Building2 },
  { view: 'runs', label: 'Batch Ledger', icon: History },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [caseQuery, setCaseQuery] = useState('');

  const setView = useAppStore((s) => s.setView);
  const selectCase = useAppStore((s) => s.selectCase);
  const startRun = useStartRun();
  const { toast } = useToast();

  // Live case lookup — debounced so typing doesn't hammer the API.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(caseQuery), 250);
    return () => clearTimeout(t);
  }, [caseQuery]);

  const { data: caseResults, isFetching: casesFetching } = useCases({
    search: debouncedQuery.length >= 2 ? debouncedQuery : undefined,
    limit: 5,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const openEvent = () => setOpen(true);
    document.addEventListener('keydown', down);
    window.addEventListener('apf:open-command-menu', openEvent);
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('apf:open-command-menu', openEvent);
    };
  }, []);

  const go = (view: View) => {
    setView(view);
    setOpen(false);
  };

  const runBatch = async () => {
    setOpen(false);
    try {
      const r = await startRun.mutateAsync({});
      toast({
        title: 'Batch screening initiated',
        description: `Run ${r.run_id ?? 'queued'} — 141 invoices entering 7-stage pipeline.`,
      });
      setView('dashboard');
    } catch (e) {
      toast({
        title: 'Run failed',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="rounded-2xl border-white/10 bg-[#0B0B0E] sm:max-w-xl"
    >
      <CommandInput
        placeholder="Search views, run a batch, or find a case…"
        value={caseQuery}
        onValueChange={setCaseQuery}
        className="text-sm"
      />
      <CommandList className="max-h-[380px]">
        {/* Case results appear as you type */}
        {debouncedQuery.length >= 2 && (
          <CommandGroup heading="Cases">
            {casesFetching && (caseResults?.items ?? []).length === 0 && (
              <div className="px-4 py-3 text-xs text-white/30">Searching…</div>
            )}
            {!casesFetching && (caseResults?.items ?? []).length === 0 && (
              <CommandEmpty>No case matches that search.</CommandEmpty>
            )}
            {(caseResults?.items ?? []).map((c) => (
              <CommandItem
                key={c.caseId}
                value={`case-${c.caseId}-${c.vendorName}`}
                onSelect={() => {
                  selectCase(c.caseId);
                  setOpen(false);
                }}
                className="gap-3"
              >
                <FileText className="h-4 w-4 text-white/35" strokeWidth={ICON_STROKE} />
                <span className="font-mono text-xs font-bold text-white">{c.caseId}</span>
                <span className="truncate text-xs text-white/45">{c.vendorName}</span>
                <span className="ml-auto font-mono text-xs tabular-nums text-white/45">
                  {formatCurrency(c.amountUsd, c.currency)}
                </span>
                <CornerDownLeft className="h-3 w-3 text-white/20" strokeWidth={ICON_STROKE} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.view} onSelect={() => go(item.view)} className="gap-3">
                <Icon className="h-4 w-4 text-white/45" strokeWidth={ICON_STROKE} />
                <span className="text-sm">{item.label}</span>
              </CommandItem>
            );
          })}
          <CommandItem onSelect={() => { setOpen(false); setView('landing'); }} className="gap-3">
            <Globe className="h-4 w-4 text-white/45" strokeWidth={ICON_STROKE} />
            <span className="text-sm">Public website</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={runBatch} className="gap-3" disabled={startRun.isPending}>
            <Play className="h-4 w-4 fill-red-400 text-red-400" strokeWidth={ICON_STROKE} />
            <span className="text-sm">Run batch audit</span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-white/25">
              141 invoices
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

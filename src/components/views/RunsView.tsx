'use client';

// Batch runs ledger — master-detail layout.
// Left: compact, scannable run list (searchable). Right: inspector for the
// selected run with outcome stats and the cost breakdown chart.

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Loader2, Clock, ShieldCheck, ShieldAlert, Radar, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRuns } from '@/hooks/useDashboardData';
import { CostTable } from '@/components/dashboard/CostTable';
import { formatCurrency } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { RunRecord } from '@/lib/types';

const ICON_STROKE = 1.5;

function fmtDateTime(s?: string | null): { date: string; time: string } {
  if (!s) return { date: '—', time: '' };
  try {
    const d = new Date(s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z'));
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
  } catch {
    return { date: s, time: '' };
  }
}

function fmtDuration(s: number): string {
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

function StatusIcon({ status }: { status: RunRecord['status'] }) {
  if (status === 'complete')
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={ICON_STROKE} />;
  if (status === 'running')
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sky-400" strokeWidth={ICON_STROKE} />;
  return <XCircle className="h-4 w-4 shrink-0 text-red-400" strokeWidth={ICON_STROKE} />;
}

function StatCell({
  icon,
  label,
  value,
  tone = 'text-white',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {icon}
        {label}
      </span>
      <span className={cn('mt-2 block font-mono text-2xl font-semibold tabular-nums tracking-tight', tone)}>
        {value}
      </span>
    </div>
  );
}

export function RunsView() {
  const { data: runs, isLoading } = useRuns();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const allRuns: RunRecord[] = useMemo(() => runs?.items ?? [], [runs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRuns;
    return allRuns.filter((r) => r.runId.toLowerCase().includes(q));
  }, [allRuns, search]);

  // Keep a valid selection as data refreshes.
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedRunId(null);
    } else if (!filtered.some((r) => r.runId === selectedRunId)) {
      setSelectedRunId(filtered[0].runId);
    }
  }, [filtered, selectedRunId]);

  const selected = filtered.find((r) => r.runId === selectedRunId) ?? null;
  const started = selected ? fmtDateTime(selected.startedAt) : null;
  const ended = selected ? fmtDateTime(selected.endedAt) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Batch ledger{' '}
          {!isLoading && <span className="text-base font-normal text-white/35">({allRuns.length})</span>}
        </h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search run ID…"
            className="rounded-full border-white/10 bg-white/[0.04] pl-9 pr-4 text-xs text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-[#C00018]/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ===== Master: run list ===== */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] lg:col-span-5">
          <div className="max-h-[640px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-white/35">
                {allRuns.length === 0
                  ? 'No batch runs yet — click "Run Batch Audit" to screen the invoice queue.'
                  : `No runs match "${search.trim()}".`}
              </div>
            ) : (
              filtered.map((r) => {
                const active = r.runId === selectedRunId;
                const started = fmtDateTime(r.startedAt);
                return (
                  <button
                    key={r.runId}
                    type="button"
                    onClick={() => setSelectedRunId(r.runId)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3.5 border-b border-white/[0.05] px-5 py-3.5 text-left transition-colors duration-200 last:border-b-0',
                      active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
                    )}
                  >
                    <StatusIcon status={r.status} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-xs font-bold text-white/90">{r.runId}</div>
                      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-white/30">
                        {started.date} {started.time} · {r.casesProcessed} cases · {fmtDuration(r.durationS)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold tabular-nums text-emerald-300">
                        {formatCurrency(r.amountSavedUsd, 'USD')}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-white/30">
                        {r.fraudCaught} caught
                      </div>
                    </div>
                    <ArrowRight
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 transition-all duration-300',
                        active ? 'translate-x-0.5 text-white/70' : 'text-white/15',
                      )}
                      strokeWidth={ICON_STROKE}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ===== Detail: run inspector ===== */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.runId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                {/* Inspector header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Run inspector
                    </span>
                    <h2 className="mt-1 font-mono text-lg font-bold text-white">{selected.runId}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-right font-mono text-xs text-white/45">
                    <Clock className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    <span className="tabular-nums">
                      {started?.date} {started?.time}
                      {ended?.time ? ` → ${ended.time}` : ''}
                    </span>
                  </div>
                </div>

                {/* Outcome stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCell
                    icon={<Radar className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Cases"
                    value={selected.casesProcessed.toLocaleString()}
                  />
                  <StatCell
                    icon={<ShieldAlert className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Held"
                    value={String(selected.casesHeld)}
                    tone="text-red-300"
                  />
                  <StatCell
                    icon={<ShieldCheck className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Caught"
                    value={String(selected.fraudCaught)}
                    tone="text-emerald-300"
                  />
                  <StatCell
                    icon={<Clock className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Duration"
                    value={fmtDuration(selected.durationS)}
                  />
                </div>

                {/* Money strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-5 py-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/70">
                      Fraud losses prevented
                    </span>
                    <div className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white">
                      {formatCurrency(selected.amountSavedUsd, 'USD')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      Total run cost
                    </span>
                    <div className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white/85">
                      {formatCurrency(selected.totalUsd, 'USD')}
                    </div>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div>
                  <h3 className="mb-3 text-sm font-bold text-white">Cost breakdown</h3>
                  <CostTable
                    signalsCost={selected.signalsCostUsd}
                    llmCost={selected.llmCostUsd}
                    callCost={selected.callCostUsd}
                    totalCost={selected.totalUsd}
                    casesProcessed={selected.casesProcessed}
                  />
                </div>
              </motion.div>
            ) : (
              !isLoading && (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-white/30">
                  Select a run to inspect it.
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

'use client';

// Dashboard — asymmetric command-center composition.
// Hero metric dominates; supporting tiles, the live pipeline trace and an
// operations feed with inline risk bars replace the old equal-card grid.

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, ShieldAlert, ShieldCheck, Activity, Gauge } from 'lucide-react';
import { StatCallout } from '@/components/dashboard/StatCallout';
import { PipelineTrace } from '@/components/dashboard/PipelineTrace';
import { useStats, useCases, useRuns } from '@/hooks/useDashboardData';
import { useAppStore, formatCurrency } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { RecommendationBadge } from '@/components/dashboard/StatusBadge';
import { cn } from '@/lib/utils';
import type { CaseRecord } from '@/lib/types';

const ICON_STROKE = 1.5;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

/** Thin rounded risk meter — 0..1 → colored bar. */
function RiskBar({ score }: { score: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  return (
    <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          score >= 0.7 ? 'bg-amber-400' : score >= 0.4 ? 'bg-red-400' : 'bg-emerald-400',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** SVG ring gauge — fraud caught vs. cases screened. */
function RingGauge({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const r = 26;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#4ade80"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold tabular-nums text-white">{value}</span>
        <span className="text-[9px] uppercase tracking-wider text-white/35">caught</span>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: cases, isLoading: casesLoading } = useCases({ limit: 8 });
  const { data: runs } = useRuns();
  const selectCase = useAppStore((s) => s.selectCase);
  const setView = useAppStore((s) => s.setView);
  const runId = useAppStore((s) => s.runId);
  const stages = useAppStore((s) => s.stages);
  const batchStatus = useAppStore((s) => s.batchStatus);

  const recentRuns = useMemo(() => (runs?.items ?? []).slice(0, 8), [runs]);
  const sparkline = useMemo(
    () =>
      recentRuns
        .slice()
        .reverse()
        .map((r, i) => ({ idx: i, saved: r.amountSavedUsd })),
    [recentRuns],
  );
  const lastRun = recentRuns.at(-1) ?? null;
  const perInvoice =
    lastRun && lastRun.casesProcessed > 0 ? lastRun.totalUsd / lastRun.casesProcessed : 0;

  const feed: CaseRecord[] = cases?.items ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* ===== Hero bento row ===== */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 md:grid-cols-12"
      >
        {/* Dominant metric — $ protected + live sparkline */}
        <motion.div variants={cardVariants} className="md:col-span-5">
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.04] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
                Fraud losses prevented
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
            {statsLoading ? (
              <Skeleton className="mt-6 h-14 w-64 rounded-xl" />
            ) : (
              <div className="mt-5 font-mono text-5xl font-semibold tabular-nums tracking-tighter text-white sm:text-6xl">
                {formatCurrency(stats?.amountSavedUsd ?? 0, 'USD')}
              </div>
            )}
            <p className="mt-2 text-xs text-white/40">
              intercepted across {stats?.casesScreened ?? 0} screened invoices
            </p>
            <div className="mt-4 h-16 w-full">
              {sparkline.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkline} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="savedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
                      contentStyle={{
                        background: 'rgba(11,11,14,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        fontSize: 12,
                        color: '#fff',
                      }}
                      formatter={(v: number) => [formatCurrency(v, 'USD'), 'saved']}
                      labelFormatter={() => ''}
                    />
                    <Area
                      type="monotone"
                      dataKey="saved"
                      stroke="#4ade80"
                      strokeWidth={2}
                      fill="url(#savedFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center text-[11px] text-white/25">
                  Run a batch to build the trend.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Fraud caught — ring gauge */}
        <motion.div variants={cardVariants} className="md:col-span-3">
          <div className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Detection record
            </span>
            <div className="flex items-center justify-between gap-4">
              <RingGauge value={stats?.fraudCaught ?? 0} total={stats?.casesScreened ?? 0} />
              <div className="flex flex-col gap-1 text-right">
                <span className="font-mono text-2xl font-semibold tabular-nums text-white">
                  {stats?.casesScreened ? (((stats.fraudCaught ?? 0) / stats.casesScreened) * 100).toFixed(1) : '0.0'}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/35">hit rate</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-white/40">
              Every caught case verified against ground truth.
            </p>
          </div>
        </motion.div>

        {/* Held for review — actionable */}
        <motion.div variants={cardVariants} className="md:col-span-4">
          <button
            type="button"
            onClick={() => setView('cases')}
            className="group flex h-full w-full cursor-pointer flex-col justify-between rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-7 text-left shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-red-400/40 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300/70">
                Awaiting your decision
              </span>
              {(stats?.casesHeld ?? 0) > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                </span>
              )}
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div className="font-mono text-6xl font-semibold tabular-nums leading-none text-white">
                {statsLoading ? '—' : (stats?.casesHeld ?? 0)}
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-300 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                Open queue
                <ArrowRight className="h-4 w-4" strokeWidth={ICON_STROKE} />
              </span>
            </div>
            <p className="mt-3 text-xs text-white/40">
              {batchStatus === 'running'
                ? 'Pipeline in flight — holds land here as they score.'
                : 'Held payments stay frozen until a controller disposes them.'}
            </p>
          </button>
        </motion.div>
      </motion.div>

      {/* ===== Pipeline trace (full width) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 24 }}
        className="rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Activity className="h-4 w-4 text-sky-300" strokeWidth={ICON_STROKE} />
            Pipeline Trace
          </h2>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs font-medium text-white/45">
            {runId ?? 'DEFAULT-141'}
          </span>
        </div>
        <PipelineTrace stages={stages} runId={runId} />
      </motion.div>

      {/* ===== Ops feed + right rail ===== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Feed */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 24 }}
          className="rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] lg:col-span-8"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Case feed</h2>
            <button
              type="button"
              onClick={() => setView('cases')}
              className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-red-300 transition-colors hover:bg-[#C00018]/10"
            >
              <span>All cases</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </button>
          </div>

          <div className="flex flex-col">
            {casesLoading && (
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            )}
            {!casesLoading && feed.length === 0 && (
              <div className="py-10 text-center text-sm text-white/35">
                No cases yet — run a batch audit to screen the invoice queue.
              </div>
            )}
            {!casesLoading &&
              feed.map((c, i) => (
                <motion.button
                  key={c.caseId}
                  type="button"
                  onClick={() => selectCase(c.caseId)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.25 }}
                  className="group flex w-full cursor-pointer items-center gap-4 border-b border-white/[0.05] px-2 py-3 text-left transition-colors duration-200 last:border-b-0 hover:bg-white/[0.03]"
                >
                  <span className="w-32 shrink-0 font-mono text-xs font-bold text-white/90">
                    {c.caseId}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/55" title={c.vendorName}>
                    {c.vendorName}
                  </span>
                  <RiskBar score={c.riskScore} />
                  <span className="w-6 shrink-0 text-right font-mono text-[11px] tabular-nums text-white/40">
                    {c.riskScore.toFixed(2)}
                  </span>
                  <span className="w-24 shrink-0 text-right font-mono text-xs font-bold tabular-nums text-white">
                    {formatCurrency(c.amountUsd, c.currency)}
                  </span>
                  <span className="w-20 shrink-0 text-center">
                    <RecommendationBadge rec={c.recommendation} />
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white/60"
                    strokeWidth={ICON_STROKE}
                  />
                </motion.button>
              ))}
          </div>
        </motion.div>

        {/* Right rail — efficiency + recent batches */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 24 }}
          className="flex flex-col gap-5 lg:col-span-4"
        >
          {/* Efficiency tile */}
          <div className="rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <Gauge className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Cost per screening
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-semibold tabular-nums tracking-tighter text-white">
                ${perInvoice.toFixed(4)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/40">
              Last batch · target $0.04 end-card. Signals cost fractions of a cent; calls only bill on holds.
            </p>
            <button
              type="button"
              onClick={() => setView('runs')}
              className="mt-4 flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200"
            >
              Full cost breakdown
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </button>
          </div>

          {/* Recent batches */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Recent batches
            </span>
            <div className="mt-4 flex flex-col gap-1">
              {recentRuns.slice(0, 4).map((r) => (
                <button
                  key={r.runId}
                  type="button"
                  onClick={() => setView('runs')}
                  className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-white/[0.04]"
                >
                  <span className="max-w-[9rem] truncate font-mono text-[11px] text-white/70">{r.runId}</span>
                  <span className="font-mono text-[11px] tabular-nums text-emerald-300">
                    {formatCurrency(r.amountSavedUsd, 'USD')}
                  </span>
                </button>
              ))}
              {recentRuns.length === 0 && (
                <span className="py-4 text-center text-xs text-white/30">No batches yet.</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setView('runs')}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/10 py-2 text-xs font-semibold text-white/60 transition-colors duration-300 hover:border-white/25 hover:text-white"
            >
              <ShieldAlert className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Batch ledger
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

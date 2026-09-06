'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Inbox,
  FileText,
  Network,
  Radar,
  Bot,
  PhoneCall,
  Gavel,
  type LucideIcon,
  CheckCircle2,
  Loader2,
  Activity,
} from 'lucide-react';
import type { TraceStage, TraceEvent } from '@/lib/types';
import { useStats } from '@/hooks/useDashboardData';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.5;

const STAGES: { name: TraceStage['name']; label: string; icon: LucideIcon }[] = [
  { name: 'intake', label: 'Intake', icon: Inbox },
  { name: 'extraction', label: 'Extraction', icon: FileText },
  { name: 'grounding', label: 'Grounding', icon: Network },
  { name: 'signals', label: 'Signals', icon: Radar },
  { name: 'agents', label: 'Agents', icon: Bot },
  { name: 'verification', label: 'Verification', icon: PhoneCall },
  { name: 'gate', label: 'Gate', icon: Gavel },
];

const STAGE_ICON: Record<string, LucideIcon> = Object.fromEntries(
  STAGES.map((s) => [s.name, s.icon]),
) as Record<string, LucideIcon>;

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

function stageDuration(s?: TraceStage): string | null {
  if (!s?.startedAt || !s?.completedAt) return null;
  const secs = (s.completedAt - s.startedAt) / 1000;
  if (secs < 0) return null;
  return secs < 10 ? `${secs.toFixed(1)}s` : `${Math.round(secs)}s`;
}

export function PipelineTrace({ stages, runId }: { stages: TraceStage[]; runId?: string | null }) {
  const map = new Map(stages.map((s) => [s.name, s] as const));
  const activeStage = stages.find((s) => s.status === 'running');
  const batchStatus = useAppStore((s) => s.batchStatus);
  const recentEvents = useAppStore((s) => s.recentEvents);
  const reduceMotion = useReducedMotion();
  const { data: stats } = useStats();

  const screenedCount = stats?.casesScreened ?? 0;
  const fraudCaught = stats?.fraudCaught ?? 0;
  const totalCount = 141;
  const progressPercent = Math.min(100, Math.round((screenedCount / totalCount) * 100));
  const isRunning = batchStatus === 'running';
  const isDone = batchStatus === 'completed';

  // Pull the invoice number out of the active stage's message, if any.
  const activeMsg = activeStage?.message || '';
  const caseMatch = activeMsg.match(/(?:INV-\d{4}-\d+[A-Z]?|C-\d{3,4}|CORRUPT-\d{4})/i);
  const activeInvoiceNo = caseMatch ? caseMatch[0] : null;

  // Latest case-level trace events for the live ticker (newest first).
  const tickerEvents = recentEvents
    .filter((e): e is TraceEvent => e.type === 'case' && !!e.caseId)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      {/* Stepper card */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0B0B0E] p-6 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="-mx-6 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
          <div className="flex min-w-max items-center justify-between gap-4">
          {STAGES.map((stage, i) => {
            const s = map.get(stage.name);
            const status = s?.status ?? 'idle';
            const isComplete = status === 'complete';
            const isRunningStage = status === 'running';
            const Icon = stage.icon;
            const duration = stageDuration(s);

            return (
              <div key={stage.name} className="flex flex-1 items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={false}
                    animate={{ scale: isRunningStage && !reduceMotion ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      'relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300',
                      isComplete
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                        : isRunningStage
                          ? 'border-red-400/40 bg-white text-[#C00018] shadow-[0_0_0_6px_rgba(192,0,24,0.12)]'
                          : 'border-white/10 bg-white/[0.04] text-white/35',
                    )}
                  >
                    {isComplete ? (
                      <motion.span
                        key="check"
                        initial={{ scale: reduceMotion ? 1 : 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className="flex"
                      >
                        <Check className="h-5 w-5 stroke-[2.5]" />
                      </motion.span>
                    ) : isRunningStage ? (
                      <>
                        {!reduceMotion && (
                          <span className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-[#C00018]" />
                        )}
                        <Icon className="h-5 w-5" strokeWidth={ICON_STROKE} />
                      </>
                    ) : (
                      <Icon className="h-5 w-5" strokeWidth={ICON_STROKE} />
                    )}
                  </motion.div>
                  <div className="text-center">
                    <span
                      className={cn(
                        'block text-xs font-semibold transition-colors duration-200',
                        isRunningStage ? 'text-red-300' : isComplete ? 'text-emerald-300' : 'text-white/45',
                      )}
                    >
                      {stage.label}
                    </span>
                    <span
                      className={cn(
                        'block font-mono text-[10px] tabular-nums transition-opacity duration-300',
                        duration ? 'text-white/35 opacity-100' : 'opacity-0',
                      )}
                    >
                      {duration ?? '·'}
                    </span>
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div className="relative mb-5 h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <motion.div
                      initial={false}
                      animate={{
                        width: isComplete ? '100%' : isRunningStage ? '55%' : '0%',
                      }}
                      transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeInOut' }}
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        isComplete
                          ? 'bg-emerald-400'
                          : isRunningStage
                            ? 'bg-gradient-to-r from-[#C00018] to-[#FF8A80] apf-shimmer'
                            : 'bg-transparent',
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>

        {/* Status pill — animated swap between idle / processing / complete */}
        <div className="mt-6 flex h-9 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isRunning ? (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300"
              >
                <Loader2 className={cn('h-3.5 w-3.5', !reduceMotion && 'animate-spin')} strokeWidth={ICON_STROKE} />
                <span>
                  Processing {activeInvoiceNo ?? 'invoice batch'}
                  {activeStage ? ` · ${STAGES.find((st) => st.name === activeStage.name)?.label}` : ''}
                </span>
              </motion.div>
            ) : isDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                <span>
                  Batch complete · {screenedCount} invoices screened
                  {fraudCaught > 0 ? ` · ${fraudCaught} fraud caught` : ''}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/50"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={ICON_STROKE} />
                <span>Batch Screening Ready · {totalCount} Invoices Synchronized</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live case-level activity ticker */}
        <AnimatePresence initial={false}>
          {tickerEvents.length > 0 && (
            <motion.div
              key="ticker"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                  <Activity className="h-3 w-3" strokeWidth={ICON_STROKE} />
                  Live Case Activity
                  {runId && <span className="ml-auto font-mono normal-case tracking-normal">{runId}</span>}
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {tickerEvents.map((e) => {
                      const StageIcon = (e.stage && STAGE_ICON[e.stage]) || Activity;
                      return (
                        <motion.div
                          key={`${e.timestamp}-${e.caseId}-${e.caseStatus}`}
                          layout={!reduceMotion}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.2 }}
                          className="flex items-center gap-2 font-mono text-[11px] text-white/70"
                        >
                          <span className="text-white/25">{formatClock(e.timestamp)}</span>
                          <StageIcon className="h-3 w-3 text-sky-300" strokeWidth={ICON_STROKE} />
                          <span className="font-bold text-white">{e.caseId}</span>
                          <span
                            className={cn(
                              'font-semibold',
                              e.caseStatus === 'quarantined'
                                ? 'text-amber-300'
                                : e.caseStatus === 'closed'
                                  ? 'text-emerald-300'
                                  : 'text-sky-300',
                            )}
                          >
                            {e.caseStatus}
                          </span>
                          {e.stage && <span className="text-white/25">· {e.stage}</span>}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Linear progress bar */}
      <div className="flex items-center gap-4 px-1">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'h-full rounded-full',
              isDone
                ? 'bg-emerald-400'
                : isRunning
                  ? 'bg-gradient-to-r from-[#C00018] to-[#FF8A80] apf-shimmer'
                  : 'bg-white/20',
            )}
          />
        </div>
        <span className="min-w-[7.5rem] text-right font-mono text-xs font-bold tabular-nums text-white/60">
          {screenedCount} / {totalCount} ({progressPercent}%)
        </span>
      </div>
    </div>
  );
}

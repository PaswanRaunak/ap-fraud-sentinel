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
      {/* Material 3 Process Stepper Container */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E2E5E8] bg-white p-6 sm:p-8 text-[#1B1B1F] shadow-xs">
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
                      'relative flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300',
                      isComplete
                        ? 'bg-[#D6E8D6] text-[#1E6827] border border-[#A8D5A8]'
                        : isRunningStage
                          ? 'bg-white text-[#C00018] border-2 border-[#FFB4AB] shadow-[0_0_0_6px_rgba(192,0,24,0.06)]'
                          : 'bg-[#F1F3F5] text-[#74777F] border border-[#E2E5E8]',
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
                          <span className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#C00018] animate-spin" />
                        )}
                        <Icon className="h-5 w-5" />
                      </>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </motion.div>
                  <div className="text-center">
                    <span
                      className={cn(
                        'text-xs font-bold block transition-colors duration-200 font-poppins',
                        isRunningStage ? 'text-[#C00018]' : isComplete ? 'text-[#1E6827]' : 'text-[#44474E]',
                      )}
                    >
                      {stage.label}
                    </span>
                    <span
                      className={cn(
                        'block text-[10px] font-mono transition-opacity duration-300',
                        duration ? 'text-[#74777F] opacity-100' : 'opacity-0',
                      )}
                    >
                      {duration ?? '·'}
                    </span>
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div className="relative mb-5 h-1.5 flex-1 rounded-full bg-[#E2E5E8] overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{
                        width: isComplete ? '100%' : isRunningStage ? '55%' : '0%',
                      }}
                      transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeInOut' }}
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        isComplete
                          ? 'bg-[#1E6827]'
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
                className="inline-flex items-center gap-2 rounded-full bg-[#FFF4E0] border border-[#FFE3B3] px-4 py-1.5 text-xs font-bold text-[#8A5A00]"
              >
                <Loader2 className={cn('h-3.5 w-3.5', !reduceMotion && 'animate-spin')} />
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
                className="inline-flex items-center gap-2 rounded-full bg-[#D6E8D6] border border-[#A8D5A8] px-4 py-1.5 text-xs font-bold text-[#1E6827]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
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
                className="inline-flex items-center gap-2 rounded-full bg-[#F1F3F5] px-4 py-1.5 text-xs font-semibold text-[#44474E] border border-[#E2E5E8]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1E6827]" />
                <span>Batch Screening Ready · {totalCount} Invoices Synchronized</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live case-level activity ticker — shows the per-case flow the
            stage stepper above aggregates away. */}
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
              <div className="mt-4 rounded-2xl bg-[#F7F8FA] border border-[#E2E5E8] px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#74777F]">
                  <Activity className="h-3 w-3" />
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
                          className="flex items-center gap-2 font-mono text-[11px] text-[#44474E]"
                        >
                          <span className="text-[#9AA0A6]">{formatClock(e.timestamp)}</span>
                          <StageIcon className="h-3 w-3 text-[#00668C]" />
                          <span className="font-bold">{e.caseId}</span>
                          <span
                            className={cn(
                              'font-semibold',
                              e.caseStatus === 'quarantined'
                                ? 'text-amber-700'
                                : e.caseStatus === 'closed'
                                  ? 'text-[#1E6827]'
                                  : 'text-[#00668C]',
                            )}
                          >
                            {e.caseStatus}
                          </span>
                          {e.stage && <span className="text-[#9AA0A6]">· {e.stage}</span>}
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

      {/* Linear progress bar with shimmer while the batch is in flight */}
      <div className="flex items-center gap-4 px-1">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E2E5E8]">
          <motion.div
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'h-full rounded-full',
              isDone
                ? 'bg-[#1E6827]'
                : isRunning
                  ? 'bg-gradient-to-r from-[#C00018] to-[#FF8A80] apf-shimmer'
                  : 'bg-[#C4C7C5]',
            )}
          />
        </div>
        <span className="min-w-[7.5rem] text-right text-xs font-bold text-[#44474E] font-mono tabular-nums">
          {screenedCount} / {totalCount} ({progressPercent}%)
        </span>
      </div>
    </div>
  );
}

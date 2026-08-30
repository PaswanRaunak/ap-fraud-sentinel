'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, DollarSign, IndianRupee, ClipboardList, ArrowRight } from 'lucide-react';
import { StatCallout } from '@/components/dashboard/StatCallout';
import { PipelineTrace } from '@/components/dashboard/PipelineTrace';
import { CaseCard } from '@/components/dashboard/CaseCard';
import { useStats, useCases } from '@/hooks/useDashboardData';
import { useAppStore, formatCurrency } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';

const statCards = [
  { key: 'screened', label: 'Cases Screened', accent: 'default' as const, icon: ClipboardList },
  { key: 'held', label: 'Held For Review', accent: 'red' as const, icon: ShieldAlert },
  { key: 'fraud', label: 'Fraud Caught', accent: 'steel' as const, icon: ShieldCheck },
  { key: 'saved', label: '$ Saved', accent: 'emerald' as const, icon: DollarSign },
];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

export function DashboardView() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: cases, isLoading: casesLoading } = useCases({ limit: 10 });
  const selectCase = useAppStore((s) => s.selectCase);
  const setView = useAppStore((s) => s.setView);
  const runId = useAppStore((s) => s.runId);
  const stages = useAppStore((s) => s.stages);

  const statValues: Record<string, string | number> = {
    screened: stats?.casesScreened ?? 141,
    held: stats?.casesHeld ?? 7,
    fraud: stats?.fraudCaught ?? 6,
    saved: formatCurrency(stats?.amountSavedUsd ?? 92744, 'USD'),
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* 4 Stat Cards Row */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statsLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </>
        ) : (
          statCards.map(({ key, label, accent, icon: Icon }) => (
            <motion.div key={key} variants={cardVariants}>
              <StatCallout
                label={label}
                value={statValues[key]}
                accent={accent}
                icon={<Icon className="h-4 w-4" />}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pipeline Trace Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 24 }}
        className="rounded-3xl border border-[#E2E5E8] bg-white p-7 shadow-xs"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B1B1F] font-poppins">Pipeline Trace</h2>
          <span className="font-mono text-xs font-semibold text-[#74777F] bg-[#F1F3F5] px-3 py-1 rounded-full">
            Active Batch: {runId ?? 'DEFAULT-141'}
          </span>
        </div>
        <PipelineTrace stages={stages} runId={runId} />
      </motion.div>

      {/* Recent Cases Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 24 }}
        className="rounded-3xl border border-[#E2E5E8] bg-white p-7 shadow-xs"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B1B1F] font-poppins">Recent Verified Cases</h2>
          <button
            type="button"
            onClick={() => setView('cases')}
            className="flex items-center gap-1 text-xs font-bold text-[#C00018] hover:bg-[#FFDAD6]/60 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span>View All Cases</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {!casesLoading && (cases?.items ?? []).length === 0 && (
            <div className="py-8 text-center text-sm text-[#74777F]">No cases in this batch run. Click &quot;Run Batch Audit&quot; in the sidebar to screen.</div>
          )}
          {(cases?.items ?? []).map((c, i) => (
            <motion.div
              key={c.caseId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25, ease: 'easeOut' }}
            >
              <CaseCard c={c} onClick={() => selectCase(c.caseId)} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}



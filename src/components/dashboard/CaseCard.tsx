'use client';

import { ChevronRight } from 'lucide-react';
import { RecommendationBadge } from '@/components/dashboard/StatusBadge';
import { cn } from '@/lib/utils';
import type { CaseRecord } from '@/lib/types';

import { useAppStore, formatCurrency } from '@/lib/store';

const ICON_STROKE = 1.5;

export function CaseCard({ c, onClick }: { c: CaseRecord; onClick?: () => void }) {
  const currency = useAppStore((s) => s.currency);
  const getRiskTrackLabel = (score: number) => {
    // Risk-band labels only - never claim a specific fraud type, which only
    // the fired signals / ground truth can tell.
    if (score >= 0.7) return { label: 'HIGH RISK', bg: 'bg-amber-400/10 text-amber-300 border-amber-400/25' };
    if (score >= 0.4) return { label: 'ELEVATED RISK', bg: 'bg-red-400/10 text-red-300 border-red-400/25' };
    return { label: 'CLEAR', bg: 'bg-white/[0.04] text-white/50 border-white/10' };
  };

  const riskTrack = getRiskTrackLabel(c.riskScore);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-left transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.995] active:bg-white/[0.05]',
      )}
    >
      <div className="flex w-32 shrink-0 flex-col">
        <span className="font-mono text-xs font-bold text-white/90">{c.caseId}</span>
      </div>

      <div className="flex min-w-0 flex-1 px-2">
        <span className="truncate text-xs font-medium text-white/60" title={c.vendorName}>
          {c.vendorName}
        </span>
      </div>

      <div className="w-28 shrink-0 text-right font-mono text-xs font-bold tabular-nums text-white">
        {formatCurrency(c.amountUsd, c.currency)}
      </div>

      <div className="hidden w-44 shrink-0 justify-center sm:flex">
        <span className={cn('rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', riskTrack.bg)}>
          {riskTrack.label}
        </span>
      </div>

      <div className="flex w-24 shrink-0 justify-center px-2">
        <RecommendationBadge rec={c.recommendation} />
      </div>

      <div className="flex w-8 shrink-0 justify-end text-white/25 transition-colors group-hover:text-white/70">
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={ICON_STROKE} />
      </div>
    </button>
  );
}

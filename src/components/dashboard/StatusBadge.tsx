'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CaseStatus, Recommendation, ControllerDecision, VerificationResult } from '@/lib/types';

export function StatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  const map: Record<CaseStatus, { label: string; cls: string }> = {
    queued: { label: 'Queued', cls: 'bg-white/[0.04] text-white/50 border-white/10' },
    extracted: { label: 'Extracted', cls: 'bg-white/[0.04] text-white/50 border-white/10' },
    grounded: { label: 'Grounded', cls: 'bg-white/[0.04] text-white/50 border-white/10' },
    scored: { label: 'Scored', cls: 'bg-sky-400/10 text-sky-300 border-sky-400/25' },
    reviewed: { label: 'Reviewed', cls: 'bg-sky-400/10 text-sky-300 border-sky-400/25' },
    verified: { label: 'Verified', cls: 'bg-amber-400/10 text-amber-300 border-amber-400/25' },
    closed: { label: 'Closed', cls: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25' },
    quarantined: { label: 'Quarantined', cls: 'bg-red-400/10 text-red-300 border-red-400/25' },
  };
  const v = map[status] ?? map.queued;
  return (
    <Badge variant="outline" className={cn(v.cls, 'rounded-full font-semibold uppercase text-[10px] px-2.5 py-0.5 tracking-wider', className)}>
      {v.label}
    </Badge>
  );
}

export function RecommendationBadge({ rec, className }: { rec: Recommendation | null | undefined; className?: string }) {
  if (!rec) return <Badge variant="outline" className={cn('text-white/30 rounded-full', className)}>—</Badge>;
  if (rec === 'hold') {
    return (
      <Badge variant="outline" className={cn('bg-red-400/10 text-red-300 border-red-400/25 rounded-full font-bold uppercase text-[10px] px-3 py-0.5 tracking-wider flex items-center gap-1', className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Hold
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn('bg-emerald-400/10 text-emerald-300 border-emerald-400/25 rounded-full font-bold uppercase text-[10px] px-3 py-0.5 tracking-wider flex items-center gap-1', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      Pass
    </Badge>
  );
}

export function DecisionBadge({ decision, className }: { decision: ControllerDecision | null | undefined; className?: string }) {
  if (!decision) return <Badge variant="outline" className={cn('text-white/30 rounded-full', className)}>—</Badge>;
  const map: Record<ControllerDecision, string> = {
    release: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25',
    hold: 'bg-red-400/10 text-red-300 border-red-400/25',
    escalate: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-bold uppercase text-[10px] px-2.5 py-0.5 tracking-wider', map[decision], className)}>
      {decision}
    </Badge>
  );
}

export function VerificationBadge({ result, className }: { result: VerificationResult | null | undefined; className?: string }) {
  if (!result) return <Badge variant="outline" className={cn('text-white/30 rounded-full', className)}>No call</Badge>;
  const map: Record<VerificationResult, string> = {
    confirmed: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25',
    denied: 'bg-red-400/10 text-red-300 border-red-400/25',
    unclear: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full font-bold uppercase text-[10px] px-2.5 py-0.5 tracking-wider', map[result], className)}>
      {result}
    </Badge>
  );
}

'use client';

// Case evidence sheet - fully data-driven from the /api/cases/[id] payload:
// real extracted facts, fired signals, agent narrative, verification transcript
// and the decision audit trail. No hardcoded demo content.

import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  AlertTriangle,
  Bot,
  Download,
  Info,
  PhoneCall,
  Radar,
  ShieldCheck,
  History,
} from 'lucide-react';
import { useAppStore, formatCurrency } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useCase, useDecide } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ControllerDecision, Signal } from '@/lib/types';

const ICON_STROKE = 1.5;

interface CaseFacts {
  invoice_date?: string | null;
  due_date?: string | null;
  bank_account?: string | null;
  remit_to_email?: string | null;
  notes?: string | null;
  email?: {
    from?: string | null;
    date?: string | null;
    subject?: string | null;
    bankChangeRequest?: boolean;
    bankChangeRequestDate?: string | null;
    requestedBankAccount?: string | null;
  };
}

interface CaseDetailExtra {
  facts?: CaseFacts;
  evidencePack?: Record<string, unknown>;
  vendor?: {
    vendorId?: string;
    legalName?: string;
    registeredDomain?: string;
    knownBankAccount?: string;
  } | null;
}

function last4(account: string | null | undefined): string {
  if (!account) return '-';
  const digits = account.replace(/\D/g, '');
  return digits ? `•••• ${digits.slice(-4)}` : account;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { dateStyle: 'medium' });
}

export function CaseDetailSheet() {
  const id = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);
  const currency = useAppStore((s) => s.currency);
  const user = useAuthStore((s) => s.user);
  const { data } = useCase(id);
  const decide = useDecide();
  const { toast } = useToast();
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const open = Boolean(id);
  const close = () => selectCase(null);

  const detail = (data ?? null) as (typeof data & CaseDetailExtra) | null;
  const facts = detail?.facts ?? {};
  const email = facts.email ?? {};
  const vendor = detail?.vendor ?? null;
  const signals: Signal[] = (detail?.signals ?? []) as Signal[];
  const firedSignals = signals.filter((s) => s.fired);

  const onDecision = async (decision: ControllerDecision) => {
    if (!id) return;
    try {
      await decide.mutateAsync({
        id,
        decision,
        approver: user?.name ?? 'controller',
        reason:
          decision === 'release'
            ? 'Controller reviewed evidence pack and released payment.'
            : decision === 'hold'
              ? 'Controller held payment pending out-of-band confirmation.'
              : 'Controller escalated case for secondary review.',
      });
      toast({
        title: `Disposition set to ${decision.toUpperCase()}`,
        description: `Case ${id} updated.`,
      });
    } catch (e) {
      toast({
        title: 'Action failed',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  const downloadEvidencePack = () => {
    if (!detail) return;
    const signalRows = firedSignals
      .map(
        (s) =>
          `<div class="box"><div style="font-weight:700;font-size:12px;color:#991b1b;">${s.name} - score ${s.score.toFixed(2)} (weight ${(s.weight * 100).toFixed(0)}%)</div><div style="font-size:11px;color:#475569;margin-top:4px;">${s.evidence}</div></div>`,
      )
      .join('');
    const transcriptBlock = detail.callTranscript
      ? `<div class="transcript-box"><div>${detail.callTranscript.replace(/</g, '&lt;')}</div></div>`
      : `<div class="transcript-box">No verification call was placed for this case.</div>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Evidence Pack - ${detail.caseId}</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px; margin: 0; }
          .card { background: #ffffff; border: 2px solid #0f172a; border-radius: 16px; padding: 32px; max-width: 800px; margin: 0 auto; box-shadow: 4px 4px 0 0 #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 20px; font-weight: 800; color: #00668c; letter-spacing: -0.02em; }
          .sub { font-size: 11px; color: #64748b; font-weight: 500; }
          .facts { font-size: 12px; color: #475569; line-height: 1.9; }
          .amount { font-size: 24px; font-weight: 800; color: #00668c; font-variant-numeric: tabular-nums; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
          .transcript-box { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 14px; font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.7; margin-top: 6px; white-space: pre-wrap; }
          .footer { margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <div class="brand">Sentinel Payments - Evidence Pack</div>
              <div class="sub">Case ${detail.caseId} · generated ${new Date().toLocaleString()}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:18px;font-weight:800;">${detail.vendorName}</div>
              <div class="sub">Invoice ${detail.invoiceNumber}</div>
            </div>
          </div>

          <div class="facts">
            <span class="amount">${formatCurrency(detail.amountUsd, detail.currency)}</span><br/>
            Sender domain: <strong>${detail.senderDomain ?? '-'}</strong><br/>
            Invoice date: ${fmtDate(facts.invoice_date ?? detail.invoiceDate)} · Due: ${fmtDate(facts.due_date ?? detail.dueDate)}<br/>
            Requested account: <strong>${last4(email.requestedBankAccount ?? facts.bank_account)}</strong>
            ${vendor?.knownBankAccount ? ` · Account on master: <strong>${last4(vendor.knownBankAccount)}</strong>` : ''}
          </div>

          <div style="margin-top:14px;font-size:11px;font-weight:700;color:#991b1b;">
            Composite risk score: ${(detail.riskScore ?? 0).toFixed(2)} / 1.00 - recommendation: ${(detail.recommendation ?? 'n/a').toUpperCase()}
          </div>

          <div style="font-size:14px;font-weight:800;margin:18px 0 4px;">Fired risk signals</div>
          <div class="grid">${signalRows || '<div class="box">No signals fired.</div>'}</div>

          ${detail.narrative ? `<div style="font-size:14px;font-weight:800;margin:18px 0 6px;">Agent narrative</div><div style="font-size:12px;color:#475569;line-height:1.7;">${detail.narrative.replace(/</g, '&lt;')}</div>` : ''}

          <div style="font-size:14px;font-weight:800;margin:18px 0 2px;">Voice verification</div>
          ${transcriptBlock}

          ${
            detail.decisions.length
              ? `<div style="font-size:14px;font-weight:800;margin:18px 0 6px;">Decision history</div><div class="facts">${detail.decisions
                  .map((d) => `<div>${d.timestamp} - <strong>${d.decision.toUpperCase()}</strong> by ${d.approver}${d.reason ? ` · ${d.reason}` : ''}</div>`)
                  .join('')}</div>`
              : ''
          }

          <div class="footer">
            <div>Generated by AP Payment Fraud Sentinel</div>
            <div>Case record ${detail.caseId}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      setTimeout(() => {
        win.print();
      }, 300);
    }

    toast({
      title: 'Evidence Pack Ready',
      description: `Opened the evidence pack report for ${detail.caseId}.`,
    });
  };

  const riskPct = Math.round((detail?.riskScore ?? 0) * 100);

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[90vw] lg:max-w-[1100px] bg-[#050505]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0B0B0E] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={close}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Back to cases"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={ICON_STROKE} />
            </button>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/35">
                {detail?.caseId ?? id}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {detail?.vendorName ?? 'Loading…'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {detail?.recommendation && (
              <span
                className={cn(
                  'rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase',
                  detail.recommendation === 'hold'
                    ? 'bg-red-400/10 text-red-300 border border-red-400/25'
                    : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/25',
                )}
              >
                {detail.recommendation === 'hold' ? 'Held for review' : 'Cleared to release'}
              </span>
            )}
            {detail?.verificationResult && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white/55">
                Call: {detail.verificationResult}
              </span>
            )}
          </div>
        </div>

        {/* 3-column content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!detail ? (
            <div className="flex h-full items-center justify-center text-sm text-white/35">
              Loading case record…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Column 1: Transaction facts + fired signals */}
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B0B0E] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div>
                  <h3 className="text-sm font-bold text-white">Transaction facts</h3>
                  <p className="text-xs font-medium text-white/35">Extracted from the source document</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/45">Requested amount</span>
                  <span className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-sky-300">
                    {formatCurrency(detail.amountUsd, detail.currency)}
                  </span>
                </div>

                <div className="mt-1 flex flex-col gap-2 border-t border-white/[0.06] pt-3 font-mono text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30">Invoice</span>
                    <strong className="text-right text-white/85">{detail.invoiceNumber}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30">Invoice date</span>
                    <span className="text-white/60">{fmtDate(facts.invoice_date ?? detail.invoiceDate)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30">Due date</span>
                    <span className="text-white/60">{fmtDate(facts.due_date ?? detail.dueDate)}</span>
                  </div>
                  {email.from && (
                    <div className="flex justify-between gap-3">
                      <span className="text-white/30">Sender</span>
                      <strong className="truncate text-right text-white/70" title={email.from}>
                        {email.from}
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30">Sender domain</span>
                    <strong className={cn('text-right', detail.senderDomain ? 'text-white/85' : 'text-white/30')}>
                      {detail.senderDomain ?? '-'}
                    </strong>
                  </div>
                  {(email.requestedBankAccount || facts.bank_account) && (
                    <div className="flex justify-between gap-3">
                      <span className="text-white/30">Requested account</span>
                      <strong className="text-right text-amber-300">{last4(email.requestedBankAccount ?? facts.bank_account)}</strong>
                    </div>
                  )}
                  {vendor?.knownBankAccount && (
                    <div className="flex justify-between gap-3">
                      <span className="text-white/30">Master account</span>
                      <strong className="text-right text-emerald-300">{last4(vendor.knownBankAccount)}</strong>
                    </div>
                  )}
                  {vendor?.registeredDomain && (
                    <div className="flex justify-between gap-3">
                      <span className="text-white/30">Registered domain</span>
                      <strong className="text-right text-white/70">{vendor.registeredDomain}</strong>
                    </div>
                  )}
                </div>

                {/* Risk score with hold-threshold marker */}
                <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white/55">Composite risk score</span>
                    <span className="font-mono tabular-nums text-white">{(detail.riskScore ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        (detail.riskScore ?? 0) >= 0.4 ? 'bg-red-600' : 'bg-emerald-500',
                      )}
                      style={{ width: `${riskPct}%` }}
                    />
                    {/* 0.40 hold threshold tick */}
                    <span className="absolute inset-y-0 left-[40%] w-0.5 bg-white/25" title="Hold threshold 0.40" />
                  </div>
                  <span className="text-[10px] font-medium text-white/30">
                    Hold threshold 0.40 · {(detail.riskScore ?? 0) >= 0.4 ? 'above' : 'below'} the line
                  </span>
                </div>

                {/* Fired signals */}
                <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white/85">
                    <Radar className="h-3.5 w-3.5 text-white/40" strokeWidth={ICON_STROKE} />
                    Fired signals ({firedSignals.length}/{signals.length})
                  </span>
                  {firedSignals.length === 0 ? (
                    <p className="text-xs leading-relaxed text-white/35">
                      No deterministic signals fired - every check passed cleanly.
                    </p>
                  ) : (
                    firedSignals.map((s) => (
                      <div key={s.name} className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-red-300">{s.name}</span>
                          <span className="font-mono text-[11px] font-bold tabular-nums text-red-300">
                            {s.score.toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] leading-relaxed text-red-300/60">{s.evidence}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Agent narrative + evidence pack */}
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B0B0E] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div>
                  <h3 className="text-sm font-bold text-white">Agent review</h3>
                  <p className="text-xs font-medium text-white/35">BEC analyst &amp; arbitration output</p>
                </div>

                {detail.narrative ? (
                  <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white/85">
                      <Bot className="h-3.5 w-3.5 text-white/40" strokeWidth={ICON_STROKE} />
                      Narrative
                    </span>
                    <p className="text-xs leading-relaxed text-white/55">{detail.narrative}</p>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-white/35">
                    No agent narrative was recorded for this case - it cleared on deterministic signals alone.
                  </p>
                )}

                {(detail as { fraudType?: string | null }).fraudType && (
                  <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3 text-xs text-amber-200">
                    <span className="font-bold">Ground truth:</span> {(detail as { fraudType: string }).fraudType}
                  </div>
                )}

                {vendor?.legalName && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/55">
                    <span className="font-bold text-white/85">Grounded against master:</span>{' '}
                    {vendor.legalName}
                    {vendor.vendorId && <span className="font-mono text-white/30"> · {vendor.vendorId}</span>}
                  </div>
                )}

                {/* Decision history */}
                {detail.decisions.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white/85">
                      <History className="h-3.5 w-3.5 text-white/40" strokeWidth={ICON_STROKE} />
                      Decision history
                    </span>
                    {detail.decisions.map((d) => (
                      <div key={d.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <strong
                            className={cn(
                              'font-mono text-[10px] font-bold uppercase tracking-wider',
                              d.decision === 'release' ? 'text-emerald-300' : d.decision === 'hold' ? 'text-red-300' : 'text-amber-300',
                            )}
                          >
                            {d.decision}
                          </strong>
                          <span className="font-mono text-[10px] text-white/30">{d.timestamp}</span>
                        </div>
                        <p className="mt-1 text-white/45">
                          by {d.approver}
                          {d.reason ? ` · ${d.reason}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                  <Button
                    onClick={downloadEvidencePack}
                    className="w-full cursor-pointer gap-2 rounded-full bg-white text-xs font-bold text-black transition-all hover:bg-white/85 active:scale-[0.98]"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    Download evidence pack
                  </Button>
                  <span className="text-center text-[10px] text-white/30">
                    Printable report with facts, signals, transcript and audit trail
                  </span>
                </div>
              </div>

              {/* Column 3: Verification call */}
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B0B0E] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div>
                  <h3 className="text-sm font-bold text-white">Verification call</h3>
                  <p className="text-xs font-medium text-white/35">Out-of-band voice verification</p>
                </div>

                {detail.callTranscript ? (
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/45">
                      <PhoneCall className="h-3 w-3" strokeWidth={ICON_STROKE} />
                      Transcript recorded
                    </div>
                    <div
                      className={cn(
                        'whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-[11px] leading-relaxed text-white/85',
                        !showFullTranscript && 'max-h-56 overflow-hidden',
                      )}
                    >
                      {showFullTranscript || detail.callTranscript.length <= 480
                        ? detail.callTranscript
                        : `${detail.callTranscript.slice(0, 480)}…`}
                    </div>
                    {detail.callTranscript.length > 480 && (
                      <button
                        type="button"
                        onClick={() => setShowFullTranscript((v) => !v)}
                        className="cursor-pointer self-start text-[11px] font-semibold text-sky-300 transition-colors hover:text-sky-200"
                      >
                        {showFullTranscript ? 'Show less' : 'Show full transcript'}
                      </button>
                    )}
                    <div
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 text-xs font-semibold',
                        detail.verificationResult === 'denied'
                          ? 'border-red-400/25 bg-red-400/10 text-red-300'
                          : detail.verificationResult === 'confirmed'
                            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                            : 'border-amber-400/25 bg-amber-400/10 text-amber-300',
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                        Vendor response
                      </span>
                      <span className="font-mono text-[11px] font-bold uppercase">
                        {detail.verificationResult}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/30">
                      <PhoneCall className="h-5 w-5" strokeWidth={ICON_STROKE} />
                    </span>
                    <p className="text-xs leading-relaxed text-white/35">
                      No verification call was placed - this case never crossed the hold threshold, so
                      payment verification wasn&apos;t required.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Disposition footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#0B0B0E] px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/45">
            <Info className="h-4 w-4" strokeWidth={ICON_STROKE} />
            <span>
              {detail?.decision
                ? `Decided: ${detail.decision.toUpperCase()} by ${detail.approver ?? 'controller'}`
                : 'Requires a controller disposition to clear the queue.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onDecision('escalate')}
              disabled={decide.isPending}
              className="cursor-pointer rounded-full border-amber-400/40 px-5 py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-400/10"
            >
              Escalate
            </Button>
            <Button
              variant="outline"
              onClick={() => onDecision('hold')}
              disabled={decide.isPending}
              className="cursor-pointer rounded-full border-red-400/40 px-5 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-400/10"
            >
              Hold
            </Button>
            <Button
              onClick={() => onDecision('release')}
              disabled={decide.isPending}
              className="cursor-pointer gap-1.5 rounded-full bg-[#00668c] px-6 py-2 text-xs font-bold text-white transition-all hover:bg-[#005577] active:scale-[0.98]"
            >
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Release payment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

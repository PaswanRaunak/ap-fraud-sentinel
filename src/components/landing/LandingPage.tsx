'use client';

// Sentinel Payments - public corporate portal.
// Dark "Ethereal Glass" identity: OLED base, red/emerald mesh orbs, film grain,
// glass double-bezel cards, Geist typography. The ops console (light) is a
// separate internal surface - this page is the marketing/public face.

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  LogOut,
  Radar,
  Network,
  Bot,
  PhoneCall,
  Gavel,
  FileText,
  Check,
  ChevronDown,
  Activity,
  AlertTriangle,
  Zap,
  TrendingUp,
  Layers,
  Lock,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { useAppStore, formatCurrency } from '@/lib/store';
import { useStats } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Standardized icon stroke for this surface - light, precise lines.
const ICON_STROKE = 1.5;

const EASE = [0.32, 0.72, 0, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: EASE },
};

/** Section heading block - eyebrow tag + display heading + lede, left-aligned. */
function SectionHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
}) {
  return (
    <motion.div {...fadeUp} className="max-w-3xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-semibold tracking-tighter text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-white/50 sm:text-base">
          {lede}
        </p>
      )}
    </motion.div>
  );
}

/** Double-bezel glass card - outer shell + inner core with concentric radii. */
function GlassCard({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-[calc(2rem-0.375rem)] border border-white/[0.06] bg-[#0B0B0E] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]',
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);
  const setView = useAppStore((s) => s.setView);
  const { data: stats } = useStats();
  const { toast } = useToast();

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeSandboxScenario, setActiveSandboxScenario] = useState<'bec' | 'amount' | 'clean'>('bec');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [monthlyInvoices, setMonthlyInvoices] = useState(2500);
  const [avgInvoiceAmount, setAvgInvoiceAmount] = useState(12000);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please provide a valid corporate email address.',
        variant: 'destructive',
      });
      return;
    }
    setContactSubmitted(true);
    toast({
      title: 'Inquiry Received',
      description: 'A Sentinel Payments security specialist will contact you within 24 hours.',
    });
  };

  const annualDisbursements = monthlyInvoices * avgInvoiceAmount * 12;
  const estimatedFraudPrevented = Math.round(annualDisbursements * 0.0045);
  const manualAuditHoursSaved = Math.round((monthlyInvoices * 12 * 4.5) / 60);

  const enterConsole = () => {
    if (isAuthenticated) setView('dashboard');
    else openAuthModal('login');
  };

  const navLinks = [
    { href: '#what-we-do', label: 'Platform' },
    { href: '#sandbox', label: 'Sandbox' },
    { href: '#how-it-works', label: 'Pipeline' },
    { href: '#security', label: 'Signals' },
    { href: '#contact', label: 'Contact' },
  ];

  const stagesData = [
    {
      no: '01',
      title: 'Intake & Classification',
      icon: FileText,
      desc: 'Inbound PDF invoices and EML emails enter through secure REST webhooks. Payload tags are stripped, MIME structure parsed, and the document kind classified before anything touches the risk engine.',
    },
    {
      no: '02',
      title: 'OCR Fact Extraction',
      icon: Layers,
      desc: 'Vendor, dates, amounts and remit bank account are pulled from the document with pdfplumber and Tesseract OCR, then normalized to a USD baseline so downstream signals compare like-for-like.',
    },
    {
      no: '03',
      title: 'Vendor Master Grounding',
      icon: Network,
      desc: 'Facts are cross-referenced against the 60-record vendor master and 480-row historical payment ledger to compute a live statistical baseline (mean, standard deviation) per vendor.',
    },
    {
      no: '04',
      title: '6-Rule Risk Signal Engine',
      icon: Radar,
      desc: 'Six deterministic detectors run in parallel - Levenshtein domain lookalikes, 3-sigma z-scores, bank-change timing windows, duplicate SQL matching, first-time vendor gating and SAR threshold skirting.',
    },
    {
      no: '05',
      title: 'Tri-Agent Swarm Reasoning',
      icon: Bot,
      desc: 'A 3-agent swarm (BEC Analyst, Vendor Verifier, Case Builder) supervised by a Manager Arbitrator synthesizes the fired signals into an evidence pack and a recommendation. Ties break to hold.',
    },
    {
      no: '06',
      title: 'Out-of-Band Voice Verification',
      icon: PhoneCall,
      desc: 'For held bank-change cases, an automated call is placed to the vendor phone number registered on file - never a number from the suspicious email - with speech-to-text and intent classification.',
    },
    {
      no: '07',
      title: 'Controller Decision Gate',
      icon: Gavel,
      desc: 'Clean invoices auto-release with zero human latency. Everything suspicious lands in the Controller Audit Queue with the full evidence pack, call transcript and decision trail attached.',
    },
  ];

  const signalMatrix = [
    {
      weight: '30%',
      name: 'Domain Lookalike',
      desc: 'Levenshtein distance catches character spoofing - acme-industria1.com against the registered acmeindustrial.com.',
      accent: 'text-red-300',
      badge: 'bg-red-950/60 text-red-300',
    },
    {
      weight: '20%',
      name: 'Amount Anomaly',
      desc: '3-sigma z-score thresholding against the vendor historical payment ledger.',
      accent: 'text-amber-300',
      badge: 'bg-amber-950/60 text-amber-300',
    },
    {
      weight: '20%',
      name: 'Timing Window',
      desc: 'Flags bank-change requests arriving 3 days or fewer before the invoice due date.',
      accent: 'text-amber-300',
      badge: 'bg-amber-950/60 text-amber-300',
    },
    {
      weight: '15%',
      name: 'Duplicate Invoice',
      desc: 'SQL cross-match on payment history stops double disbursement and resubmitted invoices.',
      accent: 'text-sky-300',
      badge: 'bg-sky-950/60 text-sky-300',
    },
    {
      weight: '10%',
      name: 'First-Time Vendor',
      desc: 'Unregistered vendors are gated behind mandatory verification before any payment.',
      accent: 'text-violet-300',
      badge: 'bg-violet-950/60 text-violet-300',
    },
    {
      weight: '5%',
      name: 'SAR Threshold Skirting',
      desc: 'Structuring detection for amounts priced between $9,500 and $9,999 - just under the report line.',
      accent: 'text-emerald-300',
      badge: 'bg-emerald-950/60 text-emerald-300',
    },
  ];

  const faqs = [
    {
      q: 'How does Sentinel detect Business Email Compromise attacks?',
      a: 'Sentinel combines Levenshtein domain-lookalike detection (catching character spoofing like acme-industria1.com) with header provenance checks, bank-change timing analysis and the tri-agent LLM swarm - intercepting wire redirection before disbursement.',
    },
    {
      q: 'Does it slow down legitimate invoice workflows?',
      a: 'No. Clean invoices matching verified master records and historical baselines evaluate in under a millisecond and auto-release. Only high-risk anomalies - typically under 5% of volume - route to hold and out-of-band verification.',
    },
    {
      q: 'How does out-of-band phone verification work?',
      a: 'When an unverified bank modification is detected, Sentinel places an automated call strictly to the supplier number registered in the vendor master record. It never dials a number taken from the suspicious email.',
    },
    {
      q: 'Which ERP systems does it integrate with?',
      a: 'SAP S/4HANA, NetSuite, Oracle Cloud ERP, Workday Financials, Microsoft Dynamics 365 and QuickBooks Enterprise - via secure REST webhooks and certified connectors.',
    },
  ];

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#050505] font-sans text-white antialiased selection:bg-[#C00018]/30 selection:text-white">
      {/* Ambient layer: mesh orbs + film grain */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
          style={{ background: 'radial-gradient(closest-side, #C00018, transparent)' }}
        />
        <div
          className="absolute right-[-180px] top-[38%] h-[480px] w-[480px] rounded-full opacity-[0.12] blur-[130px]"
          style={{ background: 'radial-gradient(closest-side, #34d399, transparent)' }}
        />
        <div
          className="absolute bottom-[-200px] left-[-160px] h-[520px] w-[520px] rounded-full opacity-[0.10] blur-[130px]"
          style={{ background: 'radial-gradient(closest-side, #C00018, transparent)' }}
        />
      </div>
      <div className="apf-grain" aria-hidden />

      {/* Floating glass pill nav */}
      <header className="fixed inset-x-0 top-0 z-50 mt-5 flex justify-center px-4">
        <div className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/60 py-2 pl-4 pr-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Logo */}
          <button
            type="button"
            onClick={() => setView('landing')}
            className="group flex cursor-pointer items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C00018] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
              <ShieldCheck className="h-4.5 w-4.5" strokeWidth={ICON_STROKE} />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Sentinel<span className="text-white/40"> Payments</span>
            </span>
          </button>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-xs font-medium text-white/60 transition-colors duration-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Button
                  onClick={() => setView('dashboard')}
                  className="h-9 rounded-full bg-white px-4 text-xs font-semibold text-black transition-all duration-300 hover:bg-white/85 active:scale-[0.98]"
                >
                  Console
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast({ title: 'Signed Out', description: 'You have been logged out.' });
                  }}
                  title={`Log out (${user.name})`}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors duration-300 hover:text-white"
                >
                  <LogOut className="h-4 w-4" strokeWidth={ICON_STROKE} />
                </button>
              </>
            ) : (
              <Button
                onClick={() => openAuthModal('login')}
                className="h-9 rounded-full bg-white px-5 text-xs font-semibold text-black transition-all duration-300 hover:bg-white/85 active:scale-[0.98]"
              >
                Sign in
              </Button>
            )}

            {/* Mobile hamburger - morphs to X */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 lg:hidden"
              aria-label="Menu"
            >
              <span
                className={cn(
                  'absolute h-[1.5px] w-4 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  mobileMenuOpen ? 'rotate-45' : '-translate-y-[3.5px]',
                )}
              />
              <span
                className={cn(
                  'absolute h-[1.5px] w-4 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  mobileMenuOpen ? '-rotate-45' : 'translate-y-[3.5px]',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-black/85 px-8 backdrop-blur-3xl lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: EASE }}
                  className="border-b border-white/10 py-5 text-3xl font-semibold tracking-tight text-white/80 transition-colors hover:text-white"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full max-w-full">
        {/* ============ HERO - asymmetric split ============ */}
        <section id="home" className="relative flex min-h-[100dvh] items-center px-4 pb-20 pt-36 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-12">
            {/* Left: massive typography */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="inline-flex items-center gap-2 rounded-full border border-[#C00018]/30 bg-[#C00018]/10 px-3.5 py-1.5 text-[11px] font-medium text-red-200"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live interception - INV-2026-4410 · spoofed domain blocked
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
                className="mt-7 max-w-5xl text-[clamp(2.5rem,4.4vw,3.5rem)] font-semibold leading-[1.04] tracking-tighter text-white"
              >
                Out-of-band verification,
                <br />
                <span className="text-white/35">shipped as software.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
                className="mt-7 max-w-[60ch] text-base leading-relaxed text-white/50 sm:text-lg"
              >
                Sentinel Payments screens every inbound invoice and vendor email through a
                7-stage pipeline - six deterministic risk signals, a tri-agent AI swarm, and an
                automated verification call to the number on file - before a single dollar moves.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                {/* Primary CTA - button-in-button trailing icon */}
                <button
                  type="button"
                  onClick={enterConsole}
                  className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#C00018] py-2 pl-7 pr-2 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#A80015] active:scale-[0.98]"
                >
                  {isAuthenticated ? 'Enter the console' : 'Access the portal'}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={ICON_STROKE} />
                  </span>
                </button>
                <a
                  href="#sandbox"
                  className="inline-flex h-[52px] items-center rounded-full border border-white/15 px-7 text-sm font-medium text-white/70 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:text-white active:scale-[0.98]"
                >
                  Try the live sandbox
                </a>
              </motion.div>
            </div>

            {/* Right: floating live-threat glass card */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: EASE }}
              className="lg:col-span-5"
            >
              <div className="lg:rotate-[1.5deg] lg:hover:rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <GlassCard>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                      <Activity className="h-3.5 w-3.5 text-red-400" strokeWidth={ICON_STROKE} />
                      Live interception feed
                    </span>
                    <span className="rounded-full bg-[#C00018]/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-red-300">
                      BLOCKED
                    </span>
                  </div>

                  <div className="mt-5 space-y-3.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/35">Invoice</span>
                      <span className="text-white">INV-2026-4410</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/35">Sender domain</span>
                      <span className="text-red-300">acme-industria1.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/35">Amount</span>
                      <span className="text-white">{formatCurrency(48394.27, 'USD')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/35">Top signal</span>
                      <span className="text-amber-300">domain_lookalike · 1.00</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-xs leading-relaxed text-white/55">
                    &ldquo;Vendor confirmed by phone: no bank change was requested. Disbursement
                    frozen, case routed to controller queue.&rdquo;
                    <span className="mt-2 block font-mono text-[10px] text-white/30">
                      - Manager Agent, arbitration verdict
                    </span>
                  </div>

                  {/* Live stats strip */}
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-5 text-center">
                    <div>
                      <div className="font-mono text-lg font-semibold tabular-nums text-white">
                        {stats?.casesScreened ?? 141}
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Screened</div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-semibold tabular-nums text-[#4ade80]">
                        {stats?.fraudCaught ?? 1}
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Caught</div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-semibold tabular-nums text-white">
                        {formatCurrency(stats?.amountSavedUsd ?? 48394.27, 'USD')}
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Protected</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============ ERP MARQUEE ============ */}
        <section className="border-y border-white/[0.06] py-10">
          <div className="relative overflow-hidden">
            <div className="apf-marquee-track flex w-max items-center gap-16 whitespace-nowrap">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center gap-16" aria-hidden={copy === 1}>
                  {['SAP S/4HANA', 'Oracle Cloud ERP', 'NetSuite', 'Workday', 'Microsoft Dynamics', 'QuickBooks Enterprise'].map((erp) => (
                    <span
                      key={`${copy}-${erp}`}
                      className="font-mono text-sm uppercase tracking-[0.25em] text-white/25 transition-colors duration-500 hover:text-white/60"
                    >
                      {erp}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent" />
          </div>
        </section>

        {/* ============ PLATFORM - asymmetric bento ============ */}
        <section id="what-we-do" className="px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHead
              eyebrow="Platform"
              title={<>Four layers of defense between the invoice and the wire.</>}
              lede="Every payment passes statistical grounding, six deterministic signals, agent reasoning and a human gate - clean invoices in under a millisecond, suspicious ones never leave the building."
            />

            <motion.div
              {...fadeUp}
              className="mt-16 grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-12"
            >
              <GlassCard className="md:col-span-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C00018]/15 text-red-400">
                  <AlertTriangle className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">BEC &amp; phishing defense</h3>
                <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-white/45">
                  Supplier invoices and emails are screened autonomously. Lookalike domains and
                  urgency coercion are flagged before disbursement - not after the wire clears.
                </p>
                <div className="mt-6 flex items-center gap-2 font-mono text-[11px]">
                  <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-red-300 line-through decoration-red-400/60">
                    acme-industria1.com
                  </span>
                  <span className="text-white/25">vs</span>
                  <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-emerald-300">
                    acmeindustrial.com
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="md:col-span-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <PhoneCall className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">Out-of-band telephony</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  Automated calls to the supplier number on file - never the attacker&apos;s -
                  with speech-to-text verification of every bank change.
                </p>
              </GlassCard>

              <GlassCard className="md:col-span-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Network className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">Master vendor grounding</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  60+ verified records and 480+ historical payments set the 3-sigma statistical
                  baseline every amount is judged against.
                </p>
              </GlassCard>

              <GlassCard className="md:col-span-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                  <Zap className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">Under a millisecond, zero friction</h3>
                <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-white/45">
                  Routine invoices clear all six statistical checks without a human in the loop.
                  Only genuine anomalies interrupt anyone.
                </p>
                <div className="mt-6 inline-flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold tabular-nums tracking-tighter">0.8ms</span>
                  <span className="text-xs text-white/35">median clean-invoice evaluation</span>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* ============ LIVE SANDBOX ============ */}
        <section id="sandbox" className="border-t border-white/[0.06] px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHead
              eyebrow="Live sandbox"
              title="Run a real attack scenario."
              lede="Pick a case and watch the six-rule engine and tri-agent swarm analyze, verify and resolve it - the same pipeline that screens production invoices."
            />

            <motion.div {...fadeUp} className="mt-12 flex flex-wrap gap-2.5">
              {(
                [
                  { key: 'bec', label: 'Spoofed BEC domain', amount: '$48,394.27', icon: AlertTriangle, tone: 'text-red-300' },
                  { key: 'amount', label: '3-sigma amount spike', amount: '$98,500.00', icon: TrendingUp, tone: 'text-amber-300' },
                  { key: 'clean', label: 'Verified clean invoice', amount: '$3,450.00', icon: CheckCircle2, tone: 'text-emerald-300' },
                ] as const
              ).map((s) => {
                const Icon = s.icon;
                const active = activeSandboxScenario === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveSandboxScenario(s.key)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-full border px-5 py-2.5 text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
                      active
                        ? 'border-white/25 bg-white text-black'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white',
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', active ? 'text-black/70' : s.tone)} strokeWidth={ICON_STROKE} />
                    <span>{s.label}</span>
                    <span className={cn('font-mono', active ? 'text-black/50' : 'text-white/30')}>{s.amount}</span>
                  </button>
                );
              })}
            </motion.div>

            <motion.div {...fadeUp} className="mt-8">
              <GlassCard innerClassName="p-6 sm:p-9">
                <AnimatePresence mode="wait">
                  {activeSandboxScenario === 'bec' && (
                    <SandboxPanel
                      key="bec"
                      vendor="Acme Industrial Supply"
                      facts={[
                        ['Invoice no', 'INV-2026-4410', 'text-white'],
                        ['Sender', 'billing@acme-industria1.com', 'text-red-300'],
                        ['Amount', formatCurrency(48394.27, 'USD'), 'text-red-300'],
                        ['Bank account', 'MODIFIED - rogue IBAN', 'text-amber-300'],
                      ]}
                      signals={[
                        { name: 'domain_lookalike', score: '1.00', note: 'Levenshtein distance 2 from registered acmeindustrial.com', fired: true },
                        { name: 'amount_anomaly', score: '1.00', note: 'Z-score 42.1 - amount is far outside the vendor baseline', fired: true },
                      ]}
                      verdictTone="HOLD"
                      verdictLabel="RECOMMENDATION: HOLD"
                      verdict={
                        'Definite BEC impersonation. Character-substituted domain, bank change requested one day before due date. Out-of-band call confirmed the vendor never requested it. Disbursement frozen.'
                      }
                    />
                  )}
                  {activeSandboxScenario === 'amount' && (
                    <SandboxPanel
                      key="amount"
                      vendor="Vertex Technology Partners"
                      facts={[
                        ['Invoice no', 'INV-2026-8821', 'text-white'],
                        ['Sender', 'finance@vertextech.com', 'text-emerald-300'],
                        ['Amount', formatCurrency(98500.0, 'USD'), 'text-amber-300'],
                        ['Historical avg', formatCurrency(4200.0, 'USD'), 'text-white/60'],
                      ]}
                      signals={[
                        { name: 'amount_anomaly', score: '0.95', note: '3-sigma violation - amount is 23x the historical baseline', fired: true },
                        { name: 'domain_lookalike', score: '0.00', note: 'Sender domain matches the master record', fired: false },
                      ]}
                      verdictTone="AUDIT HOLD"
                      verdictLabel="RECOMMENDATION: AUDIT HOLD"
                      verdict={
                        'Valid sender domain, but the size violates the 3-sigma statistical threshold. Routed to the controller review queue with a secondary-signature requirement.'
                      }
                    />
                  )}
                  {activeSandboxScenario === 'clean' && (
                    <SandboxPanel
                      key="clean"
                      vendor="Pacific Cloud Logistics"
                      facts={[
                        ['Invoice no', 'INV-2026-1044', 'text-white'],
                        ['Sender', 'billing@pacificcloud.com', 'text-emerald-300'],
                        ['Amount', formatCurrency(3450.0, 'USD'), 'text-emerald-300'],
                        ['Status', 'VERIFIED CLEAN', 'text-emerald-300'],
                      ]}
                      signals={[
                        { name: 'composite risk', score: '0.00', note: 'All six statistical checks passed cleanly', fired: false },
                        { name: 'processing time', score: '0.8ms', note: 'Grounded and released with zero human latency', fired: false },
                      ]}
                      verdictTone="AUTO-RELEASE"
                      verdictLabel="RECOMMENDATION: AUTO-RELEASE"
                      verdict={
                        'Facts fully grounded in the master ledger, zero signals fired. Dispatched directly to the ERP payment batch scheduler.'
                      }
                    />
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* ============ ROI CALCULATOR ============ */}
        <section id="roi-calculator" className="border-t border-white/[0.06] px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHead
              eyebrow="Exposure model"
              title="What does fraud cost you today?"
              lede="Move the sliders to your actual volume. The model uses the industry-average 0.45% AP fraud rate against your annual disbursements."
            />

            <div className="mt-14 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
              <motion.div {...fadeUp}>
                <GlassCard innerClassName="p-8 sm:p-10 h-full">
                  <div className="space-y-9">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <label htmlFor="roi-invoices" className="text-sm font-medium text-white/70">
                          Monthly inbound invoices
                        </label>
                        <span className="font-mono text-sm tabular-nums text-white">
                          {monthlyInvoices.toLocaleString()}
                        </span>
                      </div>
                      <input
                        id="roi-invoices"
                        type="range"
                        min="200"
                        max="20000"
                        step="200"
                        value={monthlyInvoices}
                        onChange={(e) => setMonthlyInvoices(Number(e.target.value))}
                        className="apf-range mt-4 w-full cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <label htmlFor="roi-avg" className="text-sm font-medium text-white/70">
                          Average invoice value
                        </label>
                        <span className="font-mono text-sm tabular-nums text-white">
                          {formatCurrency(avgInvoiceAmount, 'USD')}
                        </span>
                      </div>
                      <input
                        id="roi-avg"
                        type="range"
                        min="1000"
                        max="50000"
                        step="500"
                        value={avgInvoiceAmount}
                        onChange={(e) => setAvgInvoiceAmount(Number(e.target.value))}
                        className="apf-range mt-4 w-full cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2.5 border-t border-white/[0.06] pt-6 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/35">Annual disbursements</span>
                        <span className="tabular-nums text-white">{formatCurrency(annualDisbursements, 'USD')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/35">Industry baseline fraud rate</span>
                        <span className="tabular-nums text-white">0.45%</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="flex"
              >
                <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-[#C00018]/25 bg-gradient-to-br from-[#C00018]/[0.12] to-transparent p-8 sm:p-10">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-200/70">
                      Estimated annual value
                    </span>
                    <div className="mt-3 font-mono text-5xl font-semibold tabular-nums tracking-tighter text-white sm:text-6xl">
                      {formatCurrency(estimatedFraudPrevented, 'USD')}
                    </div>
                    <p className="mt-2 text-sm text-white/45">
                      in fraudulent disbursements intercepted per year
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <span className="block text-[11px] text-white/35">Audit hours saved</span>
                      <strong className="font-mono text-sm tabular-nums text-white">
                        {manualAuditHoursSaved.toLocaleString()} hrs / yr
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[11px] text-white/35">False-alarm friction</span>
                      <strong className="font-mono text-sm tabular-nums text-emerald-300">0.00%</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) setView('dashboard');
                      else openAuthModal('register');
                    }}
                    className="group mt-9 inline-flex cursor-pointer items-center gap-3 self-start rounded-full bg-white py-2 pl-6 pr-2 text-sm font-semibold text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    Protect your AP pipeline
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                      <ArrowRight className="h-4 w-4" strokeWidth={ICON_STROKE} />
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS - 7-stage pipeline ============ */}
        <section id="how-it-works" className="border-t border-white/[0.06] px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHead
              eyebrow="Pipeline"
              title="Seven stages between intake and authorization."
              lede="Every invoice flows through a modular directed acyclic graph. Select a stage to see what happens inside it."
            />

            <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Stage rail */}
              <motion.div {...fadeUp} className="lg:col-span-5">
                <div className="flex flex-col gap-1.5 lg:sticky lg:top-28">
                  {stagesData.map((st, i) => {
                    const Icon = st.icon;
                    const active = activeStageIndex === i;
                    return (
                      <button
                        key={st.no}
                        type="button"
                        onClick={() => setActiveStageIndex(i)}
                        className={cn(
                          'group flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]',
                          active
                            ? 'border-white/15 bg-white/[0.06]'
                            : 'border-transparent hover:bg-white/[0.03]',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] transition-colors duration-500',
                            active
                              ? 'border-[#C00018] bg-[#C00018] text-white'
                              : 'border-white/10 text-white/40 group-hover:text-white/70',
                          )}
                        >
                          {active ? <Icon className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} /> : st.no}
                        </span>
                        <span
                          className={cn(
                            'text-sm font-medium transition-colors duration-300',
                            active ? 'text-white' : 'text-white/50 group-hover:text-white/80',
                          )}
                        >
                          {st.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            'ml-auto h-3.5 w-3.5 -rotate-90 transition-all duration-500',
                            active ? 'text-white' : 'text-white/20',
                          )}
                          strokeWidth={ICON_STROKE}
                        />
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Detail card */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="lg:col-span-7">
                <GlassCard innerClassName="p-8 sm:p-10 lg:sticky lg:top-28">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStageIndex}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
                        <div className="flex items-center gap-4">
                          {React.createElement(stagesData[activeStageIndex].icon, {
                            className: 'h-6 w-6 text-red-400',
                            strokeWidth: ICON_STROKE,
                          })}
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                              Stage {stagesData[activeStageIndex].no}
                            </span>
                            <h3 className="text-xl font-semibold tracking-tight">
                              {stagesData[activeStageIndex].title}
                            </h3>
                          </div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-white/50">
                          AUTOMATED
                        </span>
                      </div>

                      <p className="mt-7 text-sm leading-relaxed text-white/55 sm:text-base">
                        {stagesData[activeStageIndex].desc}
                      </p>

                      <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
                        <span className="text-xs text-white/35">Screen a live batch yourself</span>
                        <button
                          type="button"
                          onClick={enterConsole}
                          className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-white transition-colors hover:text-red-300 active:scale-[0.98]"
                        >
                          Launch live audit
                          <ArrowRight
                            className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
                            strokeWidth={ICON_STROKE}
                          />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ SIGNAL MATRIX - weighted asymmetric grid ============ */}
        <section id="security" className="border-t border-white/[0.06] px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHead
              eyebrow="Risk intelligence"
              title="Six signals. One frozen score."
              lede="Deterministic, weighted scoring across six independent threat vectors produces a composite risk from 0.00 to 1.00. Holds trigger at 0.40 - the threshold is frozen, never tuned after the fact."
            />

            <motion.div
              {...fadeUp}
              className="mt-16 grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-12"
            >
              {signalMatrix.map((sig, i) => (
                <GlassCard
                  key={sig.name}
                  className={cn(
                    ['md:col-span-5', 'md:col-span-4', 'md:col-span-3', 'md:col-span-3', 'md:col-span-4', 'md:col-span-5'][i],
                  )}
                  innerClassName="p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold', sig.badge)}>
                      {sig.weight} weight
                    </span>
                    <span className="font-mono text-2xl font-semibold tabular-nums tracking-tighter text-white/15">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight text-white">{sig.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">{sig.desc}</p>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="border-t border-white/[0.06] px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionHead eyebrow="FAQ" title="Questions, answered." />
              </div>
              <motion.div {...fadeUp} className="lg:col-span-7">
                <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {faqs.map((faq, index) => {
                    const open = openFaqIndex === index;
                    return (
                      <div key={faq.q}>
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(open ? null : index)}
                          className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left transition-colors duration-300 hover:text-white"
                        >
                          <span className={cn('text-sm font-medium sm:text-base', open ? 'text-white' : 'text-white/70')}>
                            {faq.q}
                          </span>
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                              open ? 'rotate-180 border-white/25 text-white' : 'border-white/10 text-white/40',
                            )}
                          >
                            <ChevronDown className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <p className="max-w-[65ch] pb-7 text-sm leading-relaxed text-white/45">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="border-t border-white/[0.06] px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionHead
                  eyebrow="Contact"
                  title="Talk to the payment security team."
                  lede="Tell us about your invoice volume and current verification workflow. A specialist responds within 24 hours."
                />
                <motion.div {...fadeUp} className="mt-10 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                      <Lock className="h-4 w-4" strokeWidth={ICON_STROKE} />
                    </span>
                    SOC 2 aligned controls, encrypted at rest and in transit
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                      <Mail className="h-4 w-4" strokeWidth={ICON_STROKE} />
                    </span>
                    security@sentinelpayments.example
                  </div>
                </motion.div>
              </div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="lg:col-span-7">
                <GlassCard innerClassName="p-8 sm:p-10">
                  {contactSubmitted ? (
                    <div className="flex flex-col items-center py-14 text-center">
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"
                      >
                        <Check className="h-7 w-7" strokeWidth={ICON_STROKE} />
                      </motion.span>
                      <h3 className="mt-6 text-xl font-semibold tracking-tight">Message received</h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">
                        A Sentinel Payments specialist will contact you at{' '}
                        <strong className="text-white/80">{contactEmail}</strong> within one business day.
                      </p>
                      <button
                        type="button"
                        onClick={() => setContactSubmitted(false)}
                        className="mt-7 cursor-pointer text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="contact-name" className="text-xs font-medium text-white/60">
                            Full name
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            placeholder="Dana Whitfield"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            required
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/25 transition-colors duration-300 focus:border-[#C00018]/60 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="contact-email" className="text-xs font-medium text-white/60">
                            Corporate email
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            placeholder="dana@meridianlogistics.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            required
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/25 transition-colors duration-300 focus:border-[#C00018]/60 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact-company" className="text-xs font-medium text-white/60">
                          Company
                        </label>
                        <input
                          id="contact-company"
                          type="text"
                          placeholder="Meridian Logistics Group"
                          value={contactCompany}
                          onChange={(e) => setContactCompany(e.target.value)}
                          required
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/25 transition-colors duration-300 focus:border-[#C00018]/60 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact-message" className="text-xs font-medium text-white/60">
                          Inquiry details
                        </label>
                        <textarea
                          id="contact-message"
                          rows={4}
                          placeholder="Invoice volume, ERP system, current bank-change verification process..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          required
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white placeholder:text-white/25 transition-colors duration-300 focus:border-[#C00018]/60 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="group inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#C00018] py-2 pl-7 pr-2 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#A80015] active:scale-[0.99] sm:w-auto"
                      >
                        Submit inquiry
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={ICON_STROKE} />
                        </span>
                      </button>
                    </form>
                  )}
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t border-white/[0.06] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C00018] text-white">
                  <ShieldCheck className="h-4.5 w-4.5" strokeWidth={ICON_STROKE} />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight text-white">Sentinel Payments</div>
                  <div className="text-xs text-white/35">AP fraud sentinel · RocketRide pipeline</div>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-white/45">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="transition-colors duration-300 hover:text-white">
                    {l.label}
                  </a>
                ))}
                <a href="#roi-calculator" className="transition-colors duration-300 hover:text-white">
                  ROI model
                </a>
                <Link href="/privacy" className="transition-colors duration-300 hover:text-white">
                  Privacy
                </Link>
                <Link href="/terms" className="transition-colors duration-300 hover:text-white">
                  Terms
                </Link>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="cursor-pointer font-semibold text-white/80 transition-colors duration-300 hover:text-white"
                  >
                    Sign in
                  </button>
                )}
              </nav>
            </div>

            <div className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-white/30">
              &copy; {new Date().getFullYear()} Sentinel Payments. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/** Sandbox scenario panel - facts rail + fired signals + verdict terminal. */
function SandboxPanel({
  vendor,
  facts,
  signals,
  verdictLabel,
  verdictTone,
  verdict,
}: {
  vendor: string;
  facts: [string, string, string][];
  signals: { name: string; score: string; note: string; fired: boolean }[];
  verdictLabel: string;
  verdictTone: string;
  verdict: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-12"
    >
      {/* Facts rail */}
      <div className="lg:col-span-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Inbound invoice facts</span>
        <h4 className="mt-2 text-lg font-semibold tracking-tight text-white">{vendor}</h4>
        <div className="mt-5 space-y-3 font-mono text-xs">
          {facts.map(([k, v, tone]) => (
            <div key={k} className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-2.5">
              <span className="text-white/35">{k}</span>
              <strong className={cn('text-right', tone)}>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Signals + verdict */}
      <div className="space-y-4 lg:col-span-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            Fired signals
          </span>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {signals.map((s) => (
              <div
                key={s.name}
                className={cn(
                  'rounded-2xl border p-4',
                  s.fired
                    ? 'border-[#C00018]/30 bg-[#C00018]/[0.08]'
                    : 'border-emerald-400/20 bg-emerald-400/[0.05]',
                )}
              >
                <span className={cn('font-mono text-xs font-semibold', s.fired ? 'text-red-300' : 'text-emerald-300')}>
                  {s.name}: {s.score}
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-white/45">{s.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-5 font-mono text-xs">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              <Bot className="h-3.5 w-3.5" strokeWidth={1.5} />
              Manager agent verdict
            </span>
            <span
              className={cn(
                'rounded-full px-3 py-0.5 text-[10px] font-bold',
                verdictTone === 'AUTO-RELEASE'
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : verdictTone === 'AUDIT HOLD'
                    ? 'bg-amber-400/15 text-amber-300'
                    : 'bg-[#C00018]/20 text-red-300',
              )}
            >
              {verdictLabel}
            </span>
          </div>
          <p className="mt-3 leading-relaxed text-white/55">&ldquo;{verdict}&rdquo;</p>
        </div>
      </div>
    </motion.div>
  );
}

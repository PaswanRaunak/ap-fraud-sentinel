'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Play,
  Lock,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut,
  User,
  Radar,
  Network,
  Bot,
  PhoneCall,
  Gavel,
  FileText,
  Volume2,
  Check,
  Sliders,
  DollarSign,
  Clock,
  HelpCircle,
  ChevronDown,
  Activity,
  AlertTriangle,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { useAppStore, formatCurrency } from '@/lib/store';
import { useStats } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);
  const setView = useAppStore((s) => s.setView);
  const { data: stats } = useStats();
  const { toast } = useToast();

  // Navigation / Stepper states
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeSandboxScenario, setActiveSandboxScenario] = useState<'bec' | 'amount' | 'clean'>('bec');

  // ROI Calculator states
  const [monthlyInvoices, setMonthlyInvoices] = useState(2500);
  const [avgInvoiceAmount, setAvgInvoiceAmount] = useState(12000);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact form state
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

  // ROI Calculations
  const annualDisbursements = monthlyInvoices * avgInvoiceAmount * 12;
  const estimatedFraudPrevented = Math.round(annualDisbursements * 0.0045); // industry avg 0.45% AP fraud rate
  const manualAuditHoursSaved = Math.round((monthlyInvoices * 12 * 4.5) / 60); // 4.5 mins saved per invoice

  const stagesData = [
    {
      no: '01',
      title: 'Intake & Classification',
      icon: FileText,
      desc: 'Ingests inbound PDF invoices and EML email attachments via secure REST webhooks, strips payload tags, extracts MIME structure, and classifies document kind using lightweight heuristics.',
    },
    {
      no: '02',
      title: 'OCR Fact Extraction',
      icon: Layers,
      desc: 'Extracts structured invoice facts (vendor, invoice date, due date, amount, remit bank account) using pdfplumber and Tesseract OCR, normalizing all figures to USD baseline.',
    },
    {
      no: '03',
      title: 'Vendor Master Grounding',
      icon: Network,
      desc: 'Cross-references invoice facts against the 60-vendor Master Record and historical payment ledger (480 historical payments) to compute dynamic baseline statistics (μ, σ).',
    },
    {
      no: '04',
      title: '6-Rule Risk Signal Engine',
      icon: Radar,
      desc: 'Executes 6 deterministic detection algorithms in parallel (Levenshtein lookalikes, 3-sigma Z-scores, timing windows, duplicate SQL matching, SAR threshold skirting).',
    },
    {
      no: '05',
      title: 'Tri-Agent Swarm Reasoning',
      icon: Bot,
      desc: 'Coordinates an autonomous 3-agent swarm (BEC Analyst, Vendor Verifier, Case Builder) supervised by a Manager Arbitrator to synthesize evidence and recommend action.',
    },
    {
      no: '06',
      title: 'Out-of-Band Voice Verification',
      icon: PhoneCall,
      desc: 'Places an automated phone call via Bland AI to the verified vendor phone number on file with Whisper speech-to-text transcription and intent classification.',
    },
    {
      no: '07',
      title: 'Controller Decision Gate',
      icon: Gavel,
      desc: 'Auto-releases verified clean invoices while isolating suspicious or bank change holds in the Controller Audit Queue with complete cryptographic traceability.',
    },
  ];

  const faqs = [
    {
      q: 'How does Sentinel Payments detect Business Email Compromise (BEC) attacks?',
      a: 'Sentinel combines Levenshtein distance domain lookalike algorithms (detecting character spoofing like acme-industria1.com) with header provenance checks, bank alteration timing analysis, and our tri-agent LLM swarm to intercept wire redirection before disbursements occur.',
    },
    {
      q: 'Does Sentinel slow down legitimate Accounts Payable invoice workflows?',
      a: 'No. Clean invoices matching verified master vendor records and historical amount baselines evaluate in under 1 millisecond and are auto-released without human intervention. Only high-risk anomaly cases (typically <5% of volume) are routed for hold and out-of-band verification.',
    },
    {
      q: 'How does Out-of-Band Phone Call verification work?',
      a: 'When an unverified bank modification is detected, Sentinel autonomously places a voice call via Bland AI strictly to the pre-registered verified supplier phone number on file in the vendor master record—never using phone numbers extracted from the suspicious email.',
    },
    {
      q: 'Which ERP systems does Sentinel Payments integrate with?',
      a: 'Sentinel integrates with SAP S/4HANA, NetSuite, Oracle Cloud ERP, Workday Financials, Microsoft Dynamics 365, and QuickBooks Enterprise via secure REST webhooks and certified connectors.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1B1B1F] font-sans antialiased selection:bg-[#FFDAD6] selection:text-[#410002]">
      {/* 1. MATERIAL 3 TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E5E8] shadow-xs">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo matching reference screenshot with Material 3 branding */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('landing')}
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C00018] text-white shadow-sm transition-transform group-hover:scale-105">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="6" cy="6" r="3" fill="currentColor" fillOpacity="0.3" />
                <circle cx="18" cy="6" r="3" fill="currentColor" fillOpacity="0.3" />
                <circle cx="12" cy="18" r="3" fill="currentColor" fillOpacity="0.3" />
                <path d="M8.5 7.5L15.5 7.5M7.5 8.5L10.5 15.5M16.5 8.5L13.5 15.5" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-poppins text-lg font-black tracking-tight text-[#C00018]">
                Sentinel
              </span>
              <span className="font-poppins text-base font-bold tracking-tight text-[#1B1B1F]">
                Payments
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links — Clean, spacious, and minimalist */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#44474E]">
            <a
              href="#home"
              className="text-[#C00018] hover:text-[#A80015] transition-colors"
            >
              Home
            </a>
            <a
              href="#what-we-do"
              className="hover:text-[#C00018] transition-colors"
            >
              What We Do
            </a>
            <a
              href="#sandbox"
              className="hover:text-[#C00018] transition-colors"
            >
              Live Sandbox
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#C00018] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="hover:text-[#C00018] transition-colors"
            >
              Security
            </a>
          </nav>

          {/* Material 3 Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* M3 Outlined CONTACT Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#74777F] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1F] hover:bg-[#F1F3F5] transition-all"
            >
              Contact
            </a>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setView('dashboard')}
                  className="h-10 rounded-full bg-[#C00018] px-5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md hover:bg-[#A80015] active:scale-[0.98] transition-all"
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  <span>Sentinel Console</span>
                </Button>

                <button
                  onClick={() => {
                    logout();
                    toast({ title: 'Signed Out', description: 'You have been logged out.' });
                  }}
                  title={`Log out (${user.name})`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E5E8] bg-[#F7F8FA] text-[#74777F] hover:text-[#C00018] hover:bg-[#FFDAD6]/40 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => openAuthModal('login')}
                className="h-10 rounded-full bg-[#C00018] px-6 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md hover:bg-[#A80015] active:scale-[0.98] transition-all"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MATERIAL 3 HERO SECTION (MATCHING SENTINELCHARGE REFERENCE) */}
      <section
        id="home"
        className="relative min-h-[620px] lg:min-h-[680px] flex items-center justify-center overflow-hidden bg-[#0A0D14] text-white"
      >
        {/* Photographic background image with warm terminal / payment flow */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0a67c55c2f82?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        {/* Material 3 Surface Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/80 to-[#0A0D14]/60" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          {/* Live Alert Pill Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#C00018]/20 border border-[#C00018]/40 px-4 py-1.5 text-xs text-red-200 backdrop-blur-md mb-4 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold">Live Threat Intercepted:</span>
            <span className="font-mono text-white font-bold">#INV-2026-4410 spoofed domain (+$48,394.27 BLOCKED)</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif italic text-xl sm:text-2xl text-slate-300 tracking-wide font-normal"
          >
            Sentinel Payments
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-poppins leading-tight sm:leading-none"
          >
            Payment Processing <br />
            And Workflow Experts
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-slate-300 font-normal leading-relaxed"
          >
            Autonomous Accounts Payable Fraud Prevention Platform powered by RocketRide Visual Pipe Architecture &amp; Multi-Agent AI Swarms.
          </motion.p>

          {/* Material 3 Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            {/* M3 Filled Button (Red) */}
            <Button
              size="lg"
              onClick={() => {
                if (isAuthenticated) setView('dashboard');
                else openAuthModal('login');
              }}
              className="h-12 rounded-full bg-[#C00018] px-8 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg hover:bg-[#A80015] active:scale-[0.98] transition-all"
            >
              <span>{isAuthenticated ? 'Enter Fraud Console' : 'Access Sentinel Portal'}</span>
            </Button>

            {/* M3 Outlined Button (White) */}
            <a
              href="#sandbox"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/90 bg-transparent px-8 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-[#0A0D14] active:scale-[0.98] transition-all"
            >
              <span>Test Live Sandbox</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 3. ENTERPRISE TRUST & ERP INTEGRATIONS BAR */}
      <section className="bg-white border-b border-[#E2E5E8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#74777F] mb-6">
            Engineered for enterprise ERP systems &amp; global supply chains
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
            <span className="font-poppins font-black text-base text-slate-800 tracking-wider">SAP S/4HANA</span>
            <span className="font-poppins font-black text-base text-slate-800 tracking-wider">ORACLE Cloud ERP</span>
            <span className="font-poppins font-black text-base text-slate-800 tracking-wider">NetSuite</span>
            <span className="font-poppins font-black text-base text-slate-800 tracking-wider">Workday</span>
            <span className="font-poppins font-black text-base text-slate-800 tracking-wider">Microsoft Dynamics</span>
            <span className="font-poppins font-black text-base text-slate-800 tracking-wider">QuickBooks Enterprise</span>
          </div>
        </div>
      </section>

      {/* 4. MATERIAL 3 "WHAT WE DO" SECTION */}
      <section id="what-we-do" className="bg-[#F7F8FA] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E8] text-center">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1B1B1F] leading-snug">
            We specialize in payment processing services for a wide variety of industries.
          </h2>

          <p className="mt-6 text-sm sm:text-base text-[#44474E] leading-relaxed max-w-3xl mx-auto">
            We take the time to understand your unique challenges and find the perfect merchant security and automated fraud prevention setup.
          </p>

          {/* 4 M3 Bento Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="rounded-3xl border border-[#E2E5E8] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFDAD6] text-[#C00018] mb-5">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#1B1B1F] font-poppins">BEC &amp; Phishing Defense</h3>
              <p className="mt-2 text-xs text-[#44474E] leading-relaxed">
                Autonomous screening of supplier invoices &amp; emails. Identifies lookalike domains and urgency coercion before disbursements occur.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E2E5E8] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CCE8EE] text-[#006874] mb-5">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#1B1B1F] font-poppins">Master Vendor Grounding</h3>
              <p className="mt-2 text-xs text-[#44474E] leading-relaxed">
                Grounds transactions against 60+ verified records and 480+ historical ledgers for 3-sigma statistical baseline anomaly thresholds.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E2E5E8] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6E8D6] text-[#1E6827] mb-5">
                <PhoneCall className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#1B1B1F] font-poppins">Out-of-Band Telephony</h3>
              <p className="mt-2 text-xs text-[#44474E] leading-relaxed">
                Automated phone calls placed to the registered supplier contact on file (never attacker&apos;s phone) with speech-to-text verification.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E2E5E8] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAECEF] text-[#1B1B1F] mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#1B1B1F] font-poppins">&lt;1ms Zero Friction</h3>
              <p className="mt-2 text-xs text-[#44474E] leading-relaxed">
                Clean, routine supplier invoices pass all 6 statistical signal checks in under 1 millisecond with zero workflow interruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE THREAT SCENARIO SANDBOX */}
      <section id="sandbox" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E2E5E8]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CCE8EE] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#006874]">
              <Zap className="h-3.5 w-3.5" /> Interactive Sandbox
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#1B1B1F] font-poppins">
              Test Real-World Attack Scenarios
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#44474E] max-w-2xl mx-auto">
              Select a scenario below to see how our 6-rule risk engine and tri-agent AI swarm analyze, verify, and resolve cases in real time.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveSandboxScenario('bec')}
              className={cn(
                'rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                activeSandboxScenario === 'bec'
                  ? 'bg-[#FFDAD6] text-[#410002] shadow-xs'
                  : 'bg-[#F1F3F5] text-[#44474E] hover:bg-[#EAECEF]'
              )}
            >
              <AlertTriangle className="h-4 w-4 text-[#C00018]" />
              <span>Scenario 1: Spoofed BEC Domain ($48,394.27)</span>
            </button>

            <button
              onClick={() => setActiveSandboxScenario('amount')}
              className={cn(
                'rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                activeSandboxScenario === 'amount'
                  ? 'bg-amber-100 text-amber-950 shadow-xs'
                  : 'bg-[#F1F3F5] text-[#44474E] hover:bg-[#EAECEF]'
              )}
            >
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <span>Scenario 2: 3-Sigma Amount Spike ($98,500.00)</span>
            </button>

            <button
              onClick={() => setActiveSandboxScenario('clean')}
              className={cn(
                'rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                activeSandboxScenario === 'clean'
                  ? 'bg-[#D6E8D6] text-[#1E6827] shadow-xs'
                  : 'bg-[#F1F3F5] text-[#44474E] hover:bg-[#EAECEF]'
              )}
            >
              <CheckCircle2 className="h-4 w-4 text-[#1E6827]" />
              <span>Scenario 3: Verified Clean Invoice ($3,450.00)</span>
            </button>
          </div>

          {/* Sandbox Live Display Card */}
          <div className="mt-8 rounded-3xl border border-[#E2E5E8] bg-[#F7F8FA] p-6 sm:p-10 shadow-sm">
            <AnimatePresence mode="wait">
              {activeSandboxScenario === 'bec' && (
                <motion.div
                  key="bec"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-1 rounded-2xl bg-white p-6 border border-[#E2E5E8]">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#74777F]">Inbound Invoice Facts</span>
                    <h4 className="mt-2 text-lg font-bold text-[#1B1B1F] font-poppins">Acme Industrial Supply</h4>
                    <div className="mt-4 space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Invoice No:</span>
                        <strong className="text-[#1B1B1F]">INV-2026-4410</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Sender Email:</span>
                        <strong className="text-[#C00018]">billing@acme-industria1.com</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Amount:</span>
                        <strong className="text-[#C00018]">{formatCurrency(48394.27, 'USD')}</strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#74777F]">Bank Account:</span>
                        <strong className="text-amber-700">MODIFIED (Rogue IBAN)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl bg-white p-6 border border-[#E2E5E8]">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#74777F]">Fired Signals &amp; Composite Risk</span>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-[#FFDAD6]/50 rounded-xl border border-[#FFDAD6]">
                          <span className="font-bold text-[#410002]">domain_lookalike: 1.00</span>
                          <p className="text-[11px] text-[#410002] mt-0.5">Levenshtein distance = 2 from registered acmeindustrial.com</p>
                        </div>
                        <div className="p-3 bg-[#FFDAD6]/50 rounded-xl border border-[#FFDAD6]">
                          <span className="font-bold text-[#410002]">amount_anomaly: 1.00</span>
                          <p className="text-[11px] text-[#410002] mt-0.5">Z-Score 42.10 (Amount $48k vs historical average $1.2k)</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#1B1B1F] p-6 text-white text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-cyan-400 font-bold">Manager Agent Arbitrator Verdict:</span>
                        <span className="bg-[#FFDAD6] text-[#410002] px-3 py-0.5 rounded-full font-bold">RECOMMENDATION: HOLD</span>
                      </div>
                      <p className="mt-3 text-slate-300">
                        &quot;Definite BEC impersonation attempt. Domain character substitution identified. Bank modification requested 1 day before due date. Out-of-band phone call confirmed vendor DID NOT request this change. Payment disbursement frozen.&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSandboxScenario === 'amount' && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-1 rounded-2xl bg-white p-6 border border-[#E2E5E8]">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#74777F]">Inbound Invoice Facts</span>
                    <h4 className="mt-2 text-lg font-bold text-[#1B1B1F] font-poppins">Vertex Technology Partners</h4>
                    <div className="mt-4 space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Invoice No:</span>
                        <strong className="text-[#1B1B1F]">INV-2026-8821</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Sender Email:</span>
                        <strong className="text-emerald-700">finance@vertextech.com</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Amount:</span>
                        <strong className="text-amber-600">{formatCurrency(98500.0, 'USD')}</strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#74777F]">Historical Avg:</span>
                        <strong className="text-[#74777F]">{formatCurrency(4200.0, 'USD')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl bg-white p-6 border border-[#E2E5E8]">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#74777F]">Fired Signals &amp; Composite Risk</span>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <span className="font-bold text-amber-900">amount_anomaly: 0.95</span>
                          <p className="text-[11px] text-amber-800 mt-0.5">3-Sigma violation: Amount is 23x above standard historical baseline</p>
                        </div>
                        <div className="p-3 bg-[#D6E8D6]/60 rounded-xl border border-[#A8D5A8]">
                          <span className="font-bold text-[#1E6827]">domain_lookalike: 0.00</span>
                          <p className="text-[11px] text-[#1E6827] mt-0.5">Legitimate registered vendor domain matched master record</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#1B1B1F] p-6 text-white text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-cyan-400 font-bold">Manager Agent Arbitrator Verdict:</span>
                        <span className="bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full font-bold">RECOMMENDATION: AUDIT HOLD</span>
                      </div>
                      <p className="mt-3 text-slate-300">
                        &quot;Valid sender domain, but transaction size violates 3-sigma statistical threshold. Placed in Controller Review Queue with automated secondary signature requirement.&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSandboxScenario === 'clean' && (
                <motion.div
                  key="clean"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-1 rounded-2xl bg-white p-6 border border-[#E2E5E8]">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#74777F]">Inbound Invoice Facts</span>
                    <h4 className="mt-2 text-lg font-bold text-[#1B1B1F] font-poppins">Pacific Cloud Logistics</h4>
                    <div className="mt-4 space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Invoice No:</span>
                        <strong className="text-[#1B1B1F]">INV-2026-1044</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Sender Email:</span>
                        <strong className="text-emerald-700">billing@pacificcloud.com</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                        <span className="text-[#74777F]">Amount:</span>
                        <strong className="text-emerald-700">{formatCurrency(3450.0, 'USD')}</strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#74777F]">Status:</span>
                        <strong className="text-emerald-700">VERIFIED CLEAN</strong>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl bg-white p-6 border border-[#E2E5E8]">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#74777F]">Fired Signals &amp; Composite Risk</span>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-[#D6E8D6]/60 rounded-xl border border-[#A8D5A8]">
                          <span className="font-bold text-[#1E6827]">Composite Risk Score: 0.00</span>
                          <p className="text-[11px] text-[#1E6827] mt-0.5">All 6 statistical anomaly algorithms passed cleanly</p>
                        </div>
                        <div className="p-3 bg-[#D6E8D6]/60 rounded-xl border border-[#A8D5A8]">
                          <span className="font-bold text-[#1E6827]">Processing Time: 0.8ms</span>
                          <p className="text-[11px] text-[#1E6827] mt-0.5">Grounding verified with zero human latency</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#1B1B1F] p-6 text-white text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-cyan-400 font-bold">Controller Gate Verdict:</span>
                        <span className="bg-[#D6E8D6] text-[#1E6827] px-3 py-0.5 rounded-full font-bold">RECOMMENDATION: AUTO-RELEASE</span>
                      </div>
                      <p className="mt-3 text-slate-300">
                        &quot;Transaction facts fully grounded in master ledger. Zero risk signals triggered. Dispatched directly to ERP payment batch scheduler.&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE AP FRAUD ROI CALCULATOR */}
      <section id="roi-calculator" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F8FA] border-b border-[#E2E5E8]">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#E2E5E8] bg-white p-8 sm:p-12 shadow-sm">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFDAD6] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#410002]">
              <DollarSign className="h-3.5 w-3.5" /> ROI Calculator
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#1B1B1F] font-poppins">
              Estimate Your Annual AP Fraud Savings
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#44474E] max-w-xl mx-auto">
              Adjust your monthly volume and average invoice value to calculate protected exposure.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#1B1B1F] mb-2">
                  <span>Monthly Inbound Invoices:</span>
                  <span className="font-mono text-[#C00018]">{monthlyInvoices.toLocaleString()} invoices/mo</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="20000"
                  step="200"
                  value={monthlyInvoices}
                  onChange={(e) => setMonthlyInvoices(Number(e.target.value))}
                  className="w-full accent-[#C00018] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#1B1B1F] mb-2">
                  <span>Average Invoice Value:</span>
                  <span className="font-mono text-[#C00018]">{formatCurrency(avgInvoiceAmount, 'USD')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={avgInvoiceAmount}
                  onChange={(e) => setAvgInvoiceAmount(Number(e.target.value))}
                  className="w-full accent-[#C00018] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E2E5E8] text-xs text-[#44474E] space-y-1">
                <div className="flex justify-between">
                  <span>Annual AP Disbursements:</span>
                  <strong className="text-[#1B1B1F] font-mono">{formatCurrency(annualDisbursements, 'USD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Industry Baseline Fraud Risk:</span>
                  <strong className="text-[#1B1B1F] font-mono">0.45%</strong>
                </div>
              </div>
            </div>

            {/* Calculated Output Display */}
            <div className="rounded-3xl border border-[#FFDAD6] bg-gradient-to-br from-[#FFF8F7] to-[#FFF0EE] p-8 text-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#410002]">Estimated Annual Value</span>
              <div className="mt-3 font-poppins text-4xl sm:text-5xl font-black text-[#C00018]">
                {formatCurrency(estimatedFraudPrevented, 'USD')}
              </div>
              <p className="mt-1 text-xs font-medium text-[#410002]">Fraudulent Disbursements Intercepted</p>

              <div className="mt-6 pt-6 border-t border-[#FFDAD6] grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-[11px] text-[#74777F] block">Audit Hours Saved:</span>
                  <strong className="text-sm font-bold text-[#1B1B1F] font-mono">{manualAuditHoursSaved.toLocaleString()} hrs / yr</strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#74777F] block">False Alarm Friction:</span>
                  <strong className="text-sm font-bold text-[#1E6827] font-mono">0.00% Disruption</strong>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (isAuthenticated) setView('dashboard');
                  else openAuthModal('register');
                }}
                className="mt-6 w-full h-11 rounded-full bg-[#C00018] text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#A80015]"
              >
                <span>Protect Your AP Pipeline Now</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MATERIAL 3 "HOW IT WORKS" — 7-STAGE DAG WORKFLOW */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E2E5E8]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-[#FFDAD6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#410002]">
              Visual DAG Architecture
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#1B1B1F] font-poppins">
              The 7-Stage RocketRide Pipeline
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#44474E] max-w-2xl mx-auto">
              Every invoice flows through an end-to-end modular Directed Acyclic Graph (DAG) before payment authorization.
            </p>
          </div>

          {/* M3 Interactive Stepper & Stage Card */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Stage Selector Chips / List */}
            <div className="space-y-2 lg:col-span-1">
              {stagesData.map((st, i) => {
                const Icon = st.icon;
                const isActive = activeStageIndex === i;
                return (
                  <button
                    key={st.no}
                    onClick={() => setActiveStageIndex(i)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all cursor-pointer',
                      isActive
                        ? 'bg-[#FFDAD6] text-[#410002] font-bold shadow-xs'
                        : 'bg-[#F7F8FA] text-[#44474E] hover:bg-[#F1F3F5]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold',
                          isActive ? 'bg-[#C00018] text-white' : 'bg-[#EAECEF] text-[#44474E]'
                        )}
                      >
                        {st.no}
                      </span>
                      <span className="text-xs font-bold">{st.title}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isActive ? 'text-[#C00018] translate-x-0.5' : 'text-[#74777F]'
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* M3 Elevated Detail Card */}
            <div className="lg:col-span-2 rounded-3xl border border-[#E2E5E8] bg-[#F7F8FA] p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E5E8] pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C00018] text-white font-mono font-bold text-sm shadow-xs">
                    {stagesData[activeStageIndex].no}
                  </span>
                  <h3 className="text-xl font-bold text-[#1B1B1F] font-poppins">
                    Stage {stagesData[activeStageIndex].no}: {stagesData[activeStageIndex].title}
                  </h3>
                </div>
                <span className="rounded-full bg-[#CCE8EE] px-3.5 py-1 text-xs font-bold text-[#006874]">
                  Automated
                </span>
              </div>

              <p className="mt-6 text-sm sm:text-base text-[#44474E] leading-relaxed">
                {stagesData[activeStageIndex].desc}
              </p>

              <div className="mt-8 pt-6 border-t border-[#E2E5E8] flex items-center justify-between">
                <span className="text-xs text-[#74777F] font-medium">Ready to screen live batch cases?</span>
                <Button
                  onClick={() => {
                    if (isAuthenticated) setView('dashboard');
                    else openAuthModal('login');
                  }}
                  className="h-10 rounded-full bg-[#1B1B1F] px-5 text-xs font-bold text-white hover:bg-black transition-all"
                >
                  <span>Launch Live Audit</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MATERIAL 3 "SECURITY & SIGNALS" MATRIX */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1B1B1F] text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-[#FFDAD6]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#FFDAD6]">
              Risk Intelligence
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white font-poppins">
              6-Dimensional Threat Scoring Matrix
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Deterministic, frozen algorithm scoring across 6 independent threat vectors for $0.00 - 1.00$ composite risk.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-800 bg-[#24262B] p-6 shadow-sm">
              <span className="rounded-full bg-red-950/80 px-2.5 py-0.5 text-[11px] font-bold text-red-300 font-mono">30% Weight</span>
              <h3 className="mt-3 text-base font-bold text-white font-poppins">Domain Lookalike Detection</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Levenshtein distance ($d \le 3$) detecting spoofed character replacements like <code className="text-red-300">acme-industria1.com</code> vs registered <code className="text-emerald-300">acmeindustrial.com</code>.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#24262B] p-6 shadow-sm">
              <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 font-mono">20% Weight</span>
              <h3 className="mt-3 text-base font-bold text-white font-poppins">Statistical Amount Anomaly</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                3-Sigma statistical Z-score thresholding ($|x - \mu| / \sigma \ge 3.0$) computed against historical vendor payments ledger.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#24262B] p-6 shadow-sm">
              <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 font-mono">20% Weight</span>
              <h3 className="mt-3 text-base font-bold text-white font-poppins">Suspicious Timing Window</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Detects urgent bank account modification emails received within $\le 3$ days prior to the invoice due date.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#24262B] p-6 shadow-sm">
              <span className="rounded-full bg-sky-950/80 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 font-mono">15% Weight</span>
              <h3 className="mt-3 text-base font-bold text-white font-poppins">Duplicate Invoice Search</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                SQL payment history cross-matching to prevent double-disbursements or duplicate invoice submissions.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#24262B] p-6 shadow-sm">
              <span className="rounded-full bg-purple-950/80 px-2.5 py-0.5 text-[11px] font-bold text-purple-300 font-mono">10% Weight</span>
              <h3 className="mt-3 text-base font-bold text-white font-poppins">First-Time Vendor Trust</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Automated gating on unverified or unregistered vendor profiles requiring mandatory verification before payment.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#24262B] p-6 shadow-sm">
              <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 font-mono">5% Weight</span>
              <h3 className="mt-3 text-base font-bold text-white font-poppins">SAR Threshold Skirting</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Flags structuring anomalies for payments intentionally priced between $\$9,500$ and $\$9,999$ beneath the SAR audit limit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E2E5E8]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F5] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#44474E]">
              <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#1B1B1F] font-poppins">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-[#E2E5E8] bg-[#F7F8FA] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-[#1B1B1F] hover:bg-[#F1F3F5] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn('h-4 w-4 text-[#74777F] transition-transform', isOpen && 'rotate-180 text-[#C00018]')} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#44474E] leading-relaxed border-t border-[#E2E5E8]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. MATERIAL 3 CONTACT SECTION */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F8FA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-[#FFDAD6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#410002]">
              Get in Touch
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#1B1B1F] font-poppins">
              Work With Sentinel Payments
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#44474E] max-w-xl mx-auto">
              Speak with our enterprise AP fraud prevention specialists and begin screening payments.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-[#E2E5E8] bg-white p-8 sm:p-10 shadow-sm">
            {contactSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D6E8D6] text-[#1E6827]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1B1B1F] font-poppins">Thank You for Reaching Out</h3>
                <p className="text-sm text-[#44474E] max-w-md mx-auto">
                  Our payment security team has received your message and will contact you at <strong>{contactEmail}</strong> shortly.
                </p>
                <Button
                  onClick={() => setContactSubmitted(false)}
                  variant="outline"
                  className="mt-4 rounded-full"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#44474E] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full h-12 rounded-2xl border border-[#C4C7C5] bg-[#F7F8FA] px-4 text-sm text-[#1B1B1F] focus:outline-hidden focus:border-[#C00018]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#44474E] mb-1.5">Corporate Email</label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full h-12 rounded-2xl border border-[#C4C7C5] bg-[#F7F8FA] px-4 text-sm text-[#1B1B1F] focus:outline-hidden focus:border-[#C00018]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474E] mb-1.5">Company / Enterprise</label>
                  <input
                    type="text"
                    placeholder="Acme Global Corporation"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-[#C4C7C5] bg-[#F7F8FA] px-4 text-sm text-[#1B1B1F] focus:outline-hidden focus:border-[#C00018]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474E] mb-1.5">Inquiry Details</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your payment volume or current accounts payable verification workflow..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full rounded-2xl border border-[#C4C7C5] bg-[#F7F8FA] p-4 text-sm text-[#1B1B1F] focus:outline-hidden focus:border-[#C00018]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#C00018] font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#A80015]"
                >
                  <span>Submit Inquiry</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. MATERIAL 3 FOOTER */}
      <footer className="border-t border-[#E2E5E8] bg-[#1B1B1F] py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C00018] text-white font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-poppins font-extrabold text-sm text-white">
              Sentinel Payments <span className="text-slate-400 font-normal">· AP Fraud Sentinel</span>
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#what-we-do" className="hover:text-white transition-colors">What We Do</a>
            <a href="#sandbox" className="hover:text-white transition-colors">Live Sandbox</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Architecture</a>
            <a href="#roi-calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-[#FFDAD6] hover:text-white font-bold cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Sentinel Payments. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

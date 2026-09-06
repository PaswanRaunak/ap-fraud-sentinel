import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy · Sentinel Payments',
  description: 'How Sentinel Payments handles invoice data, vendor records and verification call transcripts.',
};

const sections = [
  {
    title: 'What we process',
    body: 'Invoice documents and vendor emails you submit for screening, extracted facts (vendor name, amounts, dates, bank accounts), vendor master and payment history records you load, and transcripts of automated verification calls. All dataset shipped with the product is synthetic - no real PII or banking details.',
  },
  {
    title: 'How it is used',
    body: 'Submitted data is used solely to compute fraud risk: grounding against your vendor master, running the six deterministic signals, agent review, and out-of-band verification. We do not sell, rent, or share your data with third parties, and we do not use your invoices to train models.',
  },
  {
    title: 'Where it lives',
    body: 'Cases, decisions and run history are stored in the SQLite database on your own infrastructure. Documents stay on your network. When a cloud LLM provider is configured, only the minimal case facts required for a review are sent - never raw attachments.',
  },
  {
    title: 'Retention & deletion',
    body: 'Case records persist until you delete them. Re-running a batch replaces the working case set; decision audit trails are preserved per your configuration. Deleting the database removes all case data permanently.',
  },
  {
    title: 'Your controls',
    body: 'You can export or purge case data at any time through the database, disable cloud LLM routing entirely (the pipeline runs fully locally), and opt out of verification-call audio retention.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-[#050505] px-4 py-20 font-sans text-white antialiased sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back to sentinelpayments
        </Link>

        <div className="mt-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C00018] text-white">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight">Sentinel Payments</span>
        </div>

        <h1 className="mt-8 text-4xl font-semibold tracking-tighter sm:text-5xl">Privacy policy</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/45">
          Plain language, no dark patterns. Last updated{' '}
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>

        <div className="mt-14 space-y-10 border-t border-white/[0.08] pt-10">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
                <span className="font-mono text-xs text-white/25">0{i + 1}</span>
                {s.title}
              </h2>
              <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-white/50">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-white/[0.08] pt-8 text-xs text-white/30">
          Questions about this policy? Reach the security team through the contact section on the main site.
        </div>
      </div>
    </main>
  );
}

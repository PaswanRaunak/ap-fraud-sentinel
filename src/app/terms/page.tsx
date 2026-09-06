import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service · Sentinel Payments',
  description: 'Terms governing use of the Sentinel Payments AP fraud screening platform.',
};

const sections = [
  {
    title: 'The service',
    body: 'Sentinel Payments provides automated accounts-payable fraud screening: document intake, fact extraction, vendor grounding, risk scoring, agent review, out-of-band verification calls, and a controller decision gate. The platform assists your payment decisions - it does not replace them.',
  },
  {
    title: 'No guarantee of fraud prevention',
    body: 'Detection is probabilistic. Deterministic signals, statistical baselines and agent review reduce exposure but cannot guarantee every fraudulent invoice is intercepted or that every held invoice is fraudulent. Release and hold decisions remain the responsibility of your controllers.',
  },
  {
    title: 'Verification calls',
    body: 'Automated verification calls are placed only to phone numbers registered in your vendor master record. You are responsible for the accuracy of the contact data on file and for complying with call-recording and telemarketing regulations in your jurisdiction.',
  },
  {
    title: 'Acceptable use',
    body: 'Do not submit data you have no lawful basis to process, attempt to screen third parties without authorization, or use the platform to harass vendors. Evaluation demo accounts are provided as-is for testing and demonstrations.',
  },
  {
    title: 'Availability & liability',
    body: 'The service is provided under the project MIT license, without warranty of merchantability or fitness for a particular purpose. To the maximum extent permitted by law, liability is limited to the amount you paid for the service in the preceding twelve months.',
  },
];

export default function TermsPage() {
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

        <h1 className="mt-8 text-4xl font-semibold tracking-tighter sm:text-5xl">Terms of service</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/45">
          The short version: screen honestly, decide as a human, verify only with the contacts on file. Last
          updated{' '}
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
          These terms govern the Sentinel Payments platform as shipped in this repository.
        </div>
      </div>
    </main>
  );
}

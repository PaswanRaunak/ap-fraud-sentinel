'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper to extract numeric value & currency/prefix from raw value string
function parseNumericValue(val: string | number) {
  if (typeof val === 'number') return { num: val, prefix: '', suffix: '', isMoney: false };
  const str = String(val).trim();
  const isMoney = str.startsWith('$');
  const numStr = str.replace(/[^0-9.]/g, '');
  const num = parseFloat(numStr) || 0;
  return { num, prefix: isMoney ? '$' : '', suffix: '', isMoney };
}

function AnimatedNumber({ value }: { value: string | number }) {
  const { num, prefix, isMoney } = parseNumericValue(value);
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1.0s smooth count-up

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      // No floor — money values count up through their cents smoothly.
      setDisplayNum(easedProgress * num);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayNum(num);
      }
    };

    window.requestAnimationFrame(step);
  }, [num]);

  if (isNaN(num)) return <span>{value}</span>;

  // Keep cents visible for money values — the count-up floor would otherwise
  // land $48,394.27 on $48,394.
  const formatted = isMoney
    ? displayNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : displayNum.toLocaleString('en-US');

  return (
    <motion.span
      key={num}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {formatted}
    </motion.span>
  );
}

export function StatCallout({
  label,
  value,
  accent = 'default',
  icon,
}: {
  label: string;
  value: string | number;
  accent?: 'default' | 'red' | 'emerald' | 'steel' | 'amber';
  hint?: string;
  icon?: React.ReactNode;
}) {
  const accentMap: Record<string, string> = {
    default: 'text-white',
    red: 'text-red-400',
    emerald: 'text-emerald-300',
    steel: 'text-sky-300',
    amber: 'text-amber-400',
  };

  const borderMap: Record<string, string> = {
    default: 'border-white/10 bg-white/[0.03] hover:border-white/20',
    red: 'border-red-400/20 bg-red-400/[0.04] hover:border-red-400/40',
    emerald: 'border-emerald-400/20 bg-emerald-400/[0.04] hover:border-emerald-400/40',
    steel: 'border-sky-400/20 bg-sky-400/[0.04] hover:border-sky-400/40',
    amber: 'border-amber-400/20 bg-amber-400/[0.04] hover:border-amber-400/40',
  };

  const iconBgMap: Record<string, string> = {
    default: 'bg-white/[0.06] text-white/60',
    red: 'bg-red-400/10 text-red-300',
    emerald: 'bg-emerald-400/10 text-emerald-300',
    steel: 'bg-sky-400/10 text-sky-300',
    amber: 'bg-amber-400/10 text-amber-300',
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300',
        borderMap[accent]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          {label}
        </span>
        {icon && (
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3',
            iconBgMap[accent],
          )}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline">
        <span className={cn('font-mono text-3xl font-semibold tabular-nums tracking-tighter sm:text-4xl', accentMap[accent])}>
          <AnimatedNumber value={value} />
        </span>
      </div>
    </motion.div>
  );
}

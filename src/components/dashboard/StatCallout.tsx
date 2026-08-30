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
    default: 'text-slate-900',
    red: 'text-red-600',
    emerald: 'text-[#0f766e]',
    steel: 'text-[#00668c]',
    amber: 'text-amber-600',
  };

  const borderMap: Record<string, string> = {
    default: 'border-[#E2E5E8] bg-white hover:border-[#C4C7C5] hover:shadow-md',
    red: 'border-[#FFDAD6] bg-white hover:border-[#BA1A1A]/30 hover:shadow-md',
    emerald: 'border-[#D6E8D6] bg-white hover:border-[#1E6827]/30 hover:shadow-md',
    steel: 'border-[#CCE8EE] bg-white hover:border-[#006874]/30 hover:shadow-md',
    amber: 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-md',
  };

  const iconBgMap: Record<string, string> = {
    default: 'bg-[#F1F3F5] text-[#44474E]',
    red: 'bg-[#FFDAD6] text-[#C00018]',
    emerald: 'bg-[#D6E8D6] text-[#1E6827]',
    steel: 'bg-[#CCE8EE] text-[#006874]',
    amber: 'bg-amber-100 text-amber-800',
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 shadow-xs',
        borderMap[accent]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#74777F]">
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
        <span className={cn('font-poppins text-3xl font-extrabold tracking-tight sm:text-4xl', accentMap[accent])}>
          <AnimatedNumber value={value} />
        </span>
      </div>
    </motion.div>
  );
}


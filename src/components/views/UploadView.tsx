'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, Mail, CheckCircle2, ShieldAlert, Loader2, Info, Play, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadFiles, useStartRun } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_STROKE = 1.5;
const ACCEPTED = /\.(csv|pdf|eml|json|txt|msg)$/i;

interface QueueItem {
  id: string;
  name: string;
  size: string;
  time: string;
  status: 'Ready' | 'Parsing' | 'Quarantined' | 'Analyzed';
  badgeCls: string;
}

export function UploadView() {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const setRunId = useAppStore((s) => s.setRunId);
  const setView = useAppStore((s) => s.setView);
  const activeRunId = useAppStore((s) => s.runId);

  const upload = useUploadFiles();
  const startRun = useStartRun();
  const { toast } = useToast();

  const handleFilesUpload = async (fileList: File[]) => {
    const valid = fileList.filter((f) => ACCEPTED.test(f.name));
    if (!valid.length) {
      toast({
        title: 'Unsupported file format',
        description: 'Please upload PDF, EML, CSV, JSON, or TXT files.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await upload.mutateAsync({ files: valid });
      if (res.run_id) setRunId(res.run_id);

      const newItems: QueueItem[] = valid.map((f, i) => ({
        id: `upload-${Date.now()}-${i}`,
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
        time: 'Just now',
        status: 'Ready',
        badgeCls: 'bg-sky-400/10 text-sky-300 border-sky-400/25',
      }));

      setQueue((prev) => [...newItems, ...prev]);

      toast({
        title: 'Upload Successful',
        description: `${valid.length} file(s) saved. Click 'Run Batch' to analyze.`,
      });
    } catch (e) {
      toast({
        title: 'Upload Failed',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer?.files ?? []);
    if (dropped.length) handleFilesUpload(dropped);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) handleFilesUpload(picked);
  };

  const onRunBatch = async () => {
    try {
      const r = await startRun.mutateAsync({});
      toast({
        title: 'Batch run started',
        description: `run_id ${r.run_id} — processing pipeline in real time.`,
      });
      setView('dashboard');
    } catch (e) {
      toast({
        title: 'Run failed',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Upload Dataset</h1>
          <p className="text-xs font-medium text-white/40">
            Upload invoices, vendor communications, or reference CSV files to process through RocketRide.
          </p>
        </div>

        <Button
          onClick={onRunBatch}
          disabled={startRun.isPending}
          className="cursor-pointer gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-white/85 active:scale-[0.98]"
        >
          {startRun.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" strokeWidth={ICON_STROKE} />
          ) : (
            <Play className="h-3.5 w-3.5 fill-black" />
          )}
          <span>Run Batch</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Upload Box */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-white/[0.02] p-10 text-center transition-all duration-300',
              dragging ? 'border-[#C00018]/70 bg-[#C00018]/[0.06]' : 'border-white/15 hover:border-white/30 hover:bg-white/[0.04]',
              upload.isPending && 'pointer-events-none opacity-60'
            )}
          >
            {upload.isPending ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-red-400" strokeWidth={ICON_STROKE} />
                <span className="text-xs font-semibold text-white/60">Uploading files to dataset…</span>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/50">
                  <UploadCloud className="h-7 w-7" strokeWidth={ICON_STROKE} />
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-white">Drag &amp; drop invoice / dataset files</h3>
                  <p className="max-w-md text-xs font-medium text-white/40">
                    Supports PDF, EML, CSV (vendor_master, payment_history, fraud_ground_truth), JSON, or TXT.
                  </p>
                </div>

                <Button
                  type="button"
                  className="mt-2 cursor-pointer rounded-full border border-white/15 bg-white/[0.06] px-6 py-2 text-xs font-bold text-white shadow-none transition-colors hover:bg-white/[0.12]"
                >
                  Browse Files
                </Button>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".csv,.pdf,.eml,.json,.txt,.msg"
              onChange={onPick}
              className="hidden"
            />
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0B0B0E] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white/85">
                <FileText className="h-4 w-4 text-sky-300" strokeWidth={ICON_STROKE} />
                Supported Formats
              </div>
              <ul className="space-y-1 text-xs leading-relaxed text-white/45">
                <li>PDF (invoices, receipts &amp; statements)</li>
                <li>EML &amp; MSG (raw vendor communications)</li>
                <li>CSV (master databases &amp; ground truth)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B0B0E] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white/85">
                <Info className="h-4 w-4 text-sky-300" strokeWidth={ICON_STROKE} />
                Dataset Staging Policy
              </div>
              <p className="text-xs leading-relaxed text-white/45">
                Uploaded reference files automatically reload the SQLite ground-truth database for immediate
                out-of-band verification.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Processing Queue */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B0B0E] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                Processing Queue
              </h2>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-0.5 font-mono text-[10px] font-bold text-white/45">
                {queue.length} Active
              </span>
            </div>

            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {queue.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-white/25">
                      <Inbox className="h-5 w-5" strokeWidth={ICON_STROKE} />
                    </span>
                    <p className="text-xs leading-relaxed text-white/35">
                      Queue is empty. Drop files above to stage them for the next batch run.
                    </p>
                  </div>
                ) : (
                  queue.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3 pr-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/55">
                          {item.name.endsWith('.eml') ? (
                            <Mail className="h-4 w-4 text-sky-300" strokeWidth={ICON_STROKE} />
                          ) : (
                            <FileText className="h-4 w-4 text-sky-300" strokeWidth={ICON_STROKE} />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-xs font-bold text-white/85">{item.name}</span>
                          <span className="font-mono text-[10px] font-medium text-white/30">{item.size} · {item.time}</span>
                        </div>
                      </div>

                      <span className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase', item.badgeCls)}>
                        {item.status === 'Parsing' && <Loader2 className="h-3 w-3 animate-spin text-sky-300" strokeWidth={ICON_STROKE} />}
                        {item.status === 'Quarantined' && <ShieldAlert className="h-3 w-3 text-red-300" strokeWidth={ICON_STROKE} />}
                        {item.status === 'Ready' && <CheckCircle2 className="h-3 w-3 text-emerald-300" strokeWidth={ICON_STROKE} />}
                        {item.status}
                      </span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={onRunBatch}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-sky-300 transition-colors hover:text-sky-200"
            >
              <Play className="h-3 w-3 fill-sky-300" />
              Run Pipeline Now
            </button>
            <span className="font-mono text-[10px] font-bold text-white/30">
              {activeRunId ?? 'NO ACTIVE RUN'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { Download, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useCases } from '@/hooks/useDashboardData';
import { useAppStore, formatCurrency } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CaseRecord } from '@/lib/types';

const ICON_STROKE = 1.5;

const columnHelper = createColumnHelper<CaseRecord>();

export function CasesView() {
  const currency = useAppStore((s) => s.currency);
  const [status, setStatus] = useState('all');
  const [fraudType, setFraudType] = useState('all');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'riskScore', desc: true }]);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading } = useCases({
    status: status === 'all' ? undefined : status,
    fraud_type: fraudType === 'all' ? undefined : fraudType,
    search: search || undefined,
    page: page + 1,
    limit: pageSize,
  });

  const selectCase = useAppStore((s) => s.selectCase);

  const columns = useMemo(
    () => [
      columnHelper.accessor('caseId', {
        header: 'CASE ID',
        cell: (info) => <code className="font-mono text-xs font-bold text-white/90">{info.getValue()}</code>,
      }),
      columnHelper.accessor('vendorName', {
        header: 'VENDOR',
        cell: (info) => <span className="text-xs font-medium text-white/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor('invoiceNumber', {
        header: 'INVOICE #',
        cell: (info) => <code className="font-mono text-xs text-white/45">{info.getValue()}</code>,
      }),
      columnHelper.accessor('amountUsd', {
        header: 'AMOUNT',
        cell: (info) => (
          <span className="font-mono text-xs font-bold tabular-nums text-white">
            {formatCurrency(info.getValue(), info.row.original.currency)}
          </span>
        ),
      }),
      columnHelper.accessor('riskScore', {
        header: 'RISK SCORE',
        cell: (info) => {
          const score = info.getValue();
          const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
          const isHigh = score >= 0.7;
          const isMed = score >= 0.4;
          return (
            <div className="flex items-center justify-end gap-2.5">
              <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isHigh ? 'bg-amber-400' : isMed ? 'bg-red-400' : 'bg-emerald-400',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-white">{score.toFixed(2)}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('recommendation', {
        header: 'RECOMMENDATION',
        cell: (info) => {
          const isHold = info.getValue() === 'hold';
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                isHold
                  ? 'border border-red-400/25 bg-red-400/10 text-red-300'
                  : 'border border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
              )}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'ACTION',
        cell: ({ row }) => {
          const isHold = row.original.recommendation === 'hold';
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                selectCase(row.original.caseId);
              }}
              className={cn(
                'h-7 cursor-pointer rounded-full px-4 text-[11px] font-bold uppercase tracking-wider',
                isHold
                  ? 'border-red-400/40 text-red-300 hover:bg-red-400/10'
                  : 'border-sky-400/40 text-sky-300 hover:bg-sky-400/10',
              )}
            >
              {isHold ? 'HOLD' : 'RELEASE'}
            </Button>
          );
        },
      }),
    ],
    [selectCase, currency],
  );

  const rows = data?.items ?? [];
  const totalCases = data?.total ?? 0;
  const totalPages = Math.ceil(totalCases / pageSize) || 1;

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination: { pageIndex: page, pageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const exportCsv = () => {
    const sorted = table.getSortedRowModel().rows.map((r) => r.original);
    const header = ['caseId', 'vendor', 'invoice', 'amountUsd', 'riskScore', 'recommendation'];
    const lines = [header.join(',')];
    for (const r of sorted) {
      lines.push([r.caseId, `"${r.vendorName}"`, r.invoiceNumber, r.amountUsd, r.riskScore, r.recommendation].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Cases <span className="font-normal text-white/35">({totalCases})</span>
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative w-64 sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search case, vendor, invoice..."
              className="rounded-full border-white/10 bg-white/[0.04] pl-9 pr-4 text-xs text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-[#C00018]/60"
            />
          </div>
          <Button
            onClick={exportCsv}
            className="cursor-pointer gap-2 rounded-full bg-amber-600 px-5 text-xs font-bold text-white transition-colors hover:bg-amber-700"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {['all', 'scored', 'held', 'closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatus(tab); setPage(0); }}
              className={cn(
                'cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-300',
                status === tab ? 'bg-white text-black' : 'text-white/45 hover:text-white',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category Type Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/45">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            <span>Filter Type</span>
          </div>
          {[
            { id: 'bec', label: 'BEC' },
            { id: 'invoice_fraud', label: 'Invoice fraud' },
            { id: 'duplicate', label: 'Duplicate' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFraudType(fraudType === cat.id ? 'all' : cat.id);
                setPage(0);
              }}
              className={cn(
                'cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300',
                fraudType === cat.id
                  ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
                  : 'border-white/10 bg-white/[0.03] text-white/45 hover:text-white',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="py-3 text-[10px] font-bold uppercase tracking-wider text-white/35">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-4">
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-white/35">
                  No cases found for the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => selectCase(row.original.caseId)}
                  className="cursor-pointer border-b border-white/[0.05] hover:bg-white/[0.03]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4 text-xs font-semibold text-white/40">
          <span className="tabular-nums">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCases)} of {totalCases} cases
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="cursor-pointer rounded-full border border-white/10 p-1.5 transition-colors hover:bg-white/[0.06] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={ICON_STROKE} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={cn(
                  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  page === idx ? 'bg-white text-black' : 'text-white/50 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                {idx + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="px-1">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setPage(totalPages - 1)}
                className={cn(
                  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  page === totalPages - 1 ? 'bg-white text-black' : 'text-white/50 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                {totalPages}
              </button>
            )}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="cursor-pointer rounded-full border border-white/10 p-1.5 transition-colors hover:bg-white/[0.06] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={ICON_STROKE} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

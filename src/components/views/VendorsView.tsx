'use client';

// VendorsView — master-detail vendor master registry.
// Left: searchable vendor list. Right: inspector with grounding stats,
// payment-history chart and recent records. Add/vendor CSV import stays a
// dialog; editing happens inline in the inspector.

import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Building2, Search, Edit2, Save, X, Plus, Upload, FileText, Phone, Landmark, CalendarDays, ReceiptText, Sigma } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendors, useVendor } from '@/hooks/useDashboardData';
import { useAppStore, formatCurrency } from '@/lib/store';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.5;

function maskedBank(acct?: string) {
  if (!acct) return '—';
  const clean = acct.replace(/\s+/g, '');
  if (clean.length <= 6) return clean;
  if (clean.startsWith('GB') || clean.startsWith('US') || clean.startsWith('DE')) {
    return `${clean.slice(0, 4)}••••${clean.slice(-5, -2)} ${clean.slice(-2)}`;
  }
  return `•••• ${clean.slice(-4)}`;
}

function parseVendorCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getIdx = (keys: string[]) => {
    for (const k of keys) {
      const idx = headers.indexOf(k);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx = getIdx(['legalname', 'name', 'vendorname', 'vendor']);
  const domainIdx = getIdx(['registereddomain', 'domain', 'website']);
  const phoneIdx = getIdx(['knownphone', 'phone', 'contactphone']);
  const bankIdx = getIdx(['knownbankaccount', 'bankaccount', 'bank', 'account']);
  const emailIdx = getIdx(['contactemail', 'email']);
  const idIdx = getIdx(['vendorid', 'id']);
  const addressIdx = getIdx(['address']);
  const taxIdx = getIdx(['taxid']);

  const vendors: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i]);
    const legalName = nameIdx !== -1 ? row[nameIdx] : '';
    const registeredDomain = domainIdx !== -1 ? row[domainIdx] : '';

    if (legalName || registeredDomain) {
      vendors.push({
        vendorId: idIdx !== -1 && row[idIdx] ? row[idIdx] : '',
        legalName: legalName || registeredDomain,
        registeredDomain: registeredDomain || legalName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        knownPhone: phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '+1 (555) 000-0000',
        knownBankAccount: bankIdx !== -1 && row[bankIdx] ? row[bankIdx] : '1234567890',
        contactEmail: emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : `ap@${registeredDomain || 'vendor.com'}`,
        address: addressIdx !== -1 && row[addressIdx] ? row[addressIdx] : '100 Enterprise Way',
        taxId: taxIdx !== -1 && row[taxIdx] ? row[taxIdx] : 'XX-XXXXXXX',
      });
    }
  }

  return vendors;
}

function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {icon}
        {label}
      </span>
      <span className="mt-1.5 block truncate font-mono text-xs font-bold text-white/85" title={value}>
        {value || '—'}
      </span>
    </div>
  );
}

export function VendorsView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'csv'>('single');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvVendors, setParsedCsvVendors] = useState<Record<string, string>[]>([]);

  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    legalName: '',
    registeredDomain: '',
    knownPhone: '',
    knownBankAccount: '',
  });
  const [addForm, setAddForm] = useState({
    legalName: '',
    registeredDomain: '',
    knownPhone: '',
    knownBankAccount: '',
    contactEmail: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useVendors(1, 100, search);
  const { data: vendorDetail, isLoading: detailLoading } = useVendor(selected);

  const vendors = data?.items ?? [];

  // Keep a valid selection as the list filters.
  useEffect(() => {
    if (vendors.length === 0) {
      setSelected(null);
    } else if (!vendors.some((v) => v.vendorId === selected)) {
      setSelected(vendors[0].vendorId);
    }
  }, [vendors, selected]);

  useEffect(() => {
    if (vendorDetail?.vendor) {
      setEditForm({
        legalName: vendorDetail.vendor.legalName ?? '',
        registeredDomain: vendorDetail.vendor.registeredDomain ?? '',
        knownPhone: vendorDetail.vendor.knownPhone ?? '',
        knownBankAccount: vendorDetail.vendor.knownBankAccount ?? '',
      });
    }
  }, [vendorDetail]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vendors/${encodeURIComponent(selected)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update vendor');
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });
      await queryClient.invalidateQueries({ queryKey: ['vendor', selected] });
      toast({
        title: 'Vendor Updated',
        description: 'Vendor details updated successfully in SQLite database.',
      });
      setIsEditing(false);
    } catch (err) {
      toast({
        title: 'Update Error',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddVendor = async () => {
    if (!addForm.legalName || !addForm.registeredDomain) {
      toast({
        title: 'Missing Fields',
        description: 'Legal Name and Registered Domain are required.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error('Failed to create vendor');
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: 'Vendor Added',
        description: `${addForm.legalName} registered as a ground-truth vendor.`,
      });
      setIsAdding(false);
      setAddForm({
        legalName: '',
        registeredDomain: '',
        knownPhone: '',
        knownBankAccount: '',
        contactEmail: '',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCsvSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const text = await file.text();
    const rows = parseVendorCsv(text);
    setParsedCsvVendors(rows);
  };

  const handleImportCsv = async () => {
    if (!parsedCsvVendors.length) {
      toast({
        title: 'No vendor data found',
        description: 'The CSV file did not contain valid vendor rows.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors: parsedCsvVendors }),
      });
      if (!res.ok) throw new Error('Bulk CSV import failed');
      const j = await res.json();
      toast({
        title: 'CSV Import Successful',
        description: `Successfully imported ${j.count || parsedCsvVendors.length} vendors into database.`,
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsAdding(false);
      setCsvFile(null);
      setParsedCsvVendors([]);
    } catch (err) {
      toast({
        title: 'Import Error',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const chartData = (vendorDetail?.payments ?? []).map((p) => ({
    date: p.paidDate,
    amount: Number(p.amountUsd),
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Vendor master{' '}
          {!isLoading && <span className="text-base font-normal text-white/35">({data?.total ?? 0})</span>}
        </h1>
        <Button
          onClick={() => setIsAdding(true)}
          className="cursor-pointer gap-2 rounded-full bg-[#C00018] px-5 py-2.5 text-xs font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-colors hover:bg-[#A80015]"
        >
          <Plus className="h-4 w-4" strokeWidth={ICON_STROKE} />
          <span>Add Vendor</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ===== Master: vendor list ===== */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] lg:col-span-5">
          <div className="border-b border-white/[0.08] p-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" strokeWidth={ICON_STROKE} />
              <Input
                placeholder="Search vendors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-full border-white/10 bg-white/[0.04] pl-9 text-xs text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-[#C00018]/60"
              />
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="p-10 text-center text-sm text-white/35">
                No vendors found. Click "+ Add Vendor" to register vendors or import a .csv file.
              </div>
            ) : (
              vendors.map((v) => {
                const active = v.vendorId === selected;
                return (
                  <button
                    key={v.vendorId}
                    type="button"
                    onClick={() => {
                      setSelected(v.vendorId);
                      setIsEditing(false);
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 border-b border-white/[0.05] px-5 py-3 text-left transition-colors duration-200 last:border-b-0',
                      active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold',
                        active
                          ? 'border-[#C00018] bg-[#C00018]/15 text-red-300'
                          : 'border-white/10 bg-white/[0.04] text-white/40',
                      )}
                    >
                      {v.vendorId.replace('V-', '')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-white/90">{v.legalName}</div>
                      <div className="truncate font-mono text-[10px] text-white/30">{v.registeredDomain}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold tabular-nums text-white">
                        {formatCurrency(v.amountMean ?? 0, 'USD')}
                      </div>
                      <div className="font-mono text-[10px] tabular-nums text-white/30">
                        μ over {v.paymentCount ?? 0} payments
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ===== Detail: vendor inspector ===== */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-white/30">
              Loading vendor…
            </div>
          ) : vendorDetail?.vendor ? (
            <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#0B0B0E] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              {/* Inspector header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
                    <Building2 className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-white">
                      {vendorDetail.vendor.legalName}
                    </h2>
                    <p className="font-mono text-xs text-white/35">
                      {selected} · {vendorDetail.vendor.registeredDomain}
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="h-8 cursor-pointer gap-1.5 rounded-full border-white/10 text-xs font-bold text-white/70 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    Edit vendor
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="h-8 cursor-pointer gap-1 rounded-full border-white/10 text-xs font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white"
                    >
                      <X className="h-3 w-3" strokeWidth={ICON_STROKE} />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="h-8 cursor-pointer gap-1.5 rounded-full bg-white text-xs font-bold text-black hover:bg-white/85"
                    >
                      <Save className="h-3 w-3" strokeWidth={ICON_STROKE} />
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Edit form / metadata */}
              {isEditing ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-sky-400/25 bg-sky-400/[0.05] p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                      [
                        ['Legal Name', 'legalName', 'text'],
                        ['Registered Domain', 'registeredDomain', 'font-mono'],
                        ['Phone', 'knownPhone', 'font-mono'],
                        ['Bank Account', 'knownBankAccount', 'font-mono'],
                      ] as const
                    ).map(([label, key, mono]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-white/55">{label}</label>
                        <Input
                          value={editForm[key]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                          className={cn('h-8 rounded-xl border-white/10 bg-white/[0.04] text-xs text-white', mono)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <DetailField
                    icon={<Phone className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Verified phone"
                    value={vendorDetail.vendor.knownPhone}
                  />
                  <DetailField
                    icon={<Landmark className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Bank (known)"
                    value={maskedBank(vendorDetail.vendor.knownBankAccount)}
                  />
                  <DetailField
                    icon={<CalendarDays className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Bank added"
                    value={vendorDetail.vendor.bankAccountAddedDate}
                  />
                  <DetailField
                    icon={<ReceiptText className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="First invoice"
                    value={vendorDetail.vendor.firstInvoiceDate}
                  />
                  <DetailField
                    icon={<Building2 className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Payments"
                    value={String(vendorDetail.payments.length || vendorDetail.vendor.paymentCount || 0)}
                  />
                  <DetailField
                    icon={<Sigma className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                    label="Amount μ / σ"
                    value={`${vendorDetail.vendor.amountMean ? Number(vendorDetail.vendor.amountMean).toFixed(2) : '0.00'} / ${vendorDetail.vendor.amountStd ? Number(vendorDetail.vendor.amountStd).toFixed(2) : '0.00'}`}
                  />
                </div>
              )}

              {/* Payment history chart */}
              <div>
                <h3 className="mb-2 text-xs font-bold text-white/85">Payment history baseline</h3>
                <div className="h-44 w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="vendorPayFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                          axisLine={false}
                          tickLine={false}
                          width={52}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                          cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
                          contentStyle={{
                            background: 'rgba(11,11,14,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            fontSize: 12,
                            color: '#fff',
                          }}
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#38bdf8"
                          strokeWidth={2}
                          fill="url(#vendorPayFill)"
                          dot={{ r: 2.5, fill: '#38bdf8', strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/30">
                      No payment history recorded for this vendor.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent payments */}
              <div>
                <h3 className="mb-2 text-xs font-bold text-white/85">Recent payment records</h3>
                {vendorDetail.payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-xs text-white/30">
                    No payment records — first-time vendors have no baseline yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                    <table className="w-full text-xs">
                      <thead className="bg-white/[0.03]">
                        <tr>
                          {['PAYMENT', 'INVOICE', 'DATE', 'AMOUNT', 'CUR'].map((h, i) => (
                            <th
                              key={h}
                              className={cn(
                                'px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/35',
                                i === 3 ? 'text-right' : 'text-left',
                              )}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {vendorDetail.payments.slice(0, 8).map((p) => (
                          <tr key={p.paymentId} className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.03]">
                            <td className="px-3 py-2.5 font-bold text-white/85">{p.paymentId}</td>
                            <td className="px-3 py-2.5 text-white/35">{p.invoiceNumber}</td>
                            <td className="px-3 py-2.5 font-medium text-white/55">{p.paidDate}</td>
                            <td className="px-3 py-2.5 text-right font-bold tabular-nums text-white">
                              ${Number(p.amountUsd).toFixed(2)}
                            </td>
                            <td className="px-3 py-2.5 text-white/45">{p.currencyOriginal || 'USD'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            selected && (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-white/30">
                Select a vendor to inspect its grounding profile.
              </div>
            )
          )}
        </div>
      </div>

      {/* Add Vendor dialog (single / CSV bulk) */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#0B0B0E] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Building2 className="h-4 w-4 text-sky-300" strokeWidth={ICON_STROKE} />
              Register new vendor
            </DialogTitle>
            <DialogDescription className="text-xs text-white/45">
              Add single vendor details or import a full .csv vendor database.
            </DialogDescription>
          </DialogHeader>

          {/* Mode switcher */}
          <div className="my-1 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className={cn(
                'cursor-pointer select-none rounded-full py-1.5 transition-all duration-300',
                addMode === 'single' ? 'bg-white text-black' : 'text-white/45 hover:text-white',
              )}
            >
              Single entry
            </button>
            <button
              type="button"
              onClick={() => setAddMode('csv')}
              className={cn(
                'flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-full py-1.5 transition-all duration-300',
                addMode === 'csv' ? 'bg-white text-black' : 'text-white/45 hover:text-white',
              )}
            >
              <Upload className={cn('h-3.5 w-3.5', addMode === 'csv' ? 'text-black/60' : 'text-sky-300')} strokeWidth={ICON_STROKE} />
              Bulk CSV import
            </button>
          </div>

          {addMode === 'single' ? (
            <div className="flex flex-col gap-3 pt-2">
              {(
                [
                  ['Legal Company Name *', 'legalName', 'e.g. Apex Industrial Solutions', 'text'],
                  ['Registered Domain *', 'registeredDomain', 'e.g. apex-industrial.com', 'font-mono'],
                  ['Verified Phone Number', 'knownPhone', 'e.g. +1 (555) 019-2831', 'font-mono'],
                  ['Known Bank Account', 'knownBankAccount', 'e.g. 9876543210', 'font-mono'],
                  ['Contact Email', 'contactEmail', 'e.g. ap@apex-industrial.com', 'text'],
                ] as const
              ).map(([label, key, placeholder, mono]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/60">{label}</label>
                  <Input
                    placeholder={placeholder}
                    value={addForm[key]}
                    onChange={(e) => setAddForm((f) => ({ ...f, [key]: e.target.value }))}
                    className={cn(
                      'h-9 rounded-xl border-white/10 bg-white/[0.04] text-xs text-white placeholder:text-white/25',
                      mono,
                    )}
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="h-8 cursor-pointer rounded-full text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddVendor}
                  disabled={saving}
                  className="h-8 cursor-pointer gap-1.5 rounded-full bg-[#C00018] text-xs font-bold text-white hover:bg-[#A80015]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  {saving ? 'Saving…' : 'Add vendor'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <label
                htmlFor="vendor-csv-input"
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition-all duration-300 hover:border-sky-400/50 hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sky-300">
                  <FileText className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white/85">
                    {csvFile ? csvFile.name : 'Click to select or drop vendor .csv file'}
                  </span>
                  <span className="text-[10px] font-medium text-white/35">
                    Supports vendor_master.csv with legalName, domain, phone, bank columns
                  </span>
                </div>
                <input
                  id="vendor-csv-input"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvSelect}
                  className="hidden"
                />
              </label>

              {parsedCsvVendors.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-xs font-bold text-emerald-300">
                  <span>Detected {parsedCsvVendors.length} valid vendor records</span>
                  <span className="text-[10px] font-normal text-emerald-300/60">Ready to import</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="h-8 cursor-pointer rounded-full text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImportCsv}
                  disabled={saving || !parsedCsvVendors.length}
                  className="h-8 cursor-pointer gap-1.5 rounded-full bg-[#C00018] text-xs font-bold text-white hover:bg-[#A80015]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  {saving ? 'Importing…' : `Import ${parsedCsvVendors.length} vendors`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

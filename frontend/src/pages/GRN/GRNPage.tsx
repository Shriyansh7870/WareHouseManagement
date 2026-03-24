import React, { useState } from 'react';
import { Plus, Eye, CheckCircle, XCircle, Download, GitBranch, Printer } from 'lucide-react';
import BatchTraceModal from '../../components/ui/BatchTraceModal';
import { printTable } from '../../utils/printUtils';
import { exportToCSV } from '../../utils/csvExport';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/formatters';
import type { GRNStatus } from '../../types/grn.types';

const grnSchema = z.object({
  vendorName: z.string().min(1, 'Supplier is required'),
  poRef: z.string().min(1, 'PO Reference is required'),
  itemName: z.string().min(1, 'Item name is required'),
  itemCode: z.string().min(1, 'Item code is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  qtyReceived: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  mfgDate: z.string().min(1, 'Mfg date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  vehicleLR: z.string().optional(),
  storageLocation: z.string().min(1, 'Storage location is required'),
  remarks: z.string().optional(),
});

type GRNForm = z.infer<typeof grnSchema>;

const GRN_KPIS = [
  { label: 'GRNs This Month', value: '12', sub: '+3 vs last month', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'Pending QA Inspection', value: '4', sub: 'Awaiting clearance', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Quarantine Hold', value: '2', sub: 'Pending QA decision', trend: 'warn' as const, accentColor: 'red' as const },
  { label: 'Rejection Rate FY', value: '3.6%', sub: '5 batches rejected', trend: 'down' as const, accentColor: 'green' as const },
];

function grnStatusVariant(s: GRNStatus) {
  switch (s) {
    case 'APPROVED': return 'ok' as const;
    case 'QUARANTINE': return 'purple' as const;
    case 'REJECTED': return 'danger' as const;
    case 'ON_HOLD': return 'warn' as const;
    case 'PENDING_QA': return 'blue' as const;
    default: return 'gray' as const;
  }
}

function NewGRNModal({ onClose }: { onClose: () => void }) {
  const { addGRN, addInventoryItem } = useDataStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GRNForm>({
    resolver: zodResolver(grnSchema),
    defaultValues: { unit: 'units', storageLocation: 'Main Store' },
  });

  const onSubmit = async (data: GRNForm) => {
    await new Promise(r => setTimeout(r, 400));
    const id = `grn-${Date.now()}`;
    const grnNumber = `GRN-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    addGRN({
      id,
      grnNumber,
      vendorId: 'v-new',
      vendorName: data.vendorName,
      itemName: data.itemName,
      itemCode: data.itemCode,
      batchNumber: data.batchNumber,
      qtyReceived: data.qtyReceived,
      unit: data.unit,
      mfgDate: data.mfgDate,
      expiryDate: data.expiryDate,
      vehicleLR: data.vehicleLR,
      storageLocation: data.storageLocation,
      receivedByName: 'Rahul Mehta',
      status: 'PENDING_QA',
      coaLinked: false,
      remarks: data.remarks,
      createdAt: new Date().toISOString(),
    });

    addInventoryItem({
      id: `inv-${Date.now()}`,
      itemCode: data.itemCode,
      itemName: data.itemName,
      category: 'FINISHED_GOODS',
      batchNumber: data.batchNumber,
      mfgDate: data.mfgDate,
      expiryDate: data.expiryDate,
      qtyOnHand: data.qtyReceived,
      unit: data.unit,
      reorderLevel: 1000,
      storageLocation: data.storageLocation,
      siteCode: 'MH-SITE-01',
      qaStatus: 'PENDING_QA',
      grnId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    toast.success(`GRN ${grnNumber} created successfully`);
    onClose();
  };

  const Field = ({ label, name, type = 'text', placeholder, required = true }: { label: string; name: keyof GRNForm; type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30 ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
      />
      {errors[name] && <p className="text-[11px] text-red-500 mt-0.5">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <Modal
      title="Create New GRN"
      width="680px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Submit GRN
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Supplier <span className="text-red-500">*</span></label>
          <select {...register('vendorName')} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30 ${errors.vendorName ? 'border-red-400' : 'border-gray-200'}`}>
            <option value="">Select supplier</option>
            {['Cipla Ltd.', 'Sun Pharma', 'Lupin Ltd.', "Dr. Reddy's", 'Aurobindo', 'Zydus Cadila'].map(o => <option key={o}>{o}</option>)}
          </select>
          {errors.vendorName && <p className="text-[11px] text-red-500 mt-0.5">{errors.vendorName.message}</p>}
        </div>
        <Field label="PO Reference" name="poRef" placeholder="PO-2024-XXXX" />
        <Field label="Item Name" name="itemName" placeholder="e.g. Paracetamol 500mg" />
        <Field label="Item Code" name="itemCode" placeholder="e.g. PARA-B2847" />
        <Field label="Batch Number" name="batchNumber" placeholder="Batch no." />
        <Field label="Qty Received" name="qtyReceived" type="number" placeholder="0" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Unit <span className="text-red-500">*</span></label>
          <select {...register('unit')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30">
            {['units', 'kg', 'liters', 'meters'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <Field label="Mfg Date" name="mfgDate" type="date" />
        <Field label="Expiry Date" name="expiryDate" type="date" />
        <Field label="Vehicle / LR No." name="vehicleLR" placeholder="MH-XX-AB-1234" required={false} />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Storage Location <span className="text-red-500">*</span></label>
          <select {...register('storageLocation')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30">
            {['Main Store', 'Cold Room A', 'Cold Room B', 'Raw Material Store', 'Quarantine Zone'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Remarks</label>
          <textarea {...register('remarks')} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30 resize-none" placeholder="Optional remarks..." />
        </div>
        <div className="col-span-2 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400 cursor-pointer hover:border-[#6c63ff] hover:text-[#6c63ff] transition-colors">
          Click to upload CoA (PDF/DOCX, max 25MB)
        </div>
      </div>
    </Modal>
  );
}

const TABS = [
  { id: 'register', label: 'GRN Register' },
  { id: 'asn', label: 'Pending ASNs' },
  { id: 'create', label: '+ New GRN' },
];

const PAGE_SIZE = 15;

export default function GRNPage() {
  const [tab, setTab] = useState('register');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewGRN, setShowNewGRN] = useState(false);
  const [page, setPage] = useState(0);
  const [viewGRN, setViewGRN] = useState<import('../../types/grn.types').GRN | null>(null);
  const [traceBatch, setTraceBatch] = useState<string | null>(null);
  const { grns, asns } = useDataStore();

  const filtered = grns.filter(g => {
    if (search) {
      const q = search.toLowerCase();
      const match = g.grnNumber.toLowerCase().includes(q) || (g.vendorName ?? '').toLowerCase().includes(q) || g.itemName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter && g.status !== statusFilter) return false;
    if (dateFrom && g.createdAt < dateFrom) return false;
    if (dateTo && g.createdAt > dateTo + 'T23:59:59') return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2">
        {GRN_KPIS.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={id => { setTab(id); if (id === 'create') { setShowNewGRN(true); setTab('register'); } }} />
        <Button variant="primary" size="sm" onClick={() => setShowNewGRN(true)}>
          <Plus size={13} /> New GRN
        </Button>
      </div>

      {tab === 'register' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <SearchBox value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search GRN, supplier, item..." className="w-64" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">From</span>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40"
              />
              <span className="text-xs text-gray-400">To</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40"
              />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40"
            >
              <option value="">All Status</option>
              {['PENDING_QA', 'APPROVED', 'QUARANTINE', 'REJECTED', 'ON_HOLD'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {(dateFrom || dateTo || statusFilter) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter(''); setPage(0); }}
                className="text-xs text-purple-600 hover:text-purple-800 underline"
              >Clear filters</button>
            )}
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={() => exportToCSV(
                filtered.map(g => ({
                  'GRN Number': g.grnNumber,
                  'Date': formatDate(g.createdAt),
                  'Supplier': g.vendorName ?? '',
                  'Item Name': g.itemName,
                  'Item Code': g.itemCode,
                  'Batch No': g.batchNumber,
                  'Qty Received': g.qtyReceived,
                  'Unit': g.unit,
                  'Mfg Date': g.mfgDate,
                  'Expiry Date': g.expiryDate,
                  'Vehicle / LR': g.vehicleLR ?? '',
                  'Storage Location': g.storageLocation,
                  'Received By': g.receivedByName ?? '',
                  'QA Status': g.status,
                  'CoA Linked': g.coaLinked ? 'Yes' : 'No',
                  'Remarks': g.remarks ?? '',
                })),
                'grn-register'
              )}>
                <Download size={13} /> Download CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={() => printTable({
                title: 'GRN Register',
                subtitle: `Date range: ${dateFrom || 'All'} – ${dateTo || 'All'} | Status: ${statusFilter || 'All'} | ${filtered.length} records`,
                headers: ['GRN No.', 'Date', 'Supplier', 'Item', 'Batch No.', 'Qty', 'Unit', 'Expiry', 'Location', 'Status', 'CoA'],
                rows: filtered.map(g => [g.grnNumber, formatDate(g.createdAt), g.vendorName ?? '', g.itemName, g.batchNumber, g.qtyReceived, g.unit, g.expiryDate, g.storageLocation, g.status, g.coaLinked ? 'Yes' : 'No']),
                orientation: 'landscape',
              })}>
                <Printer size={13} /> Print
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['GRN No.', 'Date', 'Supplier', 'Item', 'Batch No.', 'Qty', 'Expiry', 'Vehicle / LR', 'Received By', 'QA Status', 'CoA', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map(grn => (
                  <tr key={grn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#6c63ff] font-semibold">{grn.grnNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(grn.createdAt)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{grn.vendorName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{grn.itemName}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setTraceBatch(grn.batchNumber)} className="font-mono text-xs text-[#6c63ff] hover:underline flex items-center gap-1" title="View batch traceability">
                        {grn.batchNumber} <GitBranch size={10} />
                      </button>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{grn.qtyReceived.toLocaleString()} <span className="text-gray-400 font-normal">{grn.unit}</span></td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(grn.expiryDate)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{grn.vehicleLR ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{grn.receivedByName}</td>
                    <td className="px-3 py-2.5"><Badge variant={grnStatusVariant(grn.status)}>{grn.status.replace('_', ' ')}</Badge></td>
                    <td className="px-3 py-2.5">
                      {grn.coaLinked
                        ? <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={11} /> Yes</span>
                        : <span className="text-red-500 text-xs flex items-center gap-1"><XCircle size={11} /> No</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setViewGRN(grn)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`px-3 py-1 text-xs border rounded ${page === i ? 'border-[#6c63ff] text-[#6c63ff] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'asn' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Pending Advance Shipment Notices</h3>
            <Button variant="primary" size="sm"><Plus size={13} /> New ASN</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['ASN No.', 'Supplier', 'PO Reference', 'Item', 'Expected Qty', 'ETA', 'Vehicle', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {asns.map(asn => (
                  <tr key={asn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#6c63ff] font-semibold">{asn.asnNumber}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{asn.vendorName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{asn.poReference ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{asn.itemName ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{asn.expectedQty?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{asn.expectedDelivery ? formatDate(asn.expectedDelivery) : '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{asn.vehicleLR ?? '—'}</td>
                    <td className="px-3 py-2.5"><Badge variant={asn.status === 'PENDING' ? 'warn' : asn.status === 'RECEIVED' ? 'ok' : 'blue'}>{asn.status}</Badge></td>
                    <td className="px-3 py-2.5"><Button variant="primary" size="sm" onClick={() => setShowNewGRN(true)}>Create GRN</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewGRN && (
        <Modal title={`GRN Details — ${viewGRN.grnNumber}`} onClose={() => setViewGRN(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['GRN Number', viewGRN.grnNumber], ['Date', formatDate(viewGRN.createdAt)],
              ['Supplier', viewGRN.vendorName], ['Item Name', viewGRN.itemName],
              ['Item Code', viewGRN.itemCode], ['Batch Number', viewGRN.batchNumber],
              ['Qty Received', `${viewGRN.qtyReceived.toLocaleString()} ${viewGRN.unit}`],
              ['Mfg Date', formatDate(viewGRN.mfgDate)], ['Expiry Date', formatDate(viewGRN.expiryDate)],
              ['Vehicle / LR', viewGRN.vehicleLR ?? '—'], ['Storage Location', viewGRN.storageLocation],
              ['Received By', viewGRN.receivedByName], ['QA Status', viewGRN.status],
              ['CoA Linked', viewGRN.coaLinked ? 'Yes' : 'No'], ['Remarks', viewGRN.remarks ?? '—'],
            ].map(([l, v]) => (
              <div key={String(l)}>
                <div className="text-xs text-gray-500 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{String(v ?? '—')}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showNewGRN && <NewGRNModal onClose={() => setShowNewGRN(false)} />}
      {traceBatch && <BatchTraceModal batchNumber={traceBatch} onClose={() => setTraceBatch(null)} />}
    </div>
  );
}

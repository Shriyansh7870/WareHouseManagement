import React, { useState } from 'react';
import { Plus, Eye, CheckCircle, XCircle, Download, GitBranch, Printer, Upload } from 'lucide-react';
import BatchTraceModal from '../../components/ui/BatchTraceModal';
import { printTable } from '../../utils/printUtils';
import { exportToCSV } from '../../utils/csvExport';
import toast from 'react-hot-toast';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/formatters';
import { CATEGORY_LABELS, STORAGE_LOCATIONS, SITE_CODES } from '../../utils/constants';
import { MOCK_VENDORS } from '../../utils/mockData';
import type { GRNStatus } from '../../types/grn.types';
import type { ItemCategory } from '../../types/inventory.types';

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

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

function NewGRNModal({ onClose }: { onClose: () => void }) {
  const { addGRN, addInventoryItem } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    vendorName: '',
    poRef: '',
    itemName: '',
    itemCode: '',
    category: '' as ItemCategory | '',
    batchNumber: '',
    qtyReceived: '',
    unit: 'KG',
    mfgDate: '',
    expiryDate: '',
    vehicleLR: '',
    storageLocation: '',
    siteCode: '',
    receivedBy: '',
    remarks: '',
  });

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.vendorName) errs.vendorName = 'Supplier is required';
    if (!form.poRef.trim()) errs.poRef = 'PO Reference is required';
    if (!form.itemName.trim()) errs.itemName = 'Item Name is required';
    if (!form.itemCode.trim()) errs.itemCode = 'Item Code is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.batchNumber.trim()) errs.batchNumber = 'Batch Number is required';
    if (!form.qtyReceived || parseFloat(form.qtyReceived) <= 0) errs.qtyReceived = 'Quantity must be positive';
    if (!form.mfgDate) errs.mfgDate = 'Manufacturing Date is required';
    if (!form.expiryDate) errs.expiryDate = 'Expiry Date is required';
    if (form.mfgDate && form.expiryDate && form.expiryDate <= form.mfgDate) errs.expiryDate = 'Expiry must be after Mfg Date';
    if (!form.storageLocation) errs.storageLocation = 'Storage Location is required';
    if (!form.siteCode) errs.siteCode = 'Site Code is required';
    if (!form.receivedBy.trim()) errs.receivedBy = 'Received By is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fill all required fields');
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const id = `grn-${Date.now()}`;
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const selectedVendor = MOCK_VENDORS.find((v) => v.companyName === form.vendorName);

    addGRN({
      id,
      grnNumber,
      vendorId: selectedVendor?.id ?? 'v-new',
      vendorName: form.vendorName,
      itemName: form.itemName.trim(),
      itemCode: form.itemCode.trim().toUpperCase(),
      batchNumber: form.batchNumber.trim().toUpperCase(),
      qtyReceived: parseFloat(form.qtyReceived),
      unit: form.unit,
      mfgDate: form.mfgDate,
      expiryDate: form.expiryDate,
      vehicleLR: form.vehicleLR || undefined,
      storageLocation: form.storageLocation,
      receivedByName: form.receivedBy.trim(),
      status: 'PENDING_QA',
      coaLinked: false,
      remarks: form.remarks || undefined,
      createdAt: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    addInventoryItem({
      id: `inv-${Date.now()}`,
      itemCode: form.itemCode.trim().toUpperCase(),
      itemName: form.itemName.trim(),
      category: form.category as ItemCategory,
      batchNumber: form.batchNumber.trim().toUpperCase(),
      mfgDate: form.mfgDate,
      expiryDate: form.expiryDate,
      qtyOnHand: parseFloat(form.qtyReceived),
      unit: form.unit,
      reorderLevel: 0,
      storageLocation: form.storageLocation,
      siteCode: form.siteCode,
      qaStatus: 'PENDING_QA',
      grnId: id,
      createdAt: now,
      updatedAt: now,
    });

    toast.success(`GRN ${grnNumber} created successfully`);
    setSaving(false);
    onClose();
  };

  const hasErr = (field: string) => !!errors[field];

  return (
    <Modal
      title="Create New Goods Receipt (GRN)"
      width="780px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            Submit GRN
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Section 1: Supplier & PO */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Supplier & Purchase Order</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Supplier / Vendor <span className="text-red-500">*</span></label>
              <select value={form.vendorName} onChange={(e) => set('vendorName', e.target.value)} className={hasErr('vendorName') ? inputErrCls : inputCls}>
                <option value="">Select supplier</option>
                {MOCK_VENDORS.map((v) => (
                  <option key={v.id} value={v.companyName}>{v.companyName} ({v.vendorCode})</option>
                ))}
              </select>
              {errors.vendorName && <p className="text-[11px] text-red-500 mt-0.5">{errors.vendorName}</p>}
            </div>
            <div>
              <label className={labelCls}>PO Reference <span className="text-red-500">*</span></label>
              <input type="text" value={form.poRef} onChange={(e) => set('poRef', e.target.value)} placeholder="e.g. PO-2026-0045" className={hasErr('poRef') ? inputErrCls : inputCls} />
              {errors.poRef && <p className="text-[11px] text-red-500 mt-0.5">{errors.poRef}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Item Details */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Item Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Item Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.itemName} onChange={(e) => set('itemName', e.target.value)} placeholder="e.g. Paracetamol 500mg" className={hasErr('itemName') ? inputErrCls : inputCls} />
              {errors.itemName && <p className="text-[11px] text-red-500 mt-0.5">{errors.itemName}</p>}
            </div>
            <div>
              <label className={labelCls}>Item Code <span className="text-red-500">*</span></label>
              <input type="text" value={form.itemCode} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. PARA-B2847" className={hasErr('itemCode') ? inputErrCls : inputCls} />
              {errors.itemCode && <p className="text-[11px] text-red-500 mt-0.5">{errors.itemCode}</p>}
            </div>
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={hasErr('category') ? inputErrCls : inputCls}>
                <option value="">Select Category</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {errors.category && <p className="text-[11px] text-red-500 mt-0.5">{errors.category}</p>}
            </div>
            <div>
              <label className={labelCls}>Batch Number <span className="text-red-500">*</span></label>
              <input type="text" value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)} placeholder="e.g. BATCH-2026-001" className={hasErr('batchNumber') ? inputErrCls : inputCls} />
              {errors.batchNumber && <p className="text-[11px] text-red-500 mt-0.5">{errors.batchNumber}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Quantity */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quantity Received</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.qtyReceived} onChange={(e) => set('qtyReceived', e.target.value)} placeholder="e.g. 5000" className={hasErr('qtyReceived') ? inputErrCls : inputCls} />
              {errors.qtyReceived && <p className="text-[11px] text-red-500 mt-0.5">{errors.qtyReceived}</p>}
            </div>
            <div>
              <label className={labelCls}>Unit <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputCls}>
                {['KG', 'L', 'Units', 'Boxes', 'Packs', 'Bottles', 'Drums', 'Bags'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Dates */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Manufacturing & Expiry Dates</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Manufacturing Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.mfgDate} onChange={(e) => set('mfgDate', e.target.value)} className={hasErr('mfgDate') ? inputErrCls : inputCls} />
              {errors.mfgDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.mfgDate}</p>}
            </div>
            <div>
              <label className={labelCls}>Expiry Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={hasErr('expiryDate') ? inputErrCls : inputCls} />
              {errors.expiryDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.expiryDate}</p>}
            </div>
          </div>
        </div>

        {/* Section 5: Storage & Logistics */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Storage & Logistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Storage Location <span className="text-red-500">*</span></label>
              <select value={form.storageLocation} onChange={(e) => set('storageLocation', e.target.value)} className={hasErr('storageLocation') ? inputErrCls : inputCls}>
                <option value="">Select Location</option>
                {STORAGE_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              {errors.storageLocation && <p className="text-[11px] text-red-500 mt-0.5">{errors.storageLocation}</p>}
            </div>
            <div>
              <label className={labelCls}>Site Code <span className="text-red-500">*</span></label>
              <select value={form.siteCode} onChange={(e) => set('siteCode', e.target.value)} className={hasErr('siteCode') ? inputErrCls : inputCls}>
                <option value="">Select Site</option>
                {SITE_CODES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.siteCode && <p className="text-[11px] text-red-500 mt-0.5">{errors.siteCode}</p>}
            </div>
            <div>
              <label className={labelCls}>Vehicle / LR No.</label>
              <input type="text" value={form.vehicleLR} onChange={(e) => set('vehicleLR', e.target.value)} placeholder="e.g. MH-12-AB-1234" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Received By <span className="text-red-500">*</span></label>
              <input type="text" value={form.receivedBy} onChange={(e) => set('receivedBy', e.target.value)} placeholder="Name of receiving person" className={hasErr('receivedBy') ? inputErrCls : inputCls} />
              {errors.receivedBy && <p className="text-[11px] text-red-500 mt-0.5">{errors.receivedBy}</p>}
            </div>
          </div>
        </div>

        {/* Section 6: Remarks & CoA */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Additional Information</h4>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Remarks</label>
              <textarea value={form.remarks} onChange={(e) => set('remarks', e.target.value)} rows={3} placeholder="Any additional notes about this goods receipt..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Certificate of Analysis (CoA)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:border-[#D4A847] hover:bg-[#D4A847]/5 transition-colors group">
                <Upload size={20} className="mx-auto mb-2 text-gray-300 group-hover:text-[#D4A847] transition-colors" />
                <p className="text-xs text-gray-400 group-hover:text-[#D4A847] transition-colors">Click to upload CoA document</p>
                <p className="text-[10px] text-gray-300 mt-1">PDF, DOCX, JPG — Max 25MB</p>
              </div>
            </div>
          </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4A847]/40"
              />
              <span className="text-xs text-gray-400">To</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4A847]/40"
              />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4A847]/40"
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
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{grn.grnNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(grn.createdAt)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{grn.vendorName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{grn.itemName}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setTraceBatch(grn.batchNumber)} className="font-mono text-xs text-[#D4A847] hover:underline flex items-center gap-1" title="View batch traceability">
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
                <button key={i} onClick={() => setPage(i)} className={`px-3 py-1 text-xs border rounded ${page === i ? 'border-[#D4A847] text-[#D4A847] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
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
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{asn.asnNumber}</td>
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

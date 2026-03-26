import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw, Eye, Download, GitBranch, Printer, Edit3 } from 'lucide-react';
import { printTable } from '../../utils/printUtils';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/csvExport';
import AlertBanner from '../../components/ui/AlertBanner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBox from '../../components/ui/SearchBox';
import Modal from '../../components/ui/Modal';
import BatchTraceModal from '../../components/ui/BatchTraceModal';
import { useDataStore } from '../../store/dataStore';
import { formatDate, daysToExpiry } from '../../utils/formatters';
import { CATEGORY_LABELS, QA_STATUS_LABELS, SITE_CODES, STORAGE_LOCATIONS } from '../../utils/constants';
import type { InventoryItem, QAStatus, ItemCategory } from '../../types/inventory.types';

function qaVariant(status: QAStatus) {
  switch (status) {
    case 'APPROVED': return 'ok' as const;
    case 'QUARANTINE': return 'purple' as const;
    case 'REJECTED': return 'danger' as const;
    case 'ON_HOLD': return 'warn' as const;
    case 'PENDING_QA': return 'blue' as const;
    default: return 'gray' as const;
  }
}

function expiryVariant(days: number) {
  if (days <= 30) return 'danger' as const;
  if (days <= 60) return 'warn' as const;
  return 'ok' as const;
}

interface ViewModalProps {
  item: InventoryItem;
  onClose: () => void;
}

function ViewItemModal({ item, onClose }: ViewModalProps) {
  const days = daysToExpiry(item.expiryDate);
  return (
    <Modal title={`${item.itemName} — ${item.batchNumber}`} onClose={onClose} width="640px">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {[
          ['Item Code', item.itemCode],
          ['Item Name', item.itemName],
          ['Category', CATEGORY_LABELS[item.category] ?? item.category],
          ['Batch No.', item.batchNumber],
          ['Mfg Date', formatDate(item.mfgDate)],
          ['Expiry Date', formatDate(item.expiryDate)],
          ['Days to Expiry', `${days} days`],
          ['Qty on Hand', `${item.qtyOnHand.toLocaleString()} ${item.unit}`],
          ['Reorder Level', `${item.reorderLevel.toLocaleString()} ${item.unit}`],
          ['Storage Location', item.storageLocation],
          ['Site Code', item.siteCode],
          ['QA Status', QA_STATUS_LABELS[item.qaStatus] ?? item.qaStatus],
        ].map(([l, v]) => (
          <div key={String(l)}>
            <div className="text-xs text-gray-500 mb-0.5">{l}</div>
            <div className="font-medium text-gray-800">{v}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─── Form Input Helper ─── */
const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

/* ─── Add Item Modal ─── */
function AddItemModal({ onClose }: { onClose: () => void }) {
  const { addInventoryItem } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    itemCode: '',
    itemName: '',
    category: '' as ItemCategory | '',
    batchNumber: '',
    mfgDate: '',
    expiryDate: '',
    qtyOnHand: '',
    unit: 'KG',
    reorderLevel: '',
    storageLocation: '',
    siteCode: '',
    qaStatus: 'PENDING_QA' as QAStatus,
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    // Validation
    if (!form.itemCode.trim()) { toast.error('Item Code is required'); return; }
    if (!form.itemName.trim()) { toast.error('Item Name is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }
    if (!form.batchNumber.trim()) { toast.error('Batch Number is required'); return; }
    if (!form.mfgDate) { toast.error('Manufacturing Date is required'); return; }
    if (!form.expiryDate) { toast.error('Expiry Date is required'); return; }
    if (form.expiryDate <= form.mfgDate) { toast.error('Expiry Date must be after Manufacturing Date'); return; }
    if (!form.qtyOnHand || parseFloat(form.qtyOnHand) < 0) { toast.error('Quantity must be 0 or more'); return; }
    if (!form.storageLocation) { toast.error('Storage Location is required'); return; }
    if (!form.siteCode) { toast.error('Site Code is required'); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: `INV-${Date.now()}`,
      itemCode: form.itemCode.trim().toUpperCase(),
      itemName: form.itemName.trim(),
      category: form.category as ItemCategory,
      batchNumber: form.batchNumber.trim().toUpperCase(),
      mfgDate: form.mfgDate,
      expiryDate: form.expiryDate,
      qtyOnHand: parseFloat(form.qtyOnHand),
      unit: form.unit,
      reorderLevel: form.reorderLevel ? parseFloat(form.reorderLevel) : 0,
      storageLocation: form.storageLocation,
      siteCode: form.siteCode,
      qaStatus: form.qaStatus,
      createdAt: now,
      updatedAt: now,
    };

    addInventoryItem(newItem);
    toast.success(`Item "${newItem.itemName}" added to inventory`);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      title="Add New Inventory Item"
      onClose={onClose}
      width="720px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Add Item</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Section: Basic Info */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Item Code <span className="text-red-500">*</span></label>
              <input type="text" value={form.itemCode} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. RM-0045" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Item Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.itemName} onChange={(e) => set('itemName', e.target.value)} placeholder="e.g. Paracetamol API" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                <option value="">Select Category</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Batch Number <span className="text-red-500">*</span></label>
              <input type="text" value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)} placeholder="e.g. BATCH-2026-001" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section: Dates */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dates</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Manufacturing Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.mfgDate} onChange={(e) => set('mfgDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expiry Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section: Quantity & Storage */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quantity & Storage</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity on Hand <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.qtyOnHand} onChange={(e) => set('qtyOnHand', e.target.value)} placeholder="e.g. 5000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Unit <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputClass}>
                {['KG', 'L', 'Units', 'Boxes', 'Packs', 'Bottles', 'Drums', 'Bags'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Reorder Level</label>
              <input type="number" min="0" value={form.reorderLevel} onChange={(e) => set('reorderLevel', e.target.value)} placeholder="e.g. 500" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Storage Location <span className="text-red-500">*</span></label>
              <select value={form.storageLocation} onChange={(e) => set('storageLocation', e.target.value)} className={inputClass}>
                <option value="">Select Location</option>
                {STORAGE_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Site Code <span className="text-red-500">*</span></label>
              <select value={form.siteCode} onChange={(e) => set('siteCode', e.target.value)} className={inputClass}>
                <option value="">Select Site</option>
                {SITE_CODES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>QA Status</label>
              <select value={form.qaStatus} onChange={(e) => set('qaStatus', e.target.value)} className={inputClass}>
                {Object.entries(QA_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Stock Adjustment Modal ─── */
interface StockAdjModalProps {
  item: InventoryItem | null;
  inventory: InventoryItem[];
  onClose: () => void;
}

function StockAdjustmentModal({ item: initialItem, inventory, onClose }: StockAdjModalProps) {
  const { adjustStock } = useDataStore();
  const [selectedItemId, setSelectedItemId] = useState(initialItem?.id ?? '');
  const [type, setType] = useState('POSITIVE');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const selectedItem = inventory.find((i) => i.id === selectedItemId);
  const previewQty = selectedItem && qty && !isNaN(parseFloat(qty))
    ? type === 'POSITIVE'
      ? selectedItem.qtyOnHand + parseFloat(qty)
      : Math.max(0, selectedItem.qtyOnHand - parseFloat(qty))
    : null;

  const handleSave = async () => {
    if (!selectedItemId) { toast.error('Please select an item'); return; }
    const delta = parseFloat(qty);
    if (!qty || isNaN(delta) || delta <= 0) { toast.error('Please enter a valid positive quantity'); return; }
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    if (!adjustmentDate) { toast.error('Adjustment date is required'); return; }
    if (type === 'NEGATIVE' && selectedItem && delta > selectedItem.qtyOnHand) {
      toast.error(`Cannot remove more than current stock (${selectedItem.qtyOnHand} ${selectedItem.unit})`);
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    adjustStock(selectedItemId, delta, type);
    toast.success(`Stock adjusted: ${type === 'POSITIVE' ? '+' : '-'}${delta} ${selectedItem?.unit} for ${selectedItem?.itemName}`);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      title="Stock Adjustment"
      onClose={onClose}
      width="640px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save Adjustment</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        {/* Item Selector */}
        <div>
          <label className={labelClass}>Select Item <span className="text-red-500">*</span></label>
          <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} className={inputClass}>
            <option value="">-- Choose an item --</option>
            {inventory.map((i) => (
              <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName} ({i.batchNumber})</option>
            ))}
          </select>
        </div>

        {/* Current stock info */}
        {selectedItem && (
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Current Qty on Hand</div>
              <div className="font-mono font-bold text-lg">{selectedItem.qtyOnHand.toLocaleString()} {selectedItem.unit}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Location</div>
              <div className="text-sm font-medium text-gray-700">{selectedItem.storageLocation}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Adjustment Type <span className="text-red-500">*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="POSITIVE">Positive (+) — Add Stock</option>
              <option value="NEGATIVE">Negative (−) — Remove Stock</option>
              <option value="WRITE_OFF">Write Off</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
            <input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Enter quantity" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Adjustment Date <span className="text-red-500">*</span></label>
            <input type="date" value={adjustmentDate} onChange={(e) => setAdjustmentDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Reference No.</label>
            <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="e.g. ADJ-2026-001" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Authorized By</label>
          <input type="text" value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)} placeholder="Name of authorizing person" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Reason <span className="text-red-500">*</span></label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for stock adjustment..." className={`${inputClass} resize-none`} />
        </div>

        {/* Preview */}
        {selectedItem && previewQty !== null && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs text-blue-600 font-medium">New Qty After Adjustment</div>
            <div className="font-mono font-bold text-lg text-blue-700">
              {previewQty.toLocaleString()} {selectedItem.unit}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [adjItem, setAdjItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [traceBatch, setTraceBatch] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof InventoryItem>('expiryDate');
  const [sortAsc, setSortAsc] = useState(true);
  const { inventory } = useDataStore();

  const filtered = useMemo(() => {
    let data = [...inventory];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((i) =>
        i.itemName.toLowerCase().includes(q) ||
        i.itemCode.toLowerCase().includes(q) ||
        i.batchNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter((i) => i.qaStatus === statusFilter);
    if (categoryFilter) data = data.filter((i) => i.category === categoryFilter);
    data.sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      return sortAsc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return data;
  }, [search, statusFilter, categoryFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: keyof InventoryItem) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const Th = ({ field, label, w }: { field: keyof InventoryItem; label: string; w?: string }) => (
    <th
      onClick={() => toggleSort(field)}
      className={`px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap ${w ?? ''}`}
    >
      {label} {sortField === field ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Alert */}
      <AlertBanner
        type="warn"
        message="⚠ 4 batch(es) within 30-day expiry window. FEFO enforcement active. Review immediately."
      />

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <SearchBox
          value={search}
          onChange={(v) => { setSearch(v); setPage(0); }}
          placeholder="Search item, batch, code..."
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30"
        >
          <option value="">All Status</option>
          {Object.entries(QA_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => exportToCSV(
            filtered.map(i => ({
              'Item Code': i.itemCode,
              'Item Name': i.itemName,
              'Category': i.category,
              'Batch No': i.batchNumber,
              'Expiry Date': i.expiryDate,
              'Days to Expiry': daysToExpiry(i.expiryDate),
              'Qty on Hand': i.qtyOnHand,
              'Unit': i.unit,
              'Location': i.storageLocation,
              'QA Status': i.qaStatus,
            })),
            'inventory-ledger'
          )}>
            <Download size={13} /> Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => printTable({
            title: 'Inventory Ledger',
            subtitle: `Filtered: ${statusFilter || 'All Statuses'} | ${categoryFilter || 'All Categories'} | ${filtered.length} items`,
            headers: ['Item Code', 'Item Name', 'Category', 'Batch No.', 'Expiry Date', 'Days Left', 'Qty on Hand', 'Unit', 'Location', 'QA Status'],
            rows: filtered.map(i => [i.itemCode, i.itemName, i.category, i.batchNumber, i.expiryDate, daysToExpiry(i.expiryDate), i.qtyOnHand, i.unit, i.storageLocation, i.qaStatus]),
            orientation: 'landscape',
          })}>
            <Printer size={13} /> Print
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={13} /> Add Item
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setAdjItem(null); setShowAdjModal(true); }}>
            <RefreshCw size={13} /> Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <Th field="itemCode" label="Item Code" />
                <Th field="itemName" label="Item Name" />
                <Th field="category" label="Category" />
                <Th field="batchNumber" label="Batch No." />
                <Th field="expiryDate" label="Expiry Date" />
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Days Left
                </th>
                <Th field="qtyOnHand" label="Qty" />
                <Th field="storageLocation" label="Location" />
                <Th field="qaStatus" label="QA Status" />
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map((item) => {
                const days = daysToExpiry(item.expiryDate);
                const isExpiring = days <= 30;
                const isWarning = days > 30 && days <= 60;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    style={isExpiring ? { borderLeft: '3px solid #ef4444' } : isWarning ? { borderLeft: '3px solid #f97316' } : { borderLeft: '3px solid transparent' }}
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs text-gray-600">{item.itemCode}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-medium text-gray-800">{item.itemName}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[item.category] ?? item.category}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setTraceBatch(item.batchNumber)}
                        className="font-mono text-xs text-[#D4A847] hover:underline flex items-center gap-1"
                        title="View batch traceability"
                      >
                        {item.batchNumber} <GitBranch size={10} />
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-gray-600">{formatDate(item.expiryDate)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={expiryVariant(days)} dot>
                        {days}d
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs font-semibold">
                        {item.qtyOnHand.toLocaleString()} <span className="text-gray-400 font-normal">{item.unit}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-gray-500">{item.storageLocation}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={qaVariant(item.qaStatus)}>
                        {QA_STATUS_LABELS[item.qaStatus] ?? item.qaStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={11} /> View
                        </button>
                        <button
                          onClick={() => { setAdjItem(item); setShowAdjModal(true); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          title="Stock Adjustment"
                        >
                          <Edit3 size={11} /> Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} items
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 text-xs border rounded transition-colors ${
                  page === i
                    ? 'border-[#D4A847] text-[#D4A847] bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewItem && <ViewItemModal item={viewItem} onClose={() => setViewItem(null)} />}
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
      {showAdjModal && (
        <StockAdjustmentModal
          item={adjItem}
          inventory={inventory}
          onClose={() => { setShowAdjModal(false); setAdjItem(null); }}
        />
      )}
      {traceBatch && <BatchTraceModal batchNumber={traceBatch} onClose={() => setTraceBatch(null)} />}
    </div>
  );
}

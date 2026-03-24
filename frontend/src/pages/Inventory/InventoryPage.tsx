import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw, Eye, Download, GitBranch, Printer } from 'lucide-react';
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
import { CATEGORY_LABELS, QA_STATUS_LABELS } from '../../utils/constants';
import type { InventoryItem, QAStatus } from '../../types/inventory.types';

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

interface StockAdjModalProps {
  item: InventoryItem;
  onClose: () => void;
}

function StockAdjustmentModal({ item, onClose }: StockAdjModalProps) {
  const { adjustStock } = useDataStore();
  const [type, setType] = useState('POSITIVE');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const delta = parseFloat(qty);
    if (!qty || isNaN(delta) || delta <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    adjustStock(item.id, delta, type);
    toast.success(`Stock adjusted: ${type === 'POSITIVE' ? '+' : '-'}${delta} ${item.unit} for ${item.itemName}`);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      title={`Stock Adjustment — ${item.itemName}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Save Adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Adjustment Type <span className="text-red-500">*</span></label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30"
          >
            <option value="POSITIVE">Positive (+)</option>
            <option value="NEGATIVE">Negative (−)</option>
            <option value="WRITE_OFF">Write Off</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Quantity <span className="text-red-500">*</span></label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Enter quantity"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Reason <span className="text-red-500">*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for adjustment..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30 resize-none"
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Current Qty on Hand</div>
          <div className="font-mono font-bold text-lg">{item.qtyOnHand.toLocaleString()} {item.unit}</div>
        </div>
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
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30"
        >
          <option value="">All Status</option>
          {Object.entries(QA_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30"
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
          <Button variant="ghost" size="sm">
            <Plus size={13} /> Add Item
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAdjItem(inventory[0] ?? null)}>
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
                        className="font-mono text-xs text-[#6c63ff] hover:underline flex items-center gap-1"
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
                      <button
                        onClick={() => setViewItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
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
                    ? 'border-[#6c63ff] text-[#6c63ff] bg-purple-50'
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
      {adjItem && <StockAdjustmentModal item={adjItem} onClose={() => setAdjItem(null)} />}
      {traceBatch && <BatchTraceModal batchNumber={traceBatch} onClose={() => setTraceBatch(null)} />}
    </div>
  );
}

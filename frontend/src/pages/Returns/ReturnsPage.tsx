import React, { useState, useMemo } from 'react';
import { Plus, Eye, ArrowRight, Download, Printer, Package, RotateCcw, Trash2, AlertTriangle, CheckCircle, Clock, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useDataStore } from '../../store/dataStore';
import { printTable } from '../../utils/printUtils';
import { exportToCSV } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import type { ReturnRMA, RMADisposition, RMAStatus, ReturnCondition } from '../../types/returns.types';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

/* ─── Helpers ─── */
type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

function dispositionVariant(d: RMADisposition): BadgeVariant {
  switch (d) {
    case 'RESTOCKED': return 'ok';
    case 'DESTROYED': return 'danger';
    case 'PENDING_INSPECTION': return 'warn';
    case 'RETURNED_TO_VENDOR': return 'blue';
    case 'QUARANTINE': return 'purple';
    default: return 'gray';
  }
}

function statusVariant(s: RMAStatus): BadgeVariant {
  switch (s) {
    case 'CLOSED': return 'ok';
    case 'DISPOSED': return 'teal';
    case 'INSPECTING': return 'blue';
    case 'INSPECTED': return 'purple';
    case 'RECEIVED': return 'warn';
    default: return 'gray';
  }
}

function conditionVariant(c: ReturnCondition): BadgeVariant {
  switch (c) {
    case 'Sealed': return 'ok';
    case 'Intact': return 'teal';
    case 'Damaged': return 'danger';
    case 'Expired': return 'orange';
    case 'Tampered': return 'danger';
    default: return 'gray';
  }
}

const RETURN_REASONS = [
  'Damaged packaging during transit',
  'Near expiry — batch recall',
  'Wrong item dispatched',
  'Over-order — excess stock',
  'Customer cancelled order after dispatch',
  'Temperature excursion during delivery',
  'Expired product received',
  'Packaging label mismatch',
  'Quality complaint from customer',
  'Regulatory hold / recall',
  'Other',
];

const CONDITIONS: ReturnCondition[] = ['Sealed', 'Intact', 'Damaged', 'Expired', 'Tampered'];
const CUSTOMERS = ['Apollo Pharmacy', 'MedPlus', 'Fortis Healthcare', 'Max Hospital', 'Narayana Health', 'AIIMS Pharmacy', 'Medanta', 'Cipla Distribution'];

/* ─── New RMA Modal ─── */
function NewRMAModal({ onClose }: { onClose: () => void }) {
  const { addReturn, deliveryOrders } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    doReference: '',
    itemName: '',
    batchNumber: '',
    qtyReturned: '',
    unit: 'Units',
    returnDate: new Date().toISOString().split('T')[0],
    reason: '',
    reasonOther: '',
    condition: '' as ReturnCondition | '',
  });

  const set = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-fill customer from DO
      if (field === 'doReference') {
        const doOrder = deliveryOrders.find((d) => d.doNumber === value);
        if (doOrder) {
          updated.customerName = doOrder.customerName;
          updated.customerPhone = doOrder.customerPhone ?? '';
          updated.itemName = doOrder.items;
          updated.unit = doOrder.unit ?? 'Units';
        }
      }
      return updated;
    });
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName) errs.customerName = 'Customer is required';
    if (!form.doReference) errs.doReference = 'DO Reference is required';
    if (!form.itemName.trim()) errs.itemName = 'Item name is required';
    if (!form.qtyReturned || parseFloat(form.qtyReturned) <= 0) errs.qtyReturned = 'Quantity must be positive';
    if (!form.returnDate) errs.returnDate = 'Return date is required';
    if (!form.reason) errs.reason = 'Reason is required';
    if (form.reason === 'Other' && !form.reasonOther.trim()) errs.reasonOther = 'Please specify reason';
    if (!form.condition) errs.condition = 'Condition is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) toast.error('Please fill all required fields');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const rmaNumber = `RMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    addReturn({
      id: `rma-${Date.now()}`,
      rmaNumber,
      returnDate: form.returnDate,
      customerName: form.customerName,
      customerPhone: form.customerPhone || undefined,
      doReference: form.doReference,
      itemName: form.itemName.trim(),
      batchNumber: form.batchNumber || undefined,
      qtyReturned: parseFloat(form.qtyReturned),
      unit: form.unit,
      reason: form.reason === 'Other' ? form.reasonOther.trim() : form.reason,
      condition: form.condition as ReturnCondition,
      disposition: 'PENDING_INSPECTION',
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
    });
    toast.success(`RMA ${rmaNumber} created successfully`);
    setSaving(false);
    onClose();
  };

  const hasErr = (f: string) => !!errors[f];

  return (
    <Modal
      title="Create Return (RMA)"
      width="780px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>Create RMA</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Section 1: Reference */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Reference</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>DO Reference <span className="text-red-500">*</span></label>
              <select value={form.doReference} onChange={(e) => set('doReference', e.target.value)} className={hasErr('doReference') ? inputErrCls : inputCls}>
                <option value="">Select delivery order</option>
                {deliveryOrders.filter((d) => d.doStatus !== 'CANCELLED' && d.doStatus !== 'PENDING').map((d) => (
                  <option key={d.id} value={d.doNumber}>{d.doNumber} — {d.customerName}</option>
                ))}
              </select>
              {errors.doReference && <p className="text-[11px] text-red-500 mt-0.5">{errors.doReference}</p>}
            </div>
            <div>
              <label className={labelCls}>Return Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.returnDate} onChange={(e) => set('returnDate', e.target.value)} className={hasErr('returnDate') ? inputErrCls : inputCls} />
              {errors.returnDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.returnDate}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Customer */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Customer Name <span className="text-red-500">*</span></label>
              <select value={form.customerName} onChange={(e) => set('customerName', e.target.value)} className={hasErr('customerName') ? inputErrCls : inputCls}>
                <option value="">Select customer</option>
                {CUSTOMERS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.customerName && <p className="text-[11px] text-red-500 mt-0.5">{errors.customerName}</p>}
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 3: Item Details */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Item Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Item Name(s) <span className="text-red-500">*</span></label>
              <input type="text" value={form.itemName} onChange={(e) => set('itemName', e.target.value)} placeholder="e.g. Paracetamol 500mg" className={hasErr('itemName') ? inputErrCls : inputCls} />
              {errors.itemName && <p className="text-[11px] text-red-500 mt-0.5">{errors.itemName}</p>}
            </div>
            <div>
              <label className={labelCls}>Batch Number</label>
              <input type="text" value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)} placeholder="e.g. B2847" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Quantity Returned <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.qtyReturned} onChange={(e) => set('qtyReturned', e.target.value)} placeholder="e.g. 200" className={hasErr('qtyReturned') ? inputErrCls : inputCls} />
              {errors.qtyReturned && <p className="text-[11px] text-red-500 mt-0.5">{errors.qtyReturned}</p>}
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputCls}>
                {['Units', 'KG', 'L', 'Boxes', 'Packs', 'Bottles'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Reason & Condition */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Return Reason & Condition</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Reason for Return <span className="text-red-500">*</span></label>
              <select value={form.reason} onChange={(e) => set('reason', e.target.value)} className={hasErr('reason') ? inputErrCls : inputCls}>
                <option value="">Select reason</option>
                {RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              {errors.reason && <p className="text-[11px] text-red-500 mt-0.5">{errors.reason}</p>}
            </div>
            <div>
              <label className={labelCls}>Product Condition <span className="text-red-500">*</span></label>
              <select value={form.condition} onChange={(e) => set('condition', e.target.value)} className={hasErr('condition') ? inputErrCls : inputCls}>
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.condition && <p className="text-[11px] text-red-500 mt-0.5">{errors.condition}</p>}
            </div>
            {form.reason === 'Other' && (
              <div className="col-span-2">
                <label className={labelCls}>Specify Reason <span className="text-red-500">*</span></label>
                <textarea value={form.reasonOther} onChange={(e) => set('reasonOther', e.target.value)} rows={2} placeholder="Describe the return reason..." className={`${hasErr('reasonOther') ? inputErrCls : inputCls} resize-none`} />
                {errors.reasonOther && <p className="text-[11px] text-red-500 mt-0.5">{errors.reasonOther}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── RMA Detail Modal with Workflow ─── */
function RMADetailModal({ rma, onClose }: { rma: ReturnRMA; onClose: () => void }) {
  const { updateReturn } = useDataStore();

  const WORKFLOW_STEPS: { key: RMAStatus; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: 'RECEIVED', label: 'Received', icon: Package },
    { key: 'INSPECTING', label: 'Inspecting', icon: Clock },
    { key: 'INSPECTED', label: 'Inspected', icon: CheckCircle },
    { key: 'DISPOSED', label: 'Disposed', icon: Truck },
    { key: 'CLOSED', label: 'Closed', icon: CheckCircle },
  ];
  const statusOrder: RMAStatus[] = ['RECEIVED', 'INSPECTING', 'INSPECTED', 'DISPOSED', 'CLOSED'];
  const currentIdx = statusOrder.indexOf(rma.status);
  const canAdvance = rma.status !== 'CLOSED';
  const nextStatus = canAdvance ? statusOrder[Math.min(currentIdx + 1, statusOrder.length - 1)] : null;

  const handleAdvance = () => {
    if (!nextStatus) return;
    const updates: Partial<ReturnRMA> = { status: nextStatus };
    if (nextStatus === 'INSPECTED') updates.inspectionDate = new Date().toISOString().split('T')[0];
    updateReturn(rma.id, updates);
    toast.success(`${rma.rmaNumber} moved to ${nextStatus.replace('_', ' ')}`);
    onClose();
  };

  const handleDisposition = (disposition: RMADisposition) => {
    updateReturn(rma.id, { disposition, status: 'DISPOSED', inspectionDate: new Date().toISOString().split('T')[0] });
    const label = disposition.replace(/_/g, ' ').toLowerCase();
    toast.success(`${rma.rmaNumber} marked as ${label}`);
    onClose();
  };

  return (
    <Modal
      title={`Return Details — ${rma.rmaNumber}`}
      onClose={onClose}
      width="780px"
      footer={
        <div className="flex items-center justify-between w-full">
          <div />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {canAdvance && nextStatus && (
              <Button variant="primary" onClick={handleAdvance}>
                Move to {nextStatus.replace('_', ' ')} <ArrowRight size={13} />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Workflow Progress */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">RMA Workflow</h4>
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted ? 'border-green-400 bg-green-50 text-green-600' :
                      isCurrent ? 'border-[#D4A847] bg-[#D4A847]/10 text-[#D4A847]' :
                      'border-gray-200 bg-gray-50 text-gray-300'
                    }`}>
                      <StepIcon size={14} />
                    </div>
                    <span className={`text-[10px] font-medium text-center ${
                      isCompleted ? 'text-green-600' : isCurrent ? 'text-[#D4A847]' : 'text-gray-300'
                    }`}>{step.label}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Info grid */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Return Information</h4>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
            {([
              ['RMA Number', rma.rmaNumber],
              ['Return Date', formatDate(rma.returnDate)],
              ['Customer', rma.customerName],
              ['DO Reference', rma.doReference],
              ['Item', rma.itemName],
              ['Batch', rma.batchNumber ?? '—'],
              ['Qty Returned', `${rma.qtyReturned.toLocaleString()} ${rma.unit ?? ''}`],
              ['Condition', rma.condition],
              ['Status', rma.status.replace(/_/g, ' ')],
              ['Disposition', rma.disposition.replace(/_/g, ' ')],
              ['Inspected By', rma.inspectedBy ?? '—'],
              ['Inspection Date', rma.inspectionDate ? formatDate(rma.inspectionDate) : '—'],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Return Reason</h4>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{rma.reason}</p>
        </div>

        {/* Inspection notes */}
        {rma.inspectionNotes && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Inspection Notes</h4>
            <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">{rma.inspectionNotes}</p>
          </div>
        )}

        {/* QA Decision */}
        {rma.qaDecision && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">QA Decision</h4>
            <p className="text-sm text-gray-700 bg-green-50 border border-green-100 rounded-lg p-3 font-medium">{rma.qaDecision}</p>
          </div>
        )}

        {/* Disposition Actions — only if pending */}
        {rma.disposition === 'PENDING_INSPECTION' && (rma.status === 'INSPECTING' || rma.status === 'INSPECTED') && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Set Disposition</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleDisposition('RESTOCKED')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium">
                <RotateCcw size={12} /> Restock to Inventory
              </button>
              <button onClick={() => handleDisposition('QUARANTINE')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors font-medium">
                <AlertTriangle size={12} /> Quarantine
              </button>
              <button onClick={() => handleDisposition('RETURNED_TO_VENDOR')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                <Truck size={12} /> Return to Vendor
              </button>
              <button onClick={() => handleDisposition('DESTROYED')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors font-medium">
                <Trash2 size={12} /> Destroy
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─── Tabs ─── */
const TABS = [
  { id: 'all', label: 'All Returns' },
  { id: 'pending', label: 'Pending Inspection' },
  { id: 'inspecting', label: 'Under Inspection' },
  { id: 'disposed', label: 'Disposed / Closed' },
];

/* ─── Main Page ─── */
export default function ReturnsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewRMA, setShowNewRMA] = useState(false);
  const [viewReturn, setViewReturn] = useState<ReturnRMA | null>(null);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const { returns, updateReturn } = useDataStore();

  // Dynamic KPIs
  const pendingCount = returns.filter((r) => r.disposition === 'PENDING_INSPECTION').length;
  const inspectingCount = returns.filter((r) => r.status === 'INSPECTING').length;
  const restockedCount = returns.filter((r) => r.disposition === 'RESTOCKED').length;
  const destroyedCount = returns.filter((r) => r.disposition === 'DESTROYED').length;
  const vendorReturnCount = returns.filter((r) => r.disposition === 'RETURNED_TO_VENDOR').length;
  const quarantineCount = returns.filter((r) => r.disposition === 'QUARANTINE').length;

  const RETURNS_KPIS = [
    { label: 'Total Returns', value: String(returns.length), sub: `${pendingCount} pending`, trend: (pendingCount > 0 ? 'warn' : 'up') as 'warn' | 'up', accentColor: 'orange' as const },
    { label: 'Pending Inspection', value: String(pendingCount), sub: inspectingCount > 0 ? `${inspectingCount} under inspection` : 'Action required', trend: (pendingCount > 0 ? 'warn' : 'up') as 'warn' | 'up', accentColor: 'red' as const },
    { label: 'Restocked', value: String(restockedCount), sub: 'Back to inventory', trend: 'up' as const, accentColor: 'green' as const },
    { label: 'Destroyed', value: String(destroyedCount), sub: 'Per QA decision', trend: 'neutral' as const, accentColor: 'purple' as const },
    { label: 'Returned to Vendor', value: String(vendorReturnCount), sub: quarantineCount > 0 ? `${quarantineCount} in quarantine` : 'Vendor claims', trend: 'up' as const, accentColor: 'blue' as const },
  ];

  const filteredReturns = useMemo(() => {
    let data = [...returns];
    // Tab filter
    if (tab === 'pending') data = data.filter((r) => r.disposition === 'PENDING_INSPECTION' && r.status === 'RECEIVED');
    else if (tab === 'inspecting') data = data.filter((r) => r.status === 'INSPECTING' || r.status === 'INSPECTED');
    else if (tab === 'disposed') data = data.filter((r) => r.status === 'DISPOSED' || r.status === 'CLOSED');
    // Search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.rmaNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.doReference.toLowerCase().includes(q) ||
        (r.batchNumber ?? '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [returns, tab, search]);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {RETURNS_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        <Button variant="primary" size="sm" onClick={() => setShowNewRMA(true)}>
          <Plus size={13} /> New RMA
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search RMA, customer, item, batch..." className="w-72" />
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => exportToCSV(
              filteredReturns.map((r) => ({
                'RMA No.': r.rmaNumber, 'Date': r.returnDate, 'Customer': r.customerName,
                'DO Ref': r.doReference, 'Item': r.itemName, 'Batch': r.batchNumber ?? '',
                'Qty': r.qtyReturned, 'Reason': r.reason, 'Condition': r.condition,
                'Disposition': r.disposition, 'Status': r.status,
                'Inspected By': r.inspectedBy ?? '', 'Inspection Date': r.inspectionDate ?? '',
              })),
              'returns-rma'
            )}>
              <Download size={13} /> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => printTable({
              title: 'Returns / RMA Register',
              subtitle: `${filteredReturns.length} returns | Tab: ${tab}`,
              headers: ['RMA No.', 'Date', 'Customer', 'DO Ref', 'Item', 'Qty', 'Condition', 'Disposition', 'Status'],
              rows: filteredReturns.map((r) => [r.rmaNumber, r.returnDate, r.customerName, r.doReference, r.itemName, r.qtyReturned, r.condition, r.disposition.replace(/_/g, ' '), r.status]),
              orientation: 'landscape',
            })}>
              <Printer size={13} /> Print
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['RMA No.', 'Date', 'Customer', 'DO Ref', 'Item', 'Batch', 'Qty', 'Reason', 'Condition', 'Disposition', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className={`hover:bg-gray-50/50 transition-colors ${
                  ret.condition === 'Damaged' || ret.condition === 'Tampered' ? 'border-l-[3px] border-l-red-400' :
                  ret.condition === 'Expired' ? 'border-l-[3px] border-l-orange-400' : ''
                }`}>
                  <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{ret.rmaNumber}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(ret.returnDate)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-700">{ret.customerName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{ret.doReference}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[140px] truncate" title={ret.itemName}>{ret.itemName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{ret.batchNumber ?? '—'}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold">{ret.qtyReturned.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[130px] truncate" title={ret.reason}>{ret.reason}</td>
                  <td className="px-3 py-2.5"><Badge variant={conditionVariant(ret.condition)}>{ret.condition}</Badge></td>
                  <td className="px-3 py-2.5"><Badge variant={dispositionVariant(ret.disposition)}>{ret.disposition.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-3 py-2.5"><Badge variant={statusVariant(ret.status)}>{ret.status}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewReturn(ret)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                      {ret.disposition === 'PENDING_INSPECTION' && ret.status === 'RECEIVED' && (
                        <button
                          onClick={() => {
                            updateReturn(ret.id, { status: 'INSPECTING' });
                            toast.success(`${ret.rmaNumber} inspection started`);
                          }}
                          className="px-2 py-1 text-[10px] rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          Inspect
                        </button>
                      )}
                      {ret.disposition === 'PENDING_INSPECTION' && (ret.status === 'RECEIVED' || ret.status === 'INSPECTING') && (
                        <button
                          className="px-2 py-1 text-[10px] rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                          onClick={async () => {
                            const ok = await confirm({ title: 'Destroy Return?', message: `This will permanently destroy ${ret.rmaNumber} (${ret.itemName}). This action cannot be undone.`, confirmLabel: 'Destroy', variant: 'danger' });
                            if (ok) {
                              updateReturn(ret.id, { disposition: 'DESTROYED', status: 'CLOSED', qaDecision: 'Destroyed per QA decision' });
                              toast.error(`${ret.rmaNumber} marked for destruction`);
                            }
                          }}
                        >Destroy</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-8 text-center text-xs text-gray-400">No returns found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showNewRMA && <NewRMAModal onClose={() => setShowNewRMA(false)} />}
      {viewReturn && <RMADetailModal rma={viewReturn} onClose={() => setViewReturn(null)} />}
    </div>
  );
}

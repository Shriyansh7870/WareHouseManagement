import React, { useState, useMemo } from 'react';
import { Plus, Eye, Package, Truck, ArrowRight, Download, Printer, MapPin, Phone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import AlertBanner from '../../components/ui/AlertBanner';
import { printTable } from '../../utils/printUtils';
import { exportToCSV } from '../../utils/csvExport';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/formatters';
import type { DeliveryOrder, DOStatus, PickStatus } from '../../types/dispatch.types';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

/* ─── Helpers ─── */
function doStatusVariant(s: DOStatus) {
  switch (s) {
    case 'DELIVERED': return 'teal';
    case 'DISPATCHED': return 'ok';
    case 'PACKED': return 'purple';
    case 'PICKING_IN_PROGRESS': return 'blue';
    case 'PENDING': return 'warn';
    case 'CANCELLED': return 'danger';
    default: return 'gray';
  }
}

function doStatusLabel(s: DOStatus) {
  return s.replace(/_/g, ' ');
}

function priorityVariant(p?: string) {
  switch (p) {
    case 'EXPRESS': return 'danger';
    case 'URGENT': return 'orange';
    default: return 'gray';
  }
}

const CARRIERS = ['Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Gati', 'Professional Couriers'];
const CUSTOMERS = ['Apollo Pharmacy', 'MedPlus', 'Fortis Healthcare', 'Max Hospital', 'Cipla Distribution', 'Medanta', 'AIIMS Pharmacy', 'Narayana Health'];

/* ─── Create DO Modal ─── */
function CreateDOModal({ onClose }: { onClose: () => void }) {
  const { addDeliveryOrder, inventory } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    items: '',
    qty: '',
    unit: 'Units',
    carrier: '',
    trackingNo: '',
    priority: 'NORMAL' as 'NORMAL' | 'URGENT' | 'EXPRESS',
    remarks: '',
  });

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName) errs.customerName = 'Customer is required';
    if (!form.orderDate) errs.orderDate = 'Order date is required';
    if (!form.items.trim()) errs.items = 'At least one item is required';
    if (!form.qty || parseFloat(form.qty) <= 0) errs.qty = 'Quantity must be positive';
    if (!form.carrier) errs.carrier = 'Carrier is required';
    if (!form.expectedDelivery) errs.expectedDelivery = 'Expected delivery date is required';
    if (form.expectedDelivery && form.expectedDelivery < form.orderDate) errs.expectedDelivery = 'Must be after order date';
    setErrors(errs);
    if (Object.keys(errs).length > 0) toast.error('Please fill all required fields');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const doNumber = `DO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    addDeliveryOrder({
      id: `do-${Date.now()}`,
      doNumber,
      orderDate: form.orderDate,
      customerName: form.customerName,
      customerAddress: form.customerAddress || undefined,
      customerPhone: form.customerPhone || undefined,
      items: form.items.trim(),
      qty: parseFloat(form.qty),
      unit: form.unit,
      carrier: form.carrier,
      trackingNo: form.trackingNo || undefined,
      pickStatus: 'PENDING',
      doStatus: 'PENDING',
      priority: form.priority,
      expectedDelivery: form.expectedDelivery,
      remarks: form.remarks || undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success(`Delivery Order ${doNumber} created successfully`);
    setSaving(false);
    onClose();
  };

  const hasErr = (f: string) => !!errors[f];

  // Get available items from inventory for suggestions
  const inventoryItems = useMemo(() => {
    const unique = new Map<string, string>();
    inventory.forEach((i) => { if (i.qaStatus === 'APPROVED') unique.set(i.itemCode, i.itemName); });
    return Array.from(unique.entries());
  }, [inventory]);

  return (
    <Modal
      title="Create Delivery Order"
      width="780px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>Create DO</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Section 1: Customer */}
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
            <div className="col-span-2">
              <label className={labelCls}>Delivery Address</label>
              <input type="text" value={form.customerAddress} onChange={(e) => set('customerAddress', e.target.value)} placeholder="Full delivery address" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 2: Order Details */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Order Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.orderDate} onChange={(e) => set('orderDate', e.target.value)} className={hasErr('orderDate') ? inputErrCls : inputCls} />
              {errors.orderDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.orderDate}</p>}
            </div>
            <div>
              <label className={labelCls}>Expected Delivery <span className="text-red-500">*</span></label>
              <input type="date" value={form.expectedDelivery} onChange={(e) => set('expectedDelivery', e.target.value)} className={hasErr('expectedDelivery') ? inputErrCls : inputCls} />
              {errors.expectedDelivery && <p className="text-[11px] text-red-500 mt-0.5">{errors.expectedDelivery}</p>}
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputCls}>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="EXPRESS">Express</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Item(s) <span className="text-red-500">*</span></label>
              <input type="text" value={form.items} onChange={(e) => set('items', e.target.value)} placeholder="e.g. Paracetamol 500mg, Metformin 850mg" className={hasErr('items') ? inputErrCls : inputCls} list="inv-items" />
              <datalist id="inv-items">
                {inventoryItems.map(([code, name]) => <option key={code} value={name}>{code}</option>)}
              </datalist>
              {errors.items && <p className="text-[11px] text-red-500 mt-0.5">{errors.items}</p>}
            </div>
            <div>
              <label className={labelCls}>Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.qty} onChange={(e) => set('qty', e.target.value)} placeholder="e.g. 2000" className={hasErr('qty') ? inputErrCls : inputCls} />
              {errors.qty && <p className="text-[11px] text-red-500 mt-0.5">{errors.qty}</p>}
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputCls}>
                {['Units', 'KG', 'L', 'Boxes', 'Packs', 'Bottles', 'Drums'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Shipping */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipping & Carrier</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Carrier <span className="text-red-500">*</span></label>
              <select value={form.carrier} onChange={(e) => set('carrier', e.target.value)} className={hasErr('carrier') ? inputErrCls : inputCls}>
                <option value="">Select carrier</option>
                {CARRIERS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.carrier && <p className="text-[11px] text-red-500 mt-0.5">{errors.carrier}</p>}
            </div>
            <div>
              <label className={labelCls}>Tracking / AWB No.</label>
              <input type="text" value={form.trackingNo} onChange={(e) => set('trackingNo', e.target.value)} placeholder="Will be assigned after dispatch" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 4: Remarks */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Additional Information</h4>
          <div>
            <label className={labelCls}>Remarks</label>
            <textarea value={form.remarks} onChange={(e) => set('remarks', e.target.value)} rows={2} placeholder="Special delivery instructions, cold chain requirements, etc." className={`${inputCls} resize-none`} />
          </div>
          <div className="mt-3 bg-blue-50 rounded-lg p-3 text-xs text-blue-700 border border-blue-200">
            FEFO enforcement is active. Pick items will be automatically assigned from the earliest-expiry batch.
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── DO Detail Modal with Workflow ─── */
function DODetailModal({ order, onClose }: { order: DeliveryOrder; onClose: () => void }) {
  const { updateDeliveryOrder } = useDataStore();

  const WORKFLOW_STEPS: { key: DOStatus; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'PICKING_IN_PROGRESS', label: 'Picking' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];
  const statusOrder: DOStatus[] = ['PENDING', 'PICKING_IN_PROGRESS', 'PACKED', 'DISPATCHED', 'DELIVERED'];
  const currentIdx = statusOrder.indexOf(order.doStatus);
  const canAdvance = order.doStatus !== 'DELIVERED' && order.doStatus !== 'CANCELLED';
  const nextStatus = canAdvance ? statusOrder[Math.min(currentIdx + 1, statusOrder.length - 1)] : null;

  const pickStatusForDO = (doStatus: DOStatus): PickStatus => {
    switch (doStatus) {
      case 'PICKING_IN_PROGRESS': return 'PICKING';
      case 'PACKED': return 'PACKED';
      case 'DISPATCHED': case 'DELIVERED': return 'PACKED';
      default: return 'PENDING';
    }
  };

  const handleAdvance = () => {
    if (!nextStatus) return;
    const updates: Partial<DeliveryOrder> = { doStatus: nextStatus, pickStatus: pickStatusForDO(nextStatus) };
    if (nextStatus === 'DISPATCHED') updates.dispatchDate = new Date().toISOString().split('T')[0];
    if (nextStatus === 'DELIVERED') updates.deliveredDate = new Date().toISOString().split('T')[0];
    updateDeliveryOrder(order.id, updates);
    toast.success(`${order.doNumber} moved to ${doStatusLabel(nextStatus)}`);
    onClose();
  };

  const handleCancel = () => {
    updateDeliveryOrder(order.id, { doStatus: 'CANCELLED' });
    toast.error(`${order.doNumber} cancelled`);
    onClose();
  };

  return (
    <Modal
      title={`Delivery Order — ${order.doNumber}`}
      onClose={onClose}
      width="780px"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {order.doStatus !== 'CANCELLED' && order.doStatus !== 'DELIVERED' && (
              <Button variant="danger" size="sm" onClick={handleCancel}>Cancel Order</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {canAdvance && nextStatus && (
              <Button variant="primary" onClick={handleAdvance}>
                Move to {doStatusLabel(nextStatus)} <ArrowRight size={13} />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Workflow Progress */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Order Workflow</h4>
          {order.doStatus === 'CANCELLED' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <span className="text-sm font-semibold text-red-600">ORDER CANCELLED</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {WORKFLOW_STEPS.map((step, i) => {
                const isCompleted = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                        isCompleted ? 'border-green-400 bg-green-50 text-green-600' :
                        isCurrent ? 'border-[#D4A847] bg-[#D4A847]/10 text-[#D4A847]' :
                        'border-gray-200 bg-gray-50 text-gray-300'
                      }`}>
                        {isCompleted ? '✓' : i + 1}
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
          )}
        </div>

        {/* Customer Info */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer Information</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="font-semibold text-sm text-gray-800">{order.customerName}</div>
            {order.customerAddress && (
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <MapPin size={12} className="mt-0.5 text-gray-400 flex-shrink-0" />
                {order.customerAddress}
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone size={12} className="text-gray-400" />
                {order.customerPhone}
              </div>
            )}
          </div>
        </div>

        {/* Order Info grid */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Details</h4>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
            {([
              ['DO Number', order.doNumber],
              ['Order Date', formatDate(order.orderDate)],
              ['Priority', order.priority ?? 'NORMAL'],
              ['Items', order.items],
              ['Quantity', `${order.qty.toLocaleString()} ${order.unit ?? ''}`],
              ['Expected Delivery', order.expectedDelivery ? formatDate(order.expectedDelivery) : '—'],
              ['Carrier', order.carrier ?? '—'],
              ['Tracking No.', order.trackingNo || '—'],
              ['Pick Status', order.pickStatus],
              ['DO Status', doStatusLabel(order.doStatus)],
              ['Dispatch Date', order.dispatchDate ? formatDate(order.dispatchDate) : '—'],
              ['Delivered Date', order.deliveredDate ? formatDate(order.deliveredDate) : '—'],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Remarks */}
        {order.remarks && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Remarks</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{order.remarks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─── Tabs ─── */
const TABS = [
  { id: 'orders', label: 'Dispatch Orders (DO)' },
  { id: 'picking', label: 'Picking Queue' },
  { id: 'packed', label: 'Packed & Ready' },
  { id: 'tracking', label: 'Shipment Tracking' },
];

/* ─── Main Page ─── */
export default function DispatchPage() {
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateDO, setShowCreateDO] = useState(false);
  const [viewOrder, setViewOrder] = useState<DeliveryOrder | null>(null);
  const { deliveryOrders, pickItems, updateDeliveryOrder } = useDataStore();

  // Dynamic KPIs
  const pendingCount = deliveryOrders.filter((d) => d.doStatus === 'PENDING' || d.doStatus === 'PICKING_IN_PROGRESS').length;
  const dispatchedToday = deliveryOrders.filter((d) => d.doStatus === 'DISPATCHED' || d.doStatus === 'DELIVERED').length;
  const packedCount = deliveryOrders.filter((d) => d.doStatus === 'PACKED').length;
  const urgentCount = deliveryOrders.filter((d) => (d.priority === 'URGENT' || d.priority === 'EXPRESS') && d.doStatus !== 'DELIVERED' && d.doStatus !== 'CANCELLED').length;

  const DISPATCH_KPIS = [
    { label: 'Pending Dispatch', value: String(pendingCount), sub: 'DOs awaiting pick/pack', trend: (pendingCount > 0 ? 'warn' : 'up') as 'warn' | 'up', accentColor: 'orange' as const },
    { label: 'Packed & Ready', value: String(packedCount), sub: 'Ready for dispatch', trend: 'up' as const, accentColor: 'purple' as const },
    { label: 'Dispatched / Delivered', value: String(dispatchedToday), sub: 'On schedule', trend: 'up' as const, accentColor: 'green' as const },
    { label: 'Urgent Orders', value: String(urgentCount), sub: urgentCount > 0 ? 'Needs attention' : 'All clear', trend: (urgentCount > 0 ? 'warn' : 'up') as 'warn' | 'up', accentColor: 'red' as const },
  ];

  const filteredOrders = useMemo(() => {
    let data = [...deliveryOrders];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        d.doNumber.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.items.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter((d) => d.doStatus === statusFilter);
    return data;
  }, [deliveryOrders, search, statusFilter]);

  const packedOrders = deliveryOrders.filter((d) => d.doStatus === 'PACKED');
  const trackingOrders = deliveryOrders.filter((d) => ['DISPATCHED', 'DELIVERED'].includes(d.doStatus));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DISPATCH_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <AlertBanner type="warn" message={`${urgentCount} urgent/express order(s) pending. Prioritize dispatch immediately.`} />
      )}

      {/* Tab + Actions */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        {(tab === 'orders' || tab === 'packed') && (
          <Button variant="primary" size="sm" onClick={() => setShowCreateDO(true)}>
            <Plus size={13} /> Create DO
          </Button>
        )}
      </div>

      {/* Dispatch Orders */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <SearchBox value={search} onChange={(v) => { setSearch(v); }} placeholder="Search DO, customer, item..." className="w-72" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30">
              <option value="">All Status</option>
              {(['PENDING', 'PICKING_IN_PROGRESS', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] as DOStatus[]).map((s) => (
                <option key={s} value={s}>{doStatusLabel(s)}</option>
              ))}
            </select>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => exportToCSV(
                filteredOrders.map((d) => ({
                  'DO No.': d.doNumber, 'Date': d.orderDate, 'Customer': d.customerName,
                  'Items': d.items, 'Qty': d.qty, 'Carrier': d.carrier ?? '',
                  'Tracking': d.trackingNo ?? '', 'Priority': d.priority ?? 'NORMAL',
                  'Pick Status': d.pickStatus, 'DO Status': d.doStatus,
                  'Expected Delivery': d.expectedDelivery ?? '',
                })),
                'dispatch-orders'
              )}>
                <Download size={13} /> Export
              </Button>
              <Button variant="ghost" size="sm" onClick={() => printTable({
                title: 'Dispatch Orders',
                subtitle: `${filteredOrders.length} orders | Status: ${statusFilter || 'All'}`,
                headers: ['DO No.', 'Date', 'Customer', 'Items', 'Qty', 'Carrier', 'Priority', 'Status'],
                rows: filteredOrders.map((d) => [d.doNumber, d.orderDate, d.customerName, d.items, d.qty, d.carrier ?? '—', d.priority ?? 'NORMAL', doStatusLabel(d.doStatus)]),
                orientation: 'landscape',
              })}>
                <Printer size={13} /> Print
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['DO No.', 'Date', 'Customer', 'Items', 'Qty', 'Carrier', 'Priority', 'Expected', 'Pick Status', 'DO Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50/50 transition-colors ${order.priority === 'EXPRESS' ? 'border-l-[3px] border-l-red-400' : order.priority === 'URGENT' ? 'border-l-[3px] border-l-orange-400' : ''}`}>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{order.doNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(order.orderDate)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[160px] truncate" title={order.items}>{order.items}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{order.qty.toLocaleString()} <span className="text-gray-400 font-normal">{order.unit ?? ''}</span></td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{order.carrier ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      {order.priority && order.priority !== 'NORMAL' ? (
                        <Badge variant={priorityVariant(order.priority)}>{order.priority}</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Normal</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{order.expectedDelivery ? formatDate(order.expectedDelivery) : '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={order.pickStatus === 'PICKED' || order.pickStatus === 'PACKED' ? 'ok' : order.pickStatus === 'PICKING' ? 'blue' : 'warn'}>
                        {order.pickStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={doStatusVariant(order.doStatus)}>{doStatusLabel(order.doStatus)}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-xs text-gray-400">No delivery orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Picking Queue */}
      {tab === 'picking' && (
        <div className="space-y-3">
          <AlertBanner type="info" message="FEFO enforced: Items are always picked from the earliest expiry batch first. Override requires QA authorization." />
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Pick List ID', 'DO Reference', 'Item', 'Batch (FEFO)', 'Qty to Pick', 'From Location', 'Assigned To', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pickItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{item.pickListId}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{item.doReference}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{item.itemName}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {item.batchFEFO}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold">{item.qtyToPick.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{item.fromLocation}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{item.assignedTo || <span className="text-gray-300 italic">Unassigned</span>}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={item.status === 'In Progress' ? 'blue' : item.status === 'Completed' ? 'ok' : 'warn'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {item.status === 'Pending' && (
                            <button className="px-2 py-1 text-[10px] rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                              onClick={() => toast.success(`Pick started for ${item.itemName}`)}>
                              Start Pick
                            </button>
                          )}
                          {item.status === 'In Progress' && (
                            <button className="px-2 py-1 text-[10px] rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                              onClick={() => toast.success(`Pick completed for ${item.itemName}`)}>
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pickItems.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-gray-400">No items in picking queue</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Packed & Ready */}
      {tab === 'packed' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm">{packedOrders.length} order(s) packed and ready for dispatch</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['DO No.', 'Customer', 'Items', 'Qty', 'Carrier', 'Priority', 'Expected Delivery', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {packedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{order.doNumber}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{order.items}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{order.qty.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{order.carrier ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      {order.priority && order.priority !== 'NORMAL' ? (
                        <Badge variant={priorityVariant(order.priority)}>{order.priority}</Badge>
                      ) : <span className="text-xs text-gray-400">Normal</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{order.expectedDelivery ? formatDate(order.expectedDelivery) : '—'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={11} /> View
                        </button>
                        <button
                          onClick={() => {
                            updateDeliveryOrder(order.id, { doStatus: 'DISPATCHED', dispatchDate: new Date().toISOString().split('T')[0] });
                            toast.success(`${order.doNumber} dispatched`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          <Truck size={11} /> Dispatch
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {packedOrders.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-xs text-gray-400">No packed orders awaiting dispatch</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shipment Tracking */}
      {tab === 'tracking' && (
        <div className="space-y-4">
          {/* Tracking summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackingOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setViewOrder(order)}
                className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#D4A847] font-bold">{order.doNumber}</span>
                  <Badge variant={doStatusVariant(order.doStatus)}>{doStatusLabel(order.doStatus)}</Badge>
                </div>
                <div className="text-sm font-medium text-gray-800 mb-1">{order.customerName}</div>
                <div className="text-xs text-gray-500 mb-3">{order.items}</div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck size={12} className="text-gray-400" />
                    <span>{order.carrier ?? '—'}</span>
                    {order.trackingNo && <span className="font-mono text-[#D4A847]">{order.trackingNo}</span>}
                  </div>
                  {order.dispatchDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={12} className="text-gray-400" />
                      <span>Dispatched {formatDate(order.dispatchDate)}</span>
                    </div>
                  )}
                  {order.expectedDelivery && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package size={12} className="text-gray-400" />
                      <span>Expected {formatDate(order.expectedDelivery)}</span>
                    </div>
                  )}
                  {order.customerAddress && (
                    <div className="flex items-start gap-2 text-gray-500">
                      <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{order.customerAddress}</span>
                    </div>
                  )}
                </div>

                {/* Mini progress */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {(['PENDING', 'PICKING_IN_PROGRESS', 'PACKED', 'DISPATCHED', 'DELIVERED'] as DOStatus[]).map((s, i) => {
                      const idx = ['PENDING', 'PICKING_IN_PROGRESS', 'PACKED', 'DISPATCHED', 'DELIVERED'].indexOf(order.doStatus);
                      return (
                        <div key={s} className={`flex-1 h-1 rounded-full ${i <= idx ? 'bg-green-400' : 'bg-gray-200'}`} />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {trackingOrders.length === 0 && (
              <div className="col-span-3 bg-white rounded-xl p-8 text-center text-xs text-gray-400" style={{ border: '1px solid var(--border)' }}>
                No dispatched or delivered shipments to track
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateDO && <CreateDOModal onClose={() => setShowCreateDO(false)} />}
      {viewOrder && <DODetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
}

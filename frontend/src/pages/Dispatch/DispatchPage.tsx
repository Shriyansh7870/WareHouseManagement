import React, { useState } from 'react';
import { Plus, Eye, Package, Truck } from 'lucide-react';
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
import AlertBanner from '../../components/ui/AlertBanner';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/formatters';
import type { DOStatus, PickStatus } from '../../types/dispatch.types';

const doSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  items: z.string().min(1, 'Items are required'),
  qty: z.coerce.number().positive('Quantity must be positive'),
  carrier: z.string().min(1, 'Carrier is required'),
  trackingNo: z.string().optional(),
});

type DOForm = z.infer<typeof doSchema>;

const DISPATCH_KPIS = [
  { label: 'Pending Dispatch', value: '3', sub: 'DOs awaiting pick', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Dispatched Today', value: '2', sub: 'On schedule', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'On-Time Delivery FY', value: '96.8%', sub: '+0.8% vs target', trend: 'up' as const, accentColor: 'teal' as const },
  { label: 'Returns Pending', value: '1', sub: 'Awaiting inspection', trend: 'warn' as const, accentColor: 'red' as const },
];

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

function CreateDOModal({ onClose }: { onClose: () => void }) {
  const { addDeliveryOrder } = useDataStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DOForm>({
    resolver: zodResolver(doSchema),
    defaultValues: { orderDate: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: DOForm) => {
    await new Promise(r => setTimeout(r, 400));
    const doNumber = `DO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    addDeliveryOrder({
      id: `do-${Date.now()}`,
      doNumber,
      orderDate: data.orderDate,
      customerName: data.customerName,
      items: data.items,
      qty: data.qty,
      carrier: data.carrier,
      trackingNo: data.trackingNo ?? '',
      pickStatus: 'PENDING',
      doStatus: 'PENDING',
    });
    toast.success(`Delivery Order ${doNumber} created successfully`);
    onClose();
  };

  return (
    <Modal
      title="Create Delivery Order"
      width="640px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>Create DO</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Customer Name <span className="text-red-500">*</span></label>
          <input {...register('customerName')} placeholder="Customer name" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.customerName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.customerName && <p className="text-[11px] text-red-500 mt-0.5">{errors.customerName.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Order Date <span className="text-red-500">*</span></label>
          <input type="date" {...register('orderDate')} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.orderDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.orderDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.orderDate.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Item(s) <span className="text-red-500">*</span></label>
          <input {...register('items')} placeholder="Item name(s)" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.items ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.items && <p className="text-[11px] text-red-500 mt-0.5">{errors.items.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Total Qty <span className="text-red-500">*</span></label>
          <input type="number" {...register('qty')} placeholder="0" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.qty ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.qty && <p className="text-[11px] text-red-500 mt-0.5">{errors.qty.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Carrier <span className="text-red-500">*</span></label>
          <select {...register('carrier')} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.carrier ? 'border-red-400' : 'border-gray-200'}`}>
            <option value="">Select carrier</option>
            {['Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'DHL'].map(o => <option key={o}>{o}</option>)}
          </select>
          {errors.carrier && <p className="text-[11px] text-red-500 mt-0.5">{errors.carrier.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tracking No.</label>
          <input {...register('trackingNo')} placeholder="AWB/tracking no." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
        </div>
        <div className="col-span-2 bg-blue-50 rounded-lg p-3 text-xs text-blue-700 border border-blue-200">
          FEFO enforcement is active. Pick items will be automatically assigned from the earliest-expiry batch.
        </div>
      </div>
    </Modal>
  );
}

const TABS = [
  { id: 'orders', label: 'Dispatch Orders (DO)' },
  { id: 'picking', label: 'Picking Queue' },
  { id: 'packed', label: 'Packed & Ready' },
];

export default function DispatchPage() {
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [showCreateDO, setShowCreateDO] = useState(false);
  const [viewOrder, setViewOrder] = useState<import('../../types/dispatch.types').DeliveryOrder | null>(null);
  const { deliveryOrders, pickItems } = useDataStore();

  const filteredOrders = deliveryOrders.filter((do_) =>
    !search ||
    do_.doNumber.toLowerCase().includes(search.toLowerCase()) ||
    do_.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const packedOrders = deliveryOrders.filter((d) => ['PACKED', 'DISPATCHED', 'DELIVERED'].includes(d.doStatus));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2">
        {DISPATCH_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tab + Actions */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        <Button variant="primary" size="sm" onClick={() => setShowCreateDO(true)}>
          <Plus size={13} /> Create DO
        </Button>
      </div>

      {/* Dispatch Orders */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100">
            <SearchBox value={search} onChange={setSearch} placeholder="Search DO, customer..." className="w-72" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['DO No.', 'Date', 'Customer', 'Items', 'Qty', 'Carrier', 'Tracking No.', 'Pick Status', 'DO Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{order.doNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(order.orderDate)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[140px] truncate">{order.items}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{order.qty.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{order.carrier ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{order.trackingNo || '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={order.pickStatus === 'PICKED' || order.pickStatus === 'PACKED' ? 'ok' : order.pickStatus === 'PICKING' ? 'blue' : 'warn'}>
                        {order.pickStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={doStatusVariant(order.doStatus)}>
                        {doStatusLabel(order.doStatus)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
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
                    {['Pick List ID', 'DO Reference', 'Item', 'Batch (FEFO)', 'Qty to Pick', 'From Location', 'Assigned To', 'Status'].map((h) => (
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
                      <td className="px-3 py-2.5 text-xs text-gray-600">{item.assignedTo || <span className="text-gray-300">Unassigned</span>}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={item.status === 'In Progress' ? 'blue' : item.status === 'Completed' ? 'ok' : 'warn'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Packed & Ready */}
      {tab === 'packed' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm">{packedOrders.length} orders packed or dispatched</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['DO No.', 'Customer', 'Items', 'Qty', 'Carrier', 'Tracking No.', 'Status', 'Actions'].map((h) => (
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
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{order.trackingNo || '—'}</td>
                    <td className="px-3 py-2.5"><Badge variant={doStatusVariant(order.doStatus)}>{doStatusLabel(order.doStatus)}</Badge></td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Truck size={11} /> Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateDO && <CreateDOModal onClose={() => setShowCreateDO(false)} />}

      {viewOrder && (
        <Modal title={`Delivery Order — ${viewOrder.doNumber}`} onClose={() => setViewOrder(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['DO Number', viewOrder.doNumber],
              ['Order Date', formatDate(viewOrder.orderDate)],
              ['Customer', viewOrder.customerName],
              ['Items', viewOrder.items],
              ['Total Qty', viewOrder.qty.toLocaleString()],
              ['Carrier', viewOrder.carrier ?? '—'],
              ['Tracking No.', viewOrder.trackingNo || '—'],
              ['Pick Status', viewOrder.pickStatus],
              ['DO Status', doStatusLabel(viewOrder.doStatus)],
            ].map(([l, v]) => (
              <div key={String(l)}>
                <div className="text-xs text-gray-500 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{String(v ?? '—')}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

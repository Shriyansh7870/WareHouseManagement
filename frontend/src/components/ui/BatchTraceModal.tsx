import React from 'react';
import { X, Package, CheckCircle, Boxes, Truck, ArrowRight, ClipboardList } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import Badge from './Badge';
import { formatDate } from '../../utils/formatters';

interface BatchTraceModalProps {
  batchNumber: string;
  onClose: () => void;
}

interface TraceStep {
  stage: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  data: React.ReactNode;
  found: boolean;
}

export default function BatchTraceModal({ batchNumber, onClose }: BatchTraceModalProps) {
  const { grns, qaInspections, inventory, deliveryOrders } = useDataStore();

  const grn = grns.find((g) => g.batchNumber === batchNumber);
  const qa = qaInspections.find((q) => q.batchNumber === batchNumber);
  const inv = inventory.find((i) => i.batchNumber === batchNumber);
  const dos = deliveryOrders.filter((d) => d.items?.toLowerCase().includes(inv?.itemName?.toLowerCase() ?? '___'));

  const steps: TraceStep[] = [
    {
      stage: 'Goods Receipt (GRN)',
      icon: <Truck size={16} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      found: !!grn,
      data: grn ? (
        <div className="space-y-1 text-sm">
          <div className="flex gap-6 flex-wrap">
            <Field label="GRN No." value={grn.grnNumber} />
            <Field label="Supplier" value={grn.vendorName ?? ''} />
            <Field label="Item" value={grn.itemName} />
          </div>
          <div className="flex gap-6 flex-wrap">
            <Field label="Qty Received" value={`${grn.qtyReceived.toLocaleString()} ${grn.unit}`} />
            <Field label="Received On" value={formatDate(grn.createdAt)} />
            <Field label="Location" value={grn.storageLocation} />
          </div>
          <div className="flex gap-6 flex-wrap">
            <Field label="Mfg Date" value={formatDate(grn.mfgDate)} />
            <Field label="Expiry Date" value={formatDate(grn.expiryDate)} />
            <Field label="CoA Linked" value={grn.coaLinked ? 'Yes ✓' : 'No ✗'} />
          </div>
          <div className="mt-1">
            <Badge variant={grn.status === 'APPROVED' ? 'ok' : grn.status === 'QUARANTINE' ? 'purple' : grn.status === 'REJECTED' ? 'danger' : 'warn'}>
              {grn.status}
            </Badge>
          </div>
        </div>
      ) : <p className="text-sm text-gray-400 italic">No GRN record found for this batch.</p>,
    },
    {
      stage: 'QA Inspection',
      icon: <CheckCircle size={16} />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      found: !!qa,
      data: qa ? (
        <div className="space-y-1 text-sm">
          <div className="flex gap-6 flex-wrap">
            <Field label="Inspection ID" value={qa.inspectionId} />
            <Field label="Sampled By" value={qa.sampledBy} />
            <Field label="Supplier" value={qa.supplier} />
          </div>
          <div className="flex gap-6 flex-wrap">
            <Field label="Test Parameters" value={qa.testParameters} />
            <Field label="TAT" value={`${qa.tatHours}h`} />
          </div>
          <div className="flex gap-4 mt-1 items-center">
            <Badge variant={qa.result === 'PASSED' ? 'ok' : 'danger'}>Result: {qa.result}</Badge>
            <Badge variant={qa.decision === 'APPROVE' ? 'ok' : qa.decision === 'QUARANTINE' ? 'purple' : 'danger'}>
              Decision: {qa.decision}
            </Badge>
          </div>
        </div>
      ) : <p className="text-sm text-gray-400 italic">No QA inspection record found for this batch.</p>,
    },
    {
      stage: 'Inventory / Stock',
      icon: <Boxes size={16} />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      found: !!inv,
      data: inv ? (
        <div className="space-y-1 text-sm">
          <div className="flex gap-6 flex-wrap">
            <Field label="Item Code" value={inv.itemCode} />
            <Field label="Item Name" value={inv.itemName} />
            <Field label="Category" value={inv.category} />
          </div>
          <div className="flex gap-6 flex-wrap">
            <Field label="Qty on Hand" value={`${inv.qtyOnHand.toLocaleString()} ${inv.unit}`} />
            <Field label="Reorder Level" value={`${inv.reorderLevel.toLocaleString()} ${inv.unit}`} />
            <Field label="Location" value={inv.storageLocation} />
          </div>
          <div className="flex gap-6 flex-wrap">
            <Field label="Expiry Date" value={formatDate(inv.expiryDate)} />
            <Field label="Days to Expiry" value={`${inv.daysToExpiry}d`} />
          </div>
          <div className="mt-1">
            <Badge variant={inv.qaStatus === 'APPROVED' ? 'ok' : inv.qaStatus === 'REJECTED' ? 'danger' : inv.qaStatus === 'QUARANTINE' ? 'purple' : 'warn'}>
              {inv.qaStatus}
            </Badge>
          </div>
        </div>
      ) : <p className="text-sm text-gray-400 italic">No inventory record found for this batch.</p>,
    },
    {
      stage: 'Dispatch / Delivery Orders',
      icon: <Package size={16} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      found: dos.length > 0,
      data: dos.length > 0 ? (
        <div className="space-y-2">
          {dos.map((d) => (
            <div key={d.id} className="text-sm space-y-1">
              <div className="flex gap-6 flex-wrap">
                <Field label="DO Number" value={d.doNumber} />
                <Field label="Customer" value={d.customerName} />
                <Field label="Order Date" value={formatDate(d.orderDate)} />
              </div>
              <div className="flex gap-6 flex-wrap">
                <Field label="Items" value={d.items} />
                <Field label="Qty" value={String(d.qty)} />
                <Field label="Carrier" value={d.carrier ?? ''} />
              </div>
              <div className="flex gap-3 mt-1 items-center">
                <Badge variant={d.doStatus === 'DELIVERED' ? 'ok' : d.doStatus === 'DISPATCHED' ? 'blue' : 'warn'}>
                  {d.doStatus?.replace(/_/g, ' ')}
                </Badge>
                {d.trackingNo && <span className="text-xs text-gray-500">Tracking: {d.trackingNo}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-gray-400 italic">No dispatch records found for this batch.</p>,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, #D4A84712, #E8B94A08)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-gold)', opacity: 0.9 }}>
              <ClipboardList size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>Batch Traceability</h2>
              <p className="text-xs text-gray-400">Full supply chain history for batch <span className="font-mono font-semibold text-purple-600">{batchNumber}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Timeline */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {steps.map((step, idx) => (
            <div key={step.stage} className="flex gap-4">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${step.bgColor} ${step.color} border ${step.borderColor}`}>
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-0.5 flex-1 mt-1 mb-0" style={{ background: step.found ? 'var(--border)' : '#e5e7eb', minHeight: '16px' }} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 rounded-xl border p-4 mb-4 ${step.found ? `${step.borderColor} ${step.bgColor}` : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-semibold ${step.found ? step.color : 'text-gray-400'}`}>{step.stage}</span>
                  {idx < steps.length - 1 && (
                    <ArrowRight size={12} className="text-gray-300 ml-auto" />
                  )}
                </div>
                {step.data}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t text-xs text-gray-400 flex items-center gap-1" style={{ borderColor: 'var(--border)' }}>
          <ClipboardList size={11} />
          <span>GMP-compliant audit trail — all batch movements logged immutably</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  );
}

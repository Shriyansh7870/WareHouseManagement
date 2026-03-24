import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import KpiCard from '../../components/ui/KpiCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { formatDate } from '../../utils/formatters';

const RETURNS_KPIS = [
  { label: 'Returns This Month', value: '4', sub: '2 pending', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Pending Inspection', value: '2', sub: 'Action required', trend: 'warn' as const, accentColor: 'red' as const },
  { label: 'Restocked', value: '1', sub: 'Back to inventory', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Destroyed', value: '1', sub: 'Per QA decision', trend: 'neutral' as const, accentColor: 'purple' as const },
];

const MOCK_RETURNS = [
  { id: 'r1', rmaNumber: 'RMA-2024-001', returnDate: '2024-03-18', customerName: 'Apollo Pharmacy', doReference: 'DO-2024-0011', itemName: 'Paracetamol 500mg', qtyReturned: 200, reason: 'Near expiry — batch recall', condition: 'Sealed', disposition: 'PENDING_INSPECTION', status: 'RECEIVED' },
  { id: 'r2', rmaNumber: 'RMA-2024-002', returnDate: '2024-03-10', customerName: 'MedPlus', doReference: 'DO-2024-0008', itemName: 'Metformin 850mg', qtyReturned: 100, reason: 'Damaged packaging', condition: 'Damaged', disposition: 'DESTROYED', status: 'DISPOSED' },
  { id: 'r3', rmaNumber: 'RMA-2024-003', returnDate: '2024-03-05', customerName: 'Fortis Healthcare', doReference: 'DO-2024-0006', itemName: 'Ibuprofen 400mg', qtyReturned: 500, reason: 'Over-order', condition: 'Intact', disposition: 'RESTOCKED', status: 'DISPOSED' },
  { id: 'r4', rmaNumber: 'RMA-2024-004', returnDate: '2024-03-22', customerName: 'Max Hospital', doReference: 'DO-2024-0015', itemName: 'Ciprofloxacin 500mg', qtyReturned: 150, reason: 'Wrong item dispatched', condition: 'Sealed', disposition: 'PENDING_INSPECTION', status: 'INSPECTING' },
];

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

function dispositionVariant(d: string): BadgeVariant {
  switch (d) {
    case 'RESTOCKED': return 'ok';
    case 'DESTROYED': return 'danger';
    case 'PENDING_INSPECTION': return 'warn';
    case 'RETURNED_TO_VENDOR': return 'blue';
    default: return 'gray';
  }
}

function statusVariant(s: string): BadgeVariant {
  switch (s) {
    case 'DISPOSED': return 'ok';
    case 'INSPECTING': return 'blue';
    case 'RECEIVED': return 'warn';
    case 'INSPECTED': return 'teal';
    default: return 'gray';
  }
}

export default function ReturnsPage() {
  const [viewReturn, setViewReturn] = useState<typeof MOCK_RETURNS[0] | null>(null);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2">
        {RETURNS_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Return Merchandise Authorizations (RMA)</h3>
          <Button variant="primary" size="sm">+ New RMA</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['RMA No.', 'Date', 'Customer', 'DO Reference', 'Item', 'Qty Returned', 'Reason', 'Condition', 'Disposition', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_RETURNS.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-xs text-[#6c63ff] font-semibold">{ret.rmaNumber}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(ret.returnDate)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-700">{ret.customerName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{ret.doReference}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600">{ret.itemName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold">{ret.qtyReturned}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[140px] truncate">{ret.reason}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{ret.condition}</td>
                  <td className="px-3 py-2.5"><Badge variant={dispositionVariant(ret.disposition)}>{ret.disposition.replace('_', ' ')}</Badge></td>
                  <td className="px-3 py-2.5"><Badge variant={statusVariant(ret.status)}>{ret.status}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewReturn(ret)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                      {ret.disposition === 'PENDING_INSPECTION' && (
                        <button
                          className="px-2 py-1 text-[10px] rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                          onClick={async () => {
                            const ok = await confirm({ title: 'Destroy Return?', message: `This will permanently destroy RMA ${ret.rmaNumber} (${ret.itemName}). This action cannot be undone.`, confirmLabel: 'Destroy', variant: 'danger' });
                            if (ok) { toast.error(`${ret.rmaNumber} marked for destruction`); }
                          }}
                        >Destroy</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {viewReturn && (
        <Modal title={`Return — ${viewReturn.rmaNumber}`} onClose={() => setViewReturn(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['RMA Number', viewReturn.rmaNumber],
              ['Return Date', formatDate(viewReturn.returnDate)],
              ['Customer', viewReturn.customerName],
              ['DO Reference', viewReturn.doReference],
              ['Item Name', viewReturn.itemName],
              ['Qty Returned', viewReturn.qtyReturned],
              ['Condition', viewReturn.condition],
              ['Disposition', viewReturn.disposition.replace(/_/g, ' ')],
              ['Status', viewReturn.status],
              ['Reason', viewReturn.reason],
            ].map(([l, v]) => (
              <div key={String(l)} className={l === 'Reason' ? 'col-span-2' : ''}>
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

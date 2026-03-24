import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

const CC_KPIS = [
  { label: 'Counts This Month', value: '3', sub: '1 full, 2 partial', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'Variances Found', value: '7', sub: 'Across 3 counts', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Accuracy Rate', value: '99.4%', sub: '+0.1% vs last month', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Pending Reconciliation', value: '2', sub: 'Awaiting sign-off', trend: 'warn' as const, accentColor: 'red' as const },
];

const MOCK_COUNTS = [
  {
    id: 'cc1', countId: 'CC-2024-001', type: 'Full', date: '2024-03-15', zone: 'Main Store — Zone A',
    totalSKUs: 36, variances: 3, conductedBy: 'Kiran Patil', status: 'RECONCILED',
    varList: [
      { item: 'Paracetamol 500mg', batch: 'B2847', sysQty: 12500, physQty: 12450, variance: -50, pct: -0.4, reason: 'Sampling loss', adjustedBy: 'Rahul Mehta' },
      { item: 'Azithromycin 500mg', batch: 'I9923', sysQty: 1250, physQty: 1200, variance: -50, pct: -4.0, reason: 'Damaged stock written off', adjustedBy: 'Rahul Mehta' },
      { item: 'Ibuprofen 400mg', batch: 'G4412', sysQty: 9400, physQty: 9400, variance: 0, pct: 0, reason: '', adjustedBy: '' },
    ],
  },
  {
    id: 'cc2', countId: 'CC-2024-002', type: 'Partial', date: '2024-03-10', zone: 'Cold Room A',
    totalSKUs: 8, variances: 2, conductedBy: 'Priya Sharma', status: 'PENDING_RECONCILIATION',
    varList: [
      { item: 'Pantoprazole 40mg', batch: 'F8821', sysQty: 6800, physQty: 6785, variance: -15, pct: -0.22, reason: 'Under investigation', adjustedBy: '' },
      { item: 'Omeprazole 20mg', batch: 'M5512', sysQty: 3600, physQty: 3612, variance: 12, pct: 0.33, reason: 'Receiving entry delay', adjustedBy: '' },
    ],
  },
  {
    id: 'cc3', countId: 'CC-2024-003', type: 'Random', date: '2024-03-05', zone: 'Raw Material Store',
    totalSKUs: 6, variances: 2, conductedBy: 'Amit Kumar', status: 'IN_PROGRESS',
    varList: [],
  },
];

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

function statusVariant(s: string): BadgeVariant {
  switch (s) {
    case 'RECONCILED': return 'ok';
    case 'CLOSED': return 'teal';
    case 'IN_PROGRESS': return 'blue';
    case 'PENDING_RECONCILIATION': return 'warn';
    default: return 'gray';
  }
}

export default function CycleCountPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<typeof MOCK_COUNTS[0] | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2">
        {CC_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="sm"><Plus size={13} /> New Cycle Count</Button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Count ID', 'Type', 'Date', 'Zone / Location', 'Total SKUs', 'Variances', 'Conducted By', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_COUNTS.map((cc) => (
                <React.Fragment key={cc.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                    <td className="px-3 py-2.5 w-8">
                      <button
                        onClick={() => setExpanded(expanded === cc.id ? null : cc.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expanded === cc.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{cc.countId}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{cc.type}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(cc.date)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{cc.zone}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{cc.totalSKUs}</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-xs font-bold ${cc.variances > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {cc.variances}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{cc.conductedBy}</td>
                    <td className="px-3 py-2.5"><Badge variant={statusVariant(cc.status)}>{cc.status.replace('_', ' ')}</Badge></td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setViewCount(cc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                  {expanded === cc.id && cc.varList.length > 0 && (
                    <tr>
                      <td colSpan={10} className="px-0 py-0">
                        <div className="bg-gray-50 border-y border-gray-200">
                          <div className="px-8 py-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Variance Reconciliation</p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-left text-gray-500">
                                  {['Item', 'Batch', 'System Qty', 'Physical Qty', 'Variance', 'Variance %', 'Reason Code', 'Adjusted By'].map((h) => (
                                    <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {cc.varList.map((v, i) => (
                                  <tr key={i} className="text-gray-700">
                                    <td className="py-1 pr-4">{v.item}</td>
                                    <td className="py-1 pr-4 font-mono">{v.batch}</td>
                                    <td className="py-1 pr-4 font-mono font-semibold">{v.sysQty.toLocaleString()}</td>
                                    <td className="py-1 pr-4 font-mono font-semibold">{v.physQty.toLocaleString()}</td>
                                    <td className={`py-1 pr-4 font-mono font-bold ${v.variance < 0 ? 'text-red-600' : v.variance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {v.variance > 0 ? '+' : ''}{v.variance}
                                    </td>
                                    <td className="py-1 pr-4 font-mono">{v.pct.toFixed(2)}%</td>
                                    <td className="py-1 pr-4">{v.reason || '—'}</td>
                                    <td className="py-1 pr-4">{v.adjustedBy || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {viewCount && (
        <Modal title={`Cycle Count — ${viewCount.countId}`} onClose={() => setViewCount(null)} width="640px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
            {[
              ['Count ID', viewCount.countId],
              ['Type', viewCount.type],
              ['Date', formatDate(viewCount.date)],
              ['Zone / Location', viewCount.zone],
              ['Total SKUs', viewCount.totalSKUs],
              ['Variances Found', viewCount.variances],
              ['Conducted By', viewCount.conductedBy],
              ['Status', viewCount.status.replace('_', ' ')],
            ].map(([l, v]) => (
              <div key={String(l)}>
                <div className="text-xs text-gray-500 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{String(v ?? '—')}</div>
              </div>
            ))}
          </div>
          {viewCount.varList.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Variance List</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      {['Item', 'Batch', 'Sys Qty', 'Phys Qty', 'Variance', '%', 'Reason'].map((h) => (
                        <th key={h} className="pb-1.5 pr-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {viewCount.varList.map((v, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-1.5 pr-3">{v.item}</td>
                        <td className="py-1.5 pr-3 font-mono">{v.batch}</td>
                        <td className="py-1.5 pr-3 font-mono font-semibold">{v.sysQty.toLocaleString()}</td>
                        <td className="py-1.5 pr-3 font-mono font-semibold">{v.physQty.toLocaleString()}</td>
                        <td className={`py-1.5 pr-3 font-mono font-bold ${v.variance < 0 ? 'text-red-600' : v.variance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {v.variance > 0 ? '+' : ''}{v.variance}
                        </td>
                        <td className="py-1.5 pr-3 font-mono">{v.pct.toFixed(2)}%</td>
                        <td className="py-1.5 pr-3">{v.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
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
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useRBAC } from '../../hooks/useRBAC';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/formatters';
import type { CAPAPriority, CAPAStatus, CAPA, QAInspection } from '../../types/qa.types';

const capaSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  priority: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  assignedTo: z.string().min(1, 'Assignee is required'),
  grnRef: z.string().optional(),
  description: z.string().min(5, 'Description is required'),
  correctiveAction: z.string().optional(),
});

type CAPAForm = z.infer<typeof capaSchema>;

const QA_KPIS = [
  { label: 'Pending Inspections', value: '4', sub: 'Awaiting decision', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Approved Today', value: '3', sub: 'Batches cleared', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Quarantine Batches', value: '5', sub: 'Under hold', trend: 'warn' as const, accentColor: 'purple' as const },
  { label: 'Rejected FY', value: '5', sub: '3.6% rejection rate', trend: 'down' as const, accentColor: 'red' as const },
  { label: 'Open CAPAs', value: '4', sub: '1 critical overdue', trend: 'warn' as const, accentColor: 'orange' as const },
];

function capaPriorityVariant(p: CAPAPriority) {
  switch (p) {
    case 'CRITICAL': return 'danger';
    case 'MAJOR': return 'orange';
    case 'MINOR': return 'blue';
    default: return 'gray';
  }
}

function capaStatusVariant(s: CAPAStatus) {
  switch (s) {
    case 'CLOSED': return 'ok';
    case 'OPEN': return 'warn';
    case 'IN_PROGRESS': return 'blue';
    case 'OVERDUE': return 'danger';
    case 'PENDING_VERIFICATION': return 'purple';
    default: return 'gray';
  }
}

function NewCAPAModal({ onClose }: { onClose: () => void }) {
  const { addCAPA } = useDataStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CAPAForm>({
    resolver: zodResolver(capaSchema),
    defaultValues: { priority: 'MAJOR' },
  });

  const onSubmit = async (data: CAPAForm) => {
    await new Promise(r => setTimeout(r, 300));
    const capaNumber = `CAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    addCAPA({
      id: `capa-${Date.now()}`,
      capaNumber,
      source: data.source.toUpperCase().replace(/\s/g, '_'),
      description: data.description,
      category: data.category,
      priority: data.priority,
      raisedBy: 'Rahul Mehta',
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      status: 'OPEN',
    });
    toast.success(`CAPA ${capaNumber} created successfully`);
    onClose();
  };

  return (
    <Modal
      title="New CAPA"
      width="640px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>Submit CAPA</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Source <span className="text-red-500">*</span></label>
          <select {...register('source')} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.source ? 'border-red-400' : 'border-gray-200'}`}>
            <option value="">Select source</option>
            {['QA Inspection', 'Customer Complaint', 'Deviation', 'Audit', 'Regulatory', 'Internal'].map(o => <option key={o}>{o}</option>)}
          </select>
          {errors.source && <p className="text-[11px] text-red-500 mt-0.5">{errors.source.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Priority <span className="text-red-500">*</span></label>
          <select {...register('priority')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30">
            <option value="CRITICAL">Critical</option>
            <option value="MAJOR">Major</option>
            <option value="MINOR">Minor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category <span className="text-red-500">*</span></label>
          <input {...register('category')} placeholder="e.g. Product Quality" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.category && <p className="text-[11px] text-red-500 mt-0.5">{errors.category.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Due Date <span className="text-red-500">*</span></label>
          <input type="date" {...register('dueDate')} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.dueDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.dueDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.dueDate.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Assigned To <span className="text-red-500">*</span></label>
          <input {...register('assignedTo')} placeholder="Assignee name" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 ${errors.assignedTo ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
          {errors.assignedTo && <p className="text-[11px] text-red-500 mt-0.5">{errors.assignedTo.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">GRN Reference</label>
          <input {...register('grnRef')} placeholder="GRN-2024-XXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea {...register('description')} rows={3} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="Describe the CAPA..." />
          {errors.description && <p className="text-[11px] text-red-500 mt-0.5">{errors.description.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Corrective Action</label>
          <textarea {...register('correctiveAction')} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 resize-none" placeholder="Steps to correct..." />
        </div>
      </div>
    </Modal>
  );
}

const TABS = [
  { id: 'inspections', label: 'QA Inspections' },
  { id: 'quarantine', label: 'Quarantine Hold' },
  { id: 'capa', label: 'CAPA Tracker' },
  { id: 'deviations', label: 'Deviation Log' },
];

export default function QAPage() {
  const [tab, setTab] = useState('inspections');
  const [search, setSearch] = useState('');
  const [showNewCAPA, setShowNewCAPA] = useState(false);
  const [viewCAPA, setViewCAPA] = useState<CAPA | null>(null);
  const [viewInspection, setViewInspection] = useState<QAInspection | null>(null);
  const { inventory, qaInspections, capas, deviations, updateQAInspection, updateInventoryItem } = useDataStore();
  const quarantineItems = inventory.filter((i) => i.qaStatus === 'QUARANTINE');
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const { canApproveQA, canManageCAPAs, role } = useRBAC();

  const handleApprove = (insp: QAInspection) => {
    updateQAInspection(insp.id, { result: 'PASSED', decision: 'APPROVE' });
    const invItem = inventory.find(i => i.batchNumber === insp.batchNumber);
    if (invItem) updateInventoryItem(invItem.id, { qaStatus: 'APPROVED' });
    toast.success(`Batch ${insp.batchNumber} approved`);
  };

  const handleQuarantine = (insp: QAInspection) => {
    updateQAInspection(insp.id, { result: 'FAILED', decision: 'QUARANTINE' });
    const invItem = inventory.find(i => i.batchNumber === insp.batchNumber);
    if (invItem) updateInventoryItem(invItem.id, { qaStatus: 'QUARANTINE' });
    toast(`Batch ${insp.batchNumber} placed in quarantine`, { icon: '⚠️' });
  };

  const handleReject = (insp: QAInspection) => {
    updateQAInspection(insp.id, { result: 'FAILED', decision: 'REJECT' });
    const invItem = inventory.find(i => i.batchNumber === insp.batchNumber);
    if (invItem) updateInventoryItem(invItem.id, { qaStatus: 'REJECTED' });
    toast.error(`Batch ${insp.batchNumber} rejected`);
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 lg:grid-cols-3">
        {QA_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        {tab === 'capa' && canManageCAPAs && (
          <Button variant="primary" size="sm" onClick={() => setShowNewCAPA(true)}>
            <Plus size={13} /> New CAPA
          </Button>
        )}
      </div>

      {/* QA Inspections */}
      {tab === 'inspections' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100">
            <SearchBox value={search} onChange={setSearch} placeholder="Search inspection, batch..." className="w-72" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Inspection ID', 'GRN Linked', 'Item', 'Batch', 'Supplier', 'Sampled By', 'Test Parameters', 'Result', 'Decision', 'TAT', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {qaInspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{insp.inspectionId}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{insp.grnLinked}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{insp.itemName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{insp.batchNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{insp.supplier}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{insp.sampledBy}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[140px] truncate">{insp.testParameters}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={insp.result === 'PASSED' ? 'ok' : insp.result === 'FAILED' ? 'danger' : 'warn'}>
                        {insp.result}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={insp.decision === 'APPROVE' ? 'ok' : insp.decision === 'REJECT' ? 'danger' : insp.decision === 'QUARANTINE' ? 'purple' : 'warn'}>
                        {insp.decision}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{insp.tatHours ?? '—'}h</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewInspection(insp)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={10} /> View
                        </button>
                        {canApproveQA ? (
                          <>
                            <button onClick={() => handleApprove(insp)} className="px-2 py-1 text-[10px] rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">Approve</button>
                            <button onClick={() => handleQuarantine(insp)} className="px-2 py-1 text-[10px] rounded bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors">Hold</button>
                            <button onClick={() => handleReject(insp)} className="px-2 py-1 text-[10px] rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">Reject</button>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic" title={`Role: ${role}`}>No QA access</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quarantine */}
      {tab === 'quarantine' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-orange-700">{quarantineItems.length} batches currently in quarantine hold</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Batch No.', 'Item', 'Qty Held', 'Hold Date', 'Location', 'QA Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quarantineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-orange-600 font-semibold">{item.batchNumber}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{item.itemName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{item.qtyOnHand.toLocaleString()} {item.unit}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(item.createdAt)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{item.storageLocation}</td>
                    <td className="px-3 py-2.5"><Badge variant="purple">Quarantine</Badge></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 text-[10px] rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">Release</button>
                        <button
                          className="px-2 py-1 text-[10px] rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                          onClick={async () => {
                            const ok = await confirm({ title: 'Destroy Batch?', message: `This will permanently destroy batch ${item.batchNumber}. This action cannot be undone.`, confirmLabel: 'Destroy', variant: 'danger' });
                            if (ok) { toast.error(`Batch ${item.batchNumber} marked for destruction`); }
                          }}
                        >Destroy</button>
                        <button className="px-2 py-1 text-[10px] rounded bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">Retest</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAPA Tracker */}
      {tab === 'capa' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['CAPA No.', 'Source', 'Description', 'Category', 'Priority', 'Raised By', 'Assigned To', 'Due Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {capas.map((capa) => (
                  <tr key={capa.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{capa.capaNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{capa.source.replace('_', ' ')}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 max-w-[180px]">
                      <div className="truncate" title={capa.description}>{capa.description}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{capa.category}</td>
                    <td className="px-3 py-2.5"><Badge variant={capaPriorityVariant(capa.priority)}>{capa.priority}</Badge></td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{capa.raisedBy}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{capa.assignedTo}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(capa.dueDate)}</td>
                    <td className="px-3 py-2.5"><Badge variant={capaStatusVariant(capa.status)}>{capa.status.replace('_', ' ')}</Badge></td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setViewCAPA(capa)}
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

      {/* Deviation Log */}
      {tab === 'deviations' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Dev. No.', 'Date', 'Batch / Item', 'Type', 'Description', 'Reported By', 'CAPA Linked', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deviations.map((dev) => (
                  <tr key={dev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{dev.deviationNo}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(dev.date)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{dev.batchRef ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{dev.deviationType}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 max-w-[200px]">
                      <div className="truncate" title={dev.description}>{dev.description}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{dev.reportedBy}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847]">{dev.capaLinked ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={dev.status === 'Closed' ? 'ok' : dev.status === 'Open' ? 'warn' : 'blue'}>
                        {dev.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showNewCAPA && <NewCAPAModal onClose={() => setShowNewCAPA(false)} />}

      {viewInspection && (
        <Modal title={`QA Inspection — ${viewInspection.inspectionId}`} onClose={() => setViewInspection(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Inspection ID', viewInspection.inspectionId],
              ['GRN Linked', viewInspection.grnLinked],
              ['Item Name', viewInspection.itemName],
              ['Batch Number', viewInspection.batchNumber],
              ['Supplier', viewInspection.supplier],
              ['Sampled By', viewInspection.sampledBy],
              ['Test Parameters', viewInspection.testParameters],
              ['Result', viewInspection.result],
              ['Decision', viewInspection.decision],
              ['TAT (hrs)', viewInspection.tatHours != null ? `${viewInspection.tatHours}h` : '—'],
            ].map(([l, v]) => (
              <div key={String(l)}>
                <div className="text-xs text-gray-500 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{String(v ?? '—')}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {viewCAPA && (
        <Modal title={`CAPA — ${viewCAPA.capaNumber}`} onClose={() => setViewCAPA(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['CAPA Number', viewCAPA.capaNumber],
              ['Source', viewCAPA.source.replace('_', ' ')],
              ['Category', viewCAPA.category],
              ['Priority', viewCAPA.priority],
              ['Raised By', viewCAPA.raisedBy],
              ['Assigned To', viewCAPA.assignedTo],
              ['Due Date', formatDate(viewCAPA.dueDate)],
              ['Status', viewCAPA.status.replace('_', ' ')],
              ['Closure Date', viewCAPA.closureDate ? formatDate(viewCAPA.closureDate) : '—'],
              ['Description', viewCAPA.description],
            ].map(([l, v]) => (
              <div key={String(l)} className={l === 'Description' ? 'col-span-2' : ''}>
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

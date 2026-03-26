import React, { useState } from 'react';
import { Plus, Eye, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
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

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

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

/* ─── CAPA Sources & Categories ─── */
const CAPA_SOURCES = ['QA Inspection', 'Customer Complaint', 'Deviation', 'Audit', 'Regulatory', 'Internal'];
const CAPA_CATEGORIES = ['Product Quality', 'Cold Chain', 'Documentation', 'Packaging', 'Process', 'Equipment', 'Training', 'Contamination'];

/* ─── New CAPA Modal ─── */
function NewCAPAModal({ onClose }: { onClose: () => void }) {
  const { addCAPA, grns } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    source: '',
    priority: 'MAJOR' as CAPAPriority,
    category: '',
    dueDate: '',
    assignedTo: '',
    raisedBy: '',
    grnRef: '',
    batchRef: '',
    description: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
  });

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.source) errs.source = 'Source is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    if (!form.assignedTo.trim()) errs.assignedTo = 'Assigned To is required';
    if (!form.raisedBy.trim()) errs.raisedBy = 'Raised By is required';
    if (!form.description.trim() || form.description.trim().length < 5) errs.description = 'Description is required (min 5 chars)';
    setErrors(errs);
    if (Object.keys(errs).length > 0) toast.error('Please fill all required fields');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    const capaNumber = `CAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    addCAPA({
      id: `capa-${Date.now()}`,
      capaNumber,
      source: form.source.toUpperCase().replace(/\s/g, '_'),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      raisedBy: form.raisedBy.trim(),
      assignedTo: form.assignedTo.trim(),
      dueDate: form.dueDate,
      status: 'OPEN',
      grnRef: form.grnRef || undefined,
      batchRef: form.batchRef || undefined,
      rootCause: form.rootCause.trim() || undefined,
      correctiveAction: form.correctiveAction.trim() || undefined,
      preventiveAction: form.preventiveAction.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success(`CAPA ${capaNumber} created successfully`);
    setSaving(false);
    onClose();
  };

  const hasErr = (f: string) => !!errors[f];

  return (
    <Modal
      title="Create New CAPA"
      width="780px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>Submit CAPA</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Section 1: Source & Classification */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Source & Classification</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Source <span className="text-red-500">*</span></label>
              <select value={form.source} onChange={(e) => set('source', e.target.value)} className={hasErr('source') ? inputErrCls : inputCls}>
                <option value="">Select source</option>
                {CAPA_SOURCES.map((o) => <option key={o}>{o}</option>)}
              </select>
              {errors.source && <p className="text-[11px] text-red-500 mt-0.5">{errors.source}</p>}
            </div>
            <div>
              <label className={labelCls}>Priority <span className="text-red-500">*</span></label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputCls}>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={hasErr('category') ? inputErrCls : inputCls}>
                <option value="">Select category</option>
                {CAPA_CATEGORIES.map((o) => <option key={o}>{o}</option>)}
              </select>
              {errors.category && <p className="text-[11px] text-red-500 mt-0.5">{errors.category}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: References & Assignment */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">References & Assignment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Raised By <span className="text-red-500">*</span></label>
              <input type="text" value={form.raisedBy} onChange={(e) => set('raisedBy', e.target.value)} placeholder="Name of person raising CAPA" className={hasErr('raisedBy') ? inputErrCls : inputCls} />
              {errors.raisedBy && <p className="text-[11px] text-red-500 mt-0.5">{errors.raisedBy}</p>}
            </div>
            <div>
              <label className={labelCls}>Assigned To <span className="text-red-500">*</span></label>
              <input type="text" value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)} placeholder="Name of assignee" className={hasErr('assignedTo') ? inputErrCls : inputCls} />
              {errors.assignedTo && <p className="text-[11px] text-red-500 mt-0.5">{errors.assignedTo}</p>}
            </div>
            <div>
              <label className={labelCls}>Due Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} className={hasErr('dueDate') ? inputErrCls : inputCls} />
              {errors.dueDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.dueDate}</p>}
            </div>
            <div>
              <label className={labelCls}>GRN Reference</label>
              <select value={form.grnRef} onChange={(e) => set('grnRef', e.target.value)} className={inputCls}>
                <option value="">None</option>
                {grns.map((g) => <option key={g.id} value={g.grnNumber}>{g.grnNumber} — {g.itemName}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Batch Reference</label>
              <input type="text" value={form.batchRef} onChange={(e) => set('batchRef', e.target.value)} placeholder="e.g. B2847, D4521" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 3: Description */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Problem Description</h4>
          <div>
            <label className={labelCls}>Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Describe the issue in detail — what happened, when, where, impact..." className={`${hasErr('description') ? inputErrCls : inputCls} resize-none`} />
            {errors.description && <p className="text-[11px] text-red-500 mt-0.5">{errors.description}</p>}
          </div>
        </div>

        {/* Section 4: Root Cause & Actions */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Root Cause & Actions <span className="text-[10px] text-gray-300 font-normal normal-case tracking-normal">(can be filled later)</span></h4>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Root Cause Analysis</label>
              <textarea value={form.rootCause} onChange={(e) => set('rootCause', e.target.value)} rows={2} placeholder="Identify the root cause — why did this happen?" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Corrective Action</label>
              <textarea value={form.correctiveAction} onChange={(e) => set('correctiveAction', e.target.value)} rows={2} placeholder="Immediate steps to correct the issue..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Preventive Action</label>
              <textarea value={form.preventiveAction} onChange={(e) => set('preventiveAction', e.target.value)} rows={2} placeholder="Long-term steps to prevent recurrence..." className={`${inputCls} resize-none`} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── CAPA Detail Modal with Workflow ─── */
function CAPADetailModal({ capa, onClose }: { capa: CAPA; onClose: () => void }) {
  const { updateCAPA } = useDataStore();

  const WORKFLOW_STEPS = [
    { key: 'OPEN', label: 'Opened', icon: AlertTriangle },
    { key: 'IN_PROGRESS', label: 'Investigation', icon: Clock },
    { key: 'PENDING_VERIFICATION', label: 'Verification', icon: Eye },
    { key: 'CLOSED', label: 'Closed', icon: CheckCircle },
  ];

  const statusOrder = ['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED'];
  const currentIdx = statusOrder.indexOf(capa.status === 'OVERDUE' ? 'OPEN' : capa.status);

  const canAdvance = capa.status !== 'CLOSED';
  const nextStatus = canAdvance ? statusOrder[Math.min(currentIdx + 1, statusOrder.length - 1)] as CAPAStatus : null;

  const handleAdvance = () => {
    if (!nextStatus) return;
    const updates: Partial<CAPA> = { status: nextStatus, updatedAt: new Date().toISOString() };
    if (nextStatus === 'CLOSED') updates.closureDate = new Date().toISOString().split('T')[0];
    updateCAPA(capa.id, updates);
    toast.success(`CAPA ${capa.capaNumber} moved to ${nextStatus.replace('_', ' ')}`);
    onClose();
  };

  return (
    <Modal
      title={`CAPA Details — ${capa.capaNumber}`}
      onClose={onClose}
      width="780px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {canAdvance && nextStatus && (
            <Button variant="primary" onClick={handleAdvance}>
              Advance to {nextStatus.replace('_', ' ')} <ArrowRight size={13} />
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Workflow Progress */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Workflow Status</h4>
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isOverdue = capa.status === 'OVERDUE' && i === 0;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isOverdue ? 'border-red-400 bg-red-50 text-red-600' :
                      isCompleted ? 'border-green-400 bg-green-50 text-green-600' :
                      isCurrent ? 'border-[#D4A847] bg-[#D4A847]/10 text-[#D4A847]' :
                      'border-gray-200 bg-gray-50 text-gray-300'
                    }`}>
                      <StepIcon size={16} />
                    </div>
                    <span className={`text-[10px] font-medium text-center ${
                      isOverdue ? 'text-red-600' :
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-[#D4A847]' :
                      'text-gray-300'
                    }`}>{isOverdue ? 'OVERDUE' : step.label}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Info Grid */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">CAPA Information</h4>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
            {([
              ['CAPA Number', capa.capaNumber],
              ['Source', capa.source.replace(/_/g, ' ')],
              ['Category', capa.category],
              ['Priority', capa.priority],
              ['Status', capa.status.replace(/_/g, ' ')],
              ['Raised By', capa.raisedBy],
              ['Assigned To', capa.assignedTo],
              ['Due Date', formatDate(capa.dueDate)],
              ['Created', capa.createdAt ? formatDate(capa.createdAt) : '—'],
              ['GRN Ref', capa.grnRef ?? '—'],
              ['Batch Ref', capa.batchRef ?? '—'],
              ['Closure Date', capa.closureDate ? formatDate(capa.closureDate) : '—'],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Problem Description</h4>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{capa.description}</p>
        </div>

        {/* Root Cause */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Root Cause Analysis</h4>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{capa.rootCause || <span className="text-gray-400 italic">Not yet documented</span>}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Corrective Action</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">{capa.correctiveAction || <span className="text-gray-400 italic">Not yet documented</span>}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preventive Action</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">{capa.preventiveAction || <span className="text-gray-400 italic">Not yet documented</span>}</p>
          </div>
        </div>

        {/* Verification (if applicable) */}
        {(capa.status === 'PENDING_VERIFICATION' || capa.status === 'CLOSED') && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Verification</h4>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
              {capa.verificationNotes ? (
                <div className="space-y-1">
                  <p className="text-gray-700">{capa.verificationNotes}</p>
                  <p className="text-xs text-green-600 font-medium">Verified by {capa.verifiedBy} on {capa.verifiedDate ? formatDate(capa.verifiedDate) : '—'}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Awaiting verification</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

const TABS = [
  { id: 'inspections', label: 'QA Inspections' },
  { id: 'quarantine', label: 'Quarantine Hold' },
  { id: 'capa', label: 'CAPA Tracker' },
  { id: 'workflow', label: 'CAPA Workflow' },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {QA_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        {(tab === 'capa' || tab === 'workflow') && canManageCAPAs && (
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

      {/* CAPA Workflow */}
      {tab === 'workflow' && (
        <div className="space-y-4">
          {/* Workflow Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { label: 'Open', statuses: ['OPEN'], color: '#f97316', bg: 'bg-orange-50 border-orange-200' },
              { label: 'In Progress', statuses: ['IN_PROGRESS'], color: '#3b82f6', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Pending Verification', statuses: ['PENDING_VERIFICATION'], color: '#8b5cf6', bg: 'bg-purple-50 border-purple-200' },
              { label: 'Closed', statuses: ['CLOSED'], color: '#22c55e', bg: 'bg-green-50 border-green-200' },
            ] as const).map((stage) => {
              const count = capas.filter((c) => stage.statuses.includes(c.status)).length;
              const overdue = stage.label === 'Open' ? capas.filter((c) => c.status === 'OVERDUE').length : 0;
              return (
                <div key={stage.label} className={`rounded-xl border p-4 ${stage.bg}`}>
                  <div className="text-xs font-medium text-gray-500 mb-1">{stage.label}</div>
                  <div className="text-2xl font-bold" style={{ color: stage.color }}>{count + overdue}</div>
                  {overdue > 0 && <div className="text-[10px] text-red-500 font-medium mt-0.5">{overdue} overdue</div>}
                </div>
              );
            })}
          </div>

          {/* Workflow Kanban-style list */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {([
              { label: 'Open', statuses: ['OPEN', 'OVERDUE'], headerColor: 'text-orange-600', borderColor: 'border-orange-300' },
              { label: 'In Progress', statuses: ['IN_PROGRESS'], headerColor: 'text-blue-600', borderColor: 'border-blue-300' },
              { label: 'Pending Verification', statuses: ['PENDING_VERIFICATION'], headerColor: 'text-purple-600', borderColor: 'border-purple-300' },
              { label: 'Closed', statuses: ['CLOSED'], headerColor: 'text-green-600', borderColor: 'border-green-300' },
            ] as const).map((col) => {
              const items = capas.filter((c) => (col.statuses as readonly string[]).includes(c.status));
              return (
                <div key={col.label} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                  <div className={`px-4 py-3 border-b-2 ${col.borderColor}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wide ${col.headerColor}`}>{col.label} ({items.length})</h4>
                  </div>
                  <div className="p-3 space-y-2 min-h-[120px]">
                    {items.length === 0 && <p className="text-xs text-gray-300 text-center py-6">No CAPAs</p>}
                    {items.map((capa) => (
                      <div
                        key={capa.id}
                        onClick={() => setViewCAPA(capa)}
                        className="p-3 rounded-lg border border-gray-100 hover:border-[#D4A847]/40 hover:shadow-sm cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[11px] text-[#D4A847] font-semibold">{capa.capaNumber}</span>
                          <Badge variant={capaPriorityVariant(capa.priority)}>{capa.priority}</Badge>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2 mb-2">{capa.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">{capa.assignedTo}</span>
                          <span className={`text-[10px] font-medium ${capa.status === 'OVERDUE' ? 'text-red-500' : 'text-gray-400'}`}>
                            Due {formatDate(capa.dueDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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

      {viewCAPA && <CAPADetailModal capa={viewCAPA} onClose={() => setViewCAPA(null)} />}
    </div>
  );
}

import React, { useState } from 'react';
import { Upload, Eye, FileText, CheckCircle, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import { printTable } from '../../utils/printUtils';
import { exportToCSV } from '../../utils/csvExport';
import { MOCK_DOCUMENTS } from '../../utils/mockData';
import { formatDate } from '../../utils/formatters';
import type { DocType, DocStatus } from '../../types/document.types';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

const DOC_KPIS = [
  { label: 'Total Documents', value: '84', sub: '+5 this month', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'Review Due 30d', value: '6', sub: 'Action required', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'CoAs Linked', value: '57', sub: '68% of GRNs', trend: 'up' as const, accentColor: 'blue' as const },
  { label: 'Active SOPs', value: '21', sub: '3 under review', trend: 'up' as const, accentColor: 'green' as const },
];

function docTypeVariant(t: DocType) {
  switch (t) {
    case 'SOP': return 'purple';
    case 'COA': return 'blue';
    case 'VALIDATION': return 'teal';
    case 'REGULATORY': return 'ok';
    case 'CAPA': return 'orange';
    case 'AUDIT_REPORT': return 'warn';
    default: return 'gray';
  }
}

function docStatusVariant(s: DocStatus) {
  switch (s) {
    case 'ACTIVE': return 'ok';
    case 'UNDER_REVIEW': return 'warn';
    case 'SUPERSEDED': return 'gray';
    case 'ARCHIVED': return 'gray';
    default: return 'gray';
  }
}

const DOC_TYPES: DocType[] = ['SOP', 'COA', 'VALIDATION', 'REGULATORY', 'CAPA', 'AUDIT_REPORT'];
const DOC_TYPE_LABELS: Record<DocType, string> = { SOP: 'SOP', COA: 'Certificate of Analysis', VALIDATION: 'Validation', REGULATORY: 'Regulatory', CAPA: 'CAPA', AUDIT_REPORT: 'Audit Report' };
const OWNERS = ['Rahul Mehta', 'Priya Sharma', 'Amit Kumar', 'Kiran Patil'];

function UploadDocumentModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '', docType: '' as DocType | '', version: '1.0', owner: '', reviewDate: '', linkedTo: '', description: '',
  });

  const set = (f: string, v: string) => {
    setForm((prev) => ({ ...prev, [f]: v }));
    setErrors((prev) => { const c = { ...prev }; delete c[f]; return c; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.docType) errs.docType = 'Type is required';
    if (!form.owner) errs.owner = 'Owner is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) toast.error('Please fill all required fields');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success(`Document "${form.title}" uploaded successfully`);
    setSaving(false);
    onClose();
  };

  const hasErr = (f: string) => !!errors[f];

  return (
    <Modal title="Upload Document" width="720px" onClose={onClose} footer={
      <><Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" loading={saving} onClick={handleSubmit}><Upload size={13} /> Upload</Button></>
    }>
      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Document Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className={labelCls}>Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. SOP — GRN Receiving Process v2.0" className={hasErr('title') ? inputErrCls : inputCls} />
              {errors.title && <p className="text-[11px] text-red-500 mt-0.5">{errors.title}</p>}</div>
            <div><label className={labelCls}>Type <span className="text-red-500">*</span></label>
              <select value={form.docType} onChange={(e) => set('docType', e.target.value)} className={hasErr('docType') ? inputErrCls : inputCls}>
                <option value="">Select type</option>
                {DOC_TYPES.map((t) => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
              </select>
              {errors.docType && <p className="text-[11px] text-red-500 mt-0.5">{errors.docType}</p>}</div>
            <div><label className={labelCls}>Version</label>
              <input type="text" value={form.version} onChange={(e) => set('version', e.target.value)} placeholder="e.g. 1.0" className={inputCls} /></div>
            <div><label className={labelCls}>Owner <span className="text-red-500">*</span></label>
              <select value={form.owner} onChange={(e) => set('owner', e.target.value)} className={hasErr('owner') ? inputErrCls : inputCls}>
                <option value="">Select owner</option>
                {OWNERS.map((o) => <option key={o}>{o}</option>)}
              </select>
              {errors.owner && <p className="text-[11px] text-red-500 mt-0.5">{errors.owner}</p>}</div>
            <div><label className={labelCls}>Review Date</label>
              <input type="date" value={form.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} className={inputCls} /></div>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">References & Description</h4>
          <div className="space-y-4">
            <div><label className={labelCls}>Linked To</label>
              <input type="text" value={form.linkedTo} onChange={(e) => set('linkedTo', e.target.value)} placeholder="GRN No., Batch No., Module name..." className={inputCls} /></div>
            <div><label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Brief description of the document..." className={`${inputCls} resize-none`} /></div>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">File Upload</h4>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-[#D4A847] bg-[#D4A847]/5' : 'border-gray-200 hover:border-[#D4A847]'}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={() => setDragging(false)}
          >
            <Upload size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Drag & drop or <span className="text-[#D4A847] font-medium">click to browse</span></p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, JPG — max 25MB</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const TABS = [
  { id: 'all', label: 'All Documents' },
  { id: 'sop', label: 'SOPs' },
  { id: 'coa', label: 'CoAs' },
  { id: 'upload', label: 'Upload' },
];

const MOCK_SOPS = MOCK_DOCUMENTS.filter((d) => d.docType === 'SOP');
const MOCK_COAS = MOCK_DOCUMENTS.filter((d) => d.docType === 'COA');

export default function DocumentsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewDoc, setViewDoc] = useState<import('../../types/document.types').Document | null>(null);

  const filtered = MOCK_DOCUMENTS.filter((d) =>
    !search ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.docId.toLowerCase().includes(search.toLowerCase())
  );

  const DocTable = ({ data }: { data: typeof MOCK_DOCUMENTS }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {['Doc ID', 'Title', 'Type', 'Version', 'Linked To', 'Owner', 'Review Date', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{doc.docId}</td>
              <td className="px-3 py-2.5 text-sm text-gray-700 max-w-[180px]">
                <div className="truncate" title={doc.title}>{doc.title}</div>
              </td>
              <td className="px-3 py-2.5"><Badge variant={docTypeVariant(doc.docType)}>{doc.docType}</Badge></td>
              <td className="px-3 py-2.5 font-mono text-xs text-gray-600">v{doc.version ?? '1.0'}</td>
              <td className="px-3 py-2.5 text-xs text-gray-500">{doc.linkedTo || '—'}</td>
              <td className="px-3 py-2.5 text-xs text-gray-600">{doc.owner}</td>
              <td className="px-3 py-2.5 text-xs text-gray-600">{doc.reviewDate ? formatDate(doc.reviewDate) : '—'}</td>
              <td className="px-3 py-2.5"><Badge variant={docStatusVariant(doc.status)}>{doc.status.replace('_', ' ')}</Badge></td>
              <td className="px-3 py-2.5">
                <button
                  onClick={() => setViewDoc(doc)}
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
  );

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOC_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={(id) => { setTab(id); if (id === 'upload') setShowUpload(true); }} />
        <Button variant="primary" size="sm" onClick={() => setShowUpload(true)}>
          <Upload size={13} /> Upload Document
        </Button>
      </div>

      {tab === 'all' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search title, ID..." className="w-72" />
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => exportToCSV(
                filtered.map((d) => ({
                  'Doc ID': d.docId, 'Title': d.title, 'Type': d.docType, 'Version': d.version ?? '',
                  'Owner': d.owner, 'Linked To': d.linkedTo ?? '', 'Review Date': d.reviewDate ?? '', 'Status': d.status,
                })),
                'documents'
              )}><Download size={13} /> Export</Button>
              <Button variant="ghost" size="sm" onClick={() => printTable({
                title: 'Document Management Register',
                subtitle: `${filtered.length} documents`,
                headers: ['Doc ID', 'Title', 'Type', 'Version', 'Owner', 'Status'],
                rows: filtered.map((d) => [d.docId, d.title, d.docType, `v${d.version ?? '1.0'}`, d.owner, d.status]),
                orientation: 'landscape',
              })}><Printer size={13} /> Print</Button>
            </div>
          </div>
          <DocTable data={filtered} />
        </div>
      )}

      {tab === 'sop' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <DocTable data={MOCK_SOPS.length > 0 ? MOCK_SOPS : MOCK_DOCUMENTS} />
        </div>
      )}

      {tab === 'coa' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <DocTable data={MOCK_COAS.length > 0 ? MOCK_COAS : MOCK_DOCUMENTS} />
        </div>
      )}

      {showUpload && <UploadDocumentModal onClose={() => { setShowUpload(false); setTab('all'); }} />}

      {viewDoc && (
        <Modal title={`Document — ${viewDoc.docId}`} onClose={() => setViewDoc(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Doc ID', viewDoc.docId],
              ['Title', viewDoc.title],
              ['Type', viewDoc.docType],
              ['Version', viewDoc.version ? `v${viewDoc.version}` : '—'],
              ['Owner', viewDoc.owner],
              ['Uploaded By', viewDoc.uploadedBy],
              ['Linked To', viewDoc.linkedTo ?? '—'],
              ['Review Date', viewDoc.reviewDate ? formatDate(viewDoc.reviewDate) : '—'],
              ['Upload Date', formatDate(viewDoc.createdAt)],
              ['Status', viewDoc.status.replace('_', ' ')],
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

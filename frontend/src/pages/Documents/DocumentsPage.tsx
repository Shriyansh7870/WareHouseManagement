import React, { useState } from 'react';
import { Upload, Eye, FileText, CheckCircle } from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import { MOCK_DOCUMENTS } from '../../utils/mockData';
import { formatDate } from '../../utils/formatters';
import type { DocType, DocStatus } from '../../types/document.types';

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

function UploadDocumentModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  return (
    <Modal
      title="Upload Document"
      width="560px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { alert('Document uploaded (mock)'); onClose(); }}>Upload</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Title <span className="text-red-500">*</span></label>
          <input type="text" placeholder="Document title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type <span className="text-red-500">*</span></label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30">
              <option value="">Select type</option>
              {['SOP', 'CoA', 'Validation', 'Regulatory', 'CAPA', 'Audit Report', 'Policy'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Version</label>
            <input type="text" placeholder="e.g. 1.0, 2.1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Owner <span className="text-red-500">*</span></label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30">
              <option>Rahul Mehta</option>
              <option>Priya Sharma</option>
              <option>Amit Kumar</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Review Date</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Linked To</label>
          <input type="text" placeholder="GRN No., Batch No., Module..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
        </div>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-[#D4A847] bg-purple-50' : 'border-gray-200 hover:border-[#D4A847]'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={() => setDragging(false)}
        >
          <Upload size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Drag & drop or <span className="text-[#D4A847] font-medium">click to browse</span></p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX — max 25MB</p>
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
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2">
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
          <div className="p-4 border-b border-gray-100">
            <SearchBox value={search} onChange={setSearch} placeholder="Search title, ID..." className="w-72" />
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

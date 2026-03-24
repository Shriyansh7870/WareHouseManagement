import React, { useState } from 'react';
import { Eye, BarChart2, Star } from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import { MOCK_VENDORS, MOCK_ASNS } from '../../utils/mockData';
import { formatDate } from '../../utils/formatters';
import type { Vendor, VendorStatus } from '../../types/vendor.types';

function VendorDetailModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const audit = MOCK_AUDITS.find((a) => a.vendor === vendor.companyName);
  const scorecard = SCORECARDS.find((s) => s.vendorId === vendor.id);
  return (
    <Modal title={`${vendor.companyName} — ${vendor.vendorCode}`} onClose={onClose} width="640px">
      <div className="space-y-5">
        {/* Basic Info */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Vendor Information</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Vendor Code', vendor.vendorCode],
              ['Company Name', vendor.companyName],
              ['Category', vendor.category.replace(/_/g, ' ')],
              ['Drug License No.', vendor.drugLicenseNo ?? '—'],
              ['GMP Certification', vendor.gmpCertification ?? '—'],
              ['QA Rating', vendor.qaRating ? `${vendor.qaRating} (${vendor.qaPassRatePct}%)` : '—'],
              ['Last Audit Date', vendor.lastAuditDate ? formatDate(vendor.lastAuditDate) : '—'],
              ['POs This FY', String(vendor.posFY ?? 0)],
              ['Status', vendor.status.replace('_', ' ')],
            ].map(([l, v]) => (
              <div key={String(l)}>
                <div className="text-xs text-gray-500 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scorecard */}
        {scorecard && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">FY 2023–24 Scorecard</h4>
            <div className="space-y-2.5">
              {[
                { label: 'On-time Delivery', value: scorecard.onTime, color: '#22c55e' },
                { label: 'QA Pass Rate', value: scorecard.qaPass, color: '#D4A847' },
                { label: 'CoA Accuracy', value: scorecard.coaAccuracy, color: '#3b82f6' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{item.label}</span>
                    <span className="font-mono font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">GRNs Processed</span>
                <span className="font-mono font-bold text-sm">{scorecard.grns}</span>
              </div>
            </div>
          </div>
        )}

        {/* Last Audit */}
        {audit && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Last Audit — {audit.auditId}</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                <div className={`font-mono text-2xl font-bold ${audit.critical > 0 ? 'text-red-600' : 'text-gray-300'}`}>{audit.critical}</div>
                <div className="text-xs text-gray-500 mt-0.5">Critical Obs.</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                <div className={`font-mono text-2xl font-bold ${audit.major > 0 ? 'text-orange-600' : 'text-gray-300'}`}>{audit.major}</div>
                <div className="text-xs text-gray-500 mt-0.5">Major Obs.</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <div className={`font-mono text-2xl font-bold ${audit.minor > 0 ? 'text-blue-600' : 'text-gray-300'}`}>{audit.minor}</div>
                <div className="text-xs text-gray-500 mt-0.5">Minor Obs.</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-500">Result</span>
              <Badge variant={audit.result === 'Satisfactory' ? 'ok' : audit.result === 'Conditional' ? 'warn' : 'danger'}>
                {audit.result}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-500">Next Audit Due</span>
              <span className="font-medium text-gray-800">{formatDate(audit.next)}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

const VENDOR_KPIS = [
  { label: 'Approved Vendors', value: '8', sub: '2 review due', trend: 'warn' as const, accentColor: 'green' as const },
  { label: 'Avg QA Pass Rate FY', value: '95.8%', sub: '+1.2% vs last year', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'Vendor Review Due', value: '2', sub: 'Action required', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'POs Raised FY', value: '84', sub: '22 with Cipla', trend: 'up' as const, accentColor: 'blue' as const },
];

function vendorStatusVariant(s: VendorStatus) {
  switch (s) {
    case 'APPROVED': return 'ok';
    case 'REVIEW_DUE': return 'warn';
    case 'SUSPENDED': return 'danger';
    case 'BLACKLISTED': return 'danger';
    default: return 'gray';
  }
}

function gradeColor(grade: string) {
  if (grade === 'A+') return 'text-green-700 bg-green-50 border-green-200';
  if (grade === 'A') return 'text-blue-700 bg-blue-50 border-blue-200';
  if (grade === 'B') return 'text-orange-700 bg-orange-50 border-orange-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

const MOCK_AUDITS = [
  { id: 'a1', auditId: 'AUD-2024-001', vendor: 'Cipla Ltd.', date: '2024-01-10', type: 'Routine', by: 'Rahul Mehta', critical: 0, major: 1, minor: 2, result: 'Satisfactory', next: '2025-01-10' },
  { id: 'a2', auditId: 'AUD-2024-002', vendor: 'Sun Pharma', date: '2023-11-15', type: 'Routine', by: 'Priya Sharma', critical: 0, major: 0, minor: 3, result: 'Satisfactory', next: '2024-11-15' },
  { id: 'a3', auditId: 'AUD-2024-003', vendor: 'Lupin Ltd.', date: '2023-09-20', type: 'For Cause', by: 'Amit Kumar', critical: 1, major: 2, minor: 4, result: 'Conditional', next: '2024-03-20' },
];

const SCORECARDS = [
  { vendorId: 'v1', name: 'Cipla Ltd.', grade: 'A+', onTime: 98, qaPass: 98.5, coaAccuracy: 99, grns: 22 },
  { vendorId: 'v2', name: 'Sun Pharma', grade: 'A', onTime: 95, qaPass: 96.2, coaAccuracy: 97, grns: 18 },
  { vendorId: 'v3', name: 'Lupin Ltd.', grade: 'B', onTime: 82, qaPass: 88.7, coaAccuracy: 91, grns: 14 },
  { vendorId: 'v4', name: "Dr. Reddy's", grade: 'A', onTime: 96, qaPass: 97.1, coaAccuracy: 98, grns: 16 },
  { vendorId: 'v5', name: 'Aurobindo', grade: 'A+', onTime: 99, qaPass: 99.1, coaAccuracy: 99.5, grns: 20 },
  { vendorId: 'v6', name: 'Zydus Cadila', grade: 'A', onTime: 94, qaPass: 95.4, coaAccuracy: 96, grns: 10 },
];

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold w-12 text-right">{value}%</span>
    </div>
  );
}

const TABS = [
  { id: 'avl', label: 'Approved Vendors (AVL)' },
  { id: 'scorecards', label: 'Annual Scorecards' },
  { id: 'asns', label: 'Incoming ASNs' },
  { id: 'audits', label: 'Vendor Audits' },
];

export default function VendorsPage() {
  const [tab, setTab] = useState('avl');
  const [search, setSearch] = useState('');
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);

  const filteredVendors = MOCK_VENDORS.filter((v) =>
    !search ||
    v.companyName.toLowerCase().includes(search.toLowerCase()) ||
    v.vendorCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 lg:grid-cols-2">
        {VENDOR_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* AVL Table */}
      {tab === 'avl' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100">
            <SearchBox value={search} onChange={setSearch} placeholder="Search vendor, code..." className="w-72" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Vendor Code', 'Company', 'Category', 'Drug License No.', 'GMP Cert', 'QA Rating FY', 'Last Audit', 'POs FY', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{v.vendorCode}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-800">{v.companyName}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{v.category.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{v.drugLicenseNo ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">{v.gmpCertification ?? '—'}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded border font-bold ${gradeColor(v.qaRating ?? 'B')}`}>
                        {v.qaRating ?? '—'} ({v.qaPassRatePct}%)
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{v.lastAuditDate ? formatDate(v.lastAuditDate) : '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{v.posFY ?? 0}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={vendorStatusVariant(v.status)}>
                        {v.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setViewVendor(v)}
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

      {/* Scorecards */}
      {tab === 'scorecards' && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {SCORECARDS.map((sc) => (
            <Card key={sc.vendorId}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-800">{sc.name}</h3>
                  <p className="text-xs text-gray-500">FY 2023–24 • {sc.grns} GRNs processed</p>
                </div>
                <span className={`text-lg font-bold font-mono px-3 py-1 rounded-lg border ${gradeColor(sc.grade)}`}>
                  {sc.grade}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>On-time Delivery</span></div>
                  <ProgressBar value={sc.onTime} color="#22c55e" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>QA Pass Rate</span></div>
                  <ProgressBar value={sc.qaPass} color="#D4A847" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>CoA Accuracy</span></div>
                  <ProgressBar value={sc.coaAccuracy} color="#3b82f6" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Incoming ASNs */}
      {tab === 'asns' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ASN No.', 'Supplier', 'PO Reference', 'Item', 'Expected Qty', 'ETA', 'Vehicle', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_ASNS.map((asn) => (
                  <tr key={asn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{asn.asnNumber}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{asn.vendorName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{asn.poReference ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{asn.itemName ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{asn.expectedQty?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{asn.expectedDelivery ? formatDate(asn.expectedDelivery) : '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{asn.vehicleLR ?? '—'}</td>
                    <td className="px-3 py-2.5"><Badge variant={asn.status === 'PENDING' ? 'warn' : 'ok'}>{asn.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewVendor && <VendorDetailModal vendor={viewVendor} onClose={() => setViewVendor(null)} />}

      {/* Vendor Audits */}
      {tab === 'audits' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Audit ID', 'Vendor', 'Date', 'Type', 'Conducted By', 'Critical', 'Major', 'Minor', 'Result', 'Next Audit'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_AUDITS.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{audit.auditId}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{audit.vendor}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(audit.date)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{audit.type}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{audit.by}</td>
                    <td className="px-3 py-2.5"><span className={`font-mono text-xs font-bold ${audit.critical > 0 ? 'text-red-600' : 'text-gray-400'}`}>{audit.critical}</span></td>
                    <td className="px-3 py-2.5"><span className={`font-mono text-xs font-bold ${audit.major > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{audit.major}</span></td>
                    <td className="px-3 py-2.5"><span className={`font-mono text-xs font-bold ${audit.minor > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{audit.minor}</span></td>
                    <td className="px-3 py-2.5">
                      <Badge variant={audit.result === 'Satisfactory' ? 'ok' : audit.result === 'Conditional' ? 'warn' : 'danger'}>
                        {audit.result}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDate(audit.next)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

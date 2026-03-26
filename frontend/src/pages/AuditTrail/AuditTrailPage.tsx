import React, { useState, useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import SearchBox from '../../components/ui/SearchBox';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { MOCK_AUDIT_LOGS } from '../../utils/mockData';
import { formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import { printTable } from '../../utils/printUtils';
import type { AuditModule } from '../../types/audit.types';

const AUDIT_KPIS = [
  { label: 'Events Today', value: '48', sub: 'Last event 13:45', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'Events This Month', value: '1,240', sub: 'Across all modules', trend: 'up' as const, accentColor: 'blue' as const },
  { label: 'Active Users', value: '5', sub: '3 online now', trend: 'up' as const, accentColor: 'green' as const },
];

const MODULE_COLORS: Record<AuditModule, string> = {
  AUTH: '#9ca3af',
  INVENTORY: '#D4A847',
  GRN: '#3b82f6',
  QA: '#22c55e',
  COLD_CHAIN: '#14b8a6',
  DISPATCH: '#f97316',
  VENDOR: '#8b5cf6',
  DOCUMENTS: '#ec4899',
  CYCLE_COUNT: '#eab308',
  RETURNS: '#ef4444',
  REPORTS: '#6b7280',
  SETTINGS: '#374151',
};

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

const MODULE_VARIANTS: Record<AuditModule, BadgeVariant> = {
  AUTH: 'gray',
  INVENTORY: 'purple',
  GRN: 'blue',
  QA: 'ok',
  COLD_CHAIN: 'teal',
  DISPATCH: 'orange',
  VENDOR: 'purple',
  DOCUMENTS: 'blue',
  CYCLE_COUNT: 'warn',
  RETURNS: 'danger',
  REPORTS: 'gray',
  SETTINGS: 'gray',
};

const ALL_MODULES: AuditModule[] = ['AUTH', 'INVENTORY', 'GRN', 'QA', 'COLD_CHAIN', 'DISPATCH', 'VENDOR', 'DOCUMENTS', 'CYCLE_COUNT', 'RETURNS', 'REPORTS', 'SETTINGS'];

const PAGE_SIZE = 20;

export default function AuditTrailPage() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<AuditModule | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((log) => {
      if (moduleFilter && log.module !== moduleFilter) return false;
      if (dateFrom && log.createdAt < dateFrom) return false;
      if (dateTo && log.createdAt > dateTo + 'T23:59:59') return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.detail.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, moduleFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {AUDIT_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <SearchBox value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search action, detail, user..." className="w-64" />
        <select
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value as AuditModule | ''); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30"
        >
          <option value="">All Modules</option>
          {ALL_MODULES.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">From</span>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4A847]/40"
          />
          <span className="text-xs text-gray-400">To</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4A847]/40"
          />
        </div>
        {(dateFrom || dateTo || moduleFilter) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); setModuleFilter(''); setPage(0); }}
            className="text-xs text-purple-600 hover:text-purple-800 underline"
          >Clear</button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
        <Button variant="ghost" size="sm" onClick={() => exportToCSV(
          filtered.map(l => ({
            'Timestamp': l.createdAt,
            'Module': l.module,
            'Action': l.action,
            'Detail': l.detail,
            'User': l.userName,
            'IP': (l as { ipAddress?: string }).ipAddress ?? '',
          })),
          'audit-trail'
        )}>
          <Download size={13} /> Export
        </Button>
        <Button variant="ghost" size="sm" onClick={() => printTable({
          title: 'Audit Trail',
          subtitle: `Module: ${moduleFilter || 'All'} | Date: ${dateFrom || 'All'} – ${dateTo || 'All'} | ${filtered.length} entries`,
          headers: ['Timestamp', 'Module', 'Action', 'Detail', 'User'],
          rows: filtered.map(l => [l.createdAt, l.module, l.action, l.detail, l.userName]),
          orientation: 'landscape',
        })}>
          <Printer size={13} /> Print
        </Button>
      </div>

      {/* Audit List */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="divide-y divide-gray-50">
          {paged.map((log) => (
            <div
              key={log.id}
              className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors"
              style={{ borderLeft: `3px solid ${MODULE_COLORS[log.module]}` }}
            >
              <div className="w-36 flex-shrink-0">
                <div className="text-[11px] text-gray-400 font-mono">{formatDateTime(log.createdAt)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-gray-800">{log.action}</span>
                  <Badge variant={MODULE_VARIANTS[log.module]}>{log.module.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-gray-500">{log.detail}</p>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">{log.userName}</div>
            </div>
          ))}
          {paged.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">No audit entries found</div>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`px-3 py-1 text-xs border rounded ${page === i ? 'border-[#D4A847] text-[#D4A847] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

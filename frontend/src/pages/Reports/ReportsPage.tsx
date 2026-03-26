import React, { useState } from 'react';
import { Download, Calendar, Package, Truck, Clock, CheckCircle, Thermometer, Factory, Search, FileText, Eye, X, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useDataStore } from '../../store/dataStore';
import { exportToCSV } from '../../utils/csvExport';
import { formatDate, daysToExpiry } from '../../utils/formatters';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

interface ReportDef {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

const REPORTS: ReportDef[] = [
  { id: 'inventory', icon: <Package size={20} />, title: 'Inventory Ledger Report', desc: 'Full inventory status with FEFO order, expiry flags, and QA status', color: '#D4A847' },
  { id: 'grn', icon: <Truck size={20} />, title: 'GRN Register', desc: 'All goods receipts with QA decisions and CoA linkage', color: '#3b82f6' },
  { id: 'dispatch', icon: <Truck size={20} />, title: 'Dispatch Summary', desc: 'Dispatch orders, OTD performance, and customer-wise breakdown', color: '#22c55e' },
  { id: 'expiry', icon: <Clock size={20} />, title: 'Expiry & FEFO Report', desc: 'Expiry buckets, at-risk batches, and waste prevention metrics', color: '#ef4444' },
  { id: 'qa', icon: <CheckCircle size={20} />, title: 'QA & CAPA Report', desc: 'QA inspection results, CAPA status, and deviation log', color: '#f97316' },
  { id: 'coldchain', icon: <Thermometer size={20} />, title: 'Cold Chain Log', desc: 'Temperature records, excursion events, and uptime analysis', color: '#14b8a6' },
  { id: 'vendor', icon: <Factory size={20} />, title: 'Vendor Scorecard', desc: 'Vendor performance ratings, audit results, and GRN analytics', color: '#8b5cf6' },
  { id: 'audit', icon: <Search size={20} />, title: 'Audit Trail Export', desc: 'Complete immutable audit log with user, action, and timestamp', color: '#9ca3af' },
];

/* ─── Build report data ─── */
function useReportData() {
  const { inventory, grns, deliveryOrders, qaInspections, capas } = useDataStore();

  const getReportData = (reportId: string): { headers: string[]; rows: (string | number)[][] } => {
    switch (reportId) {
      case 'inventory':
        return {
          headers: ['Item Code', 'Item Name', 'Category', 'Batch No', 'Mfg Date', 'Expiry Date', 'Days Left', 'Qty', 'Unit', 'Location', 'Site', 'QA Status'],
          rows: inventory.map((i) => [i.itemCode, i.itemName, i.category, i.batchNumber, i.mfgDate, i.expiryDate, daysToExpiry(i.expiryDate), i.qtyOnHand, i.unit, i.storageLocation, i.siteCode, i.qaStatus]),
        };
      case 'grn':
        return {
          headers: ['GRN No', 'Date', 'Supplier', 'Item', 'Code', 'Batch', 'Qty', 'Unit', 'Mfg Date', 'Expiry', 'Location', 'Status', 'CoA'],
          rows: grns.map((g) => [g.grnNumber, formatDate(g.createdAt), g.vendorName ?? '', g.itemName, g.itemCode, g.batchNumber, g.qtyReceived, g.unit, g.mfgDate, g.expiryDate, g.storageLocation, g.status, g.coaLinked ? 'Yes' : 'No']),
        };
      case 'dispatch':
        return {
          headers: ['DO No', 'Date', 'Customer', 'Items', 'Qty', 'Carrier', 'Tracking', 'Priority', 'Pick Status', 'DO Status', 'Expected', 'Dispatched'],
          rows: deliveryOrders.map((d) => [d.doNumber, d.orderDate, d.customerName, d.items, d.qty, d.carrier ?? '', d.trackingNo ?? '', d.priority ?? 'NORMAL', d.pickStatus, d.doStatus, d.expectedDelivery ?? '', d.dispatchDate ?? '']),
        };
      case 'expiry':
        return {
          headers: ['Item Code', 'Item Name', 'Batch', 'Expiry Date', 'Days Left', 'Risk Level', 'Qty', 'Unit', 'Location'],
          rows: inventory
            .map((i) => ({ ...i, _days: daysToExpiry(i.expiryDate) }))
            .sort((a, b) => a._days - b._days)
            .map((i) => [i.itemCode, i.itemName, i.batchNumber, i.expiryDate, i._days, i._days <= 30 ? 'CRITICAL' : i._days <= 60 ? 'WARNING' : 'OK', i.qtyOnHand, i.unit, i.storageLocation]),
        };
      case 'qa':
        return {
          headers: ['Type', 'ID', 'Item', 'Batch', 'Supplier', 'Result', 'Decision', 'TAT (hrs)'],
          rows: [
            ...qaInspections.map((q) => ['Inspection', q.inspectionId, q.itemName, q.batchNumber, q.supplier, q.result, q.decision, q.tatHours ?? ''] as (string | number)[]),
            ...capas.map((c) => ['CAPA', c.capaNumber, c.description.slice(0, 50), c.batchRef ?? '', '', c.status, c.priority, ''] as (string | number)[]),
          ],
        };
      case 'vendor':
        return {
          headers: ['Vendor', 'Total GRNs', 'Approved', 'Rejected', 'Pending QA', 'CoA Linked'],
          rows: (() => {
            const map = new Map<string, { total: number; approved: number; rejected: number; pending: number; coa: number }>();
            grns.forEach((g) => {
              const key = g.vendorName ?? 'Unknown';
              const cur = map.get(key) ?? { total: 0, approved: 0, rejected: 0, pending: 0, coa: 0 };
              cur.total++;
              if (g.status === 'APPROVED') cur.approved++;
              if (g.status === 'REJECTED') cur.rejected++;
              if (g.status === 'PENDING_QA') cur.pending++;
              if (g.coaLinked) cur.coa++;
              map.set(key, cur);
            });
            return Array.from(map.entries()).map(([k, v]) => [k, v.total, v.approved, v.rejected, v.pending, v.coa]);
          })(),
        };
      default:
        return { headers: ['Info'], rows: [['Report data not available']] };
    }
  };

  return { getReportData };
}

/* ─── Generate A4 HTML string ─── */
function buildA4Html(title: string, headers: string[], rows: (string | number)[][], orientation: 'portrait' | 'landscape' = 'landscape') {
  const now = new Date();
  const dateStr = now.toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell ?? '—'}</td>`).join('')}</tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — Quantum Invenza</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 ${orientation}; margin: 15mm 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #111; padding: 0; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2.5px solid #D4A847; padding-bottom: 10px; margin-bottom: 14px; }
    .header .brand { font-size: 18px; font-weight: 900; color: #D4A847; }
    .header .company { font-size: 9px; color: #6b7280; margin-top: 2px; }
    .header .meta { text-align: right; font-size: 9px; color: #6b7280; line-height: 1.6; }
    .title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 3px; }
    .subtitle { font-size: 10px; color: #6b7280; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th { background: #f8f6f0; color: #1f1635; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 6px 5px; border: 1px solid #d4d0c8; text-align: left; white-space: nowrap; }
    td { padding: 5px 5px; border: 1px solid #e5e7eb; font-size: 9.5px; color: #374151; vertical-align: top; }
    tr:nth-child(even) td { background: #fafaf8; }
    .footer { margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer .total { font-size: 9px; color: #6b7280; }
    .signs { display: flex; gap: 60px; margin-top: 30px; }
    .signs .sign-box { text-align: center; }
    .signs .sign-line { width: 120px; border-top: 1px solid #374151; padding-top: 4px; font-size: 8px; color: #6b7280; }
    .page-footer { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 7.5px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding: 4px 12mm; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Quantum Invenza</div>
      <div class="company">Forge Quantum Solution | GMP Controlled Document</div>
    </div>
    <div class="meta">
      <div><strong>Document:</strong> ${title}</div>
      <div><strong>Generated:</strong> ${dateStr}</div>
      <div><strong>Prepared By:</strong> System Generated</div>
      <div><strong>Classification:</strong> Confidential</div>
    </div>
  </div>

  <div class="title">${title}</div>
  <div class="subtitle">Generated on ${dateStr} | Total Records: ${rows.length} | Format: A4 ${orientation}</div>

  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">
    <div class="total">Total Records: <strong>${rows.length}</strong></div>
  </div>

  <div class="signs">
    <div class="sign-box"><div class="sign-line">Prepared By</div></div>
    <div class="sign-box"><div class="sign-line">Reviewed By (QA)</div></div>
    <div class="sign-box"><div class="sign-line">Approved By</div></div>
  </div>

  <div class="page-footer">
    <span>Quantum Invenza WMS — Confidential | GMP Controlled Document</span>
    <span>Printed: ${dateStr} | For internal use only</span>
  </div>
</body>
</html>`;
}

/* ─── Preview Modal ─── */
function PreviewModal({ report, headers, rows, onClose, onDownload, onPrint }: {
  report: ReportDef;
  headers: string[];
  rows: (string | number)[][];
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${report.color}18`, color: report.color }}>
              {report.icon}
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-800">{report.title}</h2>
              <p className="text-[11px] text-gray-400">Preview — {rows.length} records | A4 Landscape</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onDownload}><Download size={13} /> Download CSV</Button>
            <Button variant="ghost" size="sm" onClick={onPrint}><Printer size={13} /> Print A4</Button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* A4 Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div
            className="bg-white mx-auto shadow-lg"
            style={{
              width: '297mm',
              minHeight: '210mm',
              maxWidth: '100%',
              padding: '15mm 12mm',
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
          >
            {/* Report Header */}
            <div className="flex items-start justify-between pb-3 mb-4" style={{ borderBottom: '2.5px solid #D4A847' }}>
              <div>
                <div className="text-lg font-black" style={{ color: '#D4A847' }}>Quantum Invenza</div>
                <div className="text-[9px] text-gray-500 mt-0.5">Forge Quantum Solution | GMP Controlled Document</div>
              </div>
              <div className="text-right text-[9px] text-gray-500 leading-relaxed">
                <div><strong>Document:</strong> {report.title}</div>
                <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
                <div><strong>Prepared By:</strong> System Generated</div>
                <div><strong>Classification:</strong> Confidential</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-sm font-bold text-gray-900 mb-0.5">{report.title}</div>
            <div className="text-[10px] text-gray-500 mb-4">
              Generated on {new Date().toLocaleString()} | Total Records: {rows.length} | Format: A4 Landscape
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[9.5px]">
                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="text-left px-2 py-1.5 font-bold text-[8.5px] uppercase tracking-wide text-gray-700 whitespace-nowrap" style={{ background: '#f8f6f0', border: '1px solid #d4d0c8' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 text-gray-700" style={{ border: '1px solid #e5e7eb', background: i % 2 === 0 ? 'white' : '#fafaf8' }}>
                          {cell ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 text-[9px] text-gray-500">
              Total Records: <strong>{rows.length}</strong>
            </div>

            {/* Signature lines */}
            <div className="flex gap-16 mt-8">
              {['Prepared By', 'Reviewed By (QA)', 'Approved By'].map((label) => (
                <div key={label} className="text-center">
                  <div className="w-28 border-t border-gray-400 pt-1 text-[8px] text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Page footer */}
            <div className="flex justify-between mt-6 pt-2 border-t border-gray-200 text-[7.5px] text-gray-400">
              <span>Quantum Invenza WMS — Confidential | GMP Controlled Document</span>
              <span>For internal use only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule Modal ─── */
function ScheduleModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success(`Schedule saved for "${title}"`);
    setSaving(false);
    onClose();
  };

  return (
    <Modal title={`Schedule Report: ${title}`} width="520px" onClose={onClose} footer={
      <><Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" loading={saving} onClick={handleSave}>Save Schedule</Button></>
    }>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Format <span className="text-red-500">*</span></label>
            <select className={inputCls}><option>CSV</option><option>PDF</option><option>Both (PDF + CSV)</option></select></div>
          <div><label className={labelCls}>Frequency <span className="text-red-500">*</span></label>
            <select className={inputCls}><option>Daily</option><option>Weekly (Monday)</option><option>Monthly (1st)</option><option>Quarterly</option></select></div>
          <div><label className={labelCls}>Delivery Time</label>
            <input type="time" defaultValue="08:00" className={inputCls} /></div>
          <div><label className={labelCls}>Date Range</label>
            <select className={inputCls}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option><option>Current FY</option></select></div>
        </div>
        <div><label className={labelCls}>Email Recipients <span className="text-red-500">*</span></label>
          <textarea rows={2} placeholder="email1@company.in, email2@company.in" className={`${inputCls} resize-none`} />
          <p className="text-[10px] text-gray-400 mt-1">Separate multiple emails with commas</p></div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ─── */
export default function ReportsPage() {
  const [scheduleReport, setScheduleReport] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const { getReportData } = useReportData();

  const handleDownloadCSV = (reportId: string) => {
    const report = REPORTS.find((r) => r.id === reportId);
    const { headers, rows } = getReportData(reportId);
    const csvData = rows.map((row) => {
      const obj: Record<string, string | number> = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    exportToCSV(csvData, `${reportId}-report`);
    toast.success(`${report?.title ?? 'Report'} downloaded as CSV`);
  };

  const handleDownloadA4 = (reportId: string) => {
    const report = REPORTS.find((r) => r.id === reportId);
    if (!report) return;
    const { headers, rows } = getReportData(reportId);
    const html = buildA4Html(report.title, headers, rows);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}-report-A4.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${report.title} downloaded (A4 format — open in browser and print to PDF)`);
  };

  const handlePrintA4 = (reportId: string) => {
    const report = REPORTS.find((r) => r.id === reportId);
    if (!report) return;
    const { headers, rows } = getReportData(reportId);
    const html = buildA4Html(report.title, headers, rows);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) return;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };

  const previewData = previewReport ? getReportData(previewReport) : null;
  const previewReportDef = previewReport ? REPORTS.find((r) => r.id === previewReport) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Generate and schedule reports for all WMS modules. All reports are GMP-compliant with timestamps.
        </div>
        <Badge variant="ok">
          <FileText size={11} /> {REPORTS.length} Reports Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <div
            key={report.title}
            className="bg-white rounded-xl p-5 hover:-translate-y-0.5 transition-all"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${report.color}18`, color: report.color }}>
                {report.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">{report.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{report.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadCSV(report.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <Download size={12} /> CSV
              </button>
              <button
                onClick={() => setPreviewReport(report.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <Eye size={12} /> Preview
              </button>
              <button
                onClick={() => setScheduleReport(report.title)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg text-white font-medium transition-colors hover:opacity-90"
                style={{ background: report.color }}
              >
                <Calendar size={12} /> Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {scheduleReport && <ScheduleModal title={scheduleReport} onClose={() => setScheduleReport(null)} />}
      {previewReport && previewReportDef && previewData && (
        <PreviewModal
          report={previewReportDef}
          headers={previewData.headers}
          rows={previewData.rows}
          onClose={() => setPreviewReport(null)}
          onDownload={() => { handleDownloadCSV(previewReport); }}
          onPrint={() => { handlePrintA4(previewReport); }}
        />
      )}
    </div>
  );
}

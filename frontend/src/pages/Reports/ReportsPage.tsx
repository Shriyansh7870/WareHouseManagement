import React, { useState } from 'react';
import { Download, Calendar, Package, Truck, Clock, CheckCircle, Thermometer, Factory, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useDataStore } from '../../store/dataStore';
import { exportToCSV } from '../../utils/csvExport';
import { printTable } from '../../utils/printUtils';
import { formatDate, daysToExpiry } from '../../utils/formatters';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

interface ReportDef {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  module: string;
}

const REPORTS: ReportDef[] = [
  { id: 'inventory', icon: <Package size={20} />, title: 'Inventory Ledger Report', desc: 'Full inventory status with FEFO order, expiry flags, and QA status', color: '#D4A847', module: 'Inventory' },
  { id: 'grn', icon: <Truck size={20} />, title: 'GRN Register', desc: 'All goods receipts with QA decisions and CoA linkage', color: '#3b82f6', module: 'GRN' },
  { id: 'dispatch', icon: <Truck size={20} />, title: 'Dispatch Summary', desc: 'Dispatch orders, OTD performance, and customer-wise breakdown', color: '#22c55e', module: 'Dispatch' },
  { id: 'expiry', icon: <Clock size={20} />, title: 'Expiry & FEFO Report', desc: 'Expiry buckets, at-risk batches, and waste prevention metrics', color: '#ef4444', module: 'Inventory' },
  { id: 'qa', icon: <CheckCircle size={20} />, title: 'QA & CAPA Report', desc: 'QA inspection results, CAPA status, and deviation log', color: '#f97316', module: 'QA' },
  { id: 'coldchain', icon: <Thermometer size={20} />, title: 'Cold Chain Log', desc: 'Temperature records, excursion events, and uptime analysis', color: '#14b8a6', module: 'Cold Chain' },
  { id: 'vendor', icon: <Factory size={20} />, title: 'Vendor Scorecard', desc: 'Vendor performance ratings, audit results, and GRN analytics', color: '#8b5cf6', module: 'Vendor' },
  { id: 'audit', icon: <Search size={20} />, title: 'Audit Trail Export', desc: 'Complete immutable audit log with user, action, and timestamp', color: '#9ca3af', module: 'Audit' },
];

/* ─── Generate report data as CSV ─── */
function useReportGenerator() {
  const { inventory, grns, deliveryOrders, qaInspections, capas, returns } = useDataStore();

  const generate = (reportId: string) => {
    switch (reportId) {
      case 'inventory':
        exportToCSV(inventory.map((i) => ({
          'Item Code': i.itemCode, 'Item Name': i.itemName, 'Category': i.category,
          'Batch No': i.batchNumber, 'Mfg Date': i.mfgDate, 'Expiry Date': i.expiryDate,
          'Days to Expiry': daysToExpiry(i.expiryDate), 'Qty on Hand': i.qtyOnHand,
          'Unit': i.unit, 'Location': i.storageLocation, 'Site': i.siteCode, 'QA Status': i.qaStatus,
        })), 'inventory-ledger-report');
        break;
      case 'grn':
        exportToCSV(grns.map((g) => ({
          'GRN No': g.grnNumber, 'Date': formatDate(g.createdAt), 'Supplier': g.vendorName ?? '',
          'Item': g.itemName, 'Code': g.itemCode, 'Batch': g.batchNumber,
          'Qty': g.qtyReceived, 'Unit': g.unit, 'Mfg Date': g.mfgDate,
          'Expiry': g.expiryDate, 'Location': g.storageLocation, 'Status': g.status,
          'CoA': g.coaLinked ? 'Yes' : 'No',
        })), 'grn-register-report');
        break;
      case 'dispatch':
        exportToCSV(deliveryOrders.map((d) => ({
          'DO No': d.doNumber, 'Date': d.orderDate, 'Customer': d.customerName,
          'Items': d.items, 'Qty': d.qty, 'Carrier': d.carrier ?? '',
          'Tracking': d.trackingNo ?? '', 'Priority': d.priority ?? 'NORMAL',
          'Pick Status': d.pickStatus, 'DO Status': d.doStatus,
          'Expected': d.expectedDelivery ?? '', 'Dispatched': d.dispatchDate ?? '',
        })), 'dispatch-summary-report');
        break;
      case 'expiry':
        exportToCSV(
          inventory
            .map((i) => ({ ...i, _days: daysToExpiry(i.expiryDate) }))
            .sort((a, b) => a._days - b._days)
            .map((i) => ({
              'Item Code': i.itemCode, 'Item Name': i.itemName, 'Batch': i.batchNumber,
              'Expiry Date': i.expiryDate, 'Days Left': i._days,
              'Risk Level': i._days <= 30 ? 'CRITICAL' : i._days <= 60 ? 'WARNING' : 'OK',
              'Qty': i.qtyOnHand, 'Unit': i.unit, 'Location': i.storageLocation,
            })),
          'expiry-fefo-report'
        );
        break;
      case 'qa':
        exportToCSV([
          ...qaInspections.map((q) => ({
            'Type': 'Inspection', 'ID': q.inspectionId, 'Item': q.itemName,
            'Batch': q.batchNumber, 'Supplier': q.supplier, 'Result': q.result,
            'Decision': q.decision, 'TAT (hrs)': q.tatHours ?? '',
          })),
          ...capas.map((c) => ({
            'Type': 'CAPA', 'ID': c.capaNumber, 'Item': c.description.slice(0, 50),
            'Batch': c.batchRef ?? '', 'Supplier': '', 'Result': c.status,
            'Decision': c.priority, 'TAT (hrs)': '',
          })),
        ], 'qa-capa-report');
        break;
      case 'vendor':
        exportToCSV(grns.reduce((acc, g) => {
          const key = g.vendorName ?? 'Unknown';
          if (!acc.find((a) => a.Vendor === key)) {
            const vendorGrns = grns.filter((gg) => gg.vendorName === key);
            acc.push({
              'Vendor': key, 'Total GRNs': vendorGrns.length,
              'Approved': vendorGrns.filter((gg) => gg.status === 'APPROVED').length,
              'Rejected': vendorGrns.filter((gg) => gg.status === 'REJECTED').length,
              'Pending QA': vendorGrns.filter((gg) => gg.status === 'PENDING_QA').length,
              'CoA Linked': vendorGrns.filter((gg) => gg.coaLinked).length,
            });
          }
          return acc;
        }, [] as Record<string, string | number>[]), 'vendor-scorecard-report');
        break;
      default:
        exportToCSV([{ 'Note': `${reportId} report — sample data` }], `${reportId}-report`);
    }
    toast.success('Report downloaded as CSV');
  };

  const preview = (reportId: string) => {
    const report = REPORTS.find((r) => r.id === reportId);
    if (!report) return;

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    switch (reportId) {
      case 'inventory':
        headers = ['Item Code', 'Item', 'Batch', 'Expiry', 'Days Left', 'Qty', 'Location', 'QA Status'];
        rows = inventory.slice(0, 10).map((i) => [i.itemCode, i.itemName, i.batchNumber, i.expiryDate, daysToExpiry(i.expiryDate), i.qtyOnHand, i.storageLocation, i.qaStatus]);
        break;
      case 'grn':
        headers = ['GRN No', 'Date', 'Supplier', 'Item', 'Batch', 'Qty', 'Status', 'CoA'];
        rows = grns.slice(0, 10).map((g) => [g.grnNumber, formatDate(g.createdAt), g.vendorName ?? '', g.itemName, g.batchNumber, g.qtyReceived, g.status, g.coaLinked ? 'Yes' : 'No']);
        break;
      case 'dispatch':
        headers = ['DO No', 'Customer', 'Items', 'Qty', 'Carrier', 'Status'];
        rows = deliveryOrders.slice(0, 10).map((d) => [d.doNumber, d.customerName, d.items, d.qty, d.carrier ?? '—', d.doStatus]);
        break;
      default:
        headers = ['Info'];
        rows = [['Preview not available — download the full report']];
    }

    printTable({ title: report.title, subtitle: `Generated ${new Date().toLocaleString()} — Preview (first 10 rows)`, headers, rows, orientation: 'landscape' });
  };

  return { generate, preview };
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
  const { generate, preview } = useReportGenerator();

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
                onClick={() => generate(report.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <Download size={12} /> Download
              </button>
              <button
                onClick={() => preview(report.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <Search size={12} /> Preview
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

      {scheduleReport && <ScheduleModal title={scheduleReport} onClose={() => setScheduleReport(null)} />}
    </div>
  );
}

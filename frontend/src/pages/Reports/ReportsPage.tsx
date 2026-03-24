import React, { useState } from 'react';
import { Download, Calendar, Package, Truck, Clock, CheckCircle, Thermometer, Factory, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

interface ReportCard {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

const REPORTS: ReportCard[] = [
  { icon: <Package size={20} />, title: 'Inventory Ledger Report', desc: 'Full inventory status with FEFO order, expiry flags, and QA status', color: '#D4A847' },
  { icon: <Truck size={20} />, title: 'GRN Register', desc: 'All goods receipts with QA decisions and CoA linkage', color: '#3b82f6' },
  { icon: <Truck size={20} />, title: 'Dispatch Summary', desc: 'Dispatch orders, OTD performance, and customer-wise breakdown', color: '#22c55e' },
  { icon: <Clock size={20} />, title: 'Expiry & FEFO Report', desc: 'Expiry buckets, at-risk batches, and waste prevention metrics', color: '#ef4444' },
  { icon: <CheckCircle size={20} />, title: 'QA & CAPA Report', desc: 'QA inspection results, CAPA status, and deviation log', color: '#f97316' },
  { icon: <Thermometer size={20} />, title: 'Cold Chain Log', desc: 'Temperature records, excursion events, and uptime analysis', color: '#14b8a6' },
  { icon: <Factory size={20} />, title: 'Vendor Scorecard', desc: 'Vendor performance ratings, audit results, and GRN analytics', color: '#8b5cf6' },
  { icon: <Search size={20} />, title: 'Audit Trail Export', desc: 'Complete immutable audit log with user, action, and timestamp', color: '#9ca3af' },
];

function ScheduleModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Modal
      title={`Schedule Report: ${title}`}
      width="480px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { alert('Schedule saved (mock)'); onClose(); }}>Save Schedule</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Format <span className="text-red-500">*</span></label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30">
            <option>PDF</option>
            <option>CSV</option>
            <option>Both (PDF + CSV)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Frequency <span className="text-red-500">*</span></label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30">
            <option>Daily</option>
            <option>Weekly (Monday)</option>
            <option>Monthly (1st)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Delivery Time</label>
          <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email Recipients <span className="text-red-500">*</span></label>
          <textarea
            rows={2}
            placeholder="email1@pharmatech.in, email2@pharmatech.in"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">Separate multiple emails with commas</p>
        </div>
      </div>
    </Modal>
  );
}

export default function ReportsPage() {
  const [scheduleReport, setScheduleReport] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        Generate and schedule reports for all WMS modules. All reports are GMP-compliant and include timestamps.
      </div>

      <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 sm:grid-cols-1">
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
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <Download size={12} /> Generate
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

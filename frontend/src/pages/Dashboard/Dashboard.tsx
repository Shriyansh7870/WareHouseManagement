import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../../components/ui/TabBar';
import KpiCard from '../../components/ui/KpiCard';
import Card from '../../components/ui/Card';

type KpiTrend = 'up' | 'down' | 'warn' | 'neutral';
type KpiAccent = 'purple' | 'orange' | 'green' | 'blue' | 'red' | 'teal';
interface KpiItem {
  label: string;
  value: string;
  sub: string;
  trend: KpiTrend;
  accentColor: KpiAccent;
  onClick?: () => void;
}
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ReferenceLine, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

const TABS = [
  { id: 'ops', label: 'Warehouse Ops' },
  { id: 'inv', label: 'Inventory Health' },
  { id: 'qa', label: 'QA Dashboard' },
  { id: 'cold', label: 'Cold Chain' },
  { id: 'dispatch', label: 'Dispatch' },
];

// --- Chart Data ---
const GRN_TREND = [
  { month: 'Oct', Approved: 8, Quarantine: 1, Rejected: 0 },
  { month: 'Nov', Approved: 10, Quarantine: 2, Rejected: 1 },
  { month: 'Dec', Approved: 9, Quarantine: 1, Rejected: 0 },
  { month: 'Jan', Approved: 11, Quarantine: 0, Rejected: 1 },
  { month: 'Feb', Approved: 10, Quarantine: 2, Rejected: 0 },
  { month: 'Mar', Approved: 12, Quarantine: 1, Rejected: 1 },
];

const TURNOVER_DATA = [
  { month: 'Oct', 'Finished Goods': 4.2, 'Raw Material': 3.1, Packaging: 2.8 },
  { month: 'Nov', 'Finished Goods': 4.5, 'Raw Material': 3.3, Packaging: 2.9 },
  { month: 'Dec', 'Finished Goods': 4.1, 'Raw Material': 3.0, Packaging: 3.1 },
  { month: 'Jan', 'Finished Goods': 4.8, 'Raw Material': 3.5, Packaging: 3.0 },
  { month: 'Feb', 'Finished Goods': 4.6, 'Raw Material': 3.2, Packaging: 2.7 },
  { month: 'Mar', 'Finished Goods': 4.9, 'Raw Material': 3.6, Packaging: 3.2 },
];

const DISPATCH_TREND = [
  { month: 'Oct', Orders: 42, 'OTD %': 94 },
  { month: 'Nov', Orders: 48, 'OTD %': 95 },
  { month: 'Dec', Orders: 38, 'OTD %': 93 },
  { month: 'Jan', Orders: 51, 'OTD %': 97 },
  { month: 'Feb', Orders: 55, 'OTD %': 96 },
  { month: 'Mar', Orders: 58, 'OTD %': 97 },
];

const FEFO_DATA = [
  { month: 'Oct', Compliance: 92 },
  { month: 'Nov', Compliance: 94 },
  { month: 'Dec', Compliance: 93 },
  { month: 'Jan', Compliance: 96 },
  { month: 'Feb', Compliance: 97 },
  { month: 'Mar', Compliance: 98 },
];

const EXPIRY_DATA = [
  { name: '≤30 days', value: 4, fill: '#ef4444' },
  { name: '31–60 days', value: 7, fill: '#f97316' },
  { name: '61–90 days', value: 11, fill: '#6c63ff' },
  { name: '91–180 days', value: 8, fill: '#3b82f6' },
  { name: '>180 days', value: 6, fill: '#22c55e' },
];

const QA_DONUT = [
  { name: 'Approved', value: 28, fill: '#22c55e' },
  { name: 'Quarantine', value: 5, fill: '#f97316' },
  { name: 'Rejected', value: 3, fill: '#ef4444' },
];

const ACTIVITY_FEED = [
  { time: '13:45', type: 'inventory', color: '#6c63ff', msg: 'Stock adjustment: Azithromycin 500mg (−50 units)' },
  { time: '13:00', type: 'dispatch', color: '#3b82f6', msg: 'DO-2024-0003 created for Fortis Healthcare' },
  { time: '11:00', type: 'qa', color: '#22c55e', msg: 'Batch B2847 approved — Paracetamol 500mg' },
  { time: '10:30', type: 'grn', color: '#f97316', msg: 'GRN-2024-0006 received — Atorvastatin 10mg (Zydus)' },
  { time: '09:15', type: 'coldchain', color: '#14b8a6', msg: 'Sensor CR-B-03 went offline — maintenance required' },
  { time: '09:00', type: 'auth', color: '#9ca3af', msg: 'Rahul Mehta logged in from 192.168.1.105' },
  { time: 'Yesterday', type: 'capa', color: '#ef4444', msg: 'CAP-2024-004 overdue — Packaging complaint unresolved' },
];

const OPS_KPIS: KpiItem[] = [
  { label: 'Total Active SKUs', value: '36', sub: '+2 this week', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'GRNs This Month', value: '12', sub: '+3 vs last month', trend: 'up' as const, accentColor: 'blue' as const },
  { label: 'Dispatches This Month', value: '58', sub: 'OTD 96.8%', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Stock Accuracy', value: '99.4%', sub: 'Last cycle count', trend: 'up' as const, accentColor: 'teal' as const },
  { label: 'Open CAPAs', value: '4', sub: '1 critical overdue', trend: 'warn' as const, accentColor: 'orange' as const },
];

const INV_KPIS: KpiItem[] = [
  { label: 'Total Stock Value', value: '₹2.8Cr', sub: '+₹0.3Cr vs last month', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'Expiry ≤30 Days', value: '4', sub: 'Immediate action needed', trend: 'warn' as const, accentColor: 'red' as const },
  { label: 'Quarantine Batches', value: '5', sub: 'Pending QA decision', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Avg Turnover', value: '4.7x', sub: '+0.3 vs last quarter', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Waste Prevented', value: '₹1.2L', sub: 'FEFO enforcement savings', trend: 'up' as const, accentColor: 'teal' as const },
];

const QA_KPIS: KpiItem[] = [
  { label: 'QA Pass Rate', value: '96.4%', sub: '+1.2% vs last quarter', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Rejections FY', value: '5', sub: '3.6% rejection rate', trend: 'down' as const, accentColor: 'red' as const },
  { label: 'Open CAPAs', value: '4', sub: '1 critical', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Avg QA TAT', value: '26hrs', sub: '−4hrs vs target', trend: 'up' as const, accentColor: 'blue' as const },
  { label: 'FEFO Compliance', value: '98.0%', sub: '+5% this month', trend: 'up' as const, accentColor: 'teal' as const },
];

const COLD_KPIS: KpiItem[] = [
  { label: 'Excursions FY', value: '7', sub: '2 open', trend: 'warn' as const, accentColor: 'red' as const },
  { label: 'Cold Chain Uptime', value: '99.2%', sub: 'All rooms', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Sensors Online', value: '7/8', sub: 'CR-B-03 offline', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Avg Temp (CR-A)', value: '4.8°C', sub: 'Within spec 2–8°C', trend: 'up' as const, accentColor: 'teal' as const },
  { label: 'Batches at Risk', value: '2', sub: 'Pending assessment', trend: 'warn' as const, accentColor: 'purple' as const },
];

const DISPATCH_KPIS: KpiItem[] = [
  { label: 'Units Dispatched', value: '18.6L', sub: '+2.1L vs last month', trend: 'up' as const, accentColor: 'purple' as const },
  { label: 'On-Time Delivery', value: '96.8%', sub: '+0.8% vs target', trend: 'up' as const, accentColor: 'green' as const },
  { label: 'Active Customers', value: '24', sub: '3 new this month', trend: 'up' as const, accentColor: 'blue' as const },
  { label: 'Pending Dispatch', value: '3', sub: 'DOs awaiting pick', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Revenue FY', value: '₹12.4Cr', sub: '88% of annual target', trend: 'up' as const, accentColor: 'teal' as const },
];

const KPIS_MAP: Record<string, KpiItem[]> = {
  ops: OPS_KPIS,
  inv: INV_KPIS,
  qa: QA_KPIS,
  cold: COLD_KPIS,
  dispatch: DISPATCH_KPIS,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ops');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const kpis = KPIS_MAP[activeTab] ?? OPS_KPIS;

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()); }, 500);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const kpisWithNav = kpis.map(k => {
    if (k.label === 'Open CAPAs') return { ...k, onClick: () => navigate('/qa') };
    if (k.label === 'GRNs This Month') return { ...k, onClick: () => navigate('/grn') };
    if (k.label === 'Dispatches This Month') return { ...k, onClick: () => navigate('/dispatch') };
    if (k.label.includes('Expiry')) return { ...k, onClick: () => navigate('/inventory') };
    if (k.label === 'Excursions FY') return { ...k, onClick: () => navigate('/cold-chain') };
    if (k.label === 'Sensors Online') return { ...k, onClick: () => navigate('/cold-chain') };
    return k;
  });

  return (
    <div className="space-y-5">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-end gap-2 mb-1">
        <span className="text-[11px] text-gray-400">
          {refreshing ? 'Refreshing…' : `Updated ${lastRefresh.toLocaleTimeString()}`}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`} />
      </div>

      {/* Tab Bar */}
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* KPI Grid */}
      <div className="grid grid-cols-5 gap-4 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {kpisWithNav.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <Card title="GRN Receipt Trend" action={
          <div className="flex gap-1">
            {['Q4 FY24', 'H2 FY24', 'FY24'].map((l) => (
              <button key={l} className="px-2.5 py-1 text-[11px] rounded border border-gray-200 text-gray-500 hover:border-[#6c63ff] hover:text-[#6c63ff] transition-colors">
                {l}
              </button>
            ))}
          </div>
        }>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={GRN_TREND} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Approved" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
              <Bar dataKey="Quarantine" stackId="a" fill="#f97316" />
              <Bar dataKey="Rejected" stackId="a" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Inventory Turnover by Category">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TURNOVER_DATA} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Finished Goods" fill="#6c63ff" radius={[3,3,0,0]} />
              <Bar dataKey="Raw Material" fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="Packaging" fill="#14b8a6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <Card title="Dispatch Volume Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={DISPATCH_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[85,100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="Orders" fill="#6c63ff" opacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="OTD %" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="FEFO Compliance Rate (%)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={FEFO_DATA}>
              <defs>
                <linearGradient id="fefoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Compliance']} />
              <ReferenceLine y={95} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Target 95%', fill: '#f97316', fontSize: 10 }} />
              <Area type="monotone" dataKey="Compliance" stroke="#6c63ff" strokeWidth={2} fill="url(#fefoGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
        {/* Expiry Forecast */}
        <Card title="Inventory Expiry Forecast">
          <div className="space-y-3 mt-1">
            {EXPIRY_DATA.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-semibold font-mono">{item.value} batches</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.value / 11) * 100}%`, background: item.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* QA Donut */}
        <Card title="QA Status Summary">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={QA_DONUT} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {QA_DONUT.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {QA_DONUT.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                  <span className="font-mono text-xs font-bold ml-auto pl-3">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card title="Live Activity Feed">
          <div className="space-y-2.5 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
            {ACTIVITY_FEED.map((item, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{item.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

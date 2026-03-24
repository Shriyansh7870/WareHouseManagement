import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ReferenceLine, CartesianGrid,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from 'recharts';
import {
  Package, Truck, CheckCircle, Thermometer, AlertTriangle, TrendingUp,
  TrendingDown, Clock, Activity, ArrowUpRight, ArrowDownRight, Minus,
  BarChart2, ShieldCheck, Boxes, Warehouse, Users, FileCheck
} from 'lucide-react';

// ── KPI Data ─────────────────────────────────────────────────────
const KPIS = [
  { label: 'Total SKUs', value: '248', change: '+12', trend: 'up', icon: Package, color: '#D4A847', bgColor: 'rgba(212,168,71,0.08)' },
  { label: 'Stock Value', value: '₹4.8Cr', change: '+₹0.6Cr', trend: 'up', icon: Boxes, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)' },
  { label: 'GRNs This Month', value: '34', change: '+8 vs last', trend: 'up', icon: FileCheck, color: '#22c55e', bgColor: 'rgba(34,197,94,0.08)' },
  { label: 'Dispatches', value: '126', change: 'OTD 97.2%', trend: 'up', icon: Truck, color: '#14b8a6', bgColor: 'rgba(20,184,166,0.08)' },
  { label: 'QA Pass Rate', value: '96.8%', change: '+1.4% vs Q3', trend: 'up', icon: ShieldCheck, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.08)' },
  { label: 'Expiring ≤30d', value: '7', change: 'Action needed', trend: 'warn', icon: AlertTriangle, color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)' },
  { label: 'Cold Chain', value: '99.4%', change: 'Uptime', trend: 'up', icon: Thermometer, color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.08)' },
  { label: 'Open CAPAs', value: '6', change: '2 critical', trend: 'warn', icon: AlertTriangle, color: '#f97316', bgColor: 'rgba(249,115,22,0.08)' },
];

// ── Chart Data ───────────────────────────────────────────────────
const GRN_TREND = [
  { month: 'Jul', Approved: 22, Quarantine: 3, Rejected: 1 },
  { month: 'Aug', Approved: 28, Quarantine: 4, Rejected: 2 },
  { month: 'Sep', Approved: 25, Quarantine: 2, Rejected: 1 },
  { month: 'Oct', Approved: 30, Quarantine: 5, Rejected: 2 },
  { month: 'Nov', Approved: 32, Quarantine: 3, Rejected: 1 },
  { month: 'Dec', Approved: 27, Quarantine: 2, Rejected: 0 },
  { month: 'Jan', Approved: 35, Quarantine: 4, Rejected: 1 },
  { month: 'Feb', Approved: 31, Quarantine: 3, Rejected: 2 },
  { month: 'Mar', Approved: 34, Quarantine: 2, Rejected: 1 },
];

const REVENUE_DATA = [
  { month: 'Jul', Revenue: 1.2, Cost: 0.8, Profit: 0.4 },
  { month: 'Aug', Revenue: 1.5, Cost: 0.9, Profit: 0.6 },
  { month: 'Sep', Revenue: 1.3, Cost: 0.85, Profit: 0.45 },
  { month: 'Oct', Revenue: 1.8, Cost: 1.0, Profit: 0.8 },
  { month: 'Nov', Revenue: 1.6, Cost: 0.95, Profit: 0.65 },
  { month: 'Dec', Revenue: 1.4, Cost: 0.88, Profit: 0.52 },
  { month: 'Jan', Revenue: 2.0, Cost: 1.1, Profit: 0.9 },
  { month: 'Feb', Revenue: 1.9, Cost: 1.05, Profit: 0.85 },
  { month: 'Mar', Revenue: 2.2, Cost: 1.15, Profit: 1.05 },
];

const INVENTORY_BY_CATEGORY = [
  { name: 'Finished Goods', value: 42, fill: '#D4A847' },
  { name: 'Raw Materials', value: 28, fill: '#3b82f6' },
  { name: 'Packaging', value: 18, fill: '#14b8a6' },
  { name: 'API', value: 8, fill: '#8b5cf6' },
  { name: 'Excipients', value: 4, fill: '#f97316' },
];

const WAREHOUSE_UTILIZATION = [
  { zone: 'Zone A - General', used: 82, total: 100, color: '#D4A847' },
  { zone: 'Zone B - Cold Room', used: 68, total: 100, color: '#0ea5e9' },
  { zone: 'Zone C - Hazardous', used: 45, total: 100, color: '#ef4444' },
  { zone: 'Zone D - Quarantine', used: 72, total: 100, color: '#f97316' },
  { zone: 'Zone E - Dispatch', used: 56, total: 100, color: '#22c55e' },
];

const TEMPERATURE_DATA = [
  { time: '00:00', 'Cold Room A': 4.2, 'Cold Room B': 5.1, 'Freezer': -18.5 },
  { time: '04:00', 'Cold Room A': 4.5, 'Cold Room B': 5.3, 'Freezer': -18.2 },
  { time: '08:00', 'Cold Room A': 4.8, 'Cold Room B': 5.6, 'Freezer': -17.8 },
  { time: '12:00', 'Cold Room A': 5.1, 'Cold Room B': 6.0, 'Freezer': -17.5 },
  { time: '16:00', 'Cold Room A': 4.9, 'Cold Room B': 5.8, 'Freezer': -18.0 },
  { time: '20:00', 'Cold Room A': 4.4, 'Cold Room B': 5.2, 'Freezer': -18.3 },
  { time: 'Now', 'Cold Room A': 4.3, 'Cold Room B': 5.0, 'Freezer': -18.6 },
];

const QA_RADAR = [
  { metric: 'Pass Rate', value: 96, fullMark: 100 },
  { metric: 'TAT', value: 88, fullMark: 100 },
  { metric: 'FEFO', value: 98, fullMark: 100 },
  { metric: 'CAPA Closure', value: 75, fullMark: 100 },
  { metric: 'Doc Compliance', value: 92, fullMark: 100 },
  { metric: 'Audit Score', value: 90, fullMark: 100 },
];

const DISPATCH_TREND = [
  { month: 'Jul', Orders: 82, 'OTD %': 93 },
  { month: 'Aug', Orders: 95, 'OTD %': 94 },
  { month: 'Sep', Orders: 88, 'OTD %': 95 },
  { month: 'Oct', Orders: 102, 'OTD %': 96 },
  { month: 'Nov', Orders: 110, 'OTD %': 95 },
  { month: 'Dec', Orders: 98, 'OTD %': 94 },
  { month: 'Jan', Orders: 118, 'OTD %': 97 },
  { month: 'Feb', Orders: 122, 'OTD %': 96 },
  { month: 'Mar', Orders: 126, 'OTD %': 97 },
];

const TOP_PRODUCTS = [
  { name: 'Paracetamol 500mg', sku: 'PCM-500', qty: '12,400', revenue: '₹18.6L', trend: 'up', growth: '+14%' },
  { name: 'Azithromycin 250mg', sku: 'AZI-250', qty: '8,200', revenue: '₹24.1L', trend: 'up', growth: '+8%' },
  { name: 'Metformin 500mg', sku: 'MET-500', qty: '9,800', revenue: '₹12.4L', trend: 'up', growth: '+11%' },
  { name: 'Atorvastatin 10mg', sku: 'ATV-010', qty: '6,500', revenue: '₹15.8L', trend: 'down', growth: '-3%' },
  { name: 'Omeprazole 20mg', sku: 'OMP-020', qty: '7,100', revenue: '₹9.2L', trend: 'up', growth: '+6%' },
];

const EXPIRY_DATA = [
  { name: '≤30 days', value: 7, fill: '#ef4444' },
  { name: '31–60 days', value: 12, fill: '#f97316' },
  { name: '61–90 days', value: 18, fill: '#D4A847' },
  { name: '91–180 days', value: 24, fill: '#3b82f6' },
  { name: '>180 days', value: 187, fill: '#22c55e' },
];

const VENDOR_PERFORMANCE = [
  { name: 'Cipla Ltd', score: 94, deliveries: 28, onTime: 96, quality: 98 },
  { name: 'Zydus Lifesciences', score: 91, deliveries: 22, onTime: 93, quality: 95 },
  { name: 'Sun Pharma', score: 89, deliveries: 18, onTime: 90, quality: 94 },
  { name: 'Dr. Reddy\'s', score: 87, deliveries: 15, onTime: 88, quality: 92 },
  { name: 'Lupin Ltd', score: 85, deliveries: 12, onTime: 87, quality: 90 },
];

const ACTIVITY_FEED = [
  { time: '2 min ago', icon: Package, color: '#D4A847', msg: 'GRN-2024-0042 received — Amoxicillin 500mg (Cipla)', badge: 'GRN' },
  { time: '15 min ago', icon: Truck, color: '#3b82f6', msg: 'DO-2024-0089 dispatched to Apollo Hospitals', badge: 'Dispatch' },
  { time: '32 min ago', icon: CheckCircle, color: '#22c55e', msg: 'Batch B3421 QA approved — Metformin 500mg', badge: 'QA' },
  { time: '1 hr ago', icon: Thermometer, color: '#0ea5e9', msg: 'Cold Room B temp stabilized at 5.0°C', badge: 'Cold Chain' },
  { time: '1.5 hrs ago', icon: AlertTriangle, color: '#f97316', msg: 'CAPA-2024-012 escalated — overdue by 3 days', badge: 'CAPA' },
  { time: '2 hrs ago', icon: Package, color: '#D4A847', msg: 'Stock transfer: 500 units Azithromycin → Zone A', badge: 'Transfer' },
  { time: '3 hrs ago', icon: CheckCircle, color: '#22c55e', msg: 'Cycle count completed — Zone D accuracy 99.6%', badge: 'Count' },
  { time: '4 hrs ago', icon: Users, color: '#8b5cf6', msg: 'Priya Sharma logged in from warehouse terminal', badge: 'Auth' },
];

const ALERTS = [
  { severity: 'critical', msg: '7 batches expiring within 30 days — immediate review needed', action: 'View Batches' },
  { severity: 'warning', msg: 'CAPA-2024-008 overdue by 5 days — packaging complaint', action: 'Open CAPA' },
  { severity: 'warning', msg: 'Cold Room sensor CR-B-03 offline since 09:15 AM', action: 'Check Sensor' },
  { severity: 'info', msg: 'Quarterly audit scheduled for April 5, 2024', action: 'View Details' },
];

// ── Helpers ──────────────────────────────────────────────────────
const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <ArrowUpRight size={14} className="text-green-500" />;
  if (trend === 'down') return <ArrowDownRight size={14} className="text-red-500" />;
  if (trend === 'warn') return <AlertTriangle size={14} className="text-amber-500" />;
  return <Minus size={14} className="text-gray-400" />;
};

const severityStyles: Record<string, { bg: string; border: string; dot: string }> = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
};

// ── Component ────────────────────────────────────────────────────
export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()); }, 500);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Welcome Banner ──────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #112D4E 0%, #0A1F38 60%, #1a3a5c 100%)',
          border: '1px solid rgba(212,168,71,0.15)',
        }}
      >
        <div>
          <h1 className="text-white text-xl font-bold mb-1">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Rahul
          </h1>
          <p className="text-white/50 text-sm">
            Here's your warehouse overview for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-white/40 text-[11px]">
              {refreshing ? 'Refreshing...' : `Last updated ${lastRefresh.toLocaleTimeString()}`}
            </div>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-emerald-400/80 text-[11px] font-medium">All systems operational</span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,168,71,0.15)' }}
          >
            <Warehouse size={24} className="text-[#D4A847]" />
          </div>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl overflow-hidden hover:-translate-y-0.5 transition-all cursor-pointer group"
              style={{ boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}
            >
              <div className="h-[3px]" style={{ background: kpi.color }} />
              <div className="p-4 flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                  style={{ background: kpi.bgColor }}
                >
                  <Icon size={20} style={{ color: kpi.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{kpi.label}</div>
                  <div className="font-mono font-bold text-2xl leading-tight mt-0.5" style={{ color: 'var(--text)' }}>
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendIcon trend={kpi.trend} />
                    <span className={`text-[11px] font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'warn' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Row 1: Revenue + GRN ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Revenue & Profitability (₹ Cr)" action={
          <span className="text-[11px] text-gray-400">Last 9 months</span>
        }>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Revenue" fill="#D4A847" radius={[4,4,0,0]} barSize={18} />
              <Bar dataKey="Cost" fill="#3b82f6" radius={[4,4,0,0]} barSize={18} opacity={0.6} />
              <Line type="monotone" dataKey="Profit" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card title="GRN Receipt Trend" action={
          <span className="text-[11px] text-gray-400">Monthly breakdown</span>
        }>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={GRN_TREND} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Approved" stackId="a" fill="#22c55e" />
              <Bar dataKey="Quarantine" stackId="a" fill="#f97316" />
              <Bar dataKey="Rejected" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 2: Inventory Pie + Warehouse Utilization ──── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Inventory by Category">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={INVENTORY_BY_CATEGORY}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                  style={{ fontSize: 10 }}
                >
                  {INVENTORY_BY_CATEGORY.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Warehouse Zone Utilization">
          <div className="space-y-4 mt-1">
            {WAREHOUSE_UTILIZATION.map((zone) => (
              <div key={zone.zone}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{zone.zone}</span>
                  <span className="font-mono font-bold" style={{ color: zone.used > 80 ? '#ef4444' : zone.color }}>{zone.used}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${zone.used}%`, background: zone.used > 80 ? `linear-gradient(90deg, ${zone.color}, #ef4444)` : zone.color }}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Overall Utilization</span>
              <span className="text-sm font-bold font-mono" style={{ color: '#D4A847' }}>64.6%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 3: QA Radar + Cold Chain Temp ────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="QA Performance Radar">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={QA_RADAR}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Score" dataKey="value" stroke="#D4A847" fill="#D4A847" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Cold Chain Temperature (24hr)" action={
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-emerald-600 font-medium">All within spec</span>
          </div>
        }>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={TEMPERATURE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[-22, 10]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Max 8°C', fill: '#ef4444', fontSize: 9, position: 'right' }} />
              <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Min 2°C', fill: '#ef4444', fontSize: 9, position: 'right' }} />
              <Line type="monotone" dataKey="Cold Room A" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Cold Room B" stroke="#D4A847" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Freezer" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 4: Dispatch + Expiry ─────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Dispatch Volume & OTD %" action={
          <span className="text-[11px] text-gray-400">Last 9 months</span>
        }>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={DISPATCH_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[85, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="Orders" fill="#D4A847" radius={[4,4,0,0]} barSize={18} opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="OTD %" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Batch Expiry Forecast">
          <div className="space-y-3.5 mt-1">
            {EXPIRY_DATA.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-mono font-bold">{item.value} batches</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.value / 187) * 100}%`, background: item.fill }}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Total Batches Tracked</span>
              <span className="text-sm font-bold font-mono" style={{ color: 'var(--text)' }}>248</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 5: Top Products + Vendor Scorecard ──────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Top Products by Volume">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-2 tracking-wider">Product</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase pb-2 tracking-wider">Qty</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase pb-2 tracking-wider">Revenue</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase pb-2 tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5">
                      <div className="text-xs font-medium text-gray-800">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.sku}</div>
                    </td>
                    <td className="text-right text-xs font-mono text-gray-600">{p.qty}</td>
                    <td className="text-right text-xs font-mono font-semibold text-gray-800">{p.revenue}</td>
                    <td className="text-right">
                      <span className={`text-[11px] font-bold ${p.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        {p.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Vendor Scorecard">
          <div className="space-y-3 mt-1">
            {VENDOR_PERFORMANCE.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: `hsl(${40 + i * 5}, 70%, ${55 - i * 5}%)` }}
                >
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-800 truncate">{v.name}</span>
                    <span className="text-xs font-bold font-mono ml-2" style={{ color: '#D4A847' }}>{v.score}%</span>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-gray-400">{v.deliveries} deliveries</span>
                    <span className="text-[10px] text-green-600">OT {v.onTime}%</span>
                    <span className="text-[10px] text-blue-600">QA {v.quality}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 5: Activity Feed ────────────────────────────── */}
      <Card title="Live Activity Feed" action={
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-[#D4A847]" />
          <span className="text-[11px] text-gray-400">Real-time</span>
        </div>
      }>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-1">
          {ACTIVITY_FEED.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex gap-3 items-start py-2.5 border-b border-gray-50">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}12` }}
                >
                  <Icon size={14} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{item.msg}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

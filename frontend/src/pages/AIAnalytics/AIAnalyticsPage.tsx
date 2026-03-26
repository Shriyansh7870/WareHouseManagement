import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const INSIGHTS = [
  { id: '1', cat: 'critical', catLabel: '🚨 Critical', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', msg: 'AMX-D4521 (Amoxicillin 500mg, Batch D4521) expires in 13 days with 850 units remaining. No demand forecast. Immediate disposition required.' },
  { id: '2', cat: 'predictive', catLabel: '🔮 Predictive', color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', msg: 'Paracetamol 500mg projected stock-out in 18 days based on 90-day consumption trend (avg 280 units/day vs 12,450 remaining).' },
  { id: '3', cat: 'preventive', catLabel: '🛡 Preventive', color: '#22c55e', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', msg: 'CR-B-03 sensor offline 6+ hours. Schedule maintenance before next cold batch arrival (ASN-2024-0002 expected 08 Apr).' },
  { id: '4', cat: 'quality', catLabel: '✅ Quality', color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', msg: 'QA TAT improved 23% this quarter (avg 26h vs target 30h). Lupin Ltd. rejection rate remains elevated at 11.3% — CAPA review recommended.' },
  { id: '5', cat: 'coldchain', catLabel: '❄ Cold Chain', color: '#14b8a6', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', msg: 'Vehicle VH-01 shows recurring temperature deviation pattern during 08:00–10:00 window. Recommend pre-trip sensor calibration and pre-cooling protocol.' },
  { id: '6', cat: 'predictive', catLabel: '🔮 Predictive', color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', msg: 'Metformin 850mg stock critically low (3,200 units, 28 days to expiry). Auto-reorder recommendation: raise PO for 5,000 units from Sun Pharma within 5 days.' },
];

const CATEGORIES = ['all', 'critical', 'predictive', 'preventive', 'quality', 'coldchain'];

const STOCK_HEATMAP_DATA = [
  { sku: 'Paracetamol 500mg', w1: 20, w2: 35, w3: 55, w4: 75 },
  { sku: 'Metformin 850mg', w1: 45, w2: 62, w3: 78, w4: 92 },
  { sku: 'Amoxicillin 500mg', w1: 85, w2: 90, w3: 95, w4: 98 },
  { sku: 'Pantoprazole 40mg', w1: 10, w2: 15, w3: 22, w4: 30 },
  { sku: 'Ibuprofen 400mg', w1: 5, w2: 8, w3: 12, w4: 18 },
  { sku: 'Atorvastatin 10mg', w1: 38, w2: 52, w3: 65, w4: 72 },
  { sku: 'Ciprofloxacin 500mg', w1: 8, w2: 10, w3: 15, w4: 20 },
];

function heatColor(v: number) {
  if (v >= 70) return { bg: 'bg-red-100 text-red-800', label: `${v}%` };
  if (v >= 50) return { bg: 'bg-orange-100 text-orange-800', label: `${v}%` };
  if (v >= 30) return { bg: 'bg-yellow-100 text-yellow-800', label: `${v}%` };
  return { bg: 'bg-green-100 text-green-800', label: `${v}%` };
}

const ANOMALIES = [
  { time: '2024-03-22 13:45', severity: 'critical', msg: 'Negative stock adjustment — Azithromycin 500mg: 50 units', module: 'Inventory' },
  { time: '2024-03-22 09:15', severity: 'warning', msg: 'Sensor CR-B-03 offline — no reading for >6 hours', module: 'Cold Chain' },
  { time: '2024-03-15 09:20', severity: 'warning', msg: 'Vehicle VH-01 temperature reached 8.8°C for 20 minutes', module: 'Cold Chain' },
  { time: '2024-03-10 14:30', severity: 'info', msg: 'Batch D4521 QA failed — Dissolution out of spec', module: 'QA' },
  { time: '2024-03-05 11:00', severity: 'critical', msg: 'CAPA CAP-2024-004 overdue by 3 days', module: 'CAPA' },
];

const PROJECTION_DATA = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  Actual: i < 5 ? 12450 - i * 280 : null,
  Forecast: i >= 4 ? Math.max(0, 12450 - i * 290) : null,
  Low: i >= 4 ? Math.max(0, 12450 - i * 340) : null,
  High: i >= 4 ? Math.max(0, 12450 - i * 240) : null,
}));

const RADAR_DATA = [
  { axis: 'Accuracy', value: 99.4 },
  { axis: 'FEFO', value: 98 },
  { axis: 'QA TAT', value: 87 },
  { axis: 'Turnover', value: 78 },
  { axis: 'Uptime', value: 99.2 },
];

const REORDER_ITEMS = [
  { item: 'Paracetamol 500mg', currentQty: 12450, reorderQty: 15000, leadTime: '7 days', supplier: 'Cipla Ltd.', urgency: 'Medium' },
  { item: 'Metformin 850mg', currentQty: 3200, reorderQty: 5000, leadTime: '5 days', supplier: 'Sun Pharma', urgency: 'High' },
  { item: 'Atorvastatin 10mg', currentQty: 4100, reorderQty: 6000, leadTime: '10 days', supplier: 'Zydus Cadila', urgency: 'Medium' },
  { item: 'Paracetamol API', currentQty: 2000, reorderQty: 3000, leadTime: '14 days', supplier: 'Cipla Ltd.', urgency: 'Low' },
];

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

export default function AIAnalyticsPage() {
  const [catFilter, setCatFilter] = useState('all');

  const filteredInsights = catFilter === 'all' ? INSIGHTS : INSIGHTS.filter((i) => i.cat === catFilter);

  return (
    <div className="space-y-6">
      {/* AI Insight Feed */}
      <Card title="AI Insight Feed" action={
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors capitalize ${
                catFilter === c
                  ? 'bg-[#D4A847] text-white border-[#D4A847]'
                  : 'border-gray-200 text-gray-500 hover:border-[#D4A847] hover:text-[#D4A847]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      }>
        <div className="space-y-3">
          {filteredInsights.map((ins) => (
            <div key={ins.id} className={`flex gap-3 p-3.5 rounded-lg border ${ins.bg} ${ins.border}`}>
              <div className={`text-[11px] font-semibold px-2 py-0.5 rounded self-start whitespace-nowrap ${ins.text}`}>
                {ins.catLabel}
              </div>
              <p className={`text-sm ${ins.text} leading-relaxed`}>{ins.msg}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Stock-Out Risk Heatmap */}
      <Card title="Stock-Out Risk Heatmap — Next 4 Weeks" action={<span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">AI-Scored</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-2 pr-4 font-medium">SKU</th>
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => <th key={w} className="py-2 px-2 text-center font-medium">{w}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {STOCK_HEATMAP_DATA.map((row) => (
                <tr key={row.sku}>
                  <td className="py-2 pr-4 font-medium text-gray-700">{row.sku}</td>
                  {([row.w1, row.w2, row.w3, row.w4] as number[]).map((v, i) => {
                    const { bg, label } = heatColor(v);
                    return <td key={i} className="py-2 px-2 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold ${bg}`}>{label}</span></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> Safe (&lt;30%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded" /> Watch (30–50%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-100 rounded" /> Risk (50–70%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded" /> Critical (&gt;70%)</span>
        </div>
      </Card>

      {/* Anomaly Timeline */}
      <Card title="Anomaly Detection Timeline">
        <div className="space-y-3">
          {ANOMALIES.map((a, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-400'}`} />
              <div className="flex-1 pb-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant={(a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warn' : 'blue') as BadgeVariant}>
                    {a.severity}
                  </Badge>
                  <span className="text-[10px] text-gray-400">{a.module}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{a.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{a.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="90-Day Stock Level Projection — Paracetamol 500mg">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={PROJECTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Actual" stroke="#D4A847" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              <Line type="monotone" dataKey="Forecast" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="Low" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="High" stroke="#22c55e" strokeWidth={1} strokeDasharray="3 3" dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Warehouse Efficiency Radar">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar dataKey="value" stroke="#D4A847" fill="#D4A847" fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Reorder Recommendations */}
      <Card title="AI Reorder Recommendations">
        <div className="space-y-3">
          {REORDER_ITEMS.map((item) => (
            <div key={item.item} className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-[#D4A847]/30 hover:bg-purple-50/20 transition-colors">
              <div>
                <div className="font-medium text-sm text-gray-800">{item.item}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Current: <span className="font-mono font-semibold">{item.currentQty.toLocaleString()}</span> units •
                  Supplier: {item.supplier} • Lead time: {item.leadTime}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono font-bold text-[#D4A847]">{item.reorderQty.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400">Recommended qty</div>
                </div>
                <Badge variant={(item.urgency === 'High' ? 'danger' : item.urgency === 'Medium' ? 'warn' : 'ok') as BadgeVariant}>
                  {item.urgency}
                </Badge>
                <button className="px-3 py-1.5 text-xs rounded bg-[#D4A847] text-white hover:bg-[#B8922E] transition-colors">
                  Raise PO
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

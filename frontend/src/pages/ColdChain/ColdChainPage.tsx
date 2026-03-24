import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Eye } from 'lucide-react';
import AlertBanner from '../../components/ui/AlertBanner';
import Modal from '../../components/ui/Modal';
import KpiCard from '../../components/ui/KpiCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TabBar from '../../components/ui/TabBar';
import { MOCK_SENSORS, MOCK_EXCURSIONS } from '../../utils/mockData';
import { formatDateTime } from '../../utils/formatters';
import type { Sensor } from '../../types/coldchain.types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, BarChart, Bar
} from 'recharts';

const CC_KPIS = [
  { label: 'Sensors Online', value: '7/8', sub: 'CR-B-03 offline', trend: 'warn' as const, accentColor: 'orange' as const },
  { label: 'Cold Room A Avg', value: '4.8°C', sub: 'Within 2–8°C spec', trend: 'up' as const, accentColor: 'teal' as const },
  { label: 'Cold Room B Avg', value: '2.1°C', sub: 'Within 2–8°C spec', trend: 'up' as const, accentColor: 'blue' as const },
  { label: 'Excursions FY', value: '7', sub: '2 open', trend: 'warn' as const, accentColor: 'red' as const },
  { label: 'Cold Chain Uptime', value: '99.2%', sub: 'Last 90 days', trend: 'up' as const, accentColor: 'green' as const },
];

// 24h temperature data
const TEMP_24H = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  'Cold Room A': +(4 + Math.sin(h * 0.4) * 0.8 + (h % 3) * 0.1).toFixed(1),
  'Cold Room B': +(2.2 + Math.sin(h * 0.5) * 0.6 + (h % 2) * 0.1).toFixed(1),
  'Vehicle': +(5.5 + Math.sin(h * 0.6) * 2.0 + (h % 4) * 0.1).toFixed(1),
}));

const EXCURSION_BY_MONTH = [
  { month: 'Oct', count: 1 },
  { month: 'Nov', count: 0 },
  { month: 'Dec', count: 2 },
  { month: 'Jan', count: 1 },
  { month: 'Feb', count: 1 },
  { month: 'Mar', count: 2 },
];

const TABS = [
  { id: 'sensors', label: 'Sensor Grid' },
  { id: 'charts', label: 'Temperature Charts' },
  { id: 'excursions', label: 'Excursion Log' },
];

function SensorCard({ sensor }: { sensor: Sensor }) {
  const isOffline = !sensor.isOnline;
  const isDeviation = sensor.status === 'deviation';

  return (
    <div
      className="bg-white rounded-xl p-4 transition-all hover:-translate-y-0.5"
      style={{
        border: `1px solid ${isOffline ? '#ef4444' : isDeviation ? '#f97316' : '#e5e7eb'}`,
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff size={14} className="text-red-500" />
          ) : (
            <Wifi size={14} className={isDeviation ? 'text-orange-500' : 'text-green-500'} />
          )}
          <span className="font-mono text-xs font-bold text-gray-700">{sensor.sensorId}</span>
        </div>
        <Badge variant={isOffline ? 'danger' : isDeviation ? 'warn' : 'ok'} dot>
          {isOffline ? 'OFFLINE' : isDeviation ? 'Deviation' : 'Normal'}
        </Badge>
      </div>

      <div className="text-xs text-gray-500 mb-2">{sensor.name}</div>

      <div className="flex items-end justify-between">
        <div>
          <div
            className={`font-mono font-bold text-2xl ${
              isOffline ? 'text-gray-300' : isDeviation ? 'text-orange-600' : 'text-gray-800'
            }`}
          >
            {isOffline ? '—' : `${sensor.currentTemp}°C`}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Spec: {sensor.minSpecC}–{sensor.maxSpecC}°C
          </div>
        </div>
        {!isOffline && sensor.minToday !== undefined && (
          <div className="text-right">
            <div className="text-[10px] text-gray-400">Today</div>
            <div className="text-[10px] font-mono text-gray-600">
              {sensor.minToday}°C / {sensor.maxToday}°C
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ColdChainPage() {
  const [tab, setTab] = useState('sensors');
  const [viewExcursion, setViewExcursion] = useState<import('../../types/coldchain.types').TempExcursion | null>(null);
  const [sensors, setSensors] = useState(MOCK_SENSORS);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(s => {
        if (!s.isOnline) return s;
        const delta = (Math.random() - 0.5) * 0.4;
        const newTemp = s.currentTemp !== undefined
          ? Math.round((s.currentTemp + delta) * 10) / 10
          : undefined;
        const isDeviation = newTemp !== undefined && (newTemp > s.maxSpecC || newTemp < s.minSpecC);
        return { ...s, currentTemp: newTemp, status: isDeviation ? 'deviation' as const : 'normal' as const };
      }));
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 lg:grid-cols-3">
        {CC_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* Sensor Grid */}
      {tab === 'sensors' && (
        <div>
          {sensors.some(s => s.status === 'deviation') && (
            <AlertBanner type="warn" message={`⚠ ${sensors.filter(s => s.status === 'deviation').length} sensor(s) showing temperature deviation. Immediate review required.`} className="mb-3" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Live • Last updated {lastUpdated.toLocaleTimeString()}</span>
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sensors streaming
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 sm:grid-cols-1">
            {sensors.map((s) => <SensorCard key={s.id} sensor={s} />)}
          </div>
        </div>
      )}

      {/* Charts */}
      {tab === 'charts' && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <Card title="24h Temperature Log">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={TEMP_24H}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}°C`]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <ReferenceArea y1={2} y2={8} fill="#22c55e" fillOpacity={0.06} />
                <Line type="monotone" dataKey="Cold Room A" stroke="#6c63ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Cold Room B" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Vehicle" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Excursion Frequency by Month">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={EXCURSION_BY_MONTH} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Excursions" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Excursion Log */}
      {tab === 'excursions' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Excursion ID', 'Date/Time', 'Location', 'Duration', 'Max Deviation', 'Batches Affected', 'Root Cause', 'Impact Assessment', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_EXCURSIONS.map((exc) => (
                  <tr key={exc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#6c63ff] font-semibold">{exc.excursionId}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDateTime(exc.startTime)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{exc.location}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{exc.durationMinutes ?? '—'} min</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-xs font-bold ${exc.maxDeviationC > 8 ? 'text-red-600' : 'text-orange-600'}`}>
                        {exc.maxDeviationC}°C
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {exc.batchesAffected.map((b) => (
                          <span key={b} className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{b}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{exc.rootCause ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[150px] truncate">{exc.impactAssessment ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={exc.status === 'Closed' ? 'ok' : 'warn'}>{exc.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setViewExcursion(exc)}
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

      {viewExcursion && (
        <Modal title={`Excursion Details — ${viewExcursion.excursionId}`} onClose={() => setViewExcursion(null)} width="600px">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Excursion ID', viewExcursion.excursionId],
              ['Sensor ID', viewExcursion.sensorId],
              ['Location', viewExcursion.location],
              ['Start Time', formatDateTime(viewExcursion.startTime)],
              ['End Time', viewExcursion.endTime ? formatDateTime(viewExcursion.endTime) : '—'],
              ['Duration', viewExcursion.durationMinutes != null ? `${viewExcursion.durationMinutes} min` : '—'],
              ['Max Deviation', `${viewExcursion.maxDeviationC}°C`],
              ['Severity', viewExcursion.severity],
              ['Status', viewExcursion.status],
              ['Batches Affected', viewExcursion.batchesAffected.join(', ') || '—'],
              ['Root Cause', viewExcursion.rootCause ?? '—'],
              ['Impact Assessment', viewExcursion.impactAssessment ?? '—'],
            ].map(([l, v]) => (
              <div key={String(l)} className={l === 'Batches Affected' || l === 'Root Cause' || l === 'Impact Assessment' ? 'col-span-2' : ''}>
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

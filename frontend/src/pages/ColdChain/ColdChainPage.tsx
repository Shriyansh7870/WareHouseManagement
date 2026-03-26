import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, WifiOff, Eye, Thermometer, AlertTriangle, Plus, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import AlertBanner from '../../components/ui/AlertBanner';
import Modal from '../../components/ui/Modal';
import KpiCard from '../../components/ui/KpiCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBox from '../../components/ui/SearchBox';
import TabBar from '../../components/ui/TabBar';
import { printTable } from '../../utils/printUtils';
import { exportToCSV } from '../../utils/csvExport';
import { MOCK_SENSORS, MOCK_EXCURSIONS } from '../../utils/mockData';
import { formatDateTime } from '../../utils/formatters';
import type { Sensor, TempExcursion } from '../../types/coldchain.types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, BarChart, Bar, AreaChart, Area
} from 'recharts';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

// 24h temperature data
const TEMP_24H = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  'Cold Room A': +(4 + Math.sin(h * 0.4) * 0.8 + (h % 3) * 0.1).toFixed(1),
  'Cold Room B': +(2.2 + Math.sin(h * 0.5) * 0.6 + (h % 2) * 0.1).toFixed(1),
  'Vehicle': +(5.5 + Math.sin(h * 0.6) * 2.0 + (h % 4) * 0.1).toFixed(1),
}));

// 7-day history per zone
const TEMP_7D = Array.from({ length: 7 }, (_, d) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - d));
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    'CR-A Avg': +(4.5 + Math.sin(d * 0.8) * 0.5).toFixed(1),
    'CR-A Min': +(3.8 + Math.sin(d * 0.8) * 0.3).toFixed(1),
    'CR-A Max': +(5.2 + Math.sin(d * 0.8) * 0.4).toFixed(1),
    'CR-B Avg': +(2.2 + Math.sin(d * 0.6) * 0.4).toFixed(1),
    'CR-B Min': +(1.8 + Math.sin(d * 0.6) * 0.2).toFixed(1),
    'CR-B Max': +(2.8 + Math.sin(d * 0.6) * 0.3).toFixed(1),
  };
});

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
  { id: 'alerts', label: 'Alert Config' },
];

/* ─── Sensor Card ─── */
function SensorCard({ sensor, onClick }: { sensor: Sensor; onClick: () => void }) {
  const isOffline = !sensor.isOnline;
  const isDeviation = sensor.status === 'deviation';
  const tempPct = sensor.currentTemp !== undefined
    ? Math.min(100, Math.max(0, ((sensor.currentTemp - sensor.minSpecC) / (sensor.maxSpecC - sensor.minSpecC)) * 100))
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
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
            <Wifi size={14} className={isDeviation ? 'text-orange-500 animate-pulse' : 'text-green-500'} />
          )}
          <span className="font-mono text-xs font-bold text-gray-700">{sensor.sensorId}</span>
        </div>
        <Badge variant={isOffline ? 'danger' : isDeviation ? 'warn' : 'ok'} dot>
          {isOffline ? 'OFFLINE' : isDeviation ? 'Deviation' : 'Normal'}
        </Badge>
      </div>

      <div className="text-xs text-gray-500 mb-2">{sensor.name}</div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className={`font-mono font-bold text-2xl ${isOffline ? 'text-gray-300' : isDeviation ? 'text-orange-600' : 'text-gray-800'}`}>
            {isOffline ? '—' : `${sensor.currentTemp}°C`}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Spec: {sensor.minSpecC}–{sensor.maxSpecC}°C
          </div>
        </div>
        {!isOffline && sensor.minToday !== undefined && (
          <div className="text-right">
            <div className="text-[10px] text-gray-400">Today Min/Max</div>
            <div className="text-[10px] font-mono text-gray-600">
              {sensor.minToday}°C / {sensor.maxToday}°C
            </div>
          </div>
        )}
      </div>

      {/* Temp gauge bar */}
      {!isOffline && (
        <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all ${isDeviation ? 'bg-orange-400' : 'bg-green-400'}`}
            style={{ width: `${tempPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Sensor Detail Modal ─── */
function SensorDetailModal({ sensor, onClose }: { sensor: Sensor; onClose: () => void }) {
  const isOffline = !sensor.isOnline;
  const isDeviation = sensor.status === 'deviation';

  // Generate fake 24h data for this specific sensor
  const sensorHourly = useMemo(() => Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    temp: isOffline ? null : +(
      (sensor.currentTemp ?? 4) + Math.sin(h * 0.5) * 0.6 + (Math.random() - 0.5) * 0.3
    ).toFixed(1),
  })), [sensor, isOffline]);

  return (
    <Modal title={`Sensor Details — ${sensor.sensorId}`} onClose={onClose} width="680px">
      <div className="space-y-5">
        {/* Status header */}
        <div className={`rounded-lg p-4 flex items-center justify-between ${
          isOffline ? 'bg-red-50 border border-red-200' :
          isDeviation ? 'bg-orange-50 border border-orange-200' :
          'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isOffline ? 'bg-red-100' : isDeviation ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              <Thermometer size={18} className={isOffline ? 'text-red-500' : isDeviation ? 'text-orange-500' : 'text-green-500'} />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-800">{sensor.name}</div>
              <div className="text-xs text-gray-500">{sensor.location}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-mono font-bold text-3xl ${isOffline ? 'text-gray-300' : isDeviation ? 'text-orange-600' : 'text-gray-800'}`}>
              {isOffline ? '—' : `${sensor.currentTemp}°C`}
            </div>
            <Badge variant={isOffline ? 'danger' : isDeviation ? 'warn' : 'ok'} dot>
              {isOffline ? 'OFFLINE' : isDeviation ? 'Deviation' : 'Normal'}
            </Badge>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          {([
            ['Sensor ID', sensor.sensorId],
            ['Location', sensor.location],
            ['Status', isOffline ? 'Offline' : isDeviation ? 'Deviation' : 'Normal'],
            ['Spec Range', `${sensor.minSpecC}°C – ${sensor.maxSpecC}°C`],
            ['Today Min', sensor.minToday !== undefined ? `${sensor.minToday}°C` : '—'],
            ['Today Max', sensor.maxToday !== undefined ? `${sensor.maxToday}°C` : '—'],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l}>
              <div className="text-xs text-gray-400 mb-0.5">{l}</div>
              <div className="font-medium text-gray-800">{v}</div>
            </div>
          ))}
        </div>

        {/* 24h chart for this sensor */}
        {!isOffline && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">24-Hour Temperature Log</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sensorHourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis domain={[sensor.minSpecC - 1, sensor.maxSpecC + 1]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v}°C`, 'Temperature']} />
                <ReferenceArea y1={sensor.minSpecC} y2={sensor.maxSpecC} fill="#22c55e" fillOpacity={0.08} label={{ value: 'Spec Range', fontSize: 9, fill: '#22c55e' }} />
                <Area type="monotone" dataKey="temp" stroke={isDeviation ? '#f97316' : '#D4A847'} fill={isDeviation ? '#f97316' : '#D4A847'} fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─── Excursion Detail Modal ─── */
function ExcursionDetailModal({ exc, onClose }: { exc: TempExcursion; onClose: () => void }) {
  const severityColor = exc.severity === 'CRITICAL' ? 'red' : exc.severity === 'MAJOR' ? 'orange' : 'blue';
  return (
    <Modal title={`Excursion Details — ${exc.excursionId}`} onClose={onClose} width="700px">
      <div className="space-y-5">
        {/* Severity header */}
        <div className={`rounded-lg p-4 flex items-center justify-between bg-${severityColor}-50 border border-${severityColor}-200`}
          style={{
            background: exc.severity === 'CRITICAL' ? '#fef2f2' : exc.severity === 'MAJOR' ? '#fff7ed' : '#eff6ff',
            borderColor: exc.severity === 'CRITICAL' ? '#fecaca' : exc.severity === 'MAJOR' ? '#fed7aa' : '#bfdbfe',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className={exc.severity === 'CRITICAL' ? 'text-red-500' : exc.severity === 'MAJOR' ? 'text-orange-500' : 'text-blue-500'} />
            <div>
              <div className="font-semibold text-sm text-gray-800">{exc.location}</div>
              <div className="text-xs text-gray-500">Sensor: {exc.sensorId}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-2xl text-red-600">{exc.maxDeviationC}°C</div>
            <Badge variant={exc.severity === 'CRITICAL' ? 'danger' : exc.severity === 'MAJOR' ? 'orange' : 'blue'}>{exc.severity}</Badge>
          </div>
        </div>

        {/* Info grid */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Excursion Information</h4>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
            {([
              ['Excursion ID', exc.excursionId],
              ['Sensor ID', exc.sensorId],
              ['Location', exc.location],
              ['Start Time', formatDateTime(exc.startTime)],
              ['End Time', exc.endTime ? formatDateTime(exc.endTime) : 'Ongoing'],
              ['Duration', exc.durationMinutes != null ? `${exc.durationMinutes} min` : 'Ongoing'],
              ['Max Deviation', `${exc.maxDeviationC}°C`],
              ['Severity', exc.severity],
              ['Status', exc.status],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                <div className="font-medium text-gray-800">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Batches */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Batches Affected</h4>
          <div className="flex flex-wrap gap-2">
            {exc.batchesAffected.length > 0 ? exc.batchesAffected.map((b) => (
              <span key={b} className="inline-flex items-center px-2.5 py-1 font-mono text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">{b}</span>
            )) : <span className="text-xs text-gray-400 italic">None recorded</span>}
          </div>
        </div>

        {/* Root Cause & Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Root Cause</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">{exc.rootCause || <span className="text-gray-400 italic">Not yet documented</span>}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Impact Assessment</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">{exc.impactAssessment || <span className="text-gray-400 italic">Not yet assessed</span>}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Log Excursion Modal ─── */
function LogExcursionModal({ sensors, onClose, onSave }: { sensors: Sensor[]; onClose: () => void; onSave: (exc: TempExcursion) => void }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    sensorId: '',
    location: '',
    startTime: '',
    endTime: '',
    maxDeviationC: '',
    severity: 'MAJOR' as TempExcursion['severity'],
    batchesAffected: '',
    rootCause: '',
    impactAssessment: '',
  });

  const set = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-fill location from sensor
      if (field === 'sensorId') {
        const s = sensors.find((s) => s.sensorId === value);
        if (s) updated.location = s.location;
      }
      return updated;
    });
    setErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.sensorId) errs.sensorId = 'Sensor is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.maxDeviationC || parseFloat(form.maxDeviationC) <= 0) errs.maxDeviationC = 'Max deviation is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) toast.error('Please fill all required fields');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    const durationMinutes = form.startTime && form.endTime
      ? Math.round((new Date(form.endTime).getTime() - new Date(form.startTime).getTime()) / 60000)
      : undefined;
    const exc: TempExcursion = {
      id: `e-${Date.now()}`,
      excursionId: `EXC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      sensorId: form.sensorId,
      location: form.location,
      startTime: form.startTime,
      endTime: form.endTime || undefined,
      durationMinutes,
      maxDeviationC: parseFloat(form.maxDeviationC),
      severity: form.severity,
      batchesAffected: form.batchesAffected ? form.batchesAffected.split(',').map((s) => s.trim()).filter(Boolean) : [],
      rootCause: form.rootCause || undefined,
      impactAssessment: form.impactAssessment || undefined,
      status: form.endTime ? 'Open' : 'Ongoing',
    };
    onSave(exc);
    toast.success(`Excursion ${exc.excursionId} logged`);
    setSaving(false);
    onClose();
  };

  const hasErr = (f: string) => !!errors[f];

  return (
    <Modal
      title="Log Temperature Excursion"
      width="720px"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>Log Excursion</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Sensor & Location */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Sensor & Location</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sensor <span className="text-red-500">*</span></label>
              <select value={form.sensorId} onChange={(e) => set('sensorId', e.target.value)} className={hasErr('sensorId') ? inputErrCls : inputCls}>
                <option value="">Select sensor</option>
                {sensors.map((s) => <option key={s.id} value={s.sensorId}>{s.sensorId} — {s.name}</option>)}
              </select>
              {errors.sensorId && <p className="text-[11px] text-red-500 mt-0.5">{errors.sensorId}</p>}
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls} readOnly={!!form.sensorId} />
            </div>
          </div>
        </div>

        {/* Time & Severity */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Time & Severity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} className={hasErr('startTime') ? inputErrCls : inputCls} />
              {errors.startTime && <p className="text-[11px] text-red-500 mt-0.5">{errors.startTime}</p>}
            </div>
            <div>
              <label className={labelCls}>End Time <span className="text-[10px] text-gray-300 font-normal">(leave blank if ongoing)</span></label>
              <input type="datetime-local" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Deviation (°C) <span className="text-red-500">*</span></label>
              <input type="number" step="0.1" value={form.maxDeviationC} onChange={(e) => set('maxDeviationC', e.target.value)} placeholder="e.g. 10.2" className={hasErr('maxDeviationC') ? inputErrCls : inputCls} />
              {errors.maxDeviationC && <p className="text-[11px] text-red-500 mt-0.5">{errors.maxDeviationC}</p>}
            </div>
            <div>
              <label className={labelCls}>Severity <span className="text-red-500">*</span></label>
              <select value={form.severity} onChange={(e) => set('severity', e.target.value)} className={inputCls}>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Impact & Investigation</h4>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Batches Affected <span className="text-[10px] text-gray-300 font-normal">(comma-separated)</span></label>
              <input type="text" value={form.batchesAffected} onChange={(e) => set('batchesAffected', e.target.value)} placeholder="e.g. B2847, H1156" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Root Cause</label>
              <textarea value={form.rootCause} onChange={(e) => set('rootCause', e.target.value)} rows={2} placeholder="Identified cause of the excursion..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Impact Assessment</label>
              <textarea value={form.impactAssessment} onChange={(e) => set('impactAssessment', e.target.value)} rows={2} placeholder="Impact on affected batches and products..." className={`${inputCls} resize-none`} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Alert Config Tab Data ─── */
const DEFAULT_ALERT_RULES = [
  { id: 'a1', zone: 'Cold Room A', metric: 'Temperature', condition: 'Above 7°C', threshold: 7, duration: '5 min', action: 'Email + SMS', enabled: true },
  { id: 'a2', zone: 'Cold Room A', metric: 'Temperature', condition: 'Below 2°C', threshold: 2, duration: '5 min', action: 'Email + SMS', enabled: true },
  { id: 'a3', zone: 'Cold Room B', metric: 'Temperature', condition: 'Above 7°C', threshold: 7, duration: '5 min', action: 'Email + SMS', enabled: true },
  { id: 'a4', zone: 'Cold Room B', metric: 'Temperature', condition: 'Below 2°C', threshold: 2, duration: '5 min', action: 'Email', enabled: true },
  { id: 'a5', zone: 'Vehicle', metric: 'Temperature', condition: 'Above 8°C', threshold: 8, duration: '10 min', action: 'SMS', enabled: false },
  { id: 'a6', zone: 'All Zones', metric: 'Sensor Offline', condition: 'Sensor offline', threshold: 0, duration: '2 min', action: 'Email + SMS + Dashboard', enabled: true },
];

/* ─── Main Page ─── */
export default function ColdChainPage() {
  const [tab, setTab] = useState('sensors');
  const [viewExcursion, setViewExcursion] = useState<TempExcursion | null>(null);
  const [viewSensor, setViewSensor] = useState<Sensor | null>(null);
  const [showLogExcursion, setShowLogExcursion] = useState(false);
  const [sensors, setSensors] = useState(MOCK_SENSORS);
  const [excursions, setExcursions] = useState(MOCK_EXCURSIONS);
  const [alertRules, setAlertRules] = useState(DEFAULT_ALERT_RULES);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [excSearch, setExcSearch] = useState('');

  // Live sensor simulation
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

  // KPI calculations
  const onlineSensors = sensors.filter((s) => s.isOnline).length;
  const offlineSensors = sensors.filter((s) => !s.isOnline);
  const deviationSensors = sensors.filter((s) => s.status === 'deviation');
  const crATemps = sensors.filter((s) => s.location === 'Cold Room A' && s.isOnline && s.currentTemp !== undefined);
  const crBTemps = sensors.filter((s) => s.location === 'Cold Room B' && s.isOnline && s.currentTemp !== undefined);
  const crAAvg = crATemps.length ? (crATemps.reduce((s, t) => s + (t.currentTemp ?? 0), 0) / crATemps.length).toFixed(1) : '—';
  const crBAvg = crBTemps.length ? (crBTemps.reduce((s, t) => s + (t.currentTemp ?? 0), 0) / crBTemps.length).toFixed(1) : '—';
  const openExcursions = excursions.filter((e) => e.status !== 'Closed').length;

  const CC_KPIS = [
    { label: 'Sensors Online', value: `${onlineSensors}/${sensors.length}`, sub: offlineSensors.length ? `${offlineSensors.map((s) => s.sensorId).join(', ')} offline` : 'All sensors online', trend: (offlineSensors.length ? 'warn' : 'up') as 'warn' | 'up', accentColor: 'orange' as const },
    { label: 'Cold Room A Avg', value: `${crAAvg}°C`, sub: 'Spec: 2–8°C', trend: 'up' as const, accentColor: 'teal' as const },
    { label: 'Cold Room B Avg', value: `${crBAvg}°C`, sub: 'Spec: 2–8°C', trend: 'up' as const, accentColor: 'blue' as const },
    { label: 'Excursions FY', value: String(excursions.length), sub: `${openExcursions} open`, trend: (openExcursions > 0 ? 'warn' : 'up') as 'warn' | 'up', accentColor: 'red' as const },
    { label: 'Cold Chain Uptime', value: '99.2%', sub: 'Last 90 days', trend: 'up' as const, accentColor: 'green' as const },
  ];

  const filteredExcursions = useMemo(() => {
    if (!excSearch) return excursions;
    const q = excSearch.toLowerCase();
    return excursions.filter((e) =>
      e.excursionId.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.sensorId.toLowerCase().includes(q) ||
      e.batchesAffected.some((b) => b.toLowerCase().includes(q))
    );
  }, [excursions, excSearch]);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CC_KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        {tab === 'excursions' && (
          <Button variant="primary" size="sm" onClick={() => setShowLogExcursion(true)}>
            <Plus size={13} /> Log Excursion
          </Button>
        )}
      </div>

      {/* Sensor Grid */}
      {tab === 'sensors' && (
        <div>
          {deviationSensors.length > 0 && (
            <AlertBanner type="warn" message={`${deviationSensors.length} sensor(s) showing temperature deviation. Immediate review required.`} className="mb-3" />
          )}
          {offlineSensors.length > 0 && (
            <AlertBanner type="danger" message={`${offlineSensors.length} sensor(s) offline: ${offlineSensors.map((s) => s.sensorId).join(', ')}. Check connectivity.`} className="mb-3" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Live data — Last updated {lastUpdated.toLocaleTimeString()}</span>
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sensors streaming (30s refresh)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensors.map((s) => <SensorCard key={s.id} sensor={s} onClick={() => setViewSensor(s)} />)}
          </div>
        </div>
      )}

      {/* Charts */}
      {tab === 'charts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="24-Hour Temperature Log (All Zones)">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={TEMP_24H}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} unit="°C" />
                  <Tooltip formatter={(v: number) => [`${v}°C`]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceArea y1={2} y2={8} fill="#22c55e" fillOpacity={0.06} label={{ value: 'Spec 2–8°C', fontSize: 9, fill: '#22c55e' }} />
                  <Line type="monotone" dataKey="Cold Room A" stroke="#D4A847" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Cold Room B" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Vehicle" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Excursion Frequency by Month">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={EXCURSION_BY_MONTH} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Excursions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="7-Day Cold Room Trend (Daily Avg)">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={TEMP_7D}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} unit="°C" />
                <Tooltip formatter={(v: number) => [`${v}°C`]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <ReferenceArea y1={2} y2={8} fill="#22c55e" fillOpacity={0.06} />
                <Line type="monotone" dataKey="CR-A Avg" stroke="#D4A847" strokeWidth={2} dot />
                <Line type="monotone" dataKey="CR-A Min" stroke="#D4A847" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="CR-A Max" stroke="#D4A847" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="CR-B Avg" stroke="#3b82f6" strokeWidth={2} dot />
                <Line type="monotone" dataKey="CR-B Min" stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="CR-B Max" stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Excursion Log */}
      {tab === 'excursions' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <SearchBox value={excSearch} onChange={setExcSearch} placeholder="Search excursion, sensor, batch..." className="w-72" />
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => exportToCSV(
                filteredExcursions.map((e) => ({
                  'Excursion ID': e.excursionId, 'Sensor': e.sensorId, 'Location': e.location,
                  'Start Time': e.startTime, 'End Time': e.endTime ?? '', 'Duration (min)': e.durationMinutes ?? '',
                  'Max Deviation °C': e.maxDeviationC, 'Severity': e.severity, 'Batches': e.batchesAffected.join(', '),
                  'Root Cause': e.rootCause ?? '', 'Impact': e.impactAssessment ?? '', 'Status': e.status,
                })),
                'excursion-log'
              )}>
                <Download size={13} /> Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={() => printTable({
                title: 'Temperature Excursion Log',
                subtitle: `${filteredExcursions.length} excursions`,
                headers: ['ID', 'Sensor', 'Location', 'Start', 'Duration', 'Max °C', 'Severity', 'Batches', 'Status'],
                rows: filteredExcursions.map((e) => [e.excursionId, e.sensorId, e.location, formatDateTime(e.startTime), e.durationMinutes ? `${e.durationMinutes}m` : '—', e.maxDeviationC, e.severity, e.batchesAffected.join(', '), e.status]),
                orientation: 'landscape',
              })}>
                <Printer size={13} /> Print
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Excursion ID', 'Date/Time', 'Sensor', 'Location', 'Duration', 'Max °C', 'Severity', 'Batches Affected', 'Root Cause', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredExcursions.map((exc) => (
                  <tr key={exc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-[#D4A847] font-semibold">{exc.excursionId}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDateTime(exc.startTime)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{exc.sensorId}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{exc.location}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{exc.durationMinutes ?? '—'} min</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-xs font-bold ${exc.maxDeviationC > 8 ? 'text-red-600' : 'text-orange-600'}`}>
                        {exc.maxDeviationC}°C
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={exc.severity === 'CRITICAL' ? 'danger' : exc.severity === 'MAJOR' ? 'orange' : 'blue'}>{exc.severity}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {exc.batchesAffected.map((b) => (
                          <span key={b} className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{b}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[120px] truncate">{exc.rootCause ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={exc.status === 'Closed' ? 'ok' : exc.status === 'Ongoing' ? 'danger' : 'warn'}>{exc.status}</Badge>
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
                {filteredExcursions.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-xs text-gray-400">No excursions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alert Config */}
      {tab === 'alerts' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">Alert Rules</h3>
              <p className="text-xs text-gray-400 mt-0.5">Configure temperature alert thresholds and notification channels</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Zone', 'Metric', 'Condition', 'Duration', 'Notification', 'Enabled'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {alertRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{rule.zone}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{rule.metric}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{rule.condition}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{rule.duration}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {rule.action.split(' + ').map((a) => (
                          <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{a}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAlertRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${rule.enabled ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            Alert rules trigger notifications when the specified condition persists for the given duration. Toggle to enable/disable individual rules.
          </div>
        </div>
      )}

      {/* Modals */}
      {viewSensor && <SensorDetailModal sensor={viewSensor} onClose={() => setViewSensor(null)} />}
      {viewExcursion && <ExcursionDetailModal exc={viewExcursion} onClose={() => setViewExcursion(null)} />}
      {showLogExcursion && (
        <LogExcursionModal
          sensors={sensors}
          onClose={() => setShowLogExcursion(false)}
          onSave={(exc) => setExcursions((prev) => [exc, ...prev])}
        />
      )}
    </div>
  );
}

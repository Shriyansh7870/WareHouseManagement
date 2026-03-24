import React, { useState } from 'react';
import toast from 'react-hot-toast';
import TabBar from '../../components/ui/TabBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useThemeStore } from '../../store/themeStore';
import { useOnboardingTour } from '../../components/ui/OnboardingTour';

const TABS = [
  { id: 'users', label: 'User Management' },
  { id: 'site', label: 'Site Configuration' },
  { id: 'notifs', label: 'Notification Rules' },
  { id: 'sysinfo', label: 'System Info' },
];

const MOCK_USERS = [
  { id: 'u1', name: 'Rahul Mehta', email: 'rahul.mehta@pharmatech.in', role: 'QA_MANAGER', dept: 'Quality Assurance', lastLogin: '2024-03-22 08:55', status: 'ACTIVE' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@pharmatech.in', role: 'WAREHOUSE_MANAGER', dept: 'Warehouse', lastLogin: '2024-03-22 09:10', status: 'ACTIVE' },
  { id: 'u3', name: 'Amit Kumar', email: 'amit.kumar@pharmatech.in', role: 'WAREHOUSE_OPERATOR', dept: 'Warehouse', lastLogin: '2024-03-21 17:30', status: 'ACTIVE' },
  { id: 'u4', name: 'Kiran Patil', email: 'kiran.patil@pharmatech.in', role: 'WAREHOUSE_OPERATOR', dept: 'Dispatch', lastLogin: '2024-03-22 08:00', status: 'ACTIVE' },
  { id: 'u5', name: 'Sneha Iyer', email: 'sneha.iyer@pharmatech.in', role: 'VIEWER', dept: 'Regulatory', lastLogin: '2024-03-20 15:00', status: 'INACTIVE' },
];

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

function roleVariant(role: string): BadgeVariant {
  switch (role) {
    case 'ADMIN': return 'danger';
    case 'QA_MANAGER': return 'purple';
    case 'WAREHOUSE_MANAGER': return 'blue';
    case 'WAREHOUSE_OPERATOR': return 'ok';
    case 'VIEWER': return 'gray';
    default: return 'gray';
  }
}

export default function SettingsPage() {
  const [tab, setTab] = useState('users');
  const [fefo, setFefo] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const { dark, toggle } = useThemeStore();
  const { resetTour } = useOnboardingTour();

  return (
    <div className="space-y-4">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* User Management */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" size="sm">+ Invite User</Button>
          </div>
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Role', 'Department', 'Last Login', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_USERS.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6c63ff, #f97316)' }}>
                            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{u.email}</td>
                      <td className="px-3 py-2.5"><Badge variant={roleVariant(u.role)}>{u.role.replace('_', ' ')}</Badge></td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{u.dept}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{u.lastLogin}</td>
                      <td className="px-3 py-2.5"><Badge variant={u.status === 'ACTIVE' ? 'ok' : 'gray'} dot>{u.status}</Badge></td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button className="px-2 py-1 text-[10px] rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                          {u.status === 'ACTIVE' ? (
                            <button
                              className="px-2 py-1 text-[10px] rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              onClick={async () => {
                                const ok = await confirm({ title: 'Deactivate User?', message: `This will deactivate ${u.name}'s account. They will lose access immediately.`, confirmLabel: 'Deactivate', variant: 'danger' });
                                if (ok) { toast.error(`${u.name} has been deactivated`); }
                              }}
                            >Deactivate</button>
                          ) : (
                            <button className="px-2 py-1 text-[10px] rounded border border-green-200 text-green-600 hover:bg-green-50 transition-colors">Activate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Site Configuration */}
      {tab === 'site' && (
        <div className="grid grid-cols-2 gap-4 max-w-3xl lg:grid-cols-1">
          <Card title="Company Details">
            <div className="space-y-3 text-sm">
              {[
                { label: 'Company Name', value: 'PharmaTech Manufacturing Pvt. Ltd.' },
                { label: 'Regulatory License No.', value: 'MH-DL-MFGR-001234' },
                { label: 'Site Code', value: 'MH-SITE-01' },
                { label: 'GMP Certification', value: 'WHO-GMP, ISO 9001:2015' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input defaultValue={value} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30" />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Compliance Settings">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-800">FEFO Enforcement</div>
                  <div className="text-xs text-gray-500">Enforce First-Expiry First-Out picking order</div>
                </div>
                <button
                  onClick={() => setFefo(!fefo)}
                  className={`w-11 h-6 rounded-full transition-colors ${fefo ? 'bg-[#6c63ff]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${fefo ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-800">Email Notifications</div>
                  <div className="text-xs text-gray-500">Expiry alerts, CAPA reminders, and reports</div>
                </div>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`w-11 h-6 rounded-full transition-colors ${emailNotif ? 'bg-[#6c63ff]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-800">Dark Mode</div>
                  <div className="text-xs text-gray-500">Switch to dark interface theme</div>
                </div>
                <button onClick={toggle} className={`w-11 h-6 rounded-full transition-colors ${dark ? 'bg-[#6c63ff]' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-800">Onboarding Tour</div>
                  <div className="text-xs text-gray-500">Restart the first-login walkthrough</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { resetTour(); toast.success('Tour will start on next page visit'); }}>
                  Restart Tour
                </Button>
              </div>
              {[
                { label: 'Cold Room Spec Min (°C)', value: '2' },
                { label: 'Cold Room Spec Max (°C)', value: '8' },
                { label: 'QA TAT Target (hrs)', value: '30' },
                { label: 'Default Reorder Lead Time (days)', value: '14' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input type="number" defaultValue={value} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30" />
                </div>
              ))}
              <Button variant="primary" className="w-full">Save Configuration</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notification Rules */}
      {tab === 'notifs' && (
        <div className="max-w-2xl">
          <Card title="Notification Rules">
            <div className="space-y-3 text-sm">
              {[
                { label: 'Expiry Alert (days before)', value: '30', type: 'number' },
                { label: 'CAPA Due Reminder (days before)', value: '5', type: 'number' },
                { label: 'Cold Chain Alert Email', value: 'coldchain@pharmatech.in', type: 'email' },
                { label: 'QA Alerts Email', value: 'qa@pharmatech.in', type: 'email' },
                { label: 'GRN Notifications Email', value: 'warehouse@pharmatech.in', type: 'email' },
              ].map(({ label, value, type }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input type={type} defaultValue={value} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30" />
                </div>
              ))}
              <Button variant="primary">Save Notification Rules</Button>
            </div>
          </Card>
        </div>
      )}

      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}

      {/* System Info */}
      {tab === 'sysinfo' && (
        <div className="max-w-2xl">
          <Card title="System Information">
            <div className="space-y-3 text-sm">
              {[
                ['Application', 'Quantum Invenza WMS'],
                ['Version', '1.0.0 (Build 20240323)'],
                ['Company', 'PharmaTech Manufacturing Pvt. Ltd.'],
                ['Site Code', 'MH-SITE-01'],
                ['Frontend', 'React 18 + TypeScript + Vite 5'],
                ['Backend', 'Node.js 20 + Express + Prisma'],
                ['Database', 'PostgreSQL 16'],
                ['GMP Compliance', 'WHO-GMP, ISO 9001:2015'],
                ['Data Retention', '10 years (regulatory)'],
                ['Audit Trail', 'Immutable, timestamped'],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

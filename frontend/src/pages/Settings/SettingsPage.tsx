import React, { useState } from 'react';
import { User, Shield, Bell, Server, Building2, Palette, RotateCcw, Plus, Mail, Clock, Thermometer, Package, FileCheck, ChevronRight, Globe, Database, Lock, Cpu, HardDrive, Activity, Users, Settings, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBox from '../../components/ui/SearchBox';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { useThemeStore } from '../../store/themeStore';
import { useOnboardingTour } from '../../components/ui/OnboardingTour';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 transition-colors';
const inputErrCls = 'w-full px-3 py-2 border border-red-400 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

/* ─── Toggle Switch ─── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#D4A847]' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

/* ─── Setting Row ─── */
function SettingRow({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={16} className="text-gray-500" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

/* ─── Data ─── */
const MOCK_USERS = [
  { id: 'u1', name: 'Rahul Mehta', email: 'rahul.mehta@pharmatech.in', role: 'QA_MANAGER', dept: 'Quality Assurance', lastLogin: '2024-03-22 08:55', status: 'ACTIVE' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@pharmatech.in', role: 'WAREHOUSE_MANAGER', dept: 'Warehouse', lastLogin: '2024-03-22 09:10', status: 'ACTIVE' },
  { id: 'u3', name: 'Amit Kumar', email: 'amit.kumar@pharmatech.in', role: 'WAREHOUSE_OPERATOR', dept: 'Warehouse', lastLogin: '2024-03-21 17:30', status: 'ACTIVE' },
  { id: 'u4', name: 'Kiran Patil', email: 'kiran.patil@pharmatech.in', role: 'WAREHOUSE_OPERATOR', dept: 'Dispatch', lastLogin: '2024-03-22 08:00', status: 'ACTIVE' },
  { id: 'u5', name: 'Sneha Iyer', email: 'sneha.iyer@pharmatech.in', role: 'VIEWER', dept: 'Regulatory', lastLogin: '2024-03-20 15:00', status: 'INACTIVE' },
];

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

function roleVariant(role: string): BadgeVariant {
  switch (role) { case 'ADMIN': return 'danger'; case 'QA_MANAGER': return 'purple'; case 'WAREHOUSE_MANAGER': return 'blue'; case 'WAREHOUSE_OPERATOR': return 'ok'; default: return 'gray'; }
}

function roleColor(role: string) {
  switch (role) { case 'QA_MANAGER': return '#8b5cf6'; case 'WAREHOUSE_MANAGER': return '#3b82f6'; case 'WAREHOUSE_OPERATOR': return '#22c55e'; default: return '#9ca3af'; }
}

const ROLES = ['ADMIN', 'QA_MANAGER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_OPERATOR', 'VIEWER'];
const DEPTS = ['Quality Assurance', 'Warehouse', 'Dispatch', 'Regulatory', 'IT', 'Management'];

/* ─── Sidebar Navigation Items ─── */
const SETTING_SECTIONS = [
  { id: 'users', label: 'User Management', icon: Users, desc: 'Manage users, roles and permissions' },
  { id: 'company', label: 'Company Profile', icon: Building2, desc: 'Company details and site configuration' },
  { id: 'compliance', label: 'Compliance', icon: Shield, desc: 'FEFO, QA targets, and regulatory settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert rules, email, and thresholds' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, display, and onboarding' },
  { id: 'system', label: 'System Info', icon: Server, desc: 'Version, stack, and compliance info' },
];

/* ─── Invite User Modal ─── */
function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', role: '', dept: '' });

  const set = (f: string, v: string) => {
    setForm((prev) => ({ ...prev, [f]: v }));
    setErrors((prev) => { const c = { ...prev }; delete c[f]; return c; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.role) errs.role = 'Role is required';
    if (!form.dept) errs.dept = 'Department is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) toast.error('Please fill all required fields');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success(`Invitation sent to ${form.email}`);
    setSaving(false);
    onClose();
  };

  const hasErr = (f: string) => !!errors[f];

  return (
    <Modal title="Invite New User" width="560px" onClose={onClose} footer={
      <><Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" loading={saving} onClick={handleSubmit}><Mail size={13} /> Send Invitation</Button></>
    }>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rahul Mehta" className={hasErr('name') ? inputErrCls : inputCls} />
            {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}</div>
          <div><label className={labelCls}>Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@pharmatech.in" className={hasErr('email') ? inputErrCls : inputCls} />
            {errors.email && <p className="text-[11px] text-red-500 mt-0.5">{errors.email}</p>}</div>
          <div><label className={labelCls}>Role <span className="text-red-500">*</span></label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className={hasErr('role') ? inputErrCls : inputCls}>
              <option value="">Select role</option>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
            {errors.role && <p className="text-[11px] text-red-500 mt-0.5">{errors.role}</p>}</div>
          <div><label className={labelCls}>Department <span className="text-red-500">*</span></label>
            <select value={form.dept} onChange={(e) => set('dept', e.target.value)} className={hasErr('dept') ? inputErrCls : inputCls}>
              <option value="">Select department</option>
              {DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            {errors.dept && <p className="text-[11px] text-red-500 mt-0.5">{errors.dept}</p>}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          An invitation email with temporary credentials will be sent to the user. They must change their password on first login.
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ─── */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [fefo, setFefo] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [dashboardNotif, setDashboardNotif] = useState(true);
  const [autoReorder, setAutoReorder] = useState(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const { dark, toggle } = useThemeStore();
  const { resetTour } = useOnboardingTour();

  const filteredUsers = MOCK_USERS.filter((u) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* Left Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl overflow-hidden sticky top-0" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-[#D4A847]" />
              <h2 className="font-display font-bold text-sm text-gray-800">Settings</h2>
            </div>
          </div>
          <nav className="p-2">
            {SETTING_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all mb-0.5 ${
                    isActive ? 'bg-[#D4A847]/10 text-[#D4A847]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#D4A847]' : 'text-gray-400'} />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium ${isActive ? 'text-[#D4A847]' : 'text-gray-700'}`}>{section.label}</div>
                    <div className="text-[10px] text-gray-400 truncate">{section.desc}</div>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-[#D4A847]" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 min-w-0">
        {/* ─── User Management ─── */}
        {activeSection === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">User Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage user accounts, roles, and access permissions</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
                <Plus size={13} /> Invite User
              </Button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: MOCK_USERS.length, color: '#D4A847' },
                { label: 'Active', value: MOCK_USERS.filter((u) => u.status === 'ACTIVE').length, color: '#22c55e' },
                { label: 'Inactive', value: MOCK_USERS.filter((u) => u.status === 'INACTIVE').length, color: '#9ca3af' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div className="p-4 border-b border-gray-100">
                <SearchBox value={userSearch} onChange={setUserSearch} placeholder="Search users..." className="w-64" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['User', 'Role', 'Department', 'Last Login', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${roleColor(u.role)}, ${roleColor(u.role)}99)` }}>
                              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">{u.name}</div>
                              <div className="text-[11px] text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant={roleVariant(u.role)}>{u.role.replace(/_/g, ' ')}</Badge></td>
                        <td className="px-4 py-3 text-xs text-gray-600">{u.dept}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{u.lastLogin}</td>
                        <td className="px-4 py-3"><Badge variant={u.status === 'ACTIVE' ? 'ok' : 'gray'} dot>{u.status}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="View"><Eye size={13} /></button>
                            {u.status === 'ACTIVE' ? (
                              <button
                                className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors" title="Deactivate"
                                onClick={async () => {
                                  const ok = await confirm({ title: 'Deactivate User?', message: `This will deactivate ${u.name}'s account. They will lose access immediately.`, confirmLabel: 'Deactivate', variant: 'danger' });
                                  if (ok) toast.error(`${u.name} has been deactivated`);
                                }}
                              ><Trash2 size={13} /></button>
                            ) : (
                              <button className="p-1.5 rounded-lg border border-green-200 text-green-500 hover:bg-green-50 transition-colors" title="Activate"
                                onClick={() => toast.success(`${u.name} activated`)}
                              ><RotateCcw size={13} /></button>
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

        {/* ─── Company Profile ─── */}
        {activeSection === 'company' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Company Profile</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage your organization and site details</p>
            </div>

            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <img src="/logo3.png" alt="Logo" className="w-16 h-16 rounded-xl object-contain" />
                <div>
                  <h3 className="font-bold text-base text-gray-800">PharmaTech Manufacturing Pvt. Ltd.</h3>
                  <p className="text-xs text-gray-500">Quantum Invenza WMS — MH-SITE-01</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Company Name', value: 'PharmaTech Manufacturing Pvt. Ltd.' },
                  { label: 'Regulatory License No.', value: 'MH-DL-MFGR-001234' },
                  { label: 'Primary Site Code', value: 'MH-SITE-01' },
                  { label: 'GMP Certification', value: 'WHO-GMP, ISO 9001:2015' },
                  { label: 'Registered Address', value: 'Plot 42, MIDC Industrial Area, Pune, MH 411057' },
                  { label: 'GSTIN', value: '27AABCP1234F1ZV' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className={labelCls}>{label}</label>
                    <input defaultValue={value} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={() => toast.success('Company profile saved')}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Compliance ─── */}
        {activeSection === 'compliance' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Compliance & Operational Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">Configure regulatory, quality, and warehouse operation parameters</p>
            </div>

            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Warehouse Operations</h3>
              <SettingRow icon={Package} title="FEFO Enforcement" description="Enforce First-Expiry First-Out picking order for all dispatch operations">
                <Toggle enabled={fefo} onChange={() => { setFefo(!fefo); toast.success(`FEFO ${!fefo ? 'enabled' : 'disabled'}`); }} />
              </SettingRow>
              <SettingRow icon={Package} title="Auto Reorder Suggestions" description="AI generates reorder recommendations when stock drops below reorder level">
                <Toggle enabled={autoReorder} onChange={() => { setAutoReorder(!autoReorder); toast.success(`Auto reorder ${!autoReorder ? 'enabled' : 'disabled'}`); }} />
              </SettingRow>
            </div>

            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quality & Cold Chain Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cold Room Spec Min (°C)', value: '2', icon: Thermometer },
                  { label: 'Cold Room Spec Max (°C)', value: '8', icon: Thermometer },
                  { label: 'QA TAT Target (hours)', value: '30', icon: Clock },
                  { label: 'Default Reorder Lead Time (days)', value: '14', icon: Package },
                  { label: 'Expiry Alert Threshold (days)', value: '30', icon: Clock },
                  { label: 'CAPA Due Reminder (days before)', value: '5', icon: FileCheck },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className={labelCls}>{label}</label>
                    <input type="number" defaultValue={value} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={() => toast.success('Compliance settings saved')}>Save Parameters</Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Notifications ─── */}
        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Notification Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">Configure how and when you receive alerts</p>
            </div>

            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Notification Channels</h3>
              <SettingRow icon={Mail} title="Email Notifications" description="Receive alerts for expiry, CAPA, cold chain, and GRN events via email">
                <Toggle enabled={emailNotif} onChange={() => { setEmailNotif(!emailNotif); toast.success(`Email notifications ${!emailNotif ? 'enabled' : 'disabled'}`); }} />
              </SettingRow>
              <SettingRow icon={Bell} title="SMS Notifications" description="Critical alerts sent via SMS for immediate attention">
                <Toggle enabled={smsNotif} onChange={() => { setSmsNotif(!smsNotif); toast.success(`SMS notifications ${!smsNotif ? 'enabled' : 'disabled'}`); }} />
              </SettingRow>
              <SettingRow icon={Activity} title="Dashboard Alerts" description="Show alert banners and badge counts on the dashboard">
                <Toggle enabled={dashboardNotif} onChange={() => { setDashboardNotif(!dashboardNotif); toast.success(`Dashboard alerts ${!dashboardNotif ? 'enabled' : 'disabled'}`); }} />
              </SettingRow>
            </div>

            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Email Recipients</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cold Chain Alerts', value: 'coldchain@pharmatech.in' },
                  { label: 'QA / CAPA Alerts', value: 'qa@pharmatech.in' },
                  { label: 'GRN Notifications', value: 'warehouse@pharmatech.in' },
                  { label: 'Dispatch Notifications', value: 'dispatch@pharmatech.in' },
                  { label: 'Expiry Alerts', value: 'qa@pharmatech.in, warehouse@pharmatech.in' },
                  { label: 'Management Reports', value: 'management@pharmatech.in' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className={labelCls}>{label}</label>
                    <input type="email" defaultValue={value} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={() => toast.success('Notification settings saved')}>Save Notification Rules</Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Appearance ─── */}
        {activeSection === 'appearance' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Appearance & Display</h2>
              <p className="text-xs text-gray-500 mt-0.5">Customize the look and feel of your workspace</p>
            </div>

            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <SettingRow icon={Palette} title="Dark Mode" description="Switch between light and dark interface themes">
                <Toggle enabled={dark} onChange={() => { toggle(); toast.success(`${!dark ? 'Dark' : 'Light'} mode activated`); }} />
              </SettingRow>
              <SettingRow icon={RotateCcw} title="Onboarding Tour" description="Restart the first-login walkthrough to learn the system">
                <Button variant="ghost" size="sm" onClick={() => { resetTour(); toast.success('Tour will start on next page visit'); }}>Restart Tour</Button>
              </SettingRow>
            </div>

            {/* Theme Preview */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Brand Colors</h3>
              <div className="flex gap-4">
                {[
                  { name: 'Accent Gold', color: '#D4A847' },
                  { name: 'Navy Primary', color: '#112D4E' },
                  { name: 'Navy Dark', color: '#0A1F38' },
                  { name: 'Success', color: '#22c55e' },
                  { name: 'Warning', color: '#f97316' },
                  { name: 'Danger', color: '#ef4444' },
                ].map((c) => (
                  <div key={c.name} className="text-center">
                    <div className="w-12 h-12 rounded-xl border border-gray-200 mb-1.5" style={{ background: c.color }} />
                    <div className="text-[10px] text-gray-500">{c.name}</div>
                    <div className="text-[9px] font-mono text-gray-400">{c.color}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── System Info ─── */}
        {activeSection === 'system' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">System Information</h2>
              <p className="text-xs text-gray-500 mt-0.5">Technical details about this installation</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Application */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={16} className="text-[#D4A847]" />
                  <h3 className="text-sm font-semibold text-gray-700">Application</h3>
                </div>
                <div className="space-y-3">
                  {[
                    ['Application', 'Quantum Invenza WMS'],
                    ['Version', '1.0.0 (Build 20240323)'],
                    ['Frontend', 'React 18 + TypeScript + Vite 5'],
                    ['Backend', 'Node.js 20 + Express + Prisma'],
                    ['UI Framework', 'Tailwind CSS + Recharts'],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500">{k}</span>
                      <span className="text-xs font-medium text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infrastructure */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive size={16} className="text-[#D4A847]" />
                  <h3 className="text-sm font-semibold text-gray-700">Infrastructure</h3>
                </div>
                <div className="space-y-3">
                  {[
                    ['Database', 'PostgreSQL 16'],
                    ['Cache', 'Redis 7'],
                    ['Storage', 'AWS S3 (Document Store)'],
                    ['Hosting', 'AWS EC2 (ap-south-1)'],
                    ['CDN', 'CloudFront'],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500">{k}</span>
                      <span className="text-xs font-medium text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={16} className="text-[#D4A847]" />
                  <h3 className="text-sm font-semibold text-gray-700">Compliance & Security</h3>
                </div>
                <div className="space-y-3">
                  {[
                    ['GMP Compliance', 'WHO-GMP, ISO 9001:2015'],
                    ['Data Retention', '10 years (regulatory)'],
                    ['Audit Trail', 'Immutable, timestamped'],
                    ['Encryption', 'AES-256 at rest, TLS 1.3 in transit'],
                    ['Authentication', 'JWT + RBAC'],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500">{k}</span>
                      <span className="text-xs font-medium text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-[#D4A847]" />
                  <h3 className="text-sm font-semibold text-gray-700">System Health</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'API Server', status: 'ok', text: 'Healthy' },
                    { label: 'Database', status: 'ok', text: 'Connected' },
                    { label: 'Cache', status: 'ok', text: 'Active' },
                    { label: 'Cold Chain Sensors', status: 'warn', text: '7/8 Online' },
                    { label: 'Document Storage', status: 'ok', text: '42.3 GB used' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <Badge variant={item.status as BadgeVariant} dot>{item.text}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showInvite && <InviteUserModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

export const QA_STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Approved',
  QUARANTINE: 'Quarantine',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
  PENDING_QA: 'Pending QA',
};

export const CATEGORY_LABELS: Record<string, string> = {
  RAW_MATERIAL: 'Raw Material',
  FINISHED_GOODS: 'Finished Goods',
  INTERMEDIATE: 'Intermediate',
  PACKAGING: 'Packaging',
  API: 'API',
};

export const SITE_CODES = ['MH-SITE-01', 'MH-SITE-02', 'DL-SITE-01'];

export const STORAGE_LOCATIONS = [
  'Main Store',
  'Cold Room A',
  'Cold Room B',
  'Quarantine Zone',
  'Dispatch Area',
  'Raw Material Store',
];

export const NAV_ITEMS = [
  { section: 'CORE WMS', items: [
    { icon: 'LayoutDashboard', label: 'Dashboard', path: '/', badge: null, badgeColor: null },
    { icon: 'Package', label: 'Inventory', path: '/inventory', badge: null, badgeColor: null },
    { icon: 'Truck', label: 'Goods Receipt (GRN)', path: '/grn', badge: 3, badgeColor: 'purple' },
    { icon: 'CheckCircle', label: 'Quality Assurance', path: '/qa', badge: 2, badgeColor: 'orange' },
    { icon: 'Thermometer', label: 'Cold Chain', path: '/cold-chain', badge: 1, badgeColor: 'red' },
  ]},
  { section: 'OUTBOUND', items: [
    { icon: 'Rocket', label: 'Dispatch / DO', path: '/dispatch', badge: 3, badgeColor: 'purple' },
    { icon: 'RefreshCw', label: 'Returns (RMA)', path: '/returns', badge: null, badgeColor: null },
  ]},
  { section: 'COMPLIANCE', items: [
    { icon: 'Factory', label: 'Vendor Master', path: '/vendors', badge: null, badgeColor: null },
    { icon: 'FileText', label: 'Documents (DMS)', path: '/documents', badge: null, badgeColor: null },
    { icon: 'Hash', label: 'Cycle Count', path: '/cycle-count', badge: null, badgeColor: null },
  ]},
  { section: 'INTELLIGENCE', items: [
    { icon: 'Bot', label: 'AI Analytics', path: '/ai-analytics', badge: null, badgeColor: null },
    { icon: 'BarChart2', label: 'Reports', path: '/reports', badge: null, badgeColor: null },
    { icon: 'Search', label: 'Audit Trail', path: '/audit', badge: null, badgeColor: null },
  ]},
  { section: 'SYSTEM', items: [
    { icon: 'Settings', label: 'Settings', path: '/settings', badge: null, badgeColor: null },
  ]},
];

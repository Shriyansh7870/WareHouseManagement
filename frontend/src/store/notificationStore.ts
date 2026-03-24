import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'expiry' | 'capa' | 'excursion' | 'grn' | 'dispatch' | 'system';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'expiry', title: 'Batch Expiring Soon', message: 'Azithromycin 500mg (Batch I9923) expires in 8 days — 1,200 units at risk.', severity: 'critical', read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), link: '/inventory' },
  { id: 'n2', type: 'expiry', title: 'Batch Expiring Soon', message: 'Amoxicillin 500mg (Batch D4521) expires in 13 days — 850 units in Quarantine.', severity: 'critical', read: false, createdAt: new Date(Date.now() - 15 * 60000).toISOString(), link: '/inventory' },
  { id: 'n3', type: 'capa', title: 'CAPA Overdue', message: 'CAP-2024-004 is overdue by 3 days. Assigned to Priya Sharma.', severity: 'critical', read: false, createdAt: new Date(Date.now() - 60 * 60000).toISOString(), link: '/qa' },
  { id: 'n4', type: 'excursion', title: 'Temperature Deviation', message: 'Sensor VH-01 recorded 7.2°C — approaching upper spec limit (8°C).', severity: 'warning', read: false, createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), link: '/cold-chain' },
  { id: 'n5', type: 'grn', title: 'GRN Pending QA', message: 'GRN-2024-0005 (Ibuprofen 400mg) has been pending QA inspection for 48 hours.', severity: 'warning', read: true, createdAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(), link: '/grn' },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      addNotification: (n) => set((s) => ({
        notifications: [{ ...n, id: `n-${Date.now()}`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
      })),
      markRead: (id) => set((s) => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),
      markAllRead: () => set((s) => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
      })),
      clearAll: () => set({ notifications: [] }),
    }),
    { name: 'qi-notifications' }
  )
);

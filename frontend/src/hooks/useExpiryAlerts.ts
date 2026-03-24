import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDataStore } from '../store/dataStore';
import { useNotificationStore } from '../store/notificationStore';
import { daysToExpiry } from '../utils/formatters';

export function useExpiryAlerts() {
  const fired = useRef(false);
  // Use a selector to avoid subscribing to the entire store
  const inventory = useDataStore(s => s.inventory);
  const addNotification = useNotificationStore(s => s.addNotification);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const critical = inventory.filter(i => i.qaStatus === 'APPROVED' && daysToExpiry(i.expiryDate) <= 30);
    if (critical.length > 0) {
      setTimeout(() => {
        toast.error(`⚠ ${critical.length} batch(es) expire within 30 days — FEFO enforcement active`, {
          duration: 6000,
          id: 'expiry-alert',
        });
      }, 1500);
    }

    // CAPA overdue check
    const capas = useNotificationStore.getState().notifications;
    const hasOverdueNotif = capas.some(n => n.type === 'capa' && !n.read);
    if (hasOverdueNotif) {
      setTimeout(() => {
        toast('📋 You have overdue CAPAs requiring attention', {
          duration: 5000,
          id: 'capa-alert',
          icon: '⚠️',
        });
      }, 3000);
    }
  }, []);
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_INVENTORY, MOCK_GRNS, MOCK_ASNS, MOCK_CAPAS, MOCK_DEVIATIONS, MOCK_QA_INSPECTIONS, MOCK_DELIVERY_ORDERS, MOCK_PICK_ITEMS } from '../utils/mockData';
import type { InventoryItem } from '../types/inventory.types';
import type { GRN, ASN } from '../types/grn.types';
import type { CAPA, Deviation, QAInspection } from '../types/qa.types';
import type { DeliveryOrder, PickItem } from '../types/dispatch.types';

interface DataStore {
  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  adjustStock: (id: string, delta: number, type: string) => void;

  // GRN
  grns: GRN[];
  asns: ASN[];
  addGRN: (grn: GRN) => void;
  updateGRNStatus: (id: string, status: GRN['status']) => void;
  addASN: (asn: ASN) => void;

  // QA
  qaInspections: QAInspection[];
  capas: CAPA[];
  deviations: Deviation[];
  addCAPA: (capa: CAPA) => void;
  updateCAPA: (id: string, updates: Partial<CAPA>) => void;
  updateQAInspection: (id: string, updates: Partial<QAInspection>) => void;
  addDeviation: (dev: Deviation) => void;

  // Dispatch
  deliveryOrders: DeliveryOrder[];
  pickItems: PickItem[];
  addDeliveryOrder: (order: DeliveryOrder) => void;
  updateDeliveryOrder: (id: string, updates: Partial<DeliveryOrder>) => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      inventory: MOCK_INVENTORY,
      grns: MOCK_GRNS,
      asns: MOCK_ASNS,
      qaInspections: MOCK_QA_INSPECTIONS,
      capas: MOCK_CAPAS,
      deviations: MOCK_DEVIATIONS,
      deliveryOrders: MOCK_DELIVERY_ORDERS,
      pickItems: MOCK_PICK_ITEMS,

      addInventoryItem: (item) =>
        set((s) => ({ inventory: [item, ...s.inventory] })),

      updateInventoryItem: (id, updates) =>
        set((s) => ({
          inventory: s.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      adjustStock: (id, delta, type) =>
        set((s) => ({
          inventory: s.inventory.map((i) => {
            if (i.id !== id) return i;
            const newQty = type === 'POSITIVE' ? i.qtyOnHand + delta : Math.max(0, i.qtyOnHand - delta);
            return { ...i, qtyOnHand: newQty };
          }),
        })),

      addGRN: (grn) =>
        set((s) => ({ grns: [grn, ...s.grns] })),

      updateGRNStatus: (id, status) =>
        set((s) => ({
          grns: s.grns.map((g) => (g.id === id ? { ...g, status } : g)),
        })),

      addASN: (asn) =>
        set((s) => ({ asns: [asn, ...s.asns] })),

      addCAPA: (capa) =>
        set((s) => ({ capas: [capa, ...s.capas] })),

      updateCAPA: (id, updates) =>
        set((s) => ({
          capas: s.capas.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      updateQAInspection: (id, updates) =>
        set((s) => ({
          qaInspections: s.qaInspections.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })),

      addDeviation: (dev) =>
        set((s) => ({ deviations: [dev, ...s.deviations] })),

      addDeliveryOrder: (order) =>
        set((s) => ({ deliveryOrders: [order, ...s.deliveryOrders] })),

      updateDeliveryOrder: (id, updates) =>
        set((s) => ({
          deliveryOrders: s.deliveryOrders.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
    }),
    { name: 'qi-data' }
  )
);

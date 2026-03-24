export type ItemCategory = 'RAW_MATERIAL' | 'FINISHED_GOODS' | 'INTERMEDIATE' | 'PACKAGING' | 'API';
export type QAStatus = 'APPROVED' | 'QUARANTINE' | 'REJECTED' | 'ON_HOLD' | 'PENDING_QA';

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: ItemCategory;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  daysToExpiry?: number;
  expiryStatus?: 'critical' | 'warning' | 'ok';
  qtyOnHand: number;
  unit: string;
  reorderLevel: number;
  storageLocation: string;
  siteCode: string;
  qaStatus: QAStatus;
  grnId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  status?: QAStatus;
  category?: ItemCategory;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

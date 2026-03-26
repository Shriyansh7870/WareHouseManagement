export type DOStatus = 'PENDING' | 'PICKING_IN_PROGRESS' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
export type PickStatus = 'PENDING' | 'PICKING' | 'PICKED' | 'PACKED';

export interface DeliveryOrder {
  id: string;
  doNumber: string;
  orderDate: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  items: string;
  qty: number;
  unit?: string;
  carrier?: string;
  trackingNo?: string;
  pickStatus: PickStatus;
  doStatus: DOStatus;
  priority?: 'NORMAL' | 'URGENT' | 'EXPRESS';
  expectedDelivery?: string;
  dispatchDate?: string;
  deliveredDate?: string;
  remarks?: string;
  createdAt?: string;
}

export interface PickItem {
  id: string;
  pickListId: string;
  doReference: string;
  itemName: string;
  batchFEFO: string;
  qtyToPick: number;
  fromLocation: string;
  assignedTo?: string;
  status: string;
}

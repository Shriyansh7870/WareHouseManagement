export type GRNStatus = 'PENDING_QA' | 'APPROVED' | 'QUARANTINE' | 'REJECTED' | 'ON_HOLD';
export type ASNStatus = 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

export interface GRN {
  id: string;
  grnNumber: string;
  vendorId: string;
  vendorName?: string;
  itemName: string;
  itemCode: string;
  batchNumber: string;
  qtyReceived: number;
  unit: string;
  mfgDate: string;
  expiryDate: string;
  vehicleLR?: string;
  storageLocation: string;
  receivedByName?: string;
  status: GRNStatus;
  coaLinked: boolean;
  remarks?: string;
  createdAt: string;
}

export interface ASN {
  id: string;
  asnNumber: string;
  vendorName: string;
  poReference?: string;
  itemName?: string;
  expectedQty?: number;
  expectedDelivery?: string;
  vehicleLR?: string;
  status: ASNStatus;
}

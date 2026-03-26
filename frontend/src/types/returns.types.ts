export type RMADisposition = 'PENDING_INSPECTION' | 'RESTOCKED' | 'DESTROYED' | 'RETURNED_TO_VENDOR' | 'QUARANTINE';
export type RMAStatus = 'RECEIVED' | 'INSPECTING' | 'INSPECTED' | 'DISPOSED' | 'CLOSED';
export type ReturnCondition = 'Sealed' | 'Intact' | 'Damaged' | 'Expired' | 'Tampered';

export interface ReturnRMA {
  id: string;
  rmaNumber: string;
  returnDate: string;
  customerName: string;
  customerPhone?: string;
  doReference: string;
  itemName: string;
  batchNumber?: string;
  qtyReturned: number;
  unit?: string;
  reason: string;
  condition: ReturnCondition;
  disposition: RMADisposition;
  status: RMAStatus;
  inspectedBy?: string;
  inspectionDate?: string;
  inspectionNotes?: string;
  qaDecision?: string;
  refundAmount?: number;
  replacementDO?: string;
  createdAt?: string;
}

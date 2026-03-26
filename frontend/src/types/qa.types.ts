export type QAResult = 'PASSED' | 'FAILED' | 'PENDING';
export type QADecision = 'APPROVE' | 'QUARANTINE' | 'REJECT' | 'REQUEST_RETEST';
export type CAPAPriority = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type CAPAStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'CLOSED' | 'OVERDUE';

export interface QAInspection {
  id: string;
  inspectionId: string;
  grnLinked: string;
  itemName: string;
  batchNumber: string;
  supplier: string;
  sampledBy: string;
  testParameters: string;
  result: QAResult;
  decision: QADecision;
  tatHours?: number;
}

export interface CAPA {
  id: string;
  capaNumber: string;
  source: string;
  description: string;
  category: string;
  priority: CAPAPriority;
  raisedBy: string;
  assignedTo: string;
  dueDate: string;
  status: CAPAStatus;
  closureDate?: string;
  // Extended fields
  grnRef?: string;
  batchRef?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Deviation {
  id: string;
  deviationNo: string;
  date: string;
  batchRef?: string;
  deviationType: string;
  description: string;
  reportedBy: string;
  capaLinked?: string;
  status: string;
}

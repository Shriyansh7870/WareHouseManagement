export type DocType = 'SOP' | 'COA' | 'VALIDATION' | 'REGULATORY' | 'CAPA' | 'AUDIT_REPORT' | 'POLICY';
export type DocStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'SUPERSEDED' | 'ARCHIVED';

export interface Document {
  id: string;
  docId: string;
  title: string;
  docType: DocType;
  version?: string;
  linkedTo?: string;
  owner: string;
  reviewDate?: string;
  status: DocStatus;
  fileUrl?: string;
  uploadedBy: string;
  createdAt: string;
}

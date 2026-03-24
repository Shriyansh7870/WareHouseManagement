export type VendorStatus = 'APPROVED' | 'REVIEW_DUE' | 'SUSPENDED' | 'BLACKLISTED';

export interface Vendor {
  id: string;
  vendorCode: string;
  companyName: string;
  category: string;
  drugLicenseNo?: string;
  gmpCertification?: string;
  qaRating?: string;
  qaPassRatePct?: number;
  lastAuditDate?: string;
  status: VendorStatus;
  posFY?: number;
}

export interface VendorScorecard {
  vendorId: string;
  vendorName: string;
  grade: string;
  onTimeDeliveryPct: number;
  qaPassRatePct: number;
  coaAccuracyPct: number;
  grnsProcessed: number;
}

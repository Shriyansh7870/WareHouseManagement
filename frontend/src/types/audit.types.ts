export type AuditModule = 'AUTH' | 'INVENTORY' | 'GRN' | 'QA' | 'COLD_CHAIN' | 'DISPATCH' | 'VENDOR' | 'DOCUMENTS' | 'CYCLE_COUNT' | 'RETURNS' | 'REPORTS' | 'SETTINGS';

export interface AuditLog {
  id: string;
  action: string;
  detail: string;
  module: AuditModule;
  userName: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
}

import type { InventoryItem } from '../types/inventory.types';
import type { GRN, ASN } from '../types/grn.types';
import type { CAPA, Deviation, QAInspection } from '../types/qa.types';
import type { Sensor, TempExcursion } from '../types/coldchain.types';
import type { DeliveryOrder, PickItem } from '../types/dispatch.types';
import type { Vendor } from '../types/vendor.types';
import type { Document } from '../types/document.types';
import type { AuditLog } from '../types/audit.types';

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', itemCode: 'PARA-B2847', itemName: 'Paracetamol 500mg', category: 'FINISHED_GOODS', batchNumber: 'B2847', mfgDate: '2024-01-15', expiryDate: '2026-01-14', daysToExpiry: 295, expiryStatus: 'ok', qtyOnHand: 12500, unit: 'units', reorderLevel: 5000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: '2', itemCode: 'MET-C1923', itemName: 'Metformin 850mg', category: 'FINISHED_GOODS', batchNumber: 'C1923', mfgDate: '2024-02-10', expiryDate: '2025-04-20', daysToExpiry: 28, expiryStatus: 'critical', qtyOnHand: 3200, unit: 'units', reorderLevel: 2000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-02-10', updatedAt: '2024-02-10' },
  { id: '3', itemCode: 'AMX-D4521', itemName: 'Amoxicillin 500mg', category: 'FINISHED_GOODS', batchNumber: 'D4521', mfgDate: '2023-11-05', expiryDate: '2025-04-05', daysToExpiry: 13, expiryStatus: 'critical', qtyOnHand: 850, unit: 'units', reorderLevel: 1000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'QUARANTINE', createdAt: '2023-11-05', updatedAt: '2023-11-05' },
  { id: '4', itemCode: 'PARA-API-E321', itemName: 'Paracetamol API', category: 'RAW_MATERIAL', batchNumber: 'E321', mfgDate: '2024-03-01', expiryDate: '2026-02-28', daysToExpiry: 341, expiryStatus: 'ok', qtyOnHand: 2000, unit: 'kg', reorderLevel: 500, storageLocation: 'Raw Material Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '5', itemCode: 'PAN-F8821', itemName: 'Pantoprazole 40mg', category: 'FINISHED_GOODS', batchNumber: 'F8821', mfgDate: '2024-01-20', expiryDate: '2025-06-30', daysToExpiry: 99, expiryStatus: 'ok', qtyOnHand: 6800, unit: 'units', reorderLevel: 3000, storageLocation: 'Cold Room A', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-01-20', updatedAt: '2024-01-20' },
  { id: '6', itemCode: 'IBU-G4412', itemName: 'Ibuprofen 400mg', category: 'FINISHED_GOODS', batchNumber: 'G4412', mfgDate: '2024-02-28', expiryDate: '2026-02-27', daysToExpiry: 340, expiryStatus: 'ok', qtyOnHand: 9400, unit: 'units', reorderLevel: 4000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-02-28', updatedAt: '2024-02-28' },
  { id: '7', itemCode: 'ATV-H1156', itemName: 'Atorvastatin 10mg', category: 'FINISHED_GOODS', batchNumber: 'H1156', mfgDate: '2023-12-10', expiryDate: '2025-05-15', daysToExpiry: 53, expiryStatus: 'warning', qtyOnHand: 4100, unit: 'units', reorderLevel: 2500, storageLocation: 'Cold Room B', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2023-12-10', updatedAt: '2023-12-10' },
  { id: '8', itemCode: 'AZI-I9923', itemName: 'Azithromycin 500mg', category: 'FINISHED_GOODS', batchNumber: 'I9923', mfgDate: '2024-03-05', expiryDate: '2025-03-31', daysToExpiry: 8, expiryStatus: 'critical', qtyOnHand: 1200, unit: 'units', reorderLevel: 500, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'REJECTED', createdAt: '2024-03-05', updatedAt: '2024-03-05' },
  { id: '9', itemCode: 'MET-API-J221', itemName: 'Metformin API', category: 'API', batchNumber: 'J221', mfgDate: '2024-02-01', expiryDate: '2026-01-31', daysToExpiry: 312, expiryStatus: 'ok', qtyOnHand: 1800, unit: 'kg', reorderLevel: 400, storageLocation: 'Raw Material Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: '10', itemCode: 'FOIL-K8851', itemName: 'Blister Foil 120mm', category: 'PACKAGING', batchNumber: 'K8851', mfgDate: '2024-01-10', expiryDate: '2027-01-09', daysToExpiry: 656, expiryStatus: 'ok', qtyOnHand: 50000, unit: 'meters', reorderLevel: 10000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-01-10', updatedAt: '2024-01-10' },
  { id: '11', itemCode: 'CIPRO-L3347', itemName: 'Ciprofloxacin 500mg', category: 'FINISHED_GOODS', batchNumber: 'L3347', mfgDate: '2024-03-15', expiryDate: '2026-03-14', daysToExpiry: 356, expiryStatus: 'ok', qtyOnHand: 7200, unit: 'units', reorderLevel: 3000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-03-15', updatedAt: '2024-03-15' },
  { id: '12', itemCode: 'OMEP-M5512', itemName: 'Omeprazole 20mg', category: 'FINISHED_GOODS', batchNumber: 'M5512', mfgDate: '2024-01-25', expiryDate: '2025-05-10', daysToExpiry: 48, expiryStatus: 'warning', qtyOnHand: 3600, unit: 'units', reorderLevel: 2000, storageLocation: 'Cold Room A', siteCode: 'MH-SITE-01', qaStatus: 'PENDING_QA', createdAt: '2024-01-25', updatedAt: '2024-01-25' },
  { id: '13', itemCode: 'CEFI-N7734', itemName: 'Cefixime 200mg', category: 'FINISHED_GOODS', batchNumber: 'N7734', mfgDate: '2024-02-20', expiryDate: '2026-08-19', daysToExpiry: 514, expiryStatus: 'ok', qtyOnHand: 5500, unit: 'units', reorderLevel: 2500, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2024-02-20', updatedAt: '2024-02-20' },
  { id: '14', itemCode: 'GLIM-O2289', itemName: 'Glimepiride 2mg', category: 'FINISHED_GOODS', batchNumber: 'O2289', mfgDate: '2023-10-15', expiryDate: '2025-10-14', daysToExpiry: 205, expiryStatus: 'ok', qtyOnHand: 4800, unit: 'units', reorderLevel: 2000, storageLocation: 'Cold Room B', siteCode: 'MH-SITE-01', qaStatus: 'APPROVED', createdAt: '2023-10-15', updatedAt: '2023-10-15' },
  { id: '15', itemCode: 'AMLO-P6678', itemName: 'Amlodipine 5mg', category: 'FINISHED_GOODS', batchNumber: 'P6678', mfgDate: '2024-03-10', expiryDate: '2026-03-09', daysToExpiry: 351, expiryStatus: 'ok', qtyOnHand: 8200, unit: 'units', reorderLevel: 4000, storageLocation: 'Main Store', siteCode: 'MH-SITE-01', qaStatus: 'ON_HOLD', createdAt: '2024-03-10', updatedAt: '2024-03-10' },
];

export const MOCK_GRNS: GRN[] = [
  { id: '1', grnNumber: 'GRN-2024-0001', vendorId: 'v1', vendorName: 'Cipla Ltd.', itemName: 'Paracetamol 500mg', itemCode: 'PARA-B2847', batchNumber: 'B2847', qtyReceived: 12500, unit: 'units', mfgDate: '2024-01-15', expiryDate: '2026-01-14', vehicleLR: 'MH-12-AB-1234', storageLocation: 'Main Store', receivedByName: 'Rahul Mehta', status: 'APPROVED', coaLinked: true, createdAt: '2024-01-15' },
  { id: '2', grnNumber: 'GRN-2024-0002', vendorId: 'v2', vendorName: 'Sun Pharma', itemName: 'Metformin 850mg', itemCode: 'MET-C1923', batchNumber: 'C1923', qtyReceived: 3200, unit: 'units', mfgDate: '2024-02-10', expiryDate: '2025-04-20', vehicleLR: 'GJ-01-CD-5678', storageLocation: 'Main Store', receivedByName: 'Priya Sharma', status: 'APPROVED', coaLinked: true, createdAt: '2024-02-10' },
  { id: '3', grnNumber: 'GRN-2024-0003', vendorId: 'v3', vendorName: 'Lupin Ltd.', itemName: 'Amoxicillin 500mg', itemCode: 'AMX-D4521', batchNumber: 'D4521', qtyReceived: 850, unit: 'units', mfgDate: '2023-11-05', expiryDate: '2025-04-05', vehicleLR: 'KA-09-EF-9012', storageLocation: 'Main Store', receivedByName: 'Amit Kumar', status: 'QUARANTINE', coaLinked: false, createdAt: '2023-11-05' },
  { id: '4', grnNumber: 'GRN-2024-0004', vendorId: 'v4', vendorName: "Dr. Reddy's", itemName: 'Pantoprazole 40mg', itemCode: 'PAN-F8821', batchNumber: 'F8821', qtyReceived: 6800, unit: 'units', mfgDate: '2024-01-20', expiryDate: '2025-06-30', vehicleLR: 'TG-01-GH-3456', storageLocation: 'Cold Room A', receivedByName: 'Rahul Mehta', status: 'APPROVED', coaLinked: true, createdAt: '2024-01-20' },
  { id: '5', grnNumber: 'GRN-2024-0005', vendorId: 'v5', vendorName: 'Aurobindo', itemName: 'Ibuprofen 400mg', itemCode: 'IBU-G4412', batchNumber: 'G4412', qtyReceived: 9400, unit: 'units', mfgDate: '2024-02-28', expiryDate: '2026-02-27', vehicleLR: 'MH-04-IJ-7890', storageLocation: 'Main Store', receivedByName: 'Priya Sharma', status: 'PENDING_QA', coaLinked: true, createdAt: '2024-02-28' },
  { id: '6', grnNumber: 'GRN-2024-0006', vendorId: 'v6', vendorName: 'Zydus Cadila', itemName: 'Atorvastatin 10mg', itemCode: 'ATV-H1156', batchNumber: 'H1156', qtyReceived: 4100, unit: 'units', mfgDate: '2023-12-10', expiryDate: '2025-05-15', vehicleLR: 'RJ-14-KL-1234', storageLocation: 'Cold Room B', receivedByName: 'Amit Kumar', status: 'APPROVED', coaLinked: true, createdAt: '2023-12-10' },
];

export const MOCK_ASNS: ASN[] = [
  { id: 'a1', asnNumber: 'ASN-2024-0001', vendorName: 'Cipla Ltd.', poReference: 'PO-2024-0021', itemName: 'Paracetamol API', expectedQty: 2000, expectedDelivery: '2024-04-05', vehicleLR: 'MH-12-AB-5566', status: 'PENDING' },
  { id: 'a2', asnNumber: 'ASN-2024-0002', vendorName: 'Lupin Ltd.', poReference: 'PO-2024-0022', itemName: 'Amoxicillin 500mg', expectedQty: 5000, expectedDelivery: '2024-04-08', vehicleLR: 'KA-09-CD-7788', status: 'PENDING' },
  { id: 'a3', asnNumber: 'ASN-2024-0003', vendorName: 'Sun Pharma', poReference: 'PO-2024-0019', itemName: 'Metformin 850mg', expectedQty: 3000, expectedDelivery: '2024-04-02', vehicleLR: 'GJ-01-EF-9900', status: 'PARTIAL' },
];

export const MOCK_QA_INSPECTIONS: QAInspection[] = [
  { id: 'qi1', inspectionId: 'QA-2024-0001', grnLinked: 'GRN-2024-0001', itemName: 'Paracetamol 500mg', batchNumber: 'B2847', supplier: 'Cipla Ltd.', sampledBy: 'Priya Sharma', testParameters: 'Assay, Dissolution, Identification', result: 'PASSED', decision: 'APPROVE', tatHours: 24 },
  { id: 'qi2', inspectionId: 'QA-2024-0002', grnLinked: 'GRN-2024-0003', itemName: 'Amoxicillin 500mg', batchNumber: 'D4521', supplier: 'Lupin Ltd.', sampledBy: 'Rahul Mehta', testParameters: 'Assay, Sterility, pH', result: 'FAILED', decision: 'QUARANTINE', tatHours: 36 },
  { id: 'qi3', inspectionId: 'QA-2024-0003', grnLinked: 'GRN-2024-0004', itemName: 'Pantoprazole 40mg', batchNumber: 'F8821', supplier: "Dr. Reddy's", sampledBy: 'Amit Kumar', testParameters: 'Assay, Dissolution, Related Substances', result: 'PASSED', decision: 'APPROVE', tatHours: 20 },
];

export const MOCK_CAPAS: CAPA[] = [
  { id: 'c1', capaNumber: 'CAP-2024-001', source: 'QA_INSPECTION', description: 'Repeated dissolution failure in Amoxicillin batches from Lupin Ltd.', category: 'Product Quality', priority: 'CRITICAL', raisedBy: 'Rahul Mehta', assignedTo: 'Priya Sharma', dueDate: '2024-04-15', status: 'IN_PROGRESS' },
  { id: 'c2', capaNumber: 'CAP-2024-002', source: 'DEVIATION', description: 'Temperature excursion in Cold Room B affecting 3 batches', category: 'Cold Chain', priority: 'MAJOR', raisedBy: 'Amit Kumar', assignedTo: 'Rahul Mehta', dueDate: '2024-04-20', status: 'OPEN' },
  { id: 'c3', capaNumber: 'CAP-2024-003', source: 'AUDIT', description: 'Missing CoA documentation for 2 GRN entries', category: 'Documentation', priority: 'MINOR', raisedBy: 'Priya Sharma', assignedTo: 'Amit Kumar', dueDate: '2024-04-10', status: 'CLOSED', closureDate: '2024-04-08' },
  { id: 'c4', capaNumber: 'CAP-2024-004', source: 'CUSTOMER_COMPLAINT', description: 'Customer reported damaged packaging in DO-2024-0015', category: 'Packaging', priority: 'MAJOR', raisedBy: 'Rahul Mehta', assignedTo: 'Priya Sharma', dueDate: '2024-03-30', status: 'OVERDUE' },
];

export const MOCK_DEVIATIONS: Deviation[] = [
  { id: 'd1', deviationNo: 'DEV-2024-001', date: '2024-02-15', batchRef: 'D4521', deviationType: 'Process Deviation', description: 'Dissolution parameter exceeded upper limit during QA testing', reportedBy: 'Rahul Mehta', capaLinked: 'CAP-2024-001', status: 'Open' },
  { id: 'd2', deviationNo: 'DEV-2024-002', date: '2024-03-01', batchRef: 'H1156', deviationType: 'Environmental Deviation', description: 'Temperature excursion in Cold Room B — max 10.2°C recorded for 45 minutes', reportedBy: 'Amit Kumar', capaLinked: 'CAP-2024-002', status: 'Under Investigation' },
  { id: 'd3', deviationNo: 'DEV-2024-003', date: '2024-03-10', batchRef: 'N7734', deviationType: 'Documentation Deviation', description: 'CoA not attached within 24h of GRN creation', reportedBy: 'Priya Sharma', capaLinked: 'CAP-2024-003', status: 'Closed' },
];

export const MOCK_SENSORS: Sensor[] = [
  { id: 's1', sensorId: 'CR-A-01', name: 'Cold Room A — Sensor 1', location: 'Cold Room A', isOnline: true, currentTemp: 4.8, minSpecC: 2, maxSpecC: 8, minToday: 4.1, maxToday: 5.2, status: 'normal' },
  { id: 's2', sensorId: 'CR-A-02', name: 'Cold Room A — Sensor 2', location: 'Cold Room A', isOnline: true, currentTemp: 5.1, minSpecC: 2, maxSpecC: 8, minToday: 4.4, maxToday: 5.5, status: 'normal' },
  { id: 's3', sensorId: 'CR-A-03', name: 'Cold Room A — Sensor 3', location: 'Cold Room A', isOnline: true, currentTemp: 4.6, minSpecC: 2, maxSpecC: 8, minToday: 4.0, maxToday: 5.0, status: 'normal' },
  { id: 's4', sensorId: 'CR-B-01', name: 'Cold Room B — Sensor 1', location: 'Cold Room B', isOnline: true, currentTemp: 2.1, minSpecC: 2, maxSpecC: 8, minToday: 1.9, maxToday: 2.5, status: 'normal' },
  { id: 's5', sensorId: 'CR-B-02', name: 'Cold Room B — Sensor 2', location: 'Cold Room B', isOnline: true, currentTemp: 2.4, minSpecC: 2, maxSpecC: 8, minToday: 2.0, maxToday: 2.8, status: 'normal' },
  { id: 's6', sensorId: 'CR-B-03', name: 'Cold Room B — Sensor 3', location: 'Cold Room B', isOnline: false, currentTemp: undefined, minSpecC: 2, maxSpecC: 8, minToday: undefined, maxToday: undefined, status: 'offline' },
  { id: 's7', sensorId: 'VH-01', name: 'Vehicle — Sensor 1', location: 'Vehicle', isOnline: true, currentTemp: 7.2, minSpecC: 2, maxSpecC: 8, minToday: 5.1, maxToday: 8.4, status: 'deviation' },
  { id: 's8', sensorId: 'AMB-01', name: 'Ambient — Sensor 1', location: 'Ambient', isOnline: true, currentTemp: 26.1, minSpecC: 15, maxSpecC: 30, minToday: 24.2, maxToday: 28.3, status: 'normal' },
];

export const MOCK_EXCURSIONS: TempExcursion[] = [
  { id: 'e1', excursionId: 'EXC-2024-001', sensorId: 'CR-B-01', location: 'Cold Room B', startTime: '2024-03-01T14:30:00', endTime: '2024-03-01T15:15:00', durationMinutes: 45, maxDeviationC: 10.2, severity: 'MAJOR', batchesAffected: ['H1156', 'O2289'], rootCause: 'Door seal failure', impactAssessment: 'Batches quarantined pending re-evaluation', status: 'Closed' },
  { id: 'e2', excursionId: 'EXC-2024-002', sensorId: 'VH-01', location: 'Vehicle', startTime: '2024-03-15T09:00:00', endTime: '2024-03-15T09:20:00', durationMinutes: 20, maxDeviationC: 8.8, severity: 'MINOR', batchesAffected: ['B2847'], rootCause: 'Pre-cooling not performed', impactAssessment: 'Under investigation', status: 'Open' },
];

export const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [
  { id: 'do1', doNumber: 'DO-2024-0001', orderDate: '2024-03-20', customerName: 'Apollo Pharmacy', items: 'Paracetamol 500mg', qty: 2000, carrier: 'Blue Dart', trackingNo: 'BD123456', pickStatus: 'PICKED', doStatus: 'PACKED' },
  { id: 'do2', doNumber: 'DO-2024-0002', orderDate: '2024-03-21', customerName: 'MedPlus', items: 'Metformin 850mg, Atorvastatin 10mg', qty: 1500, carrier: 'DTDC', trackingNo: 'DT789012', pickStatus: 'PICKING', doStatus: 'PICKING_IN_PROGRESS' },
  { id: 'do3', doNumber: 'DO-2024-0003', orderDate: '2024-03-22', customerName: 'Fortis Healthcare', items: 'Ibuprofen 400mg', qty: 3000, carrier: 'Delhivery', trackingNo: '', pickStatus: 'PENDING', doStatus: 'PENDING' },
  { id: 'do4', doNumber: 'DO-2024-0004', orderDate: '2024-03-18', customerName: 'Max Hospital', items: 'Ciprofloxacin 500mg, Azithromycin 500mg', qty: 800, carrier: 'Blue Dart', trackingNo: 'BD234567', pickStatus: 'PACKED', doStatus: 'DISPATCHED' },
];

export const MOCK_PICK_ITEMS: PickItem[] = [
  { id: 'pi1', pickListId: 'PL-2024-001', doReference: 'DO-2024-0002', itemName: 'Metformin 850mg', batchFEFO: 'C1923 (Exp: Apr 2025)', qtyToPick: 1000, fromLocation: 'Main Store — Rack B4', assignedTo: 'Kiran Patil', status: 'In Progress' },
  { id: 'pi2', pickListId: 'PL-2024-001', doReference: 'DO-2024-0002', itemName: 'Atorvastatin 10mg', batchFEFO: 'H1156 (Exp: May 2025)', qtyToPick: 500, fromLocation: 'Cold Room B — Rack A2', assignedTo: 'Kiran Patil', status: 'Pending' },
  { id: 'pi3', pickListId: 'PL-2024-002', doReference: 'DO-2024-0003', itemName: 'Ibuprofen 400mg', batchFEFO: 'G4412 (Exp: Feb 2026)', qtyToPick: 3000, fromLocation: 'Main Store — Rack C1', assignedTo: '', status: 'Pending' },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', vendorCode: 'VEN-001', companyName: 'Cipla Ltd.', category: 'API_AND_FDF', drugLicenseNo: 'MH-DL-001234', gmpCertification: 'WHO-GMP', qaRating: 'A+', qaPassRatePct: 98.5, lastAuditDate: '2024-01-10', status: 'APPROVED', posFY: 22 },
  { id: 'v2', vendorCode: 'VEN-002', companyName: 'Sun Pharma', category: 'API_AND_FDF', drugLicenseNo: 'GJ-DL-005678', gmpCertification: 'US-FDA', qaRating: 'A', qaPassRatePct: 96.2, lastAuditDate: '2023-11-15', status: 'APPROVED', posFY: 18 },
  { id: 'v3', vendorCode: 'VEN-003', companyName: 'Lupin Ltd.', category: 'API_AND_FDF', drugLicenseNo: 'MH-DL-002345', gmpCertification: 'WHO-GMP', qaRating: 'B', qaPassRatePct: 88.7, lastAuditDate: '2023-09-20', status: 'REVIEW_DUE', posFY: 14 },
  { id: 'v4', vendorCode: 'VEN-004', companyName: "Dr. Reddy's", category: 'API', drugLicenseNo: 'TG-DL-009012', gmpCertification: 'ISO 9001', qaRating: 'A', qaPassRatePct: 97.1, lastAuditDate: '2024-02-05', status: 'APPROVED', posFY: 16 },
  { id: 'v5', vendorCode: 'VEN-005', companyName: 'Aurobindo Pharma', category: 'API_AND_FDF', drugLicenseNo: 'TG-DL-003456', gmpCertification: 'US-FDA', qaRating: 'A+', qaPassRatePct: 99.1, lastAuditDate: '2024-01-25', status: 'APPROVED', posFY: 20 },
  { id: 'v6', vendorCode: 'VEN-006', companyName: 'Zydus Cadila', category: 'API_AND_FDF', drugLicenseNo: 'GJ-DL-007890', gmpCertification: 'WHO-GMP', qaRating: 'A', qaPassRatePct: 95.4, lastAuditDate: '2023-12-10', status: 'APPROVED', posFY: 10 },
  { id: 'v7', vendorCode: 'VEN-007', companyName: 'Intas Pharma', category: 'EXCIPIENTS', drugLicenseNo: 'GJ-DL-011234', gmpCertification: 'ISO 9001', qaRating: 'B', qaPassRatePct: 91.2, lastAuditDate: '2023-08-15', status: 'REVIEW_DUE', posFY: 8 },
  { id: 'v8', vendorCode: 'VEN-008', companyName: 'Packaging Solutions Ltd.', category: 'PACKAGING', drugLicenseNo: 'MH-DL-015678', gmpCertification: 'ISO 9001', qaRating: 'A', qaPassRatePct: 96.8, lastAuditDate: '2024-03-01', status: 'APPROVED', posFY: 12 },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', docId: 'DOC-001', title: 'SOP for GRN Process', docType: 'SOP', version: '3.1', linkedTo: 'GRN Module', owner: 'Rahul Mehta', reviewDate: '2024-06-30', status: 'ACTIVE', uploadedBy: 'Rahul Mehta', createdAt: '2023-07-01' },
  { id: 'doc2', docId: 'DOC-002', title: 'CoA — Paracetamol 500mg B2847', docType: 'COA', version: '1.0', linkedTo: 'GRN-2024-0001', owner: 'Priya Sharma', reviewDate: '2026-01-14', status: 'ACTIVE', uploadedBy: 'Priya Sharma', createdAt: '2024-01-15' },
  { id: 'doc3', docId: 'DOC-003', title: 'Cold Chain Validation Protocol', docType: 'VALIDATION', version: '2.0', linkedTo: 'Cold Chain Module', owner: 'Amit Kumar', reviewDate: '2024-04-15', status: 'UNDER_REVIEW', uploadedBy: 'Amit Kumar', createdAt: '2022-04-15' },
  { id: 'doc4', docId: 'DOC-004', title: 'Regulatory Submission — WHO-GMP', docType: 'REGULATORY', version: '1.2', linkedTo: '', owner: 'Rahul Mehta', reviewDate: '2025-01-01', status: 'ACTIVE', uploadedBy: 'Rahul Mehta', createdAt: '2023-01-15' },
  { id: 'doc5', docId: 'DOC-005', title: 'CAPA Report — CAP-2024-001', docType: 'CAPA', version: '1.0', linkedTo: 'CAP-2024-001', owner: 'Priya Sharma', reviewDate: '2024-04-30', status: 'ACTIVE', uploadedBy: 'Priya Sharma', createdAt: '2024-02-20' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', action: 'GRN Created', detail: 'GRN-2024-0006 created for Zydus Cadila — Atorvastatin 10mg (Batch H1156)', module: 'GRN', userName: 'Amit Kumar', entityId: 'GRN-2024-0006', createdAt: '2024-03-22T09:15:00' },
  { id: 'al2', action: 'QA Decision: Approved', detail: 'Batch B2847 (Paracetamol 500mg) approved by QA Manager', module: 'QA', userName: 'Rahul Mehta', entityId: 'QA-2024-0001', createdAt: '2024-03-22T10:30:00' },
  { id: 'al3', action: 'Dispatch Order Created', detail: 'DO-2024-0003 created for Fortis Healthcare — 3000 units Ibuprofen 400mg', module: 'DISPATCH', userName: 'Priya Sharma', entityId: 'DO-2024-0003', createdAt: '2024-03-22T11:00:00' },
  { id: 'al4', action: 'Stock Adjustment', detail: 'Negative adjustment of 50 units — Azithromycin 500mg (Batch I9923) due to damaged stock', module: 'INVENTORY', userName: 'Rahul Mehta', entityId: 'PARA-I9923', createdAt: '2024-03-22T13:45:00' },
  { id: 'al5', action: 'Temperature Excursion Logged', detail: 'EXC-2024-002 — Vehicle VH-01 reached 8.8°C for 20 minutes', module: 'COLD_CHAIN', userName: 'System', entityId: 'EXC-2024-002', createdAt: '2024-03-15T09:20:00' },
  { id: 'al6', action: 'CAPA Closed', detail: 'CAP-2024-003 closed — Missing CoA documentation corrected for 2 GRN entries', module: 'QA', userName: 'Priya Sharma', entityId: 'CAP-2024-003', createdAt: '2024-04-08T16:00:00' },
  { id: 'al7', action: 'User Login', detail: 'Successful login from IP 192.168.1.105', module: 'AUTH', userName: 'Rahul Mehta', createdAt: '2024-03-22T08:55:00' },
  { id: 'al8', action: 'Document Uploaded', detail: 'CAPA Report CAP-2024-001 uploaded by Priya Sharma (PDF, 1.2 MB)', module: 'DOCUMENTS', userName: 'Priya Sharma', entityId: 'DOC-005', createdAt: '2024-02-20T14:30:00' },
];

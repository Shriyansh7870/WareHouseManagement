export interface Sensor {
  id: string;
  sensorId: string;
  name: string;
  location: string;
  isOnline: boolean;
  currentTemp?: number;
  minSpecC: number;
  maxSpecC: number;
  minToday?: number;
  maxToday?: number;
  status: 'normal' | 'deviation' | 'offline';
}

export interface TempExcursion {
  id: string;
  excursionId: string;
  sensorId: string;
  location: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  maxDeviationC: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  batchesAffected: string[];
  rootCause?: string;
  impactAssessment?: string;
  status: string;
}

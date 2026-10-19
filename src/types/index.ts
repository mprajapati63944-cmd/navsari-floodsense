export type PageTab = 'login' | 'dashboard' | 'rainfall' | 'map' | 'calculator' | 'about';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface LocationData {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  rainfall24h: number;
  elevation: number; // in meters
  distanceToRiver: number; // in km
  drainageStatus: 'Good' | 'Moderate' | 'Poor';
  statusDescription: string;
  historicalVulnerability: string;
  keyMitigation: string;
}

export interface RainfallRecord {
  id: string;
  date: string;
  location: string;
  rainfall: number; // in mm
  status: 'Normal' | 'Moderate' | 'High' | 'Severe';
  drainageStatus: 'Functional' | 'Slow Draining' | 'Choked' | 'Optimal';
  waterloggingAlert: boolean;
}

export interface RiskCalculationResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  estimatedWaterLevel: string; // e.g. "1.1m"
  rainfallIntensity: number; // mm/hour
  reason: string;
  waterloggingTime: string;
  trafficImpact: 'Minimal' | 'Moderate Delays' | 'Severe Road Closures';
  recommendations: string[];
}

export interface FloodAlert {
  id: string;
  timestamp: string; // ISO or formatted string
  locationName: string;
  locationId: string;
  rainfallMm: number;
  thresholdMm: number;
  severity: 'Warning' | 'Critical';
  status: string;
  read: boolean;
}


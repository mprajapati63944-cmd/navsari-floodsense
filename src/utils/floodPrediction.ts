import { LocationData, RiskCalculationResult, RiskLevel } from '../types';
import { NAVSARI_LOCATIONS } from '../data/mockFloodData';

interface PredictParams {
  rainfallMm: number;
  durationHours: number;
  locationId: string;
  soilSaturation?: 'Dry' | 'Moderate' | 'Saturated';
  drainageCondition?: 'Good' | 'Moderate' | 'Poor';
}

export function calculateFloodRisk({
  rainfallMm,
  durationHours,
  locationId,
  soilSaturation = 'Moderate',
  drainageCondition = 'Moderate',
}: PredictParams): RiskCalculationResult {
  const location = NAVSARI_LOCATIONS.find((loc) => loc.id === locationId) || NAVSARI_LOCATIONS[0];
  
  // Intensity in mm per hour
  const safeDuration = Math.max(0.5, durationHours);
  const intensity = rainfallMm / safeDuration;

  // Base score from rainfall amount and intensity
  let score = 0;

  // Rainfall volume component (0 - 45 points)
  if (rainfallMm < 20) score += (rainfallMm / 20) * 15;
  else if (rainfallMm < 50) score += 15 + ((rainfallMm - 20) / 30) * 15;
  else if (rainfallMm < 100) score += 30 + ((rainfallMm - 50) / 50) * 12;
  else score += 42 + Math.min(8, ((rainfallMm - 100) / 100) * 8);

  // Intensity component (0 - 25 points)
  if (intensity > 25) score += 25;
  else if (intensity > 15) score += 18;
  else if (intensity > 8) score += 10;
  else score += 4;

  // Elevation penalty/bonus (Navsari elevation ranges ~6m to 15m) (0 - 15 points)
  if (location.elevation < 7.5) score += 15;
  else if (location.elevation < 9.5) score += 10;
  else if (location.elevation < 12) score += 5;
  else score += 0;

  // Distance to Purna River (0 - 10 points)
  if (location.distanceToRiver < 0.5) score += 10;
  else if (location.distanceToRiver < 1.0) score += 6;
  else if (location.distanceToRiver < 2.0) score += 3;
  else score += 0;

  // Soil saturation factor
  if (soilSaturation === 'Saturated') score += 10;
  else if (soilSaturation === 'Moderate') score += 4;
  else score -= 3;

  // Drainage condition factor
  if (drainageCondition === 'Poor') score += 8;
  else if (drainageCondition === 'Moderate') score += 2;
  else if (drainageCondition === 'Good') score -= 6;

  score = Math.max(5, Math.min(98, Math.round(score)));

  let riskLevel: RiskLevel = 'Low';
  let estimatedWaterLevel = '0.05m';
  let waterloggingTime = '< 30 mins after rain stops';
  let trafficImpact: 'Minimal' | 'Moderate Delays' | 'Severe Road Closures' = 'Minimal';

  if (score >= 70) {
    riskLevel = 'High';
    const depth = 0.8 + ((score - 70) / 30) * 0.9;
    estimatedWaterLevel = `${depth.toFixed(1)}m`;
    waterloggingTime = '6 to 12 hours';
    trafficImpact = 'Severe Road Closures';
  } else if (score >= 42) {
    riskLevel = 'Medium';
    const depth = 0.25 + ((score - 42) / 28) * 0.45;
    estimatedWaterLevel = `${depth.toFixed(1)}m`;
    waterloggingTime = '2 to 4 hours';
    trafficImpact = 'Moderate Delays';
  } else {
    riskLevel = 'Low';
    estimatedWaterLevel = '0.05m';
    waterloggingTime = '< 45 minutes';
    trafficImpact = 'Minimal';
  }

  // Generate explanatory reason text matching the user's reference UI
  let reason = '';
  if (riskLevel === 'High') {
    reason = `Reason: ${rainfallMm} mm rainfall in ${durationHours} hours (${intensity.toFixed(1)} mm/hr) exceeds the heavy rainfall threshold for Navsari. ${location.name}'s low elevation (${location.elevation}m) and proximity to Purna River (${location.distanceToRiver}km) create high backflow and ponding risk.`;
  } else if (riskLevel === 'Medium') {
    reason = `Reason: Moderate rainfall of ${rainfallMm} mm over ${durationHours} hours can cause street runoff overflow in ${location.name}. Potential waterlogging in underpasses and low-lying market crossings.`;
  } else {
    reason = `Reason: Rainfall volume of ${rainfallMm} mm is within standard drainage capacity for ${location.name} (elevation ${location.elevation}m). Surface runoff expected to clear with minimal road accumulation.`;
  }

  // Recommended actions
  const recommendations: string[] = [];
  if (riskLevel === 'High') {
    recommendations.push(`Alert Navsari Municipal Corporation (NMC) emergency flood control room.`);
    recommendations.push(`Station emergency dewatering pumps at low points in ${location.name}.`);
    recommendations.push(`Issue public caution: avoid low underpasses and riverfront paths.`);
    recommendations.push(`Keep civil defense and boat rescue teams on 15-minute standby.`);
  } else if (riskLevel === 'Medium') {
    recommendations.push(`Ensure road gully pits and culvert grates in ${location.name} are unclogged.`);
    recommendations.push(`Monitor Purna River gauge reading at nearby monitoring station.`);
    recommendations.push(`Reroute heavy traffic away from vulnerable intersections.`);
  } else {
    recommendations.push(`Maintain regular automated water level sensor polling.`);
    recommendations.push(`Standard traffic flow without municipal restrictions.`);
  }

  return {
    riskLevel,
    riskScore: score,
    estimatedWaterLevel,
    rainfallIntensity: Number(intensity.toFixed(1)),
    reason,
    waterloggingTime,
    trafficImpact,
    recommendations,
  };
}

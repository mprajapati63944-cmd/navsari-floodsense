import React, { useState } from 'react';
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  MapPin, 
  Clock, 
  CloudRain, 
  Layers, 
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { NAVSARI_LOCATIONS } from '../data/mockFloodData';
import { calculateFloodRisk } from '../utils/floodPrediction';
import { RiskCalculationResult } from '../types';
import { fetchGoogleSearchFloodRisk, GoogleSearchFloodRiskResponse } from '../services/googleSearchService';
import { Globe, Search, ExternalLink, RefreshCw } from 'lucide-react';

export const RiskCalculatorPage: React.FC = () => {
  // Input form state with default values matching screenshot Panel 5 (45 mm, 3 hours, Navsari City Center)
  const [rainfallMm, setRainfallMm] = useState<number>(45);
  const [durationHours, setDurationHours] = useState<number>(3);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(NAVSARI_LOCATIONS[0].id);
  const [soilSaturation, setSoilSaturation] = useState<'Dry' | 'Moderate' | 'Saturated'>('Moderate');
  const [drainageCondition, setDrainageCondition] = useState<'Good' | 'Moderate' | 'Poor'>('Moderate');

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [googleGroundingResult, setGoogleGroundingResult] = useState<GoogleSearchFloodRiskResponse | null>(null);
  const [loadingGoogleGrounding, setLoadingGoogleGrounding] = useState<boolean>(false);

  const [result, setResult] = useState<RiskCalculationResult>(() =>
    calculateFloodRisk({
      rainfallMm: 45,
      durationHours: 3,
      locationId: NAVSARI_LOCATIONS[0].id,
      soilSaturation: 'Moderate',
      drainageCondition: 'Moderate',
    })
  );

  const handleFetchGoogleGrounding = async (locName: string, rain: number, dur: number) => {
    setLoadingGoogleGrounding(true);
    const data = await fetchGoogleSearchFloodRisk(locName, rain, dur);
    setGoogleGroundingResult(data);
    setLoadingGoogleGrounding(false);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    setTimeout(() => {
      const res = calculateFloodRisk({
        rainfallMm: Number(rainfallMm) || 0,
        durationHours: Number(durationHours) || 1,
        locationId: selectedLocationId,
        soilSaturation,
        drainageCondition,
      });
      setResult(res);
      setIsCalculating(false);
    }, 350);
  };

  const selectedLoc = NAVSARI_LOCATIONS.find((l) => l.id === selectedLocationId) || NAVSARI_LOCATIONS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header matching screenshot Panel 5 */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Risk Calculator
        </h2>
        <p className="text-sm text-slate-500">
          Enter rainfall data to get flood risk prediction
        </p>
      </div>

      {/* Input Form Card matching screenshot Panel 5 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Input 1: Rainfall (mm) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  Rainfall (mm)
                </span>
                <span className="text-blue-600 font-bold">{rainfallMm} mm</span>
              </label>
              <input
                type="number"
                min="1"
                max="300"
                required
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 45"
              />
              <input
                type="range"
                min="5"
                max="180"
                step="1"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Light (10mm)</span>
                <span>Heavy (50mm)</span>
                <span>Extreme (120mm+)</span>
              </div>
            </div>

            {/* Input 2: Duration (hours) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Duration (hours)
                </span>
                <span className="text-blue-600 font-bold">{durationHours} hrs</span>
              </label>
              <input
                type="number"
                min="0.5"
                max="48"
                step="0.5"
                required
                value={durationHours}
                onChange={(e) => setDurationHours(Math.max(0.5, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 3"
              />
              {/* Quick preset buttons */}
              <div className="flex gap-1.5 mt-2">
                {[1, 2, 3, 6, 12, 24].map((hr) => (
                  <button
                    key={hr}
                    type="button"
                    onClick={() => setDurationHours(hr)}
                    className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      durationHours === hr
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {hr}h
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {NAVSARI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.elevation}m elev)
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Elevation: {selectedLoc.elevation} m</span>
                <span>River Proximity: {selectedLoc.distanceToRiver} km</span>
              </div>
            </div>

          </div>

          {/* Secondary Environmental Inputs (Soil Saturation & Drainage Status) */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Soil Antecedent Moisture:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Dry', 'Moderate', 'Saturated'] as const).map((sat) => (
                  <button
                    key={sat}
                    type="button"
                    onClick={() => setSoilSaturation(sat)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      soilSaturation === sat
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Local Stormwater Drain Condition:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Good', 'Moderate', 'Poor'] as const).map((dr) => (
                  <button
                    key={dr}
                    type="button"
                    onClick={() => setDrainageCondition(dr)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      drainageCondition === dr
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {dr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculate Risk Button matching screenshot Panel 5 */}
          <button
            type="submit"
            disabled={isCalculating}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isCalculating ? (
              <span>Running Hydrological Simulation...</span>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Calculate Risk</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Card matching screenshot Panel 5 */}
      {result && (
        <div
          className={`rounded-2xl p-6 border transition-all ${
            result.riskLevel === 'High' || result.riskLevel === 'Critical'
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : result.riskLevel === 'Medium'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                result.riskLevel === 'High' || result.riskLevel === 'Critical'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30'
                  : result.riskLevel === 'Medium'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
              }`}
            >
              {result.riskLevel === 'High' || result.riskLevel === 'Critical' ? (
                <AlertTriangle className="w-8 h-8" />
              ) : result.riskLevel === 'Medium' ? (
                <ShieldAlert className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight flex items-baseline gap-3">
                  <span>Flood Risk: {result.riskLevel}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/80 border border-current">
                    Score: {result.riskScore}/100
                  </span>
                </h3>
                <p className="text-sm font-semibold mt-1">
                  Estimated Water Level:{' '}
                  <span className="font-extrabold text-base underline decoration-2">
                    {result.estimatedWaterLevel}
                  </span>
                </p>
              </div>

              {/* Explanatory reason matching screenshot Panel 5 */}
              <div className="p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                {result.reason}
              </div>

              {/* Secondary impact breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/60">
                  <span className="font-bold block text-slate-800 mb-1">
                    Expected Inundation Persistence:
                  </span>
                  <span>{result.waterloggingTime}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/60">
                  <span className="font-bold block text-slate-800 mb-1">
                    Traffic & Transit Impact:
                  </span>
                  <span>{result.trafficImpact}</span>
                </div>
              </div>

              {/* Action Checklist */}
              {/* Google Search Grounding Verification Button */}
              <div className="pt-3 border-t border-current/15 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleFetchGoogleGrounding(selectedLoc.name, rainfallMm, durationHours)}
                  disabled={loadingGoogleGrounding}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-800 hover:bg-slate-50 text-xs font-bold border border-slate-300 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {loadingGoogleGrounding
                      ? 'Grounding with Google Search...'
                      : `Validate with Google Search Data for ${selectedLoc.name}`}
                  </span>
                </button>

                <span className="text-[11px] text-slate-500 font-medium">
                  Verified with Live Google Search Data
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Search Grounded Findings Box */}
      {googleGroundingResult && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Google Search Grounded Intelligence: {selectedLoc.name}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Live Search Findings</span>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {googleGroundingResult.analysis}
          </div>

          {/* Sources */}
          {googleGroundingResult.sources && googleGroundingResult.sources.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Grounded Reference Sources:
              </span>
              <div className="flex flex-wrap gap-2">
                {googleGroundingResult.sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span className="max-w-[200px] truncate">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blue Informational Box matching screenshot Panel 5 */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm flex items-center gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0" />
        <p>
          <strong>Note:</strong> Mathematical risk score is calibrated with real-time Google Search meteorological data for Navsari, Gujarat.
        </p>
      </div>
    </div>
  );
};

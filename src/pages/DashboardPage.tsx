import React, { useState } from 'react';
import { 
  CloudRain, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  Waves,
  CheckCircle2, 
  Play, 
  Pause, 
  Zap, 
  Sliders, 
  BellRing,
  Radio
} from 'lucide-react';
import { 
  METRIC_SUMMARY, 
  DAILY_RAINFALL_LAST_7_DAYS, 
  RISK_DISTRIBUTION 
} from '../data/mockFloodData';
import { PageTab } from '../types';
import { useAlerts } from '../context/AlertContext';
import { GoogleSearchGroundingCard } from '../components/GoogleSearchGroundingCard';

interface DashboardPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { 
    alertThreshold, 
    setAlertThreshold, 
    isLiveSimulationActive, 
    setIsLiveSimulationActive, 
    triggerSimulatedAlert,
    lastSimulatedStation,
    alerts 
  } = useAlerts();

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activeDonutSlice, setActiveDonutSlice] = useState<string | null>(null);

  // SVG Bar Chart Calculations
  const chartHeight = 180;
  const chartWidth = 420;
  const maxRainfall = 70;
  const barWidth = 28;

  // Donut chart math
  const donutCenter = 100;
  const outerRadius = 72;
  const innerRadius = 48;

  let cumulativeAngle = 0;
  const donutArcs = RISK_DISTRIBUTION.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1Outer = donutCenter + outerRadius * Math.cos(startRad);
    const y1Outer = donutCenter + outerRadius * Math.sin(startRad);
    const x2Outer = donutCenter + outerRadius * Math.cos(endRad);
    const y2Outer = donutCenter + outerRadius * Math.sin(endRad);

    const x1Inner = donutCenter + innerRadius * Math.cos(endRad);
    const y1Inner = donutCenter + innerRadius * Math.sin(endRad);
    const x2Inner = donutCenter + innerRadius * Math.cos(startRad);
    const y2Inner = donutCenter + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1Outer} ${y1Outer}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}
      L ${x1Inner} ${y1Inner}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}
      Z
    `;

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Overview of rainfall data and flood risk in Navsari
          </p>
        </div>

        {/* Live Weather / River Alert Ticker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <Waves className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Purna River Gauge: <strong className="font-semibold">{METRIC_SUMMARY.purnaRiverLevel}</strong> (Warning: {METRIC_SUMMARY.purnaDangerLevel})
          </span>
        </div>
      </div>

      {/* REAL-TIME FLOOD ALERT TELEMETRY & NOTIFICATION CONTROLLER */}
      <div className="bg-gradient-to-r from-[#0d1d33] via-[#122744] to-[#15345b] text-white rounded-2xl p-4 sm:p-5 border border-sky-900/50 shadow-lg shadow-sky-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Status & Station Readout */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveSimulationActive ? 'bg-sky-400' : 'bg-slate-400'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isLiveSimulationActive ? 'bg-sky-500' : 'bg-slate-500'}`} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Real-Time Telemetry System
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                Threshold: {alertThreshold} mm
              </span>
            </div>

            <div className="text-sm text-slate-200 flex flex-wrap items-center gap-x-2">
              <span>Latest Simulated Telemetry:</span>
              {lastSimulatedStation ? (
                <span className="font-bold text-white bg-white/15 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  {lastSimulatedStation.name}: <strong className="text-sky-300">{lastSimulatedStation.rainfall} mm</strong>
                  <span className="text-[10px] text-slate-300 font-normal">({lastSimulatedStation.timestamp})</span>
                </span>
              ) : (
                <span className="text-slate-400 italic">Listening for station broadcast...</span>
              )}
            </div>
          </div>

          {/* Action Controls for Demo / Testing */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsLiveSimulationActive((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLiveSimulationActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
              title={isLiveSimulationActive ? 'Pause real-time updates' : 'Resume real-time updates'}
            >
              {isLiveSimulationActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Stream</span>
                </>
              )}
            </button>

            {/* Threshold Adjuster Button */}
            <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 px-2 py-1 text-xs">
              <span className="text-slate-400 text-[11px] mr-1.5">Alert at:</span>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value={40} className="bg-slate-800 text-white">40 mm (Moderate)</option>
                <option value={50} className="bg-slate-800 text-white">50 mm (Heavy)</option>
                <option value={60} className="bg-slate-800 text-white">60 mm (Severe)</option>
              </select>
            </div>

            {/* Test Trigger Button for Video / Live Demo */}
            <button
              onClick={() => triggerSimulatedAlert()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-800 active:to-rose-800 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Instantly generate an alert toast message"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Spike Toast</span>
            </button>
          </div>

        </div>
      </div>

      {/* LIVE GOOGLE SEARCH GROUNDED INTELLIGENCE CARD */}
      <GoogleSearchGroundingCard />

      {/* 4 Colored Metric Cards matching screenshot Panel 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Rainfall */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg shadow-blue-500/15 relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">
              Total Rainfall (Last 7 Days)
            </span>
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {METRIC_SUMMARY.totalRainfall7Days}
            </span>
            <span className="text-sm font-semibold text-blue-100">mm</span>
          </div>
          <p className="text-[11px] text-blue-100/90 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Monitored across 10 urban stations
          </p>
        </div>

        {/* Card 2: Avg Daily Rainfall */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/15 relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
              Avg. Daily Rainfall
            </span>
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {METRIC_SUMMARY.avgDailyRainfall}
            </span>
            <span className="text-sm font-semibold text-emerald-100">mm</span>
          </div>
          <p className="text-[11px] text-emerald-100/90 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Standard seasonal threshold
          </p>
        </div>

        {/* Card 3: Highest Rainfall */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg shadow-amber-500/15 relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-amber-100 uppercase tracking-wider">
              Highest Rainfall
            </span>
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {METRIC_SUMMARY.highestRainfall}
            </span>
            <span className="text-sm font-semibold text-amber-100">mm</span>
          </div>
          <p className="text-[11px] text-amber-100/90 mt-2">
            Recorded at Purna Riverbank (Apr 21)
          </p>
        </div>

        {/* Card 4: Current Flood Risk Level */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-5 shadow-lg shadow-rose-500/15 relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-rose-100 uppercase tracking-wider">
              Current Flood Risk Level
            </span>
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {METRIC_SUMMARY.currentRiskLevel}
            </span>
          </div>
          <p className="text-[11px] text-rose-100/90 mt-2">
            2 low-lying wards on high watch
          </p>
        </div>
      </div>

      {/* 2 Primary Visualization Cards matching screenshot Panel 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Daily Rainfall (Last 7 Days) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">
                Daily Rainfall (Last 7 Days)
              </h3>
              <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                April 18 - April 24
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Rainfall intensity (mm) recorded across urban sensors in Navsari
            </p>
          </div>

          {/* SVG Bar Chart with Interactive Bars */}
          <div className="relative w-full pt-2">
            <div className="text-[11px] text-slate-400 font-medium mb-1">
              Rainfall (mm)
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
                className="w-full h-56 select-none"
              >
                {/* Y-axis gridlines */}
                {[0, 20, 40, 60].map((val) => {
                  const y = chartHeight - (val / maxRainfall) * chartHeight;
                  return (
                    <g key={val}>
                      <line
                        x1="35"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x="28"
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* 50mm Alert threshold guide */}
                <line
                  x1="35"
                  y1={chartHeight - (alertThreshold / maxRainfall) * chartHeight}
                  x2={chartWidth}
                  y2={chartHeight - (alertThreshold / maxRainfall) * chartHeight}
                  stroke="#fb7185"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - 5}
                  y={chartHeight - (alertThreshold / maxRainfall) * chartHeight - 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#e11d48"
                  fontWeight="600"
                >
                  Alert Threshold ({alertThreshold} mm)
                </text>

                {/* Bars */}
                {DAILY_RAINFALL_LAST_7_DAYS.map((item, index) => {
                  const x = 50 + index * 50;
                  const barH = (item.rainfall / maxRainfall) * chartHeight;
                  const y = chartHeight - barH;
                  const isHovered = hoveredBar === index;
                  const isPeak = item.rainfall >= alertThreshold;

                  return (
                    <g
                      key={item.date}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="cursor-pointer transition-all duration-150"
                    >
                      {/* Bar Background Hover Area */}
                      <rect
                        x={x - 6}
                        y={0}
                        width={barWidth + 12}
                        height={chartHeight}
                        fill={isHovered ? 'rgba(14, 165, 233, 0.08)' : 'transparent'}
                        rx="4"
                      />

                      {/* Actual Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        rx="4"
                        fill={isPeak ? '#0284c7' : isHovered ? '#0ea5e9' : '#38bdf8'}
                        className="transition-all duration-200"
                      />

                      {/* Value label on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill={isPeak ? '#0369a1' : '#475569'}
                      >
                        {item.rainfall}
                      </text>

                      {/* Date label under X-axis */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight + 18}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isHovered ? '700' : '500'}
                        fill={isHovered ? '#1e293b' : '#64748b'}
                      >
                        {item.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak event: 60.2 mm on Apr 21 (River catchment surge)</span>
            <button
              onClick={() => onNavigate('rainfall')}
              className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              Detailed Analysis <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Chart: Risk Distribution (Locations) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">
                Risk Distribution (Locations)
              </h3>
              <span className="text-xs text-slate-400">10 Zones</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Distribution of flood vulnerability across municipal wards
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* Donut graphic */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xs">
                {donutArcs.map((arc) => {
                  const isHovered = activeDonutSlice === arc.name;
                  return (
                    <path
                      key={arc.name}
                      d={arc.pathData}
                      fill={arc.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      onMouseEnter={() => setActiveDonutSlice(arc.name)}
                      onMouseLeave={() => setActiveDonutSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Donut Center Text matching screenshot "Total 10 Areas" */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs text-slate-400 font-medium leading-none">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-800 leading-tight">
                  10 Areas
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-3 w-full sm:w-auto">
              {RISK_DISTRIBUTION.map((item) => {
                const isHovered = activeDonutSlice === item.name;
                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setActiveDonutSlice(item.name)}
                    onMouseLeave={() => setActiveDonutSlice(null)}
                    className={`flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl transition-colors cursor-pointer ${
                      isHovered ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {item.name.replace(' Risk', '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.percentage}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({item.value} areas)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>High Risk: Purna Riverbank & Kaliawadi</span>
            <button
              onClick={() => onNavigate('map')}
              className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              View on Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-gradient-to-r from-slate-900 to-[#10243d] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium mb-1">
            <BellRing className="w-3 h-3" />
            Automated Alert System Ready
          </div>
          <h4 className="text-lg font-bold text-white">
            Need to evaluate flood probability for sudden rainfall?
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Simulate custom rainfall intensities and duration scenarios to forecast urban waterlogging depths in vulnerable Navsari neighborhoods.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('calculator')}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Launch Risk Calculator
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Navsari Map
          </button>
        </div>
      </div>
    </div>
  );
};

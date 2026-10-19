import React from 'react';
import { 
  Target, 
  CheckCircle2, 
  Database, 
  AlertOctagon, 
  Home, 
  Waves, 
  Layers, 
  Calculator, 
  MapPin, 
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { FloodSenseLogo } from '../components/FloodSenseLogo';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          About Floodsense
        </h2>
        <p className="text-sm text-slate-500">
          Understand Rainfall. Identify Risk. Stay Prepared.
        </p>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Project Information & Key Features */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          {/* Project Identity */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-2xl bg-sky-50 border border-sky-200 shrink-0">
              <FloodSenseLogo size={42} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                System Name
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Floodsense
              </h3>
              <p className="text-xs text-sky-600 font-semibold mt-0.5">
                Understand Rainfall. Identify Risk. Stay Prepared.
              </p>
            </div>
          </div>

          {/* Project Goal */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <Target className="w-4 h-4 text-sky-600" />
              Goal
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              To monitor rainfall data, predict urban inundation risks, and trigger real-time hazard alerts for better disaster preparedness in Navsari, Gujarat.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Core Capabilities
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Real-Time Flood Alerts:</strong>
                  <span className="text-slate-600 text-xs block">
                    Automated toast notification popups and audio chimes whenever rainfall telemetry crosses safety thresholds.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Rainfall Data Visualization:</strong>
                  <span className="text-slate-600 text-xs block">
                    Interactive line and bar charts tracking weekly and monthly precipitation trends.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Risk Assessment Map:</strong>
                  <span className="text-slate-600 text-xs block">
                    Location-wise geographic mapping of Navsari wards with High, Medium, and Low vulnerability zones.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Simple Risk Calculator:</strong>
                  <span className="text-slate-600 text-xs block">
                    Predictive simulation engine calculating water depth, runoff, and safety measures based on rainfall intensity.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Data Source & Limitations */}
        <div className="space-y-6">
          
          {/* Data Source (Dummy Data) Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Data Source (Dummy Data)
                </h3>
                <span className="text-xs text-sky-600 font-medium">Hydrological Model Prototype</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Generated dummy sample data for educational and demonstration purposes only. Precipitation values and sensor telemetry simulate South Gujarat monsoon patterns along the Purna River basin.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Telemetry Stations: 10 Wards</span>
              <span className="font-semibold text-slate-700">Navsari, Gujarat</span>
            </div>
          </div>

          {/* Limitations Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                System Limitations
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>
                  <strong>Prototype Simulation:</strong> Telemetry feeds are generated randomly by client-side simulation intervals for testing and live demonstration.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>
                  <strong>Educational Scope:</strong> Does not connect to live Doppler radar or Central Water Commission (CWC) telemetry hardware.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>
                  <strong>Hydrological approximation:</strong> Simplified runoff equations model elevation and river proximity rather than 2D hydrodynamic flow equations.
                </span>
              </li>
            </ul>
          </div>

          {/* Navsari Context Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#122842] rounded-2xl p-5 text-white shadow-xs">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
              Geographical Context
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Navsari city is situated on the banks of the Purna River in southern Gujarat. Due to low relative elevations (6m - 14m above mean sea level), monsoon heavy spells often lead to urban waterlogging, making Floodsense a vital concept for civic resilience.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Information Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-3 text-slate-700 text-xs sm:text-sm text-center">
        <Home className="w-5 h-5 text-sky-600 shrink-0" />
        <p>
          <strong className="text-slate-900">Floodsense Initiative:</strong> Understand Rainfall. Identify Risk. Stay Prepared.
        </p>
      </div>
    </div>
  );
};

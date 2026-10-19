import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Waves, 
  CheckCircle2,
  Calendar,
  CloudRain
} from 'lucide-react';
import { fetchGoogleSearchWeather, GoogleSearchWeatherResponse } from '../services/googleSearchService';

interface GoogleSearchGroundingCardProps {
  onDataLoaded?: (data: GoogleSearchWeatherResponse) => void;
}

export const GoogleSearchGroundingCard: React.FC<GoogleSearchGroundingCardProps> = ({ onDataLoaded }) => {
  const [data, setData] = useState<GoogleSearchWeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFetchedTime, setLastFetchedTime] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    const result = await fetchGoogleSearchWeather();
    setData(result);
    setLoading(false);
    if (result.success) {
      setLastFetchedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (onDataLoaded) onDataLoaded(result);
    }
  };

  // Load once automatically on initial mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Header with Google Brand styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Live Google Search Grounding Data
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Live Grounded Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live weather, IMD alerts, and Purna River bulletin for Navsari, Gujarat
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>{loading ? 'Searching Google...' : 'Refresh Live Data'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading && !data ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Querying real-time Google Search data for Navsari meteorological reports...
          </p>
        </div>
      ) : data?.success ? (
        <div className="space-y-4">
          {/* Formatted summary text */}
          <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-xs sm:text-sm whitespace-pre-line">
            {data.summary}
          </div>

          {/* Search Queries Triggered */}
          {data.searchQueries && data.searchQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Grounded Queries:
              </span>
              {data.searchQueries.map((q, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono border border-slate-200"
                >
                  "{q}"
                </span>
              ))}
            </div>
          )}

          {/* Real Sources and Citations */}
          {data.sources && data.sources.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Grounding Sources & Citations:
              </span>
              <div className="flex flex-wrap gap-2">
                {data.sources.slice(0, 5).map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span className="max-w-[180px] sm:max-w-[240px] truncate font-medium">
                      {source.title || new URL(source.uri).hostname}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Last updated footer */}
          {lastFetchedTime && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Synced with live Google Search index</span>
              <span>Updated today at {lastFetchedTime}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Could not reach Google Search API. Demonstrating with local fallback sensor telemetry.</span>
          </div>
          <button
            onClick={loadData}
            className="px-2.5 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

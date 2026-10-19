import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  MapPin, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Globe,
  ExternalLink
} from 'lucide-react';
import { HISTORICAL_RAINFALL_DATA, NAVSARI_LOCATIONS } from '../data/mockFloodData';
import { RainfallRecord } from '../types';
import { fetchGoogleSearchWeather, GoogleSearchWeatherResponse } from '../services/googleSearchService';

export const RainfallAnalysisPage: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Last 30 Days');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [appliedDateRange, setAppliedDateRange] = useState<string>('Last 30 Days');
  const [appliedLocation, setAppliedLocation] = useState<string>('All Locations');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'rainfall'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [googleWeatherModal, setGoogleWeatherModal] = useState<GoogleSearchWeatherResponse | null>(null);
  const [loadingGoogleWeather, setLoadingGoogleWeather] = useState(false);

  const handleSyncGoogleWeather = async () => {
    setLoadingGoogleWeather(true);
    const result = await fetchGoogleSearchWeather();
    setGoogleWeatherModal(result);
    setLoadingGoogleWeather(false);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleApplyFilters = () => {
    setAppliedDateRange(selectedDateRange);
    setAppliedLocation(selectedLocation);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedDateRange('Last 30 Days');
    setSelectedLocation('All Locations');
    setAppliedDateRange('Last 30 Days');
    setAppliedLocation('All Locations');
    setSearchQuery('');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  // Filter records based on applied controls
  const filteredRecords = useMemo(() => {
    return HISTORICAL_RAINFALL_DATA.filter((record) => {
      // Date range filter
      if (appliedDateRange === 'Last 7 Days') {
        const d = new Date(record.date);
        const cutoff = new Date('2026-04-18');
        if (d < cutoff) return false;
      } else if (appliedDateRange === 'Last 14 Days') {
        const d = new Date(record.date);
        const cutoff = new Date('2026-04-11');
        if (d < cutoff) return false;
      }

      // Location filter
      if (appliedLocation !== 'All Locations' && !record.location.includes(appliedLocation.replace(' Ward', '').replace(' Central', ''))) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLoc = record.location.toLowerCase().includes(query);
        const matchesDate = record.date.includes(query);
        const matchesStatus = record.status.toLowerCase().includes(query);
        if (!matchesLoc && !matchesDate && !matchesStatus) return false;
      }

      // Status Filter
      if (statusFilter !== 'All' && record.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'rainfall') {
        return sortOrder === 'asc' ? a.rainfall - b.rainfall : b.rainfall - a.rainfall;
      }
      return sortOrder === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [appliedDateRange, appliedLocation, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Trend Chart data points (reverse to chronological order for chart display)
  const chartPoints = useMemo(() => {
    const list = [...filteredRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return list.slice(-14); // show last 14 data points
  }, [filteredRecords]);

  // Export to CSV functionality
  const handleExportCSV = () => {
    const headers = ['Date', 'Location', 'Rainfall (mm)', 'Status', 'Drainage Status', 'Waterlogging Alert'];
    const rows = filteredRecords.map((r) => [
      r.date,
      `"${r.location}"`,
      r.rainfall,
      r.status,
      r.drainageStatus,
      r.waterloggingAlert ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `navsari_rainfall_${appliedDateRange.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Line Chart coordinates
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const maxRain = Math.max(70, ...chartPoints.map((p) => p.rainfall));

  const points = chartPoints.map((item, index) => {
    const x = paddingX + (index / Math.max(1, chartPoints.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (item.rainfall / maxRain) * (svgHeight - paddingY * 2);
    return { x, y, item };
  });

  const linePath = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Title Header matching screenshot Panel 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rainfall Analysis
          </h2>
          <p className="text-sm text-slate-500">
            View and analyze rainfall data for Navsari
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSyncGoogleWeather}
            disabled={loadingGoogleWeather}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-60"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{loadingGoogleWeather ? 'Searching Google...' : 'Sync Live Google IMD Data'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Google Search Live IMD Weather Bulletin */}
      {googleWeatherModal && (
        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">
                Live Google Search IMD Bulletin: Navsari & South Gujarat
              </h3>
            </div>
            <button
              onClick={() => setGoogleWeatherModal(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {googleWeatherModal.summary}
          </div>

          {googleWeatherModal.sources && googleWeatherModal.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400 font-semibold">Live Sources:</span>
              {googleWeatherModal.sources.slice(0, 4).map((src, i) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5 truncate max-w-[200px]"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  {src.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Control Bar matching screenshot Panel 3 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5 items-end">
          
          {/* Date Range Selector */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Date Range
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 14 Days">Last 14 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Location Selector */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="All Locations">All Navsari Locations</option>
              {NAVSARI_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} ({loc.riskLevel} Risk)
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              onClick={handleResetFilters}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs sm:text-sm transition-all cursor-pointer"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>

        </div>
      </div>

      {/* Daily Rainfall Trend Line Chart matching screenshot Panel 3 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daily Rainfall Trend
            </h3>
            <p className="text-xs text-slate-500">
              Precipitation trajectory over time for {appliedLocation} ({appliedDateRange})
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
              <span>Rainfall (mm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 border border-dashed border-rose-400" />
              <span>Severe Threshold (50mm)</span>
            </div>
          </div>
        </div>

        {/* Responsive Line Chart SVG */}
        <div className="relative w-full overflow-x-auto">
          <div className="text-[11px] text-slate-400 font-medium mb-1">
            Rainfall (mm)
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-64 select-none"
          >
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 20, 40, 60].map((val) => {
              const y = svgHeight - paddingY - (val / maxRain) * (svgHeight - paddingY * 2);
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 10}
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

            {/* Alert Level 50mm Line */}
            {(() => {
              const alertY = svgHeight - paddingY - (50 / maxRain) * (svgHeight - paddingY * 2);
              return (
                <line
                  x1={paddingX}
                  y1={alertY}
                  x2={svgWidth - paddingX}
                  y2={alertY}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })()}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#rainGradient)" />}

            {/* Main Trend Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((p, index) => {
              const isHovered = hoveredPointIndex === index;
              const isPeak = p.item.rainfall >= 50;

              return (
                <g
                  key={p.item.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(index)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : isPeak ? 4.5 : 3.5}
                    fill={isPeak ? '#ef4444' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? '2.5' : '1.5'}
                    className="transition-all duration-150"
                  />

                  {/* X-axis date labels */}
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill={isHovered ? '#0f172a' : '#64748b'}
                    fontWeight={isHovered ? '700' : '400'}
                  >
                    {p.item.date.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPointIndex !== null && points[hoveredPointIndex] && (
            <div
              className="absolute pointer-events-none bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700 z-10 transition-all"
              style={{
                left: `${(points[hoveredPointIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPointIndex].y / svgHeight) * 100 - 30}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="font-bold text-sky-300">
                {points[hoveredPointIndex].item.date}
              </p>
              <p className="text-slate-200">
                Rainfall: <span className="font-semibold">{points[hoveredPointIndex].item.rainfall} mm</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {points[hoveredPointIndex].item.location}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rainfall Status Data Table matching screenshot Panel 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rainfall Status
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length} recorded meteorological entries
            </p>
          </div>

          {/* Search bar inside table header */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search date or station..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => {
                    setSortField('date');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Station / Location</th>
                <th
                  onClick={() => {
                    setSortField('rainfall');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Rainfall (mm)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Drainage Status</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4 text-right">Waterlogging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => {
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {record.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{record.location}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {record.rainfall.toFixed(1)} mm
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600">{record.drainageStatus}</span>
                      </td>
                      <td className="py-3 px-4">
                        {/* Status badge matching colors in screenshot */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            record.status === 'Severe'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : record.status === 'High'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : record.status === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {record.waterloggingAlert ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-medium text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No rainfall records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * itemsPerPage, filteredRecords.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredRecords.length}</span> results
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

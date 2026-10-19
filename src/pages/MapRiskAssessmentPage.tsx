import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Waves,
  Eye,
  Maximize2,
  Globe,
  ExternalLink
} from 'lucide-react';
import { fetchGoogleSearchFloodRisk, GoogleSearchFloodRiskResponse } from '../services/googleSearchService';
import { 
  NAVSARI_LOCATIONS, 
  MAP_ZONES, 
  RIVER_PATH_COORDINATES 
} from '../data/mockFloodData';
import { LocationData } from '../types';

export const MapRiskAssessmentPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);

  // Selected Location for the inspector card matching screenshot Panel 4
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(NAVSARI_LOCATIONS[0]);
  const [showRiverLayer, setShowRiverLayer] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL');
  const [googleLocationInsight, setGoogleLocationInsight] = useState<GoogleSearchFloodRiskResponse | null>(null);
  const [loadingGoogleInsight, setLoadingGoogleInsight] = useState<boolean>(false);

  const handleFetchGoogleInsight = async (locationName: string) => {
    setLoadingGoogleInsight(true);
    const data = await fetchGoogleSearchFloodRisk(locationName, selectedLocation.rainfall24h, 6);
    setGoogleLocationInsight(data);
    setLoadingGoogleInsight(false);
  };

  // Center on Navsari City Center [20.9500, 72.9300]
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.9470, 72.9300],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Standard crisp OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      polygonsLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const polygonsLayer = polygonsLayerRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !polygonsLayer || !markersLayer) return;

    // Clear prior drawings
    polygonsLayer.clearLayers();
    markersLayer.clearLayers();

    // 1. Draw Purna River line
    if (showRiverLayer) {
      const riverPolyline = L.polyline(RIVER_PATH_COORDINATES, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 4',
      }).addTo(polygonsLayer);

      riverPolyline.bindTooltip('Purna River Flow Corridor (Navsari)', {
        permanent: false,
        direction: 'center',
        className: 'bg-blue-900 text-white font-semibold text-xs px-2 py-1 rounded shadow',
      });
    }

    // 2. Draw Risk Zone Polygons
    if (showRiskZones) {
      MAP_ZONES.forEach((zone) => {
        const polygon = L.polygon(zone.coordinates, {
          color: zone.borderColor,
          fillColor: zone.fillColor,
          fillOpacity: zone.fillOpacity,
          weight: 2,
        }).addTo(polygonsLayer);

        polygon.bindTooltip(
          `<strong>${zone.name}</strong><br/>Average Elevation: ${zone.averageElevation}`,
          { direction: 'top', sticky: true }
        );
      });
    }

    // 3. Render Custom Station Markers
    NAVSARI_LOCATIONS.forEach((loc) => {
      if (activeFilter !== 'ALL' && loc.riskLevel !== activeFilter) {
        return;
      }

      const isSelected = selectedLocation.id === loc.id;
      const pinColor = loc.riskLevel === 'High' ? '#ef4444' : loc.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e';
      const shadowColor = loc.riskLevel === 'High' ? 'rgba(239,68,68,0.4)' : loc.riskLevel === 'Medium' ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)';

      const customHtml = `
        <div style="
          position: relative;
          cursor: pointer;
          transform: translate(-50%, -100%);
        ">
          <div style="
            background: ${pinColor};
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px ${shadowColor};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-size: 11px;
              font-weight: bold;
            ">●</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-flood-pin',
        html: customHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(markersLayer);

      marker.on('click', () => {
        setSelectedLocation(loc);
        map.panTo([loc.lat, loc.lng], { animate: true, duration: 0.5 });
      });

      marker.bindTooltip(`<strong>${loc.name}</strong><br/>Risk: ${loc.riskLevel} (${loc.rainfall24h} mm)`, {
        direction: 'top',
        offset: [0, -28],
      });
    });

  }, [selectedLocation, showRiverLayer, showRiskZones, activeFilter]);

  // Handle location focus from sidebar list
  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header matching screenshot Panel 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Map & Risk Assessment
          </h2>
          <p className="text-sm text-slate-500">
            View flood risk zones and location-wise risk levels in Navsari
          </p>
        </div>

        {/* Quick Risk Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs">
          {(['ALL', 'High', 'Medium', 'Low'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter === 'ALL' ? 'All Areas' : `${filter} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map (left/center) + Legend & Inspector Card (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Container matching screenshot Panel 4 */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Map Top Bar with toggles */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Navsari Urban GIS Projection (EPSG:3857)</span>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRiskZones}
                  onChange={(e) => setShowRiskZones(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Risk Polygons</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRiverLayer}
                  onChange={(e) => setShowRiverLayer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Purna River Path</span>
              </label>

              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([20.9470, 72.9300], 13);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Reset View
              </button>
            </div>
          </div>

          {/* Leaflet Map Target */}
          <div
            ref={mapContainerRef}
            className="w-full h-[500px] z-10 bg-slate-100"
          />

          {/* Map Footer status */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {activeFilter === 'ALL' ? '10' : NAVSARI_LOCATIONS.filter(l => l.riskLevel === activeFilter).length} urban hydrological stations
            </span>
            <span className="text-slate-400">Click any marker or area below to inspect</span>
          </div>
        </div>

        {/* Right Panel: Risk Legend & Selected Location Inspector matching screenshot Panel 4 */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Risk Legend Card matching screenshot Panel 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Risk Legend
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md bg-rose-500 shrink-0 shadow-xs" />
                  <span className="text-xs font-semibold text-rose-900">High Risk</span>
                </div>
                <span className="text-[11px] font-medium text-rose-700">&gt; 50 mm / Riparian</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md bg-amber-500 shrink-0 shadow-xs" />
                  <span className="text-xs font-semibold text-amber-900">Medium Risk</span>
                </div>
                <span className="text-[11px] font-medium text-amber-700">30 - 50 mm / Low Elevation</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md bg-emerald-500 shrink-0 shadow-xs" />
                  <span className="text-xs font-semibold text-emerald-900">Low Risk</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700">&lt; 30 mm / Elevated</span>
              </div>
            </div>
          </div>

          {/* Selected Location Inspector Card matching screenshot Panel 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Selected Location
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {selectedLocation.name}
              </h3>
              <p className="text-xs text-slate-500">{selectedLocation.category}</p>
            </div>

            {/* Risk Level Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Risk Level:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                  selectedLocation.riskLevel === 'High'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : selectedLocation.riskLevel === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {selectedLocation.riskLevel === 'High' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : selectedLocation.riskLevel === 'Medium' ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {selectedLocation.riskLevel}
              </span>
            </div>

            {/* Rainfall (24h) */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Rainfall (24h):</span>
              <span className="text-sm font-bold text-slate-900">
                {selectedLocation.rainfall24h} mm
              </span>
            </div>

            {/* Status matching screenshot */}
            <div>
              <span className="text-xs font-medium text-slate-600 block mb-1">
                Status:
              </span>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                {selectedLocation.statusDescription}
              </div>
            </div>

            {/* Hydrological Details */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-slate-500 block text-[10px]">Elevation</span>
                <span className="font-bold text-blue-900">{selectedLocation.elevation} meters</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                <span className="text-slate-500 block text-[10px]">Purna River Dist.</span>
                <span className="font-bold text-sky-900">{selectedLocation.distanceToRiver} km</span>
              </div>
            </div>

            {/* Mitigation Action */}
            <div className="pt-2 border-t border-slate-100 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">
                Recommended Action:
              </span>
              <p className="text-slate-600 leading-relaxed">
                {selectedLocation.keyMitigation}
              </p>
            </div>

            {/* Google Search Live Ward Intelligence */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => handleFetchGoogleInsight(selectedLocation.name)}
                disabled={loadingGoogleInsight}
                className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {loadingGoogleInsight
                    ? 'Querying Google Search...'
                    : `Get Live Google Search Intelligence for ${selectedLocation.name.split(' ')[0]}`}
                </span>
              </button>

              {googleLocationInsight && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Google Search Findings:
                  </span>
                  <div className="text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {googleLocationInsight.analysis}
                  </div>
                  {googleLocationInsight.sources && googleLocationInsight.sources.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">Sources:</span>
                      <div className="flex flex-wrap gap-1">
                        {googleLocationInsight.sources.slice(0, 3).map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5 truncate max-w-[180px]"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Location Picker List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Quick Select Station
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {NAVSARI_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedLocation.id === loc.id
                      ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{loc.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ml-2 ${
                      loc.riskLevel === 'High'
                        ? 'bg-rose-500'
                        : loc.riskLevel === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

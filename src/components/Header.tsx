import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  ShieldCheck, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Droplets,
  ExternalLink,
  X
} from 'lucide-react';
import { PageTab } from '../types';
import { FloodSenseLogo } from './FloodSenseLogo';
import { useAlerts } from '../context/AlertContext';

interface HeaderProps {
  currentTab: PageTab;
  onOpenMobile: () => void;
  onLogout: () => void;
  onNavigateToTab?: (tab: PageTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onOpenMobile, 
  onLogout,
  onNavigateToTab
}) => {
  const { alerts, unreadCount, markAllAsRead, clearAlerts, isLiveSimulationActive } = useAlerts();
  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAlertMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'rainfall':
        return 'Rainfall Analysis';
      case 'map':
        return 'Map & Risk Assessment';
      case 'calculator':
        return 'Risk Calculator';
      case 'about':
        return 'About Floodsense';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobile}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Small Screen Brand Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <FloodSenseLogo size={28} />
          <span className="font-bold text-slate-900 text-base">Floodsense</span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {getTabTitle()}
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            Navsari Urban Cell
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time simulation status pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveSimulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="font-medium">
            {isLiveSimulationActive ? 'Live Telemetry Active' : 'Simulation Paused'}
          </span>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setIsAlertMenuOpen(!isAlertMenuOpen);
              if (!isAlertMenuOpen && unreadCount > 0) {
                markAllAsRead();
              }
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification History Flyout Dropdown */}
          {isAlertMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    Flood Alert Notifications
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    {alerts.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAlerts}
                      title="Clear all alerts"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsAlertMenuOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Alert list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <Droplets className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No active flood alerts recorded.
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 hover:bg-slate-50 transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            alert.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {alert.locationName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        Simulated Rainfall: <strong>{alert.rainfallMm} mm</strong> (Exceeds {alert.thresholdMm}mm)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {alert.status}
                      </p>
                      {onNavigateToTab && (
                        <button
                          onClick={() => {
                            onNavigateToTab('map');
                            setIsAlertMenuOpen(false);
                          }}
                          className="text-[11px] text-sky-600 font-semibold hover:underline pt-0.5 inline-flex items-center gap-1 cursor-pointer"
                        >
                          Open in Map View <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {alerts.length > 0 && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile section matching screenshot "Welcome, Admin" */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-sm font-medium text-slate-800">
              Welcome, <span className="font-semibold text-sky-600">Admin</span>
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-slate-500 hover:text-rose-600 transition-colors ml-1 py-1 px-2 rounded-lg hover:bg-rose-50 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

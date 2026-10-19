import React from 'react';
import { 
  LayoutDashboard, 
  LineChart, 
  MapPin, 
  Calculator, 
  Info, 
  LogOut, 
  Waves,
  ChevronRight,
  BellRing
} from 'lucide-react';
import { PageTab } from '../types';
import { FloodSenseLogo } from './FloodSenseLogo';
import { useAlerts } from '../context/AlertContext';

interface SidebarProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { unreadCount } = useAlerts();

  const navItems: { tab: PageTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { 
      tab: 'dashboard', 
      label: 'Home', 
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { tab: 'rainfall', label: 'Rainfall Analysis', icon: <LineChart className="w-4 h-4" /> },
    { tab: 'map', label: 'Map & Risk Assessment', icon: <MapPin className="w-4 h-4" /> },
    { tab: 'calculator', label: 'Risk Calculator', icon: <Calculator className="w-4 h-4" /> },
    { tab: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: PageTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container with Dark Navy theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0d1b2a] text-slate-200 flex flex-col border-r border-[#1e2e42] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Floodsense Logo */}
        <div className="p-4 border-b border-[#1b2b3d] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/15">
            <FloodSenseLogo size={32} />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-white text-lg leading-tight tracking-tight">
              Floodsense
            </h1>
            <p className="text-[10px] text-sky-400 font-medium tracking-wide truncate">
              Understand. Identify. Prepare.
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white font-medium shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-[#16273b] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {item.badge && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}

          {/* River Basin Hydrology Widget */}
          <div className="mt-6 mx-1 p-3.5 rounded-xl bg-[#132235] border border-[#1e344f]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                <Waves className="w-3.5 h-3.5" />
                Purna River Basin
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Telemetry Live" />
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-400">Current Gauge:</span>
              <span className="text-sm font-semibold text-white">18.4 ft</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '76%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Normal: 12 ft</span>
              <span className="text-rose-400 font-medium">Alert: 24 ft</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1b2b3d] bg-[#0b1724]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-xs font-semibold text-sky-300">
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-white leading-tight">Admin User</p>
                <p className="text-[10px] text-slate-400">NMC Flood Cell</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

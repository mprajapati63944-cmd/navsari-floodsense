import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  MapPin, 
  ArrowRight,
  Droplets,
  BellRing
} from 'lucide-react';
import { FloodAlert, PageTab } from '../types';
import { useAlerts } from '../context/AlertContext';

interface ToastNotificationProps {
  alert: FloodAlert;
  onNavigateToMap?: (locationId: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  alert,
  onNavigateToMap,
}) => {
  const { dismissToast } = useAlerts();
  const [progress, setProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const duration = 8000; // 8 seconds toast lifespan

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          dismissToast(alert.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [alert.id, isPaused, dismissToast]);

  const isCritical = alert.severity === 'Critical';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl border transition-all duration-300 transform translate-y-0 backdrop-blur-md relative overflow-hidden pointer-events-auto ${
        isCritical
          ? 'bg-slate-900/95 border-rose-500/50 text-white shadow-rose-500/10'
          : 'bg-slate-900/95 border-amber-500/50 text-white shadow-amber-500/10'
      }`}
      role="alert"
    >
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <BellRing className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isCritical
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-slate-900 font-extrabold'
                }`}
              >
                {alert.severity} Flood Alert
              </span>
              <span className="text-[11px] text-slate-400">
                {alert.timestamp}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {alert.locationName}
            </h4>
          </div>
        </div>

        <button
          onClick={() => dismissToast(alert.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description & metrics */}
      <div className="mt-2.5 text-xs text-slate-300 space-y-1.5 pl-11">
        <div className="flex items-center gap-2 font-semibold">
          <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            Simulated Rainfall:{' '}
            <strong className={isCritical ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
              {alert.rainfallMm} mm
            </strong>{' '}
            <span className="text-slate-400 font-normal">
              (Threshold: {alert.thresholdMm} mm)
            </span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {alert.status}
        </p>

        {/* Action Button */}
        {onNavigateToMap && (
          <div className="pt-2">
            <button
              onClick={() => {
                onNavigateToMap(alert.locationId);
                dismissToast(alert.id);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer group"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Inspect on Map</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className={`h-full transition-all duration-75 ${
            isCritical ? 'bg-rose-500' : 'bg-amber-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ onNavigateToMap?: (locId: string) => void }> = ({
  onNavigateToMap,
}) => {
  const { activeToasts } = useAlerts();

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full"
    >
      {activeToasts.map((alert) => (
        <ToastNotification
          key={alert.id}
          alert={alert}
          onNavigateToMap={onNavigateToMap}
        />
      ))}
    </div>
  );
};

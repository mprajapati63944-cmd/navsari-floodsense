import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FloodAlert, PageTab } from '../types';
import { NAVSARI_LOCATIONS } from '../data/mockFloodData';

interface AlertContextType {
  alerts: FloodAlert[];
  activeToasts: FloodAlert[];
  alertThreshold: number;
  setAlertThreshold: (val: number) => void;
  isLiveSimulationActive: boolean;
  setIsLiveSimulationActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  triggerSimulatedAlert: (customLocationId?: string, customRainfall?: number) => void;
  dismissToast: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  unreadCount: number;
  lastSimulatedStation: { name: string; rainfall: number; timestamp: string } | null;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Web Audio subtle warning chime
const playAlertChime = (severity: 'Warning' | 'Critical') => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    const freq1 = severity === 'Critical' ? 880 : 587.33; // A5 or D5
    const freq2 = severity === 'Critical' ? 659.25 : 440; // E5 or A4

    osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.25);

    osc2.frequency.setValueAtTime(freq1 * 1.5, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(freq2 * 1.5, ctx.currentTime + 0.25);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext autoplay restrictions are handled gracefully
  }
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<FloodAlert[]>([
    {
      id: 'init-alert-1',
      timestamp: '2 mins ago',
      locationName: 'Purna Riverbank North',
      locationId: 'loc-2',
      rainfallMm: 60.2,
      thresholdMm: 50,
      severity: 'Critical',
      status: 'River gauge approaching overflow mark (18.4 ft).',
      read: false,
    },
    {
      id: 'init-alert-2',
      timestamp: '18 mins ago',
      locationName: 'Kaliawadi Ward',
      locationId: 'loc-3',
      rainfallMm: 54.5,
      thresholdMm: 50,
      severity: 'Warning',
      status: 'Low-lying culverts backlogged; road runoff pooling.',
      read: true,
    }
  ]);

  const [activeToasts, setActiveToasts] = useState<FloodAlert[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<number>(50); // 50 mm threshold
  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(true);
  const [lastSimulatedStation, setLastSimulatedStation] = useState<{ name: string; rainfall: number; timestamp: string } | null>({
    name: 'Purna Riverbank North',
    rainfall: 60.2,
    timestamp: 'Just now'
  });

  const dismissToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerSimulatedAlert = useCallback(
    (customLocationId?: string, customRainfall?: number) => {
      const loc = customLocationId
        ? NAVSARI_LOCATIONS.find((l) => l.id === customLocationId) || NAVSARI_LOCATIONS[1]
        : NAVSARI_LOCATIONS[Math.floor(Math.random() * NAVSARI_LOCATIONS.length)];

      const rainfall = customRainfall !== undefined
        ? customRainfall
        : Math.round((alertThreshold + Math.random() * 26 + 4) * 10) / 10;

      const severity: 'Warning' | 'Critical' = rainfall >= 65 ? 'Critical' : 'Warning';

      const newAlert: FloodAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: 'Just now',
        locationName: loc.name,
        locationId: loc.id,
        rainfallMm: rainfall,
        thresholdMm: alertThreshold,
        severity,
        status: `Simulated precipitation reached ${rainfall} mm, exceeding danger threshold of ${alertThreshold} mm.`,
        read: false,
      };

      setLastSimulatedStation({
        name: loc.name,
        rainfall,
        timestamp: 'Just now'
      });

      // Add to full alerts list
      setAlerts((prev) => [newAlert, ...prev]);

      // Add to active toast queue (keep max 3 concurrent toasts)
      setActiveToasts((prev) => [newAlert, ...prev.slice(0, 2)]);

      // Audio notification chime
      playAlertChime(severity);
    },
    [alertThreshold]
  );

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setActiveToasts([]);
  }, []);

  // Periodic simulation loop: runs every 14 seconds when active
  useEffect(() => {
    if (!isLiveSimulationActive) return;

    const interval = setInterval(() => {
      // Pick random location from Navsari
      const randomLoc = NAVSARI_LOCATIONS[Math.floor(Math.random() * NAVSARI_LOCATIONS.length)];
      
      // Simulate random rainfall variation (between 15 mm and 72 mm)
      // Low risk areas generally get lower, riverbank & kaliawadi have higher probability of spike
      const baseVariation = randomLoc.riskLevel === 'High' ? 42 : randomLoc.riskLevel === 'Medium' ? 28 : 14;
      const simulatedRainfall = Math.round((baseVariation + Math.random() * 32) * 10) / 10;

      setLastSimulatedStation({
        name: randomLoc.name,
        rainfall: simulatedRainfall,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      // If simulated rainfall crosses threshold, automatically trigger a toast alert!
      if (simulatedRainfall >= alertThreshold) {
        const severity: 'Warning' | 'Critical' = simulatedRainfall >= 65 ? 'Critical' : 'Warning';
        const newAlert: FloodAlert = {
          id: `alert-auto-${Date.now()}`,
          timestamp: 'Just now',
          locationName: randomLoc.name,
          locationId: randomLoc.id,
          rainfallMm: simulatedRainfall,
          thresholdMm: alertThreshold,
          severity,
          status: `Rainfall sensor clocked ${simulatedRainfall} mm (Threshold: ${alertThreshold} mm). Risk of water accumulation.`,
          read: false,
        };

        setAlerts((prev) => [newAlert, ...prev]);
        setActiveToasts((prev) => [newAlert, ...prev.slice(0, 2)]);
        playAlertChime(severity);
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [isLiveSimulationActive, alertThreshold]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        activeToasts,
        alertThreshold,
        setAlertThreshold,
        isLiveSimulationActive,
        setIsLiveSimulationActive,
        triggerSimulatedAlert,
        dismissToast,
        markAllAsRead,
        clearAlerts,
        unreadCount,
        lastSimulatedStation,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

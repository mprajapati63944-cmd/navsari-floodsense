import React, { useState } from 'react';
import { PageTab } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RainfallAnalysisPage } from './pages/RainfallAnalysisPage';
import { MapRiskAssessmentPage } from './pages/MapRiskAssessmentPage';
import { RiskCalculatorPage } from './pages/RiskCalculatorPage';
import { AboutPage } from './pages/AboutPage';
import { AlertProvider } from './context/AlertContext';
import { ToastContainer } from './components/ToastNotification';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('navsari_flood_auth') === 'true';
  });

  const [currentTab, setCurrentTab] = useState<PageTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    localStorage.setItem('navsari_flood_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('navsari_flood_auth');
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  const handleNavigateToMap = (locationId?: string) => {
    setCurrentTab('map');
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AlertProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex">
        {/* Sidebar Navigation with Floodsense branding */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-200">
          <Header
            currentTab={currentTab}
            onOpenMobile={() => setIsMobileSidebarOpen(true)}
            onLogout={handleLogout}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
            )}

            {currentTab === 'rainfall' && <RainfallAnalysisPage />}

            {currentTab === 'map' && <MapRiskAssessmentPage />}

            {currentTab === 'calculator' && <RiskCalculatorPage />}

            {currentTab === 'about' && <AboutPage />}
          </main>
        </div>

        {/* Floating Real-Time Flood Alert Toast Stack */}
        <ToastContainer onNavigateToMap={handleNavigateToMap} />
      </div>
    </AlertProvider>
  );
}

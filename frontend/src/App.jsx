import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import TopNavigation from './components/navigation/TopNavigation';
import DevToolsDiscoveryPage from './pages/DevToolsDiscoveryPage';
import MyApisPage from './pages/MyApisPage';
import ProfileModal from './components/profile/ProfileModal';
import ToastContainer from './components/common/Toast';
import { Terminal, Shield, Heart } from 'lucide-react';

function UltraMinimalistApp() {
  // Main view mode: 'devtools' | 'my-apis'
  const [activeTab, setActiveTab] = useState('devtools');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 dark:bg-black bg-white dark:text-[#EDEDED] text-black">
      {/* Top Header with Centered Segmented Control, Theme Toggle & Avatar */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Area (Dev Tools Discovery vs My APIs) */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'devtools' ? (
          <DevToolsDiscoveryPage />
        ) : (
          <MyApisPage />
        )}
      </main>

      {/* Ultra-Minimalist Developer Footer */}
      <footer className="border-t py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono dark:border-[#1f1f1f] border-[#eaeaea] dark:bg-black/60 bg-white/60 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 dark:text-neutral-500 text-neutral-600">
            <span className="font-semibold dark:text-neutral-200 text-neutral-900">Hubs & Hubs</span>
            <span>•</span>
            <span>Ultra-minimalist developer platform & tools directory</span>
          </div>

          <div className="flex items-center gap-4 dark:text-neutral-500 text-neutral-500 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Edge Gateway 99.99% SLA</span>
            </span>
            <span>•</span>
            <span>TLS 1.3 Certified</span>
          </div>
        </div>
      </footer>

      {/* User Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Global Toast Feedback Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <UltraMinimalistApp />
      </AppProvider>
    </ThemeProvider>
  );
}

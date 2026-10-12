import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import TopNavigation from './components/navigation/TopNavigation';
import ToolsDirectoryPage from './pages/ToolsDirectoryPage';
import MyApisPage from './pages/MyApisPage';
import ProfileModal from './components/profile/ProfileModal';
import AuthModal from './components/auth/AuthModal';
import ToastContainer from './components/common/Toast';

function UltraMinimalistApp() {
  const { user, isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState('devtools');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 dark:bg-black bg-white dark:text-[#EDEDED] text-black">
      {/* Top Header with Centered Segmented Control, Theme Toggle & Avatar */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfileModal={handleProfileClick}
      />

      {/* Main View Area (Tools Directory vs My APIs) */}
      <main className="flex-1 w-full">
        {activeTab === 'devtools' ? (
          <ToolsDirectoryPage />
        ) : (
          <div className="px-4 sm:px-6 lg:px-8 pt-6">
            <MyApisPage />
          </div>
        )}
      </main>

      {/* Ultra-Minimalist Developer Footer */}
      <footer className="border-t py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono dark:border-[#1f1f1f] border-[#eaeaea] dark:bg-black/60 bg-white/60 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 dark:text-neutral-500 text-neutral-600">
            <span className="font-semibold dark:text-neutral-200 text-neutral-900">Hubs & Hubs</span>
            <span>•</span>
            <span>Developer utility platform & microservice directory</span>
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
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

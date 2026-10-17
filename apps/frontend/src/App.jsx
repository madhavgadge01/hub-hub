import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import TopNavigation from './components/navigation/TopNavigation';
import ToolsDirectoryPage from './pages/ToolsDirectoryPage';
import MarketplacePage from './pages/MarketplacePage';
import ApiDetailPage from './pages/ApiDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import CertificateVerificationPage from './pages/CertificateVerificationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModal from './components/auth/AuthModal';
import ToastContainer from './components/common/Toast';
import CertificateEligibilityBanner from './components/common/CertificateEligibilityBanner';

function UltraMinimalistApp() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const location = useLocation();

  // Determine active section for TopNavigation visual highlighting
  let activeTab = '';
  if (location.pathname.startsWith('/api-market')) {
    activeTab = 'marketplace';
  } else if (location.pathname.startsWith('/profile')) {
    activeTab = 'profile';
  } else if (location.pathname.startsWith('/careers')) {
    activeTab = 'careers';
  } else if (location.pathname.startsWith('/tools')) {
    activeTab = 'devtools';
  } else if (location.pathname === '/') {
    activeTab = 'home';
  }

  const isLandingRoute = location.pathname === '/' || location.pathname === '/careers';

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 dark:bg-black bg-white dark:text-[#EDEDED] text-black">
      {/* Top Navigation for Application Pages (Tool Discovery, API Market, Profile, Auth) */}
      {!isLandingRoute && <TopNavigation activeTab={activeTab} />}

      {/* Dismissible Certificate Eligibility Banner for verified learners */}
      {!isLandingRoute && <CertificateEligibilityBanner />}

      {/* Main View Area with Dedicated URL-Based Routing */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Main Landing & Careers Section Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/careers" element={<LandingPage initialSection="careers" />} />

          {/* Tool Discovery Routes */}
          <Route path="/tools" element={<ToolsDirectoryPage />} />
          <Route path="/tools/category/:categorySlug" element={<ToolsDirectoryPage />} />
          <Route path="/tools/:slug" element={<ToolsDirectoryPage />} />

          {/* API Marketplace Routes */}
          <Route
            path="/api-market"
            element={
              <div className="px-4 sm:px-6 lg:px-8 pt-6">
                <MarketplacePage />
              </div>
            }
          />
          <Route
            path="/api-market/:slug"
            element={
              <div className="px-4 sm:px-6 lg:px-8 pt-6">
                <ApiDetailPage />
              </div>
            }
          />

          {/* User Profile & Dashboard (Protected Routes) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="px-4 sm:px-6 lg:px-8 pt-6">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/api-keys"
            element={
              <ProtectedRoute>
                <div className="px-4 sm:px-6 lg:px-8 pt-6">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/purchases"
            element={
              <ProtectedRoute>
                <div className="px-4 sm:px-6 lg:px-8 pt-6">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/analytics"
            element={
              <ProtectedRoute>
                <div className="px-4 sm:px-6 lg:px-8 pt-6">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/billing"
            element={
              <ProtectedRoute>
                <div className="px-4 sm:px-6 lg:px-8 pt-6">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/certificate"
            element={
              <ProtectedRoute>
                <div className="px-4 sm:px-6 lg:px-8 pt-6">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Public Certificate Verification Routes */}
          <Route path="/verify" element={<CertificateVerificationPage />} />
          <Route path="/verify/:verificationCode" element={<CertificateVerificationPage />} />
          <Route path="/verify/certificate/:verificationCode" element={<CertificateVerificationPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Legacy Playground Alias Redirect */}
          <Route path="/playground" element={<Navigate to="/api-market" replace />} />

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Clean Application Footer for App Views */}
      {!isLandingRoute && (
        <footer className="border-t py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono dark:border-[#1f1f1f] border-[#eaeaea] dark:bg-black/60 bg-white/60 backdrop-blur-sm transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 dark:text-neutral-500 text-neutral-600">
              <div className="w-5 h-5 rounded bg-white border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-0.5 overflow-hidden shadow-sm shrink-0">
                <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold dark:text-neutral-200 text-neutral-900 font-sans">Kruu</span>
              <span>•</span>
              <span>Developer software directory & API marketplace</span>
            </div>

            <div className="flex items-center gap-4 dark:text-neutral-500 text-neutral-500 text-[11px]">
              <span>© {new Date().getFullYear()} Kruu. All rights reserved.</span>
            </div>
          </div>
        </footer>
      )}

      {/* Authentication Modal (For in-place triggers) */}
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
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <UltraMinimalistApp />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

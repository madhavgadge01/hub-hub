import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

export const PublicNavbar = ({ onScrollToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleBrandClick = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    } else {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `#${sectionId}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Minimalist Brand Wordmark */}
        <a
          href="/"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="Kruu Home"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-0.5 overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0">
            <img
              src="/kruu_logo.png"
              alt="Kruu Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-neutral-900 dark:text-white font-sans">
            Kruu
          </span>
        </a>

        {/* Center: In-Page Section Links (Desktop) */}
        <nav aria-label="Public Navigation" className="hidden md:flex items-center gap-8">
          <button
            type="button"
            onClick={() => handleNavClick('about-us')}
            className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors duration-150 focus:outline-none"
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('careers')}
            className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors duration-150 focus:outline-none"
          >
            Careers
          </button>
        </nav>

        {/* Right: Auth Action Links & Theme Toggle (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <Link
            to="/login"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white px-2 py-1 transition-colors duration-150"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile: Hamburger Button & Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-black/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('about-us')}
              className="text-left py-2 px-3 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('careers')}
              className="text-left py-2 px-3 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Careers
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 px-4 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 px-4 rounded-xl text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;

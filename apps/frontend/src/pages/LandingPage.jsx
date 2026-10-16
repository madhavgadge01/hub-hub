import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Mail,
  Layers,
  Search,
  CheckCircle2,
  Terminal,
  Key,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PublicNavbar from '../components/navigation/PublicNavbar';

export const LandingPage = ({ initialSection = null }) => {
  const { user, authLoading } = useApp();
  const location = useLocation();

  // Hero interactive preview state
  const [activePreviewTab, setActivePreviewTab] = useState('sandbox'); // 'sandbox' | 'compare'
  const [hasCopied, setHasCopied] = useState(false);
  const [sandboxExecuted, setSandboxExecuted] = useState(false);

  // Smooth scroll handler with URL hash sync
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  // Handle direct navigation to #about-us or #careers (or via /careers route)
  useEffect(() => {
    if (initialSection === 'careers' || location.hash === '#careers') {
      const timer = setTimeout(() => scrollToSection('careers'), 100);
      return () => clearTimeout(timer);
    } else if (location.hash === '#about-us' || location.hash === '#about') {
      const timer = setTimeout(() => scrollToSection('about-us'), 100);
      return () => clearTimeout(timer);
    } else if (location.hash === '#overview') {
      const timer = setTimeout(() => scrollToSection('overview'), 100);
      return () => clearTimeout(timer);
    }
  }, [initialSection, location.hash]);

  // Auth Protection: If authenticated, redirect immediately away from public landing page
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black bg-white">
        <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/tools" replace />;
  }

  // Mailto links with encoded subjects and prefilled bodies for the Careers / Work With Us section
  const workWithUsMailto = `mailto:kruu.online@gmail.com?subject=${encodeURIComponent(
    'Working with Kruu'
  )}&body=${encodeURIComponent(
    `Hi Kruu Team,

I'm interested in exploring opportunities to work with Kruu.

Name: 
Role / Discipline: 
Portfolio / GitHub / Website: 
A brief note on what I'd love to build: 

Looking forward to connecting!`
  )}`;

  const technicalCollabMailto = `mailto:kruu.online@gmail.com?subject=${encodeURIComponent(
    'Technical Collaboration with Kruu'
  )}&body=${encodeURIComponent(
    `Hi Kruu Team,

I'm reaching out regarding a potential technical collaboration with Kruu (e.g., API integration, tool listing, or building together).

Name / Project: 
Project URL / Repository: 
Collaboration Idea: 

Looking forward to connecting!`
  )}`;

  const generalEnquiryMailto = `mailto:kruu.online@gmail.com?subject=${encodeURIComponent(
    'Enquiry about Kruu'
  )}&body=${encodeURIComponent(
    `Hi Kruu Team,

I have an enquiry regarding Kruu:

Name: 
Message / Question: 

Thank you!`
  )}`;

  const handleCopySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-black bg-white text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      
      {/* 1. Public Navbar (Minimal, Apple-inspired) */}
      <PublicNavbar onScrollToSection={scrollToSection} />

      <main className="flex-1 w-full">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-16 sm:pt-24 lg:pt-32 pb-20 sm:pb-28 lg:pb-36">
          {/* Subtle Apple-style radial ambient light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-blue-500/[0.07] dark:from-blue-500/[0.12] to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headline, Value Proposition, and Dual CTAs */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium dark:bg-white/[0.06] bg-black/[0.04] dark:text-neutral-300 text-neutral-700 border dark:border-white/10 border-black/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                  <span>Developer Software & API Platform</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
                    Everything Developers Need.{' '}
                    <span className="block text-neutral-500 dark:text-neutral-400 font-medium">
                      One Platform.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    Discover the software you need. Explore developer APIs and test them in one place. Kruu helps developers find useful tools and integrate services with less friction.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('overview')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-all shadow-sm"
                  >
                    <span>Explore Kruu</span>
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </button>

                  <Link
                    to="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-sm"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Grounded Product Capabilities Reassurance */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-neutral-500 dark:text-neutral-400 pt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Software Directory</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Interactive API Sandboxes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>API Key Management</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Refined Product Interface Preview (Apple-style Floating Showcase) */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  
                  {/* Subtle backdrop glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-3xl blur-2xl -z-10" />

                  {/* Main Product Window Preview Card */}
                  <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#0d0d0d]/90 shadow-2xl overflow-hidden backdrop-blur-sm transition-all">
                    
                    {/* Window Titlebar */}
                    <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/80 dark:bg-[#121212]/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 ml-2">
                          kruu.app
                        </span>
                      </div>

                      {/* Interactive Preview Tabs */}
                      <div className="inline-flex p-0.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/60 text-[11px] font-medium">
                        <button
                          type="button"
                          onClick={() => setActivePreviewTab('sandbox')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            activePreviewTab === 'sandbox'
                              ? 'bg-white dark:bg-[#1c1c1c] text-neutral-900 dark:text-white shadow-xs font-semibold'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          API Sandbox
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePreviewTab('compare')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            activePreviewTab === 'compare'
                              ? 'bg-white dark:bg-[#1c1c1c] text-neutral-900 dark:text-white shadow-xs font-semibold'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Tool Compare
                        </button>
                      </div>
                    </div>

                    {/* Window Content Body */}
                    <div className="p-5 text-left">
                      {activePreviewTab === 'sandbox' ? (
                        <div className="space-y-4">
                          {/* Endpoint Route Bar */}
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800 font-mono text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                POST
                              </span>
                              <span className="text-neutral-800 dark:text-neutral-200 truncate">
                                /api/v1/qr
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSandboxExecuted(!sandboxExecuted)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors shadow-xs shrink-0"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{sandboxExecuted ? 'Reset' : 'Test'}</span>
                            </button>
                          </div>

                          {/* Request Payload */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                              <span>Request Parameters</span>
                              <button
                                type="button"
                                onClick={() => handleCopySnippet('{"text":"https://kruu.dev","size":256}')}
                                className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                              >
                                {hasCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="p-3 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                              <code>{`{\n  "text": "https://kruu.dev",\n  "size": 256,\n  "format": "svg"\n}`}</code>
                            </pre>
                          </div>

                          {/* Live Sandbox Result */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                              <span>Sandbox Response</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">200 OK</span>
                            </div>
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                              {sandboxExecuted ? (
                                <div className="space-y-1">
                                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    ✓ Payload validated successfully
                                  </div>
                                  <div className="text-neutral-500 dark:text-neutral-400 truncate">
                                    data:image/svg+xml;utf8,&lt;svg xmlns="http://www.w3.org/2000/svg"...
                                  </div>
                                </div>
                              ) : (
                                <div className="text-neutral-500 italic">
                                  Click "Test" to execute live sandbox request in browser.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 font-sans">
                          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono">
                            Side-by-Side Tool Comparison
                          </div>

                          <div className="space-y-2">
                            {[
                              { name: 'Stripe', category: 'Payments', model: 'Usage-based', freeTier: 'Yes' },
                              { name: 'Supabase', category: 'Database', model: 'Tiered / Open Source', freeTier: 'Yes' },
                              { name: 'Resend', category: 'Email API', model: 'Developer Tier', freeTier: 'Yes' },
                            ].map((tool, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-semibold text-neutral-900 dark:text-white">
                                    {tool.name}
                                  </div>
                                  <div className="text-[11px] text-neutral-500">
                                    {tool.category} • {tool.model}
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
                                  Free Tier: {tool.freeTier}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 text-[11px] text-neutral-500 flex items-center justify-between">
                            <span>Compare up to 3 tools simultaneously</span>
                            <Link to="/tools" className="text-[#0071e3] hover:underline font-medium">
                              Open Directory →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Window Footer Status */}
                    <div className="px-5 py-2.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/50 dark:bg-[#121212]/50 flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Interactive Sandbox Ready</span>
                      </span>
                      <span>Verified Documentation</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. PRODUCT OVERVIEW SECTION (Tool Discovery & API Marketplace) */}
        <section id="overview" className="scroll-mt-24 py-20 sm:py-28 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0071e3]">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Two Essential Engines for Developers.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Whether researching external software tools or integrating ready-to-test APIs into your product, Kruu gives you a clear path forward.
              </p>
            </div>

            {/* The Two Main Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Card 1: Tool Discovery */}
              <div className="group rounded-3xl border border-black/[0.08] dark:border-white/[0.08] p-8 sm:p-10 dark:bg-[#0c0c0c] bg-white flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Compass className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      Tool Discovery
                    </h3>
                    <p className="text-sm font-medium text-[#0071e3]">
                      Find and compare developer software.
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                      Explore a curated directory of tools for developer workflows, infrastructure, authentication, databases, and DevOps. Compare pricing tiers, deployment models, and feature matrices side by side.
                    </p>
                  </div>

                  {/* Representative Software Badges */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                      Featured in Directory
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Stripe', 'Supabase', 'Resend', 'Cloudflare', 'Postman', 'Mapbox'].map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium dark:bg-neutral-900 bg-neutral-100 border dark:border-neutral-800 border-neutral-200 text-neutral-700 dark:text-neutral-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <Link
                    to="/tools"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors group-hover:translate-x-1 duration-200"
                  >
                    <span>Browse Tool Directory</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Card 2: API Marketplace */}
              <div className="group rounded-3xl border border-black/[0.08] dark:border-white/[0.08] p-8 sm:p-10 dark:bg-[#0c0c0c] bg-white flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      API Marketplace
                    </h3>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Explore APIs and test them in live sandboxes.
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                      Browse production-ready microservices for QR generation, URL metadata extraction, JSON validation, and security utilities. Test endpoints directly in browser sandboxes before writing integration code.
                    </p>
                  </div>

                  {/* Representative API Badges */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                      Supported Microservices
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['QR Code Generator', 'URL Metadata Engine', 'JSON Validator', 'Card Validator', 'Password Utilities'].map((apiItem) => (
                        <span
                          key={apiItem}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium dark:bg-neutral-900 bg-neutral-100 border dark:border-neutral-800 border-neutral-200 text-neutral-700 dark:text-neutral-300"
                        >
                          {apiItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <Link
                    to="/api-market"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:opacity-90 transition-opacity group-hover:translate-x-1 duration-200"
                  >
                    <span>Explore API Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. COMPACT "HOW KRUU HELPS" SECTION */}
        <section className="py-20 sm:py-24 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                Workflow Benefits
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                How Kruu Helps Developers
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Built to eliminate friction at every stage of selecting and adopting developer tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 sm:p-7 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] dark:bg-[#0a0a0a] bg-neutral-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#0071e3] flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Discover useful developer software
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Find modern, vetted software across key developer categories without searching through dozens of disconnected blogs and provider websites.
                </p>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] dark:bg-[#0a0a0a] bg-neutral-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Compare tools before choosing one
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Evaluate software options side-by-side with clear breakdowns of feature sets, deployment types, and pricing models to make informed architecture decisions.
                </p>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] dark:bg-[#0a0a0a] bg-neutral-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Explore APIs and test supported endpoints
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Execute live requests directly from your browser in interactive sandboxes to confirm request formats and response structures before writing any client code.
                </p>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] dark:bg-[#0a0a0a] bg-neutral-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Manage API access and usage in one place
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Provision secure API keys, inspect usage telemetry, and manage your API entitlements through a simple, unified developer account.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 5. SMALL ABOUT US SECTION */}
        <section id="about-us" className="scroll-mt-24 py-20 sm:py-24 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0071e3]">
                About Us
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Why We Built Kruu
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              <p>
                Modern software development often requires navigating fragmented directories, outdated documentation, and disconnected service providers just to find and evaluate the tools you need.
              </p>
              <p>
                We created Kruu to bring clarity and convenience to that workflow. By combining software discovery with an API marketplace and interactive browser sandboxes, Kruu gives developers a single place to evaluate tools, test endpoints, and integrate services with less friction.
              </p>
              <p>
                Whether you are exploring tools for a new project or testing microservices for production, Kruu is focused on keeping developer ergonomics front and center.
              </p>
            </div>

          </div>
        </section>

        {/* 6. COMPACT CAREERS / WORK WITH US SECTION */}
        <section id="careers" className="scroll-mt-24 py-20 sm:py-24 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] p-8 sm:p-12 dark:bg-[#0c0c0c] bg-neutral-50/70 text-center space-y-6 shadow-sm">
              
              <div className="space-y-3 max-w-xl mx-auto">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Collaborate
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Want to Build with Kruu?
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  We're interested in connecting with developers, designers, and people who share our interest in building useful developer products. If you'd like to collaborate or explore working with us, get in touch.
                </p>
              </div>

              {/* 3 Explicit Email Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={workWithUsMailto}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Work With Us</span>
                </a>

                <a
                  href={technicalCollabMailto}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>Technical Collaboration</span>
                </a>

                <a
                  href={generalEnquiryMailto}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors shadow-sm"
                >
                  <span>General Enquiry</span>
                </a>
              </div>

              <div className="pt-2 text-xs text-neutral-500 font-mono">
                Opens your default email client addressed to <span className="text-neutral-800 dark:text-neutral-200">kruu.online@gmail.com</span>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* 7. MINIMAL PUBLIC FOOTER */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 dark:bg-black bg-white transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-0.5 overflow-hidden shadow-xs shrink-0">
              <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white font-sans text-sm">
              Kruu
            </span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs text-neutral-500">
              Developer Software Discovery & API Sandboxes
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400">
            <button
              type="button"
              onClick={() => scrollToSection('about-us')}
              className="hover:text-black dark:hover:text-white transition-colors focus:outline-none"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('careers')}
              className="hover:text-black dark:hover:text-white transition-colors focus:outline-none"
            >
              Careers
            </button>
            <Link to="/login" className="hover:text-black dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/signup" className="hover:text-black dark:hover:text-white transition-colors">
              Get Started
            </Link>
          </div>

          <div className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Kruu. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

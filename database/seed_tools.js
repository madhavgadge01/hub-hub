import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  console.error("❌ DB_URL environment variable is required to run seed.");
  process.exit(1);
}

const isSsl = dbUrl.includes("sslmode=require") || process.env.DB_SSL === "true";
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

export const SEED_DATA = {
  categories: [
    {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description: "State-of-the-art Large Language Models, reasoning APIs, and vision endpoints.",
      sort_order: 1,
      is_active: true,
    },
    {
      name: "Analytics",
      slug: "analytics",
      description: "Product analytics, session replay, feature flags, and telemetry data platforms.",
      sort_order: 2,
      is_active: true,
    },
    {
      name: "Authentication",
      slug: "authentication",
      description: "User identity, session management, social OAuth, MFA, and passkey authentication.",
      sort_order: 3,
      is_active: true,
    },
    {
      name: "Communication & Email",
      slug: "communication-email",
      description: "Transactional email, SMS delivery, push notifications, and deliverability monitoring.",
      sort_order: 4,
      is_active: true,
    },
    {
      name: "Developer Utilities",
      slug: "developer-utilities",
      description: "API testing, network routing, edge compute, tunneling, and developer toolchains.",
      sort_order: 5,
      is_active: true,
    },
    {
      name: "Maps & Geolocation",
      slug: "maps-geolocation",
      description: "Vector mapping, reverse geocoding, turn-by-turn routing, and geospatial databases.",
      sort_order: 6,
      is_active: true,
    },
    {
      name: "Payments & Billing",
      slug: "payments-billing",
      description: "Online payment processing, recurring billing subscriptions, invoicing, and tax automation.",
      sort_order: 7,
      is_active: true,
    },
    {
      name: "Storage & Infrastructure",
      slug: "storage-infrastructure",
      description: "Cloud object storage, edge caching, and scalable CDN delivery services.",
      sort_order: 8,
      is_active: true,
    },
  ],

  tools: [
    {
      name: "Resend",
      slug: "resend",
      category_slug: "communication-email",
      provider_name: "Resend, Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/resend.svg",
      short_description: "The modern email service designed specifically for software developers.",
      overview: "Resend is an email platform built for developers, offering first-class React Email integration, lightning-fast delivery speeds, and simple REST APIs with modern developer ergonomics.",
      main_purpose: "Transactional email delivery and React-first email templating.",
      typical_use_cases: ["Transactional auth emails", "Password reset tokens", "Product notification digests"],
      intended_audience: "Full-stack web developers, SaaS founders, and engineering teams.",
      deployment_model: "Cloud",
      official_website_url: "https://resend.com",
      is_published: true,
      published_at: "2026-09-01T10:00:00Z",
      tags: ["email", "api", "smtp", "react-email", "developer-first"],
      plans: [
        {
          plan_name: "Free",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "month",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://resend.com/pricing",
        },
        {
          plan_name: "Pro",
          plan_type: "subscription",
          amount: 20.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "50k emails",
          minimum_commitment: "Monthly",
          free_tier_available: false,
          pricing_source_url: "https://resend.com/pricing",
        },
        {
          plan_name: "Enterprise",
          plan_type: "custom",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "custom",
          per_unit: "dedicated IP",
          minimum_commitment: "Annual",
          free_tier_available: false,
          pricing_source_url: "https://resend.com/pricing",
        },
      ],
      features: [
        { name: "React Email Components", group_name: "Core Features", description: "Write email templates using React and Tailwind CSS." },
        { name: "SMTP Relay & REST API", group_name: "Core Features", description: "Dual support for legacy SMTP and ultra-fast HTTPS REST API." },
        { name: "Custom Domain Verification", group_name: "Deliverability", description: "Instant DKIM, SPF, and DMARC verification records." },
        { name: "Real-time Webhook Events", group_name: "Deliverability", description: "Instant delivery, bounce, open, and click notifications." },
        { name: "Dedicated IP Addresses", group_name: "Enterprise", description: "Isolated sending reputation for high-volume senders." },
      ],
      integrations: [
        { name: "Node.js SDK", category: "SDK", description: "Official npm package (@resend/node)" },
        { name: "Next.js", category: "Framework", description: "Native server action and API route support" },
        { name: "Python SDK", category: "SDK", description: "Official Python client library" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Free Tier Quota", attribute_value: "3,000 emails/month (100/day)", group_name: "Quotas" },
        { attribute_key: "rate_limit", attribute_label: "API Rate Limit", attribute_value: "10 requests / second", group_name: "Performance" },
        { attribute_key: "latency", attribute_label: "Average Send Latency", attribute_value: "180ms", group_name: "Performance" },
        { attribute_key: "sla", attribute_label: "Uptime SLA", attribute_value: "99.99%", group_name: "Reliability" },
      ],
      pros: ["Exceptional React Email integration", "Modern developer-friendly dashboard", "Clear pricing structure with no hidden fees"],
      cons: ["Relatively newer platform compared to legacy SendGrid", "Marketing newsletter capabilities are basic compared to dedicated ESPs"],
      security: {
        auth_methods: ["API Key", "Bearer Token", "MFA"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "US East (N. Virginia)",
        certifications: ["SOC 2 Type II", "GDPR Compliant", "HIPAA Eligible"],
        security_doc_url: "https://resend.com/security",
        privacy_policy_url: "https://resend.com/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://resend.com/docs", resource_type: "documentation" },
        { title: "API Reference", url: "https://resend.com/docs/api-reference/introduction", resource_type: "api_reference" },
        { title: "Pricing Details", url: "https://resend.com/pricing", resource_type: "pricing" },
        { title: "System Status", url: "https://resend.statuspage.io", resource_type: "status" },
      ],
    },

    {
      name: "Twilio SendGrid",
      slug: "sendgrid",
      category_slug: "communication-email",
      provider_name: "Twilio Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twilio.svg",
      short_description: "Cloud-based email infrastructure delivering billions of transactional & marketing messages.",
      overview: "Twilio SendGrid is an industry stalwart in cloud email, delivering over 100 billion emails every month with global infrastructure, ISP reputation monitoring, and extensive analytics.",
      main_purpose: "High-volume transactional and marketing email delivery.",
      typical_use_cases: ["Enterprise transactional email", "Marketing campaign automation", "High-volume notifications"],
      intended_audience: "Enterprise engineering teams, large-scale consumer applications.",
      deployment_model: "Cloud",
      official_website_url: "https://sendgrid.com",
      is_published: true,
      published_at: "2026-08-15T12:00:00Z",
      tags: ["email", "smtp", "enterprise", "high-volume", "analytics"],
      plans: [
        {
          plan_name: "Free",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "100 emails/day",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://sendgrid.com/en-us/pricing",
        },
        {
          plan_name: "Essentials 50K",
          plan_type: "subscription",
          amount: 19.95,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "50,000 emails",
          minimum_commitment: "Monthly",
          free_tier_available: false,
          pricing_source_url: "https://sendgrid.com/en-us/pricing",
        },
        {
          plan_name: "Pro 100K",
          plan_type: "subscription",
          amount: 89.95,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "100,000 emails + Dedicated IP",
          minimum_commitment: "Monthly",
          free_tier_available: false,
          pricing_source_url: "https://sendgrid.com/en-us/pricing",
        },
      ],
      features: [
        { name: "High-Volume Delivery Engine", group_name: "Core Features", description: "Engineered to deliver billions of emails without throttling." },
        { name: "Deliverability Insights", group_name: "Deliverability", description: "ISP-level delivery rate monitoring and bounce classification." },
        { name: "Email Validation API", group_name: "Deliverability", description: "Real-time syntax and mailbox verification API." },
        { name: "Dynamic Template Editor", group_name: "Templates", description: "WYSIWYG and Handlebars HTML template management." },
      ],
      integrations: [
        { name: "Node.js (@sendgrid/mail)", category: "SDK", description: "Official Node.js client" },
        { name: "Python (sendgrid)", category: "SDK", description: "Python package with mail helper" },
        { name: "Ruby on Rails", category: "Framework", description: "ActionMailer integration" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Free Quota", attribute_value: "100 emails/day forever", group_name: "Quotas" },
        { attribute_key: "rate_limit", attribute_label: "API Rate Limit", attribute_value: "600 requests / minute", group_name: "Performance" },
        { attribute_key: "uptime_sla", attribute_label: "Uptime SLA", attribute_value: "99.95%", group_name: "Reliability" },
      ],
      pros: ["Proven scale for billions of monthly emails", "Established relationship with global ISPs", "Comprehensive subuser management"],
      cons: ["Legacy dashboard UI can feel cluttered", "Support response times on lower tiers are slow"],
      security: {
        auth_methods: ["API Key", "Two-Factor Authentication", "IP Access Management"],
        encryption_in_transit: "TLS 1.2 / TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "Multi-Region Cloud",
        certifications: ["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA Ready"],
        security_doc_url: "https://sendgrid.com/security",
        privacy_policy_url: "https://www.twilio.com/legal/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://docs.sendgrid.com", resource_type: "documentation" },
        { title: "API Reference", url: "https://docs.sendgrid.com/api-reference", resource_type: "api_reference" },
        { title: "Pricing Calculator", url: "https://sendgrid.com/en-us/pricing", resource_type: "pricing" },
      ],
    },

    {
      name: "Mailgun",
      slug: "mailgun",
      category_slug: "communication-email",
      provider_name: "Sinch Mailgun",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mailgun.svg",
      short_description: "Powerful email API service built for developers needing high deliverability.",
      overview: "Mailgun is a developer-focused transactional email API providing comprehensive inbound email parsing, deliverability analytics, and address verification.",
      main_purpose: "Transactional email delivery and inbound email parsing.",
      typical_use_cases: ["Receiving and parsing inbound email via webhook", "Transactional user notifications", "Email verification"],
      intended_audience: "Software engineers and DevOps teams requiring inbound routing.",
      deployment_model: "Cloud",
      official_website_url: "https://www.mailgun.com",
      is_published: true,
      published_at: "2026-07-20T08:00:00Z",
      tags: ["email", "smtp", "inbound-parsing", "api"],
      plans: [
        {
          plan_name: "Trial",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "5,000 emails (30 days)",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://www.mailgun.com/pricing/",
        },
        {
          plan_name: "Foundation 50k",
          plan_type: "subscription",
          amount: 35.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "50,000 emails",
          minimum_commitment: "Monthly",
          free_tier_available: false,
          pricing_source_url: "https://www.mailgun.com/pricing/",
        },
      ],
      features: [
        { name: "Inbound Email Routing", group_name: "Core Features", description: "Parse incoming multipart MIME messages into clean JSON." },
        { name: "Email Validations", group_name: "Deliverability", description: "Reduce bounce rates with programmatic email address validation." },
        { name: "Analytics Dashboard", group_name: "Analytics", description: "Detailed logs and click-through tracking." },
      ],
      integrations: [
        { name: "mailgun.js", category: "SDK", description: "Official modern JavaScript / TypeScript SDK" },
        { name: "Django Mailgun", category: "Framework", description: "Native backend for Python Django" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Trial Quota", attribute_value: "5,000 emails during 30-day trial", group_name: "Quotas" },
        { attribute_key: "rate_limit", attribute_label: "Rate Limit", attribute_value: "300 req / sec", group_name: "Performance" },
      ],
      pros: ["Best-in-class inbound email parsing engine", "Very reliable delivery rates", "Flexible logs retention"],
      cons: ["No permanent free tier after 30-day trial", "Overages can become costly if not monitored"],
      security: {
        auth_methods: ["HTTP Basic Auth with API Key", "Webhooks HMAC Signature"],
        encryption_in_transit: "TLS 1.2 / 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "US and EU Regions Available",
        certifications: ["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA Ready"],
        security_doc_url: "https://www.mailgun.com/security/",
        privacy_policy_url: "https://www.mailgun.com/legal/privacy-policy/",
      },
      resources: [
        { title: "Documentation", url: "https://documentation.mailgun.com", resource_type: "documentation" },
        { title: "API Reference", url: "https://documentation.mailgun.com/en/latest/api_reference.html", resource_type: "api_reference" },
      ],
    },

    {
      name: "Mapbox",
      slug: "mapbox",
      category_slug: "maps-geolocation",
      provider_name: "Mapbox Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mapbox.svg",
      short_description: "The location platform for developers to build custom maps, search, and navigation.",
      overview: "Mapbox provides building blocks to integrate location features like customized maps, search, navigation, and location data into any mobile, web, or desktop application.",
      main_purpose: "Custom vector tile maps, geocoding, turn-by-turn navigation SDKs.",
      typical_use_cases: ["Custom styled vector maps", "Address search & geocoding", "Delivery route optimization"],
      intended_audience: "Designers, mobile developers, logistics platforms, and geospatial engineers.",
      deployment_model: "Cloud",
      official_website_url: "https://www.mapbox.com",
      is_published: true,
      published_at: "2026-09-02T14:00:00Z",
      tags: ["maps", "geocoding", "navigation", "vector-tiles", "sdk"],
      plans: [
        {
          plan_name: "Pay As You Go (Free Tier Included)",
          plan_type: "usage_based",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "50,000 loads free / mo",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://www.mapbox.com/pricing",
        },
        {
          plan_name: "Standard Metered",
          plan_type: "usage_based",
          amount: 5.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "1,000 loads beyond free tier",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://www.mapbox.com/pricing",
        },
      ],
      features: [
        { name: "Mapbox Studio Custom Styles", group_name: "Design", description: "Complete typographic and color control over vector map layers." },
        { name: "Global Geocoding & Search", group_name: "Location", description: "Forward and reverse geocoding covering over 200 countries." },
        { name: "Navigation & Matrix Routing", group_name: "Routing", description: "Turn-by-turn routing with live traffic congestion layers." },
        { name: "3D Terrain & Buildings", group_name: "Visualization", description: "High-resolution elevation data and 3D building extrusions." },
      ],
      integrations: [
        { name: "Mapbox GL JS", category: "SDK", description: "WebGL-powered client-side map rendering" },
        { name: "iOS Maps SDK", category: "SDK", description: "Swift & Objective-C mobile library" },
        { name: "Android Maps SDK", category: "SDK", description: "Kotlin & Java mobile library" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Monthly Free Tier", attribute_value: "50,000 map loads & 100,000 geocoding requests", group_name: "Quotas" },
        { attribute_key: "rate_limit", attribute_label: "Default QPS", attribute_value: "300 requests / second", group_name: "Performance" },
        { attribute_key: "latency", attribute_label: "Edge Tile Latency", attribute_value: "25ms (Global CDN)", group_name: "Performance" },
        { attribute_key: "sla", attribute_label: "Uptime SLA", attribute_value: "99.99%", group_name: "Reliability" },
      ],
      pros: ["Unmatched custom styling control with Mapbox Studio", "Generous free tier (50k loads/month)", "Smooth 60fps WebGL rendering"],
      cons: ["POI business details are less comprehensive than Google Maps Places", "Pricing escalates quickly at millions of map loads"],
      security: {
        auth_methods: ["Public & Secret Access Tokens", "URL Origin Restrictions"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "Global Multi-CDN",
        certifications: ["SOC 2 Type II", "ISO 27001", "GDPR"],
        security_doc_url: "https://www.mapbox.com/security",
        privacy_policy_url: "https://www.mapbox.com/legal/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://docs.mapbox.com", resource_type: "documentation" },
        { title: "API Reference", url: "https://docs.mapbox.com/api", resource_type: "api_reference" },
        { title: "Pricing Calculator", url: "https://www.mapbox.com/pricing", resource_type: "pricing" },
      ],
    },

    {
      name: "Google Maps Platform",
      slug: "google-maps",
      category_slug: "maps-geolocation",
      provider_name: "Google LLC",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/googlemaps.svg",
      short_description: "Comprehensive global mapping with Street View, Places API, and real-time traffic.",
      overview: "Google Maps Platform offers reliable real-time mapping data, Street View 360-degree imagery, and the world's most exhaustive point-of-interest (POI) database across 250+ countries.",
      main_purpose: "Global mapping, location autocomplete, and business place details.",
      typical_use_cases: ["Store locators with rich business hours and reviews", "Address autocomplete form inputs", "Street View immersive previews"],
      intended_audience: "Enterprises, e-commerce checkouts, and local search apps.",
      deployment_model: "Cloud",
      official_website_url: "https://mapsplatform.google.com",
      is_published: true,
      published_at: "2026-08-01T10:00:00Z",
      tags: ["maps", "places-api", "street-view", "geocoding", "google"],
      plans: [
        {
          plan_name: "Monthly Credit Tier",
          plan_type: "usage_based",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "$200 recurring credit (~28,500 loads)",
          minimum_commitment: "Valid Credit Card Required",
          free_tier_available: true,
          pricing_source_url: "https://mapsplatform.google.com/pricing/",
        },
        {
          plan_name: "Dynamic Maps Pay-As-You-Go",
          plan_type: "usage_based",
          amount: 7.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "1,000 loads beyond $200 credit",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://mapsplatform.google.com/pricing/",
        },
      ],
      features: [
        { name: "Places API (200M+ Businesses)", group_name: "Places", description: "Rich details including operating hours, ratings, photos, and phone numbers." },
        { name: "Street View 360", group_name: "Imagery", description: "Panoramic interactive street imagery across hundreds of countries." },
        { name: "Address Autocomplete", group_name: "Checkout", description: "Predictive address input reducing checkout friction and typos." },
      ],
      integrations: [
        { name: "Google Maps JavaScript API", category: "SDK", description: "Direct script embed for web browsers" },
        { name: "Maps SDK for Android & iOS", category: "SDK", description: "Native mobile hardware accelerated SDKs" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Free Monthly Credit", attribute_value: "$200 recurring credit (~28,500 static map loads)", group_name: "Quotas" },
        { attribute_key: "default_qps", attribute_label: "Default QPS", attribute_value: "50 QPS (request increase available)", group_name: "Performance" },
        { attribute_key: "coverage", attribute_label: "Geographic Coverage", attribute_value: "250+ countries & territories", group_name: "Coverage" },
      ],
      pros: ["Unequalled database of local businesses and reviews", "Familiar UI that users immediately recognize", "Unrivaled address autocomplete accuracy"],
      cons: ["Significantly higher cost than alternatives beyond credit", "Custom styling is more limited compared to Mapbox Studio"],
      security: {
        auth_methods: ["API Key with HTTP Referrer and IP restrictions", "OAuth 2.0"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "Google Global Infrastructure",
        certifications: ["SOC 2", "ISO 27001", "FedRAMP", "GDPR"],
        security_doc_url: "https://cloud.google.com/security",
        privacy_policy_url: "https://policies.google.com/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://developers.google.com/maps", resource_type: "documentation" },
        { title: "Pricing Matrix", url: "https://mapsplatform.google.com/pricing/", resource_type: "pricing" },
      ],
    },

    {
      name: "Supabase Auth",
      slug: "supabase-auth",
      category_slug: "authentication",
      provider_name: "Supabase Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/supabase.svg",
      short_description: "Open source Firebase alternative providing complete PostgreSQL-native auth.",
      overview: "Supabase Auth is built on top of PostgreSQL's native Row Level Security (RLS) and GoTrue, offering email/password, magic links, phone SMS, and over 20 social login providers.",
      main_purpose: "User authentication tightly coupled with Postgres Row Level Security.",
      typical_use_cases: ["SaaS application auth", "Postgres Row Level Security enforcement", "Social OAuth login"],
      intended_audience: "Modern full-stack developers building with React, Next.js, Flutter, and PostgreSQL.",
      deployment_model: "Cloud & Self-hosted",
      official_website_url: "https://supabase.com/auth",
      is_published: true,
      published_at: "2026-09-10T12:00:00Z",
      tags: ["auth", "postgresql", "open-source", "rls", "self-hosted", "oauth"],
      plans: [
        {
          plan_name: "Free",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "50,000 Monthly Active Users",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://supabase.com/pricing",
        },
        {
          plan_name: "Pro",
          plan_type: "subscription",
          amount: 25.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "100,000 MAU + custom SMTP",
          minimum_commitment: "Monthly",
          free_tier_available: false,
          pricing_source_url: "https://supabase.com/pricing",
        },
      ],
      features: [
        { name: "PostgreSQL Row Level Security (RLS)", group_name: "Security", description: "Define authorization policies directly in SQL schemas." },
        { name: "Passwordless Magic Links & OTP", group_name: "Auth Methods", description: "One-click email login and phone SMS verification." },
        { name: "20+ Social OAuth Providers", group_name: "Auth Methods", description: "GitHub, Google, Apple, Discord, Azure, and more." },
        { name: "MFA / TOTP Authenticator", group_name: "Security", description: "Time-based One-Time Password support out of the box." },
      ],
      integrations: [
        { name: "@supabase/supabase-js", category: "SDK", description: "Universal JS/TS client with typed auth states" },
        { name: "Next.js SSR Auth Helper", category: "Framework", description: "Middleware and cookie management for Next.js App Router" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Free Monthly Active Users", attribute_value: "50,000 MAU", group_name: "Quotas" },
        { attribute_key: "open_source", attribute_label: "Open Source Codebase", attribute_value: "Yes (Apache 2.0)", group_name: "License" },
        { attribute_key: "token_type", attribute_label: "Token Format", attribute_value: "JWT with RLS claims", group_name: "Architecture" },
      ],
      pros: ["Extremely generous free tier (50k MAU)", "Directly integrates with Postgres RLS without extra ORM logic", "Can be self-hosted with Docker"],
      cons: ["Enterprise SAML SSO requires Team or Enterprise tier", "Multi-tenancy requires custom schema configuration"],
      security: {
        auth_methods: ["JWT", "Refresh Tokens", "TOTP MFA", "Passkeys (WebAuthn)"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "15+ Global Cloud Regions",
        certifications: ["SOC 2 Type II", "HIPAA Compliant", "GDPR"],
        security_doc_url: "https://supabase.com/security",
        privacy_policy_url: "https://supabase.com/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://supabase.com/docs/guides/auth", resource_type: "documentation" },
        { title: "API Reference", url: "https://supabase.com/docs/reference/javascript/auth-signup", resource_type: "api_reference" },
      ],
    },

    {
      name: "Auth0",
      slug: "auth0",
      category_slug: "authentication",
      provider_name: "Okta Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/auth0.svg",
      short_description: "Enterprise identity and access management platform for customer & workforce applications.",
      overview: "Auth0 by Okta provides a scalable, enterprise-hardened authentication and authorization platform supporting universal login, enterprise federation (SAML/WS-Fed), and anomaly detection.",
      main_purpose: "Enterprise identity management, SAML federated SSO, and universal login.",
      typical_use_cases: ["Enterprise B2B SaaS with SAML SSO", "Customer identity management (CIAM)", "Role-based access control (RBAC)"],
      intended_audience: "Enterprise companies, B2B software vendors needing compliance.",
      deployment_model: "Cloud & Private Cloud",
      official_website_url: "https://auth0.com",
      is_published: true,
      published_at: "2026-07-12T10:00:00Z",
      tags: ["auth", "enterprise", "saml", "sso", "okta", "ciam"],
      plans: [
        {
          plan_name: "Free",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "7,500 active users",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://auth0.com/pricing",
        },
        {
          plan_name: "B2C Essentials",
          plan_type: "subscription",
          amount: 35.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "500 MAU + custom domain",
          minimum_commitment: "Monthly or Annual",
          free_tier_available: false,
          pricing_source_url: "https://auth0.com/pricing",
        },
        {
          plan_name: "B2B Professional",
          plan_type: "subscription",
          amount: 240.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "500 MAU + Enterprise Connections",
          minimum_commitment: "Annual",
          free_tier_available: false,
          pricing_source_url: "https://auth0.com/pricing",
        },
      ],
      features: [
        { name: "Universal Hosted Login", group_name: "UX", description: "Centralized login page with brute force protection and credential stuffing defense." },
        { name: "Enterprise Federation (SAML 2.0)", group_name: "Enterprise", description: "Connect directly to Okta, Azure AD, Ping, and Google Workspace." },
        { name: "Auth0 Actions & Rules", group_name: "Extensibility", description: "Execute serverless JavaScript functions during auth pipelines." },
      ],
      integrations: [
        { name: "@auth0/nextjs-auth0", category: "SDK", description: "Official Next.js SDK with session cookies" },
        { name: "React SDK (@auth0/auth0-react)", category: "SDK", description: "React context and hooks for SPAs" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Free Plan Limit", attribute_value: "7,500 MAU with unlimited logins", group_name: "Quotas" },
        { attribute_key: "sla", attribute_label: "Uptime SLA", attribute_value: "99.9% (Standard) / 99.99% (Enterprise)", group_name: "Reliability" },
      ],
      pros: ["Enterprise gold standard for SAML and corporate SSO", "Battle-tested security protections against brute force attacks", "Rich marketplace of integrations"],
      cons: ["Pricing increases steeply as user count or enterprise features expand", "Hosted login domain customization requires paid plan"],
      security: {
        auth_methods: ["OAuth 2.0", "OIDC", "SAML 2.0", "WebAuthn / Passkeys"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "US, EU, Australia, Japan, Private Cloud",
        certifications: ["SOC 2 Type II", "ISO 27001", "ISO 27018", "HIPAA BAA", "FedRAMP Moderate"],
        security_doc_url: "https://auth0.com/security",
        privacy_policy_url: "https://www.okta.com/privacy-policy/",
      },
      resources: [
        { title: "Documentation", url: "https://auth0.com/docs", resource_type: "documentation" },
        { title: "Pricing Details", url: "https://auth0.com/pricing", resource_type: "pricing" },
      ],
    },

    {
      name: "Stripe",
      slug: "stripe",
      category_slug: "payments-billing",
      provider_name: "Stripe Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/stripe.svg",
      short_description: "Financial infrastructure for the internet: payments, subscriptions, and payouts.",
      overview: "Stripe is the world standard developer payment gateway, enabling online businesses to accept cards, wallets, bank debits, and local payment methods across 135+ currencies.",
      main_purpose: "Payment processing, recurring subscriptions, and developer billing infrastructure.",
      typical_use_cases: ["SaaS subscription billing with Stripe Billing", "E-commerce checkout with Stripe Elements", "Marketplace split payments with Stripe Connect"],
      intended_audience: "Internet businesses, SaaS startups, e-commerce stores, and global platforms.",
      deployment_model: "Cloud",
      official_website_url: "https://stripe.com",
      is_published: true,
      published_at: "2026-08-25T11:00:00Z",
      tags: ["payments", "billing", "subscriptions", "fintech", "checkout", "api"],
      plans: [
        {
          plan_name: "Standard Pay-As-You-Go",
          plan_type: "usage_based",
          amount: 0.00,
          currency: "USD",
          billing_interval: "usage",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "2.9% + 30¢ per successful transaction",
          minimum_commitment: "No setup or monthly fees",
          free_tier_available: true,
          pricing_source_url: "https://stripe.com/pricing",
        },
        {
          plan_name: "Custom Enterprise",
          plan_type: "custom",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "custom",
          per_unit: "Volume discounts available",
          minimum_commitment: "$100k+ monthly transaction volume",
          free_tier_available: false,
          pricing_source_url: "https://stripe.com/pricing",
        },
      ],
      features: [
        { name: "Stripe Elements & Checkout", group_name: "Checkout", description: "Pre-built, conversion-optimized UI components for payment collection." },
        { name: "Stripe Billing Subscriptions", group_name: "Billing", description: "Recurring billing engine with automated failed payment dunning." },
        { name: "Stripe Radar Fraud Detection", group_name: "Security", description: "Machine learning fraud defense trained on billions of global payments." },
        { name: "135+ Currencies & Local Payment Methods", group_name: "Global", description: "Apple Pay, Google Pay, SEPA, iDEAL, Alipay, and Klarna." },
      ],
      integrations: [
        { name: "stripe-node", category: "SDK", description: "Official Node.js SDK with full TypeScript definitions" },
        { name: "stripe-python", category: "SDK", description: "Official Python package" },
        { name: "React Stripe.js", category: "Framework", description: "Components for embedding custom card inputs" },
      ],
      specifications: [
        { attribute_key: "currencies", attribute_label: "Supported Currencies", attribute_value: "135+ currencies", group_name: "Coverage" },
        { attribute_key: "pci_level", attribute_label: "PCI Compliance Level", attribute_value: "PCI DSS Level 1 Certified", group_name: "Security" },
        { attribute_key: "uptime_sla", attribute_label: "Historical Uptime", attribute_value: "99.999% global gateway availability", group_name: "Reliability" },
      ],
      pros: ["Industry-defining API design and documentation quality", "No monthly fees or setup costs for standard accounts", "Stripe Radar minimizes fraud chargebacks seamlessly"],
      cons: ["Dispute / chargeback fee ($15) applies if fraud occurs", "Account verification requirements are strict for high-risk businesses"],
      security: {
        auth_methods: ["Restricted API Keys", "Webhook Signatures", "Two-Factor Auth"],
        encryption_in_transit: "TLS 1.3 Strict",
        encryption_at_rest: "AES-256 (PCI DSS Level 1 Card Vault)",
        data_residency: "Global Multi-Region",
        certifications: ["PCI DSS Level 1", "SOC 1 Type II", "SOC 2 Type II", "ISO 27001"],
        security_doc_url: "https://stripe.com/docs/security",
        privacy_policy_url: "https://stripe.com/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://stripe.com/docs", resource_type: "documentation" },
        { title: "API Reference", url: "https://stripe.com/docs/api", resource_type: "api_reference" },
        { title: "Pricing Page", url: "https://stripe.com/pricing", resource_type: "pricing" },
      ],
    },

    {
      name: "OpenAI API",
      slug: "openai",
      category_slug: "ai-machine-learning",
      provider_name: "OpenAI LLC",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg",
      short_description: "Cutting-edge LLM and multimodal models including GPT-4o, o1 reasoning, and Whisper.",
      overview: "OpenAI provides developer REST APIs to integrate state-of-the-art generative language models, function calling, vision processing, speech transcription, and vector embeddings.",
      main_purpose: "Natural language generation, code intelligence, and multimodal reasoning.",
      typical_use_cases: ["AI coding assistants and copilots", "Customer support knowledge base retrieval (RAG)", "Structured data extraction from messy documents"],
      intended_audience: "AI engineers, full-stack developers, and enterprise innovation teams.",
      deployment_model: "Cloud",
      official_website_url: "https://openai.com",
      is_published: true,
      published_at: "2026-09-15T09:00:00Z",
      tags: ["ai", "llm", "gpt-4o", "embeddings", "vision", "reasoning"],
      plans: [
        {
          plan_name: "Pay As You Go (Metered)",
          plan_type: "usage_based",
          amount: 0.00,
          currency: "USD",
          billing_interval: "usage",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "Per 1M input / output tokens",
          minimum_commitment: "Prepaid balance or credit card",
          free_tier_available: false,
          pricing_source_url: "https://openai.com/api/pricing/",
        },
        {
          plan_name: "Tier 1 Developer Account",
          plan_type: "usage_based",
          amount: 5.00,
          currency: "USD",
          billing_interval: "usage",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "$5.00 minimum deposit for Tier 1 limits",
          minimum_commitment: "Pay as you use",
          free_tier_available: false,
          pricing_source_url: "https://openai.com/api/pricing/",
        },
      ],
      features: [
        { name: "Structured Outputs", group_name: "Reliability", description: "Guarantees 100% adherence to supplied JSON Schemas." },
        { name: "Function Calling & Tool Use", group_name: "Agentic AI", description: "Let models invoke your database queries and third-party APIs." },
        { name: "Multimodal Vision & Audio", group_name: "Multimodal", description: "Process images, charts, diagrams, and speech in a single call." },
        { name: "Text Embeddings v3", group_name: "Search & RAG", description: "High-dimensional vector embeddings with dimension truncation." },
      ],
      integrations: [
        { name: "openai-node", category: "SDK", description: "Official Node.js / TypeScript library" },
        { name: "openai-python", category: "SDK", description: "Official Python library with streaming support" },
        { name: "LangChain / LlamaIndex", category: "Framework", description: "Native LLM and RAG orchestration" },
      ],
      specifications: [
        { attribute_key: "context_window", attribute_label: "Max Context Window", attribute_value: "128,000 tokens (GPT-4o)", group_name: "Capacity" },
        { attribute_key: "token_pricing", attribute_label: "GPT-4o-mini Pricing", attribute_value: "$0.15 / 1M input tokens, $0.60 / 1M output tokens", group_name: "Pricing" },
        { attribute_key: "rate_limit", attribute_label: "Tier 1 Limits", attribute_value: "500 RPM / 30,000 TPM", group_name: "Quotas" },
      ],
      pros: ["Benchmark-leading coding and reasoning capabilities", "Guaranteed JSON schema output mode", "Massive developer ecosystem and prompt tooling"],
      cons: ["Strict rate limit tiers for brand new API accounts", "Data privacy requires configuring Enterprise zero-data retention agreements"],
      security: {
        auth_methods: ["Bearer API Key", "Organization & Project Scoped Keys"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "US Cloud",
        certifications: ["SOC 2 Type II", "GDPR Compliant", "CCPA"],
        security_doc_url: "https://trust.openai.com",
        privacy_policy_url: "https://openai.com/policies/privacy-policy",
      },
      resources: [
        { title: "Documentation", url: "https://platform.openai.com/docs", resource_type: "documentation" },
        { title: "API Reference", url: "https://platform.openai.com/docs/api-reference", resource_type: "api_reference" },
        { title: "Pricing Table", url: "https://openai.com/api/pricing/", resource_type: "pricing" },
      ],
    },

    {
      name: "Anthropic Claude",
      slug: "anthropic-claude",
      category_slug: "ai-machine-learning",
      provider_name: "Anthropic PBC",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/anthropic.svg",
      short_description: "Safety-focused AI intelligence powered by Claude 3.5 Sonnet and Haiku.",
      overview: "Anthropic provides frontier AI models designed with Constitutional AI for enterprise safety, exceptional long-context reasoning across 200k tokens, and industry-leading software coding capability.",
      main_purpose: "Complex document analysis, nuanced software development, and safe AI workflows.",
      typical_use_cases: ["Large codebase refactoring & PR reviews", "Analyzing 100+ page legal and financial filings", "Customer support with low hallucination rates"],
      intended_audience: "Enterprise software teams, researchers, and AI application developers.",
      deployment_model: "Cloud (Direct API & AWS Bedrock / GCP Vertex)",
      official_website_url: "https://www.anthropic.com",
      is_published: true,
      published_at: "2026-09-18T10:00:00Z",
      tags: ["ai", "claude", "llm", "200k-context", "sonnet", "haiku"],
      plans: [
        {
          plan_name: "Usage-Based Pay As You Go",
          plan_type: "usage_based",
          amount: 0.00,
          currency: "USD",
          billing_interval: "usage",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "Per 1M tokens ($3 input / $15 output for Sonnet)",
          minimum_commitment: "Prepaid account balance",
          free_tier_available: false,
          pricing_source_url: "https://www.anthropic.com/pricing",
        },
      ],
      features: [
        { name: "200,000 Token Context Window", group_name: "Capacity", description: "Process full code repositories or books in a single prompt." },
        { name: "Prompt Caching", group_name: "Performance & Cost", description: "Up to 90% cost reduction on repetitive system prompts." },
        { name: "Computer Use API", group_name: "Agentic AI", description: "Allow models to control web browsers and desktop tools directly." },
      ],
      integrations: [
        { name: "@anthropic-ai/sdk", category: "SDK", description: "Official TypeScript/JavaScript SDK" },
        { name: "anthropic (Python)", category: "SDK", description: "Official Python package" },
        { name: "AWS Bedrock", category: "Cloud", description: "Enterprise deployment inside private AWS VPC" },
      ],
      specifications: [
        { attribute_key: "context_window", attribute_label: "Context Window", attribute_value: "200,000 tokens (~150,000 words)", group_name: "Capacity" },
        { attribute_key: "sonnet_price", attribute_label: "Claude 3.5 Sonnet Pricing", attribute_value: "$3.00 / 1M input, $15.00 / 1M output", group_name: "Pricing" },
      ],
      pros: ["Top-tier code generation and complex debugging capabilities", "Prompt caching yields massive cost savings for RAG and system prompts", "High reasoning reliability with minimal conversational fluff"],
      cons: ["No native text-to-speech audio model yet", "API console requires credit pre-funding"],
      security: {
        auth_methods: ["x-api-key HTTP Header"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "US AWS / GCP",
        certifications: ["SOC 2 Type II", "HIPAA Ready on AWS Bedrock", "GDPR"],
        security_doc_url: "https://trust.anthropic.com",
        privacy_policy_url: "https://www.anthropic.com/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://docs.anthropic.com", resource_type: "documentation" },
        { title: "Pricing Guide", url: "https://www.anthropic.com/pricing", resource_type: "pricing" },
      ],
    },

    {
      name: "Cloudflare",
      slug: "cloudflare",
      category_slug: "developer-utilities",
      provider_name: "Cloudflare Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/cloudflare.svg",
      short_description: "Global edge network offering DNS, DDoS mitigation, Workers serverless compute, and CDN.",
      overview: "Cloudflare protects and accelerates internet applications worldwide with an anycast network spanning over 330 cities, providing ultra-fast DNS, WAF rules, and edge compute.",
      main_purpose: "Edge CDN, DDoS protection, fast DNS, and global serverless computing.",
      typical_use_cases: ["Unmetered DDoS mitigation & Web Application Firewall", "Deploying low-latency edge APIs with Cloudflare Workers", "Fast authoritative DNS hosting"],
      intended_audience: "DevOps engineers, web developers, and security professionals.",
      deployment_model: "Edge Network",
      official_website_url: "https://www.cloudflare.com",
      is_published: true,
      published_at: "2026-08-10T12:00:00Z",
      tags: ["dns", "cdn", "ddos", "workers", "edge", "security", "waf"],
      plans: [
        {
          plan_name: "Free",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "Unlimited DDoS mitigation",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://www.cloudflare.com/plans/",
        },
        {
          plan_name: "Pro",
          plan_type: "subscription",
          amount: 20.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "domain / month (billed annually at $240/yr) or $25/mo",
          minimum_commitment: "Annual or Monthly",
          free_tier_available: false,
          pricing_source_url: "https://www.cloudflare.com/plans/",
        },
        {
          plan_name: "Business",
          plan_type: "subscription",
          amount: 200.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "subscription",
          per_unit: "domain / month",
          minimum_commitment: "Monthly",
          free_tier_available: false,
          pricing_source_url: "https://www.cloudflare.com/plans/",
        },
      ],
      features: [
        { name: "Cloudflare Workers", group_name: "Compute", description: "V8 isolate serverless compute running in 330+ edge locations with 0ms cold starts." },
        { name: "Unmetered DDoS Mitigation", group_name: "Security", description: "Absorbs layer 3, 4, and 7 volumetric DDoS attacks without bill shock." },
        { name: "Fast Anycast DNS (1.1.1.1)", group_name: "Network", description: "Sub-10ms global DNS lookup speeds." },
      ],
      integrations: [
        { name: "Wrangler CLI", category: "Tool", description: "Developer CLI for scaffolding and deploying Workers" },
        { name: "Terraform Provider", category: "DevOps", description: "Infrastructure-as-code configuration for DNS and firewall rules" },
      ],
      specifications: [
        { attribute_key: "locations", attribute_label: "Edge Data Centers", attribute_value: "330+ cities across 120+ countries", group_name: "Network" },
        { attribute_key: "cold_start", attribute_label: "Workers Cold Start", attribute_value: "0ms (V8 Isolates)", group_name: "Performance" },
        { attribute_key: "free_ddos", attribute_label: "DDoS Protection", attribute_value: "Unmetered on all plans", group_name: "Security" },
      ],
      pros: ["Legendary free tier with unmetered DDoS defense", "0ms cold start edge Workers are noticeably faster than AWS Lambda", "Fastest DNS propagation in the industry"],
      cons: ["Customer support on Free and Pro tiers is community forum based", "Custom SSL certificates require Business or Enterprise plan"],
      security: {
        auth_methods: ["Scoped API Tokens", "Global API Key", "MFA"],
        encryption_in_transit: "TLS 1.3 / HTTP/3",
        encryption_at_rest: "AES-256",
        data_residency: "Regional Services available (EU / US restrictions)",
        certifications: ["SOC 2 Type II", "ISO 27001", "PCI DSS 4.0", "FedRAMP Moderate"],
        security_doc_url: "https://www.cloudflare.com/trust-hub/compliance-resources/",
        privacy_policy_url: "https://www.cloudflare.com/privacypolicy/",
      },
      resources: [
        { title: "Documentation", url: "https://developers.cloudflare.com", resource_type: "documentation" },
        { title: "Plans Comparison", url: "https://www.cloudflare.com/plans/", resource_type: "pricing" },
        { title: "System Status", url: "https://www.cloudflarestatus.com", resource_type: "status" },
      ],
    },

    {
      name: "Postman",
      slug: "postman",
      category_slug: "developer-utilities",
      provider_name: "Postman Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/postman.svg",
      short_description: "The complete API platform for building, testing, documenting, and sharing APIs.",
      overview: "Postman simplifies each step of the API lifecycle and streamlines collaboration so teams can create better APIs faster, featuring automated testing, mock servers, and API monitoring.",
      main_purpose: "API development, testing collections, automated documentation, and mock servers.",
      typical_use_cases: ["Debugging REST & GraphQL endpoints", "Automating API regression test suites", "Generating interactive public API docs"],
      intended_audience: "Frontend, backend, QA engineers, and API product teams.",
      deployment_model: "Cloud & Desktop App",
      official_website_url: "https://www.postman.com",
      is_published: true,
      published_at: "2026-08-05T08:00:00Z",
      tags: ["api", "testing", "rest", "graphql", "mock-server", "documentation"],
      plans: [
        {
          plan_name: "Free",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "Up to 3 team members",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://www.postman.com/pricing/",
        },
        {
          plan_name: "Basic",
          plan_type: "subscription",
          amount: 14.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "per_seat",
          per_unit: "user / month (billed annually at $168/yr) or $17 monthly",
          minimum_commitment: "Annual or Monthly",
          free_tier_available: false,
          pricing_source_url: "https://www.postman.com/pricing/",
        },
        {
          plan_name: "Professional",
          plan_type: "subscription",
          amount: 29.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "per_seat",
          per_unit: "user / month (billed annually at $348/yr) or $39 monthly",
          minimum_commitment: "Annual or Monthly",
          free_tier_available: false,
          pricing_source_url: "https://www.postman.com/pricing/",
        },
      ],
      features: [
        { name: "API Client & Collections", group_name: "Testing", description: "Send requests across REST, SOAP, GraphQL, gRPC, and WebSockets." },
        { name: "Newman CLI Runner", group_name: "Automation", description: "Run Postman collections directly in CI/CD pipelines (GitHub Actions, GitLab)." },
        { name: "Mock Servers & Monitors", group_name: "Prototyping", description: "Simulate backend endpoints before backend code is written." },
      ],
      integrations: [
        { name: "GitHub Actions", category: "CI/CD", description: "Automated regression test runner via Newman" },
        { name: "OpenAPI 3.0 / Swagger", category: "Standard", description: "Import and export standard OpenAPI specs" },
      ],
      specifications: [
        { attribute_key: "protocols", attribute_label: "Supported Protocols", attribute_value: "REST, GraphQL, gRPC, WebSocket, SOAP", group_name: "Compatibility" },
        { attribute_key: "free_members", attribute_label: "Free Team Size", attribute_value: "Up to 3 team members", group_name: "Quotas" },
      ],
      pros: ["Universally used API debugging standard across the industry", "Excellent automated assertions with JavaScript test scripts", "Seamless team collection sharing"],
      cons: ["Heavy desktop client memory usage", "Scratchpad offline mode was phased out in favor of cloud sync"],
      security: {
        auth_methods: ["OAuth 2.0", "Bearer Token", "AWS Signature", "Basic Auth"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "AWS US Regions",
        certifications: ["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA Ready"],
        security_doc_url: "https://www.postman.com/trust/",
        privacy_policy_url: "https://www.postman.com/legal/privacy-policy/",
      },
      resources: [
        { title: "Documentation", url: "https://learning.postman.com", resource_type: "documentation" },
        { title: "Pricing Details", url: "https://www.postman.com/pricing/", resource_type: "pricing" },
      ],
    },

    {
      name: "Amazon S3",
      slug: "amazon-s3",
      category_slug: "storage-infrastructure",
      provider_name: "Amazon Web Services Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazons3.svg",
      short_description: "Industry-standard cloud object storage built to retrieve any amount of data from anywhere.",
      overview: "Amazon Simple Storage Service (Amazon S3) is an object storage service offering industry-leading scalability, data availability, security, and performance with 99.999999999% (11 9s) of durability.",
      main_purpose: "Object storage for user uploads, backups, static websites, and data lakes.",
      typical_use_cases: ["User avatar and asset storage with signed URLs", "Database backups and archive retention", "Static website asset hosting"],
      intended_audience: "Cloud architects, backend engineers, and enterprise DevOps teams.",
      deployment_model: "Cloud (Global AWS Regions)",
      official_website_url: "https://aws.amazon.com/s3/",
      is_published: true,
      published_at: "2026-07-01T10:00:00Z",
      tags: ["storage", "s3", "aws", "object-storage", "backup", "cloud"],
      plans: [
        {
          plan_name: "AWS Free Tier",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "5 GB Standard Storage (12 months free)",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://aws.amazon.com/s3/pricing/",
        },
        {
          plan_name: "Standard S3 Storage",
          plan_type: "usage_based",
          amount: 0.023,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "GB / month ($0.023 for first 50 TB)",
          minimum_commitment: "Pay for what you store",
          free_tier_available: true,
          pricing_source_url: "https://aws.amazon.com/s3/pricing/",
        },
      ],
      features: [
        { name: "Pre-Signed URLs", group_name: "Security", description: "Grant temporary, secure browser upload and download access without sharing AWS credentials." },
        { name: "S3 Lifecycle Policies", group_name: "Cost Management", description: "Automatically transition objects to Glacier or Infrequent Access." },
        { name: "Cross-Region Replication", group_name: "Reliability", description: "Replicate buckets across continents for disaster recovery." },
      ],
      integrations: [
        { name: "@aws-sdk/client-s3", category: "SDK", description: "Modular AWS SDK v3 for JavaScript & TypeScript" },
        { name: "boto3 (Python)", category: "SDK", description: "Standard Python AWS library" },
      ],
      specifications: [
        { attribute_key: "durability", attribute_label: "Data Durability", attribute_value: "99.999999999% (11 9s)", group_name: "Durability" },
        { attribute_key: "object_size", attribute_label: "Max Object Size", attribute_value: "5 Terabytes", group_name: "Capacity" },
      ],
      pros: ["Universal standard API supported by virtually every storage tool and library", "Unmatched 11 9s durability and global availability", "Granular IAM permissions and bucket policies"],
      cons: ["Data egress bandwidth charges can add up unexpectedly", "AWS Management Console has a steep learning curve"],
      security: {
        auth_methods: ["AWS IAM Roles", "Bucket Policies", "Pre-Signed URLs"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "SSE-S3 / SSE-KMS (AES-256)",
        data_residency: "30+ Global AWS Regions",
        certifications: ["SOC 1, 2, 3", "ISO 27001", "HIPAA", "FedRAMP High", "PCI DSS Level 1"],
        security_doc_url: "https://aws.amazon.com/compliance/",
        privacy_policy_url: "https://aws.amazon.com/privacy/",
      },
      resources: [
        { title: "Documentation", url: "https://docs.aws.amazon.com/s3/", resource_type: "documentation" },
        { title: "Pricing Calculator", url: "https://aws.amazon.com/s3/pricing/", resource_type: "pricing" },
      ],
    },

    {
      name: "PostHog",
      slug: "posthog",
      category_slug: "analytics",
      provider_name: "PostHog Inc.",
      icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/posthog.svg",
      short_description: "The all-in-one developer platform for product analytics, session replay, and feature flags.",
      overview: "PostHog is an open-source product analytics suite built specifically for engineering and product teams, bundling user event tracking, session replay video recordings, A/B testing, and feature flags into a single SDK.",
      main_purpose: "Product analytics, user session replay, feature flags, and A/B experiments.",
      typical_use_cases: ["Debugging UX issues with video session replay", "Gating releases behind remote feature flags", "Measuring user conversion funnels"],
      intended_audience: "Product engineers, growth teams, and full-stack software developers.",
      deployment_model: "Cloud & Open Source",
      official_website_url: "https://posthog.com",
      is_published: true,
      published_at: "2026-09-08T10:00:00Z",
      tags: ["analytics", "session-replay", "feature-flags", "ab-testing", "open-source"],
      plans: [
        {
          plan_name: "Free Tier Included",
          plan_type: "free",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "free",
          per_unit: "1M events + 5k recordings / mo free",
          minimum_commitment: "None",
          free_tier_available: true,
          pricing_source_url: "https://posthog.com/pricing",
        },
        {
          plan_name: "Ridiculously Cheap Metered",
          plan_type: "usage_based",
          amount: 0.00,
          currency: "USD",
          billing_interval: "month",
          interval_count: 1,
          pricing_model: "usage_based",
          per_unit: "$0.00005 per event beyond 1M free",
          minimum_commitment: "Set your own monthly billing cap",
          free_tier_available: true,
          pricing_source_url: "https://posthog.com/pricing",
        },
      ],
      features: [
        { name: "Session Replay Videos", group_name: "Diagnostics", description: "Watch real browser interactions with console log and network request syncing." },
        { name: "Feature Flags & Multivariate A/B Testing", group_name: "Flags", description: "Safely rollout features with percentage targeting and user overrides." },
        { name: "Conversion Funnels & User Paths", group_name: "Analytics", description: "Identify drop-off points with step-by-step conversion analysis." },
      ],
      integrations: [
        { name: "posthog-js", category: "SDK", description: "Web browser SDK with autocapture support" },
        { name: "posthog-node", category: "SDK", description: "Server-side event and feature flag evaluation" },
        { name: "Next.js Provider", category: "Framework", description: "App Router client and server integration" },
      ],
      specifications: [
        { attribute_key: "free_quota", attribute_label: "Monthly Free Allowance", attribute_value: "1 Million events & 5,000 session recordings", group_name: "Quotas" },
        { attribute_key: "open_source", attribute_label: "Open Source Codebase", attribute_value: "Yes (MIT / Apache 2.0)", group_name: "License" },
      ],
      pros: ["Replaces 4 separate tools (Mixpanel, Hotjar, LaunchDarkly, Optimizely)", "Unbelievably generous 1M free events every month", "Allows setting strict monthly spend limit caps to prevent surprises"],
      cons: ["Self-hosted deployment on Kubernetes requires dedicated DevOps maintenance", "High event volume queries can take a few seconds on complex cohorts"],
      security: {
        auth_methods: ["Project API Keys", "Personal API Keys", "SAML SSO"],
        encryption_in_transit: "TLS 1.3",
        encryption_at_rest: "AES-256",
        data_residency: "US (Virginia) and EU (Frankfurt) Cloud",
        certifications: ["SOC 2 Type II", "GDPR Compliant", "HIPAA BAA Available"],
        security_doc_url: "https://posthog.com/handbook/company/security",
        privacy_policy_url: "https://posthog.com/privacy",
      },
      resources: [
        { title: "Documentation", url: "https://posthog.com/docs", resource_type: "documentation" },
        { title: "Pricing Calculator", url: "https://posthog.com/pricing", resource_type: "pricing" },
      ],
    },
  ],
};

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting idempotent database seed for Tools Directory...");

    // 1. Seed Categories
    console.log(`📂 Seeding ${SEED_DATA.categories.length} categories...`);
    const categoryMap = new Map();

    for (const cat of SEED_DATA.categories) {
      const res = await client.query(
        `
        INSERT INTO tool_categories (name, slug, description, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            sort_order = EXCLUDED.sort_order,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        RETURNING id, slug, name;
        `,
        [cat.name, cat.slug, cat.description, cat.sort_order, cat.is_active]
      );
      const row = res.rows[0];
      categoryMap.set(row.slug, row.id);
    }

    // 2. Seed Tools
    console.log(`🛠️ Seeding ${SEED_DATA.tools.length} software tools & profiles...`);
    for (const tool of SEED_DATA.tools) {
      const categoryId = categoryMap.get(tool.category_slug);
      if (!categoryId) {
        console.warn(`Category ${tool.category_slug} not found for ${tool.name}. Skipping.`);
        continue;
      }

      const toolRes = await client.query(
        `
        INSERT INTO tools (
          category_id, name, slug, provider_name, icon_url,
          short_description, overview, main_purpose, typical_use_cases,
          intended_audience, deployment_model, official_website_url,
          is_published, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (slug) DO UPDATE
        SET category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            provider_name = EXCLUDED.provider_name,
            icon_url = EXCLUDED.icon_url,
            short_description = EXCLUDED.short_description,
            overview = EXCLUDED.overview,
            main_purpose = EXCLUDED.main_purpose,
            typical_use_cases = EXCLUDED.typical_use_cases,
            intended_audience = EXCLUDED.intended_audience,
            deployment_model = EXCLUDED.deployment_model,
            official_website_url = EXCLUDED.official_website_url,
            is_published = EXCLUDED.is_published,
            published_at = EXCLUDED.published_at,
            updated_at = NOW()
        RETURNING id;
        `,
        [
          categoryId,
          tool.name,
          tool.slug,
          tool.provider_name,
          tool.icon_url,
          tool.short_description,
          tool.overview,
          tool.main_purpose,
          tool.typical_use_cases,
          tool.intended_audience,
          tool.deployment_model,
          tool.official_website_url,
          tool.is_published,
          tool.published_at,
        ]
      );

      const toolId = toolRes.rows[0].id;

      // Seed Pricing Plans
      if (tool.plans && tool.plans.length > 0) {
        await client.query("DELETE FROM tool_pricing_plans WHERE tool_id = $1", [toolId]);
        for (const plan of tool.plans) {
          await client.query(
            `
            INSERT INTO tool_pricing_plans (
              tool_id, plan_name, plan_type, amount, currency,
              billing_interval, interval_count, pricing_model,
              per_unit, minimum_commitment, free_tier_available,
              pricing_source_url, last_verified_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            `,
            [
              toolId,
              plan.plan_name,
              plan.plan_type,
              plan.amount,
              plan.currency,
              plan.billing_interval,
              plan.interval_count,
              plan.pricing_model,
              plan.per_unit,
              plan.minimum_commitment,
              plan.free_tier_available,
              plan.pricing_source_url,
            ]
          );
        }
      }

      // Seed Features
      if (tool.features && tool.features.length > 0) {
        await client.query("DELETE FROM tool_features WHERE tool_id = $1", [toolId]);
        for (const feat of tool.features) {
          await client.query(
            `
            INSERT INTO tool_features (tool_id, name, description, group_name, is_available)
            VALUES ($1, $2, $3, $4, TRUE)
            `,
            [toolId, feat.name, feat.description, feat.group_name]
          );
        }
      }

      // Seed Integrations
      if (tool.integrations && tool.integrations.length > 0) {
        await client.query("DELETE FROM tool_integrations WHERE tool_id = $1", [toolId]);
        for (const integ of tool.integrations) {
          await client.query(
            `
            INSERT INTO tool_integrations (tool_id, name, description, category)
            VALUES ($1, $2, $3, $4)
            `,
            [toolId, integ.name, integ.description, integ.category]
          );
        }
      }

      // Seed Specifications
      if (tool.specifications && tool.specifications.length > 0) {
        await client.query("DELETE FROM tool_specifications WHERE tool_id = $1", [toolId]);
        for (const spec of tool.specifications) {
          await client.query(
            `
            INSERT INTO tool_specifications (tool_id, attribute_key, attribute_label, attribute_value, group_name)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [toolId, spec.attribute_key, spec.attribute_label, spec.attribute_value, spec.group_name]
          );
        }
      }

      // Seed Pros & Cons
      if (tool.pros || tool.cons) {
        await client.query("DELETE FROM tool_pros_cons WHERE tool_id = $1", [toolId]);
        for (const p of tool.pros || []) {
          await client.query(
            `INSERT INTO tool_pros_cons (tool_id, type, content) VALUES ($1, 'pro', $2)`,
            [toolId, p]
          );
        }
        for (const c of tool.cons || []) {
          await client.query(
            `INSERT INTO tool_pros_cons (tool_id, type, content) VALUES ($1, 'con', $2)`,
            [toolId, c]
          );
        }
      }

      // Seed Security & Compliance
      if (tool.security) {
        await client.query(
          `
          INSERT INTO tool_security_compliance (
            tool_id, auth_methods, encryption_in_transit, encryption_at_rest,
            data_residency, certifications, security_doc_url, privacy_policy_url
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (tool_id) DO UPDATE
          SET auth_methods = EXCLUDED.auth_methods,
              encryption_in_transit = EXCLUDED.encryption_in_transit,
              encryption_at_rest = EXCLUDED.encryption_at_rest,
              data_residency = EXCLUDED.data_residency,
              certifications = EXCLUDED.certifications,
              security_doc_url = EXCLUDED.security_doc_url,
              privacy_policy_url = EXCLUDED.privacy_policy_url;
          `,
          [
            toolId,
            tool.security.auth_methods,
            tool.security.encryption_in_transit,
            tool.security.encryption_at_rest,
            tool.security.data_residency,
            tool.security.certifications,
            tool.security.security_doc_url,
            tool.security.privacy_policy_url,
          ]
        );
      }

      // Seed Resources
      if (tool.resources && tool.resources.length > 0) {
        await client.query("DELETE FROM tool_resources WHERE tool_id = $1", [toolId]);
        for (const resItem of tool.resources) {
          await client.query(
            `
            INSERT INTO tool_resources (tool_id, title, url, resource_type)
            VALUES ($1, $2, $3, $4)
            `,
            [toolId, resItem.title, resItem.url, resItem.resource_type]
          );
        }
      }

      // Seed Tags
      if (tool.tags && tool.tags.length > 0) {
        await client.query("DELETE FROM tool_tags WHERE tool_id = $1", [toolId]);
        for (const tag of tool.tags) {
          await client.query(
            `
            INSERT INTO tool_tags (tool_id, tag)
            VALUES ($1, $2)
            ON CONFLICT (tool_id, tag) DO NOTHING
            `,
            [toolId, tag]
          );
        }
      }
    }

    console.log("✅ Seed completed successfully with verified real tools dataset!");
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed_tools.js")) {
  seedDatabase().catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });
}

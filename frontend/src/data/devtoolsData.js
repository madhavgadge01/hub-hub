export const DEV_TOOL_PRICING_FILTERS = [
  'All',
  'Free',
  'Open Source',
  'Freemium',
  'Paid',
];

export const DEV_TOOL_CATEGORIES = [
  'All',
  'Maps & Geo',
  'Email Services',
  'Authentication',
  'Databases',
  'Payments',
];

export const DEV_TOOLS_DATA = [
  {
    id: 'mapbox',
    name: 'Mapbox',
    category: 'Maps & Geo',
    pricingType: 'Freemium',
    tagline: 'Custom vector tiles, geocoding, and directions SDKs.',
    description: 'Industry-standard location platform offering customizable map styles, turn-by-turn navigation, and lightning-fast search.',
    freeTier: '50,000 monthly map loads & 100,000 geocoding requests',
    pricingSummary: 'Starts free, then $5.00 per 1,000 additional loads',
    limits: 'Up to 300 req/sec',
    websiteUrl: 'https://mapbox.com',
    specs: {
      freeQuota: '50,000 loads / mo',
      pricingRate: '$5.00 / 1k loads',
      sdkSupport: 'JavaScript, React, iOS, Android, Unity',
      openSource: 'Partial (Mapbox GL JS v1 was OSS)',
      latency: '22ms (Global Edge)',
      uptimeSla: '99.99%',
      bestFor: 'Design-centric custom vector styling'
    }
  },
  {
    id: 'google-maps',
    name: 'Google Maps Platform',
    category: 'Maps & Geo',
    pricingType: 'Freemium',
    tagline: 'Comprehensive global mapping with Street View & Places API.',
    description: 'Massive point-of-interest database, reliable real-time traffic information, and satellite imagery across 200+ countries.',
    freeTier: '$200 free monthly credit (~28,500 static map loads)',
    pricingSummary: '$7.00 per 1,000 dynamic map loads beyond credit',
    limits: '50 QPS default (scalable)',
    websiteUrl: 'https://developers.google.com/maps',
    specs: {
      freeQuota: '~$200 credit/mo (~28k loads)',
      pricingRate: '$7.00 / 1k loads',
      sdkSupport: 'JS, Android, iOS, REST, Python, Java',
      openSource: 'No (Proprietary)',
      latency: '35ms (Google Network)',
      uptimeSla: '99.9%',
      bestFor: 'Extensive business POI database & Street View'
    }
  },
  {
    id: 'protomaps',
    name: 'Protomaps & OpenStreetMap',
    category: 'Maps & Geo',
    pricingType: 'Open Source',
    tagline: 'Serverless vector tile maps stored in a single PMTiles file.',
    description: 'Completely self-hostable mapping stack powered by OpenStreetMap data. Host maps on Cloudflare R2 or S3 with zero server overhead.',
    freeTier: '100% Free & Open Source (pay only your cloud storage pennies)',
    pricingSummary: 'Free software (Apache 2.0 / BSD)',
    limits: 'Unlimited (bounded only by your S3/R2 quota)',
    websiteUrl: 'https://protomaps.com',
    specs: {
      freeQuota: 'Unlimited self-hosted',
      pricingRate: '$0 (Storage only)',
      sdkSupport: 'MapLibre GL, Leaflet, OpenLayers',
      openSource: 'Yes (100% Open Source)',
      latency: '15ms (Edge S3/R2)',
      uptimeSla: 'Self-hosted (99.99% on R2)',
      bestFor: 'Zero vendor lock-in & privacy-first maps'
    }
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'Email Services',
    pricingType: 'Freemium',
    tagline: 'Modern email API built for developers and React Email.',
    description: 'Build, test, and send transactional emails using standard React components. Exceptional deliverability and clean REST APIs.',
    freeTier: '3,000 emails/month (100 emails/day) with 1 domain',
    pricingSummary: 'Pro plan starts at $20/month for 50,000 emails',
    limits: '10 emails/sec on free tier',
    websiteUrl: 'https://resend.com',
    specs: {
      freeQuota: '3,000 emails / mo',
      pricingRate: '$20/mo (first 50k emails)',
      sdkSupport: 'Node.js, React Email, Python, Go, Ruby, PHP',
      openSource: 'React Email library is OSS',
      latency: '95ms dispatch',
      uptimeSla: '99.99%',
      bestFor: 'Next.js & React transactional emails'
    }
  },
  {
    id: 'sendgrid',
    name: 'Twilio SendGrid',
    category: 'Email Services',
    pricingType: 'Freemium',
    tagline: 'High-volume cloud email engine for transactional and marketing.',
    description: 'Enterprise email delivery infrastructure with advanced analytics, dedicated IP pools, and inbound parse webhooks.',
    freeTier: '100 emails/day forever',
    pricingSummary: 'Essentials plan starts at $19.95/month for 50,000 emails',
    limits: '600 req/min',
    websiteUrl: 'https://sendgrid.com',
    specs: {
      freeQuota: '3,000 emails / mo (100/day)',
      pricingRate: '$19.95/mo (first 50k emails)',
      sdkSupport: 'C#, Go, Java, Node.js, PHP, Python, Ruby',
      openSource: 'No (Proprietary cloud service)',
      latency: '180ms dispatch',
      uptimeSla: '99.95%',
      bestFor: 'Massive scale email & marketing campaigns'
    }
  },
  {
    id: 'postmark',
    name: 'Postmark',
    category: 'Email Services',
    pricingType: 'Paid',
    tagline: 'Lightning-fast delivery rates for critical application emails.',
    description: 'Known for industry-leading inbox placement speed, separating marketing from transactional traffic to guarantee 10-second inbox delivery.',
    freeTier: '100 test emails total (trial mode only)',
    pricingSummary: 'Starts at $15/month for 10,000 emails ($1.80/1k extra)',
    limits: '10,000 emails/min',
    websiteUrl: 'https://postmarkapp.com',
    specs: {
      freeQuota: '100 emails trial',
      pricingRate: '$15.00/mo (first 10k emails)',
      sdkSupport: 'Node.js, Rails, Python, Go, .NET, PHP',
      openSource: 'No',
      latency: '45ms dispatch (Sub-10s inbox)',
      uptimeSla: '99.99%',
      bestFor: 'Mission-critical password resets and receipts'
    }
  },
  {
    id: 'clerk',
    name: 'Clerk',
    category: 'Authentication',
    pricingType: 'Freemium',
    tagline: 'More than authentication. Complete user management for modern apps.',
    description: 'Prebuilt drop-in UI components (<SignIn />, <UserProfile />) with passwordless passkeys, MFA, multi-tenant organizations, and session cookies.',
    freeTier: '10,000 Monthly Active Users (MAUs) completely free',
    pricingSummary: 'Pro starts at $25/mo + $0.02 per active user above 10k',
    limits: 'Unlimited sessions',
    websiteUrl: 'https://clerk.com',
    specs: {
      freeQuota: '10,000 MAUs free',
      pricingRate: '$25/mo base + $0.02/extra MAU',
      sdkSupport: 'Next.js, React, Remix, Vue, iOS, Android',
      openSource: 'SDKs are OSS, backend is managed',
      latency: '30ms session validation',
      uptimeSla: '99.99%',
      bestFor: 'Fastest time-to-market auth in React/Next.js'
    }
  },
  {
    id: 'supabase-auth',
    name: 'Supabase Auth',
    category: 'Authentication',
    pricingType: 'Open Source',
    tagline: 'Open source authentication with PostgreSQL Row Level Security.',
    description: 'Built-in GoTrue auth server integrated directly into Postgres database. Supports OAuth 2.0, Magic Links, phone OTP, and fine-grained RLS policies.',
    freeTier: '50,000 MAUs free on Supabase Cloud, unlimited self-hosted',
    pricingSummary: 'Free self-hosted, Cloud Pro starts at $25/mo',
    limits: '30 signups/sec',
    websiteUrl: 'https://supabase.com/auth',
    specs: {
      freeQuota: '50,000 MAUs free cloud',
      pricingRate: '$0.00325 per MAU over 50k',
      sdkSupport: 'JavaScript, Python, Dart/Flutter, Swift, Kotlin',
      openSource: 'Yes (100% Apache 2.0)',
      latency: '40ms session check',
      uptimeSla: '99.95%',
      bestFor: 'Postgres developers needing Row Level Security'
    }
  },
  {
    id: 'neon-postgres',
    name: 'Neon Serverless Postgres',
    category: 'Databases',
    pricingType: 'Freemium',
    tagline: 'Serverless PostgreSQL with instant database branching.',
    description: 'Separates storage and compute for true autoscaling. Scale down to zero compute to eliminate idle costs, with GitHub-style DB branching.',
    freeTier: '0.5 GB storage & 1 compute branch free forever',
    pricingSummary: 'Launch tier starts at $19/mo (autoscaling compute)',
    limits: 'Auto-suspend after 5 min idle',
    websiteUrl: 'https://neon.tech',
    specs: {
      freeQuota: '0.5 GB storage + 1 compute branch',
      pricingRate: '$19/mo base + compute usage',
      sdkSupport: 'Standard psql / any Postgres driver, Serverless Driver',
      openSource: 'Core storage engine is open source',
      latency: '15ms (Edge connection pooling)',
      uptimeSla: '99.95%',
      bestFor: 'CI/CD preview databases and serverless apps'
    }
  },
  {
    id: 'pocketbase',
    name: 'PocketBase',
    category: 'Databases',
    pricingType: 'Open Source',
    tagline: 'Open source backend in 1 single executable file.',
    description: 'Embedded SQLite with realtime subscriptions, built-in auth, file storage, and an elegant admin dashboard in a single lightweight Go binary.',
    freeTier: '100% Free & Open Source forever',
    pricingSummary: '$0 (Run on a $3 VPS or Raspberry Pi)',
    limits: '10,000+ simultaneous realtime connections on $5 VPS',
    websiteUrl: 'https://pocketbase.io',
    specs: {
      freeQuota: 'Unlimited self-hosted',
      pricingRate: '$0 forever',
      sdkSupport: 'JavaScript, Dart, Go',
      openSource: 'Yes (MIT License)',
      latency: '2ms (Local SQLite)',
      uptimeSla: 'Depends on host VPS',
      bestFor: 'Solo developers, side projects, and desktop apps'
    }
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    category: 'Payments',
    pricingType: 'Freemium',
    tagline: 'The financial infrastructure powering internet commerce.',
    description: 'Accept credit cards, mobile wallets (Apple/Google Pay), local bank transfers, and create recurring subscriptions with fraud radar.',
    freeTier: 'Zero monthly subscription fee; pay only per successful transaction',
    pricingSummary: '2.9% + 30¢ per successful card charge',
    limits: '100+ req/sec',
    websiteUrl: 'https://stripe.com',
    specs: {
      freeQuota: '$0/mo fixed cost',
      pricingRate: '2.9% + $0.30 per charge',
      sdkSupport: 'Node, Python, Go, Ruby, PHP, Java, .NET, iOS, Android',
      openSource: 'SDKs are OSS, payment engine is cloud',
      latency: '85ms checkout creation',
      uptimeSla: '99.999%',
      bestFor: 'Global internet businesses and SaaS subscriptions'
    }
  },
  {
    id: 'lemon-squeezy',
    name: 'Lemon Squeezy',
    category: 'Payments',
    pricingType: 'Freemium',
    tagline: 'Merchant of Record for SaaS & digital downloads with auto-tax.',
    description: 'Handles EU VAT, global sales tax, invoices, and currency conversion on your behalf as the legal Merchant of Record.',
    freeTier: 'No monthly subscription fee',
    pricingSummary: '5% + 50¢ per successful transaction',
    limits: 'Standard cloud limits',
    websiteUrl: 'https://lemonsqueezy.com',
    specs: {
      freeQuota: '$0/mo fixed cost',
      pricingRate: '5% + $0.50 per charge',
      sdkSupport: 'REST API, Node.js, PHP, React Checkout',
      openSource: 'No',
      latency: '110ms',
      uptimeSla: '99.95%',
      bestFor: 'Software sellers who do not want to file global sales taxes'
    }
  }
];

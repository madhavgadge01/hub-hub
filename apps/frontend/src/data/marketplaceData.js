export const MARKETPLACE_CATEGORIES = [
  'All',
  'Security & Auth',
  'Utilities & Web',
  'Finance & Payment',
  'Data & Validation',
  'Media & QR'
];

export const APIS_DATA = [
  {
    id: 'card-validator',
    name: 'Credit Card Validator API',
    slug: 'card-validator',
    version: 'v1.4.2',
    category: 'Finance & Payment',
    description: 'Instant Luhn-10 verification, major card network identification (Visa, Mastercard, Amex, Discover, RuPay), and Luhn checksum validation with zero cardholder data storage.',
    badge: 'Popular',
    latency: '14ms',
    uptime: '99.99%',
    rateLimit: '2,500 req/min',
    pricingTier: 'Free Tier Available',
    costPer1k: '5 credits / 1k req',
    endpoint: 'POST /api/v1/card-validator',
    methods: ['POST'],
    auth: 'x-api-key header',
    features: [
      'Mod-10 (Luhn) mathematical verification',
      'IIN/BIN scheme brand detection (Visa, MC, Amex, Discover, JCB, RuPay)',
      'Card length and formatting sanitization',
      'PCI-DSS compliant non-logging architecture',
      'Sub-20ms edge latency worldwide'
    ],
    samplePayload: {
      cardNumber: "4532718928371928"
    },
    sampleResponse: {
      valid: true,
      cardType: "Visa",
      lengthValid: true,
      luhnCheck: true,
      masked: "4532-****-****-1928",
      country: "US",
      currency: "USD",
      meta: {
        processingTime: "12ms",
        requestId: "req_cv_98a72b"
      }
    }
  },
  {
    id: 'password-checker',
    name: 'Password Strength & Entropy Analyzer',
    slug: 'password-checker',
    version: 'v2.1.0',
    category: 'Security & Auth',
    description: 'High-precision password strength evaluation using Shannon entropy scoring, dictionary leak checking, pattern detection, and estimated crack times.',
    badge: 'Essential',
    latency: '18ms',
    uptime: '99.98%',
    rateLimit: '3,000 req/min',
    pricingTier: 'Free Tier Available',
    costPer1k: '4 credits / 1k req',
    endpoint: 'POST /api/v1/passwordchecker',
    methods: ['POST'],
    auth: 'x-api-key header',
    features: [
      'Bits of entropy calculation (0 - 128 bits)',
      'Common dictionary word & leetspeak detection',
      'Time-to-crack simulations (brute force vs GPU cluster)',
      'Actionable security recommendations for users',
      'Compliant with NIST SP 800-63B guidelines'
    ],
    samplePayload: {
      password: "P@ssw0rd!Secure2026",
      userInputs: ["alex", "vance"]
    },
    sampleResponse: {
      score: 4,
      strength: "Strong",
      entropyBits: 86.4,
      crackTimeDisplay: "12,000 centuries",
      checks: {
        hasUppercase: true,
        hasLowercase: true,
        hasNumbers: true,
        hasSymbols: true,
        minLengthPassed: true,
        noUserMatches: true
      },
      feedback: {
        warning: null,
        suggestions: ["Excellent! Meets enterprise security criteria."]
      }
    }
  },
  {
    id: 'url-metadata',
    name: 'URL Metadata & OpenGraph Extractor',
    slug: 'url-metadata',
    version: 'v1.8.0',
    category: 'Utilities & Web',
    description: 'Extract rich OpenGraph, Twitter Card, microformats, canonical links, favicons, and page descriptions from any web URL using distributed serverless headless parsers.',
    badge: 'Verified',
    latency: '120ms',
    uptime: '99.95%',
    rateLimit: '1,200 req/min',
    pricingTier: 'Pay as you go',
    costPer1k: '10 credits / 1k req',
    endpoint: 'POST /api/v1/url-metadata',
    methods: ['POST'],
    auth: 'x-api-key header',
    features: [
      'Automatic fallback: og:title -> twitter:title -> <title>',
      'High-res favicon & apple-touch-icon resolution',
      'SSRF protection & safe-redirect traversal',
      'Parses JSON-LD and Schema.org metadata',
      'Smart timeout handling with cached DNS lookup'
    ],
    samplePayload: {
      url: "https://github.com/features/actions"
    },
    sampleResponse: {
      url: "https://github.com/features/actions",
      title: "Features • GitHub Actions · GitHub",
      description: "Automate your workflow from idea to production with GitHub Actions.",
      image: "https://github.githubassets.com/images/modules/actions/actions-og.png",
      siteName: "GitHub",
      favicon: "https://github.githubassets.com/favicons/favicon.svg",
      type: "website",
      locale: "en_US",
      statusCode: 200
    }
  },
  {
    id: 'password-generator',
    name: 'Cryptographic Password & Token Generator',
    slug: 'password-generator',
    version: 'v1.1.2',
    category: 'Security & Auth',
    description: 'Generate cryptographically secure random passwords, alphanumeric tokens, API secrets, UUIDv4/v7, and memorable passphrases with custom entropy constraints.',
    badge: 'Fast',
    latency: '8ms',
    uptime: '99.99%',
    rateLimit: '5,000 req/min',
    pricingTier: 'Free Tier Available',
    costPer1k: '2 credits / 1k req',
    endpoint: 'POST /api/v1/password',
    methods: ['POST'],
    auth: 'x-api-key header',
    features: [
      'Node crypto / CSPRNG seeded generation',
      'Configurable character classes (symbols, numbers, ambiguous exclusion)',
      'Memorable Diceware passphrase mode with EFF wordlists',
      'Bulk generation (up to 100 tokens per request)',
      'Zero-retention ephemeral calculation'
    ],
    samplePayload: {
      length: 24,
      includeSymbols: true,
      includeNumbers: true,
      excludeAmbiguous: true
    },
    sampleResponse: {
      token: "K9m$qW7#vL2*pY8!xR5^bT3&",
      length: 24,
      entropyEstimate: 124.6,
      generatedAt: "2026-10-03T15:30:00.000Z"
    }
  },
  {
    id: 'qrcode-generator',
    name: 'Dynamic QR Code Generation Engine',
    slug: 'qrcode-generator',
    version: 'v1.3.0',
    category: 'Media & QR',
    description: 'Vector SVG and raster PNG QR code synthesis with custom color palettes, error correction levels (L/M/Q/H), centered logo embeds, and margin parameters.',
    badge: 'New',
    latency: '35ms',
    uptime: '99.97%',
    rateLimit: '2,000 req/min',
    pricingTier: 'Free Tier Available',
    costPer1k: '6 credits / 1k req',
    endpoint: 'POST /api/v1/QRcode',
    methods: ['POST'],
    auth: 'x-api-key header',
    features: [
      'High-speed SVG & Base64 PNG output formats',
      'Reed-Solomon error correction levels (L, M, Q, H)',
      'Custom dark/light hex colors and module padding',
      'Compact payload support (URLs, WiFi, vCard, crypto)',
      'Lossless vector rendering for high-DPI printing'
    ],
    samplePayload: {
      text: "https://kruu.dev/marketplace",
      size: 320,
      margin: 2,
      errorCorrectionLevel: "H"
    },
    sampleResponse: {
      format: "svg",
      dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj4...",
      byteLength: 4320,
      correctionLevel: "H"
    }
  },
  {
    id: 'email-checker',
    name: 'Email Deliverability & MX Validator',
    slug: 'email-checker',
    version: 'v1.5.0',
    category: 'Data & Validation',
    description: 'Verify mailbox syntax, live DNS MX records, disposable email detection, spam-trap domain identification, and SMTP handshake simulation.',
    badge: 'High Accuracy',
    latency: '85ms',
    uptime: '99.92%',
    rateLimit: '1,500 req/min',
    pricingTier: 'Pay as you go',
    costPer1k: '8 credits / 1k req',
    endpoint: 'POST /api/v1/email-verify',
    methods: ['POST'],
    auth: 'x-api-key header',
    features: [
      'RFC 5322 regex validation and typo suggestion',
      'Real-time MX record DNS verification',
      'Disposable and burner domain blacklists (15k+ domains)',
      'Free provider detection (Gmail, Yahoo, Outlook)',
      'Role-based address tagging (admin@, support@, info@)'
    ],
    samplePayload: {
      email: "engineer@enterprise-tech.corp"
    },
    sampleResponse: {
      email: "engineer@enterprise-tech.corp",
      deliverable: true,
      mxRecordsFound: true,
      isDisposable: false,
      isRoleAccount: false,
      domain: "enterprise-tech.corp",
      smtpCheck: "Passed"
    }
  }
];

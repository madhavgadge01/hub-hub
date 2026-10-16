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

export const MARKETPLACE_SEED_DATA = {
  categories: [
    {
      name: "Media & Utilities",
      slug: "media-utilities",
      description: "High-throughput visual, document, and media transformation microservices.",
      icon_name: "QrCode",
      sort_order: 1,
    },
    {
      name: "Web & Data Intelligence",
      slug: "web-data-intelligence",
      description: "Fast metadata discovery, OpenGraph scraping, and data extraction engines.",
      icon_name: "Globe",
      sort_order: 2,
    },
    {
      name: "Developer & Validation Tools",
      slug: "developer-validation",
      description: "Syntax inspection, schema compliance, payload formatting and linting utilities.",
      icon_name: "FileCode2",
      sort_order: 3,
    },
    {
      name: "Security & Cryptography",
      slug: "security-cryptography",
      description: "High-entropy secrets generation, password analysis, and crypto verification endpoints.",
      icon_name: "ShieldCheck",
      sort_order: 4,
    },
    {
      name: "Financial & Payment Tools",
      slug: "financial-validation",
      description: "Card network verification, IIN/BIN validation, and PCI-compliant calculation tools.",
      icon_name: "CreditCard",
      sort_order: 5,
    },
  ],

  products: [
    {
      category_slug: "media-utilities",
      name: "Dynamic QR Code Generation Engine",
      slug: "qr-code",
      description: "Generate vector SVG and high-resolution PNG QR codes with customizable dimensions, margins, and Reed-Solomon error correction levels.",
      overview: "The Kruu QR Code Generation Engine provides sub-15ms generation of custom, production-ready QR codes for tickets, URLs, authentication tokens, and point-of-sale systems. Outputs both lossless vector SVGs and base64-encoded PNG data URLs.",
      provider_name: "Kruu Edge",
      icon_url: "/icons/api-qrcode.svg",
      version: "v1.4.0",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/qr",
      http_method: "POST",
      rate_limit_per_minute: 120,
      features: [
        "Vector SVG & base64 PNG data URL outputs",
        "Configurable dimensions (up to 2048x2048 px)",
        "Reed-Solomon error correction levels: L (7%), M (15%), Q (25%), H (30%)",
        "Adjustable module margin/quiet zones",
        "Sub-15ms edge latency with zero data retention",
        "High-density payload support up to 2,048 characters"
      ],
      use_cases: [
        "Dynamic payment and invoice settlement links",
        "Two-factor authentication (TOTP) pairing codes",
        "Event ticketing and board-pass verification",
        "Marketing flyers and print-ready vector publishing",
        "WiFi pairing and contact vCard generation"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/qr",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          required: ["text"],
          properties: {
            text: { type: "string", description: "Payload string or URL to encode", maxLength: 2048 },
            format: { type: "string", enum: ["png", "svg"], default: "png" },
            size: { type: "integer", minimum: 64, maximum: 2048, default: 320 },
            margin: { type: "integer", minimum: 0, maximum: 10, default: 2 },
            errorCorrectionLevel: { type: "string", enum: ["L", "M", "Q", "H"], default: "M" }
          }
        },
        exampleRequest: {
          text: "https://hubhub.dev/marketplace/qr-code",
          format: "png",
          size: 320,
          margin: 2,
          errorCorrectionLevel: "H"
        },
        exampleResponse: {
          success: true,
          format: "png",
          dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFABAMAAAC2092AAAAAMFBMVEU...",
          size: 320,
          errorCorrectionLevel: "H"
        },
        statusCodes: [
          { code: 200, description: "QR code generated successfully." },
          { code: 400, description: "Invalid or empty text payload." },
          { code: 401, description: "Missing or invalid API key." },
          { code: 429, description: "Rate limit or entitlement quota exceeded." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Ideal for student projects and local testing.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 100,
          rate_limit_per_minute: 60,
          features: ["100 requests / month", "60 req/min rate limit", "Standard PNG & SVG output", "Community support"]
        },
        {
          name: "Developer Pro",
          description: "High-volume generation for live web and mobile apps.",
          plan_type: "prepaid",
          price_amount: 49900, // ₹499.00 in paise
          currency: "INR",
          billing_interval: "month",
          included_requests: 10000,
          rate_limit_per_minute: 300,
          features: ["10,000 requests / month", "300 req/min rate limit", "Sub-15ms edge routing", "Priority email support", "Downloadable SVG & PNG"]
        },
        {
          name: "Enterprise Scale",
          description: "Dedicated throughput for large fleets and e-commerce.",
          plan_type: "prepaid",
          price_amount: 199900, // ₹1,999.00 in paise
          currency: "INR",
          billing_interval: "month",
          included_requests: 100000,
          rate_limit_per_minute: 1200,
          features: ["100,000 requests / month", "1,200 req/min rate limit", "99.99% uptime SLA", "Dedicated account manager", "Custom error correction tuning"]
        }
      ]
    },

    {
      category_slug: "web-data-intelligence",
      name: "URL Metadata & OpenGraph Extractor",
      slug: "url-metadata",
      description: "Extract rich OpenGraph images, Twitter Card tags, favicons, site names, and semantic metadata from any public URL with built-in SSRF protection.",
      overview: "An enterprise-grade URL unfurler and parser designed to power link preview widgets, search engines, and bookmarking apps. Automatically follows safe redirects and safeguards against internal network SSRF exploits.",
      provider_name: "Kruu Edge",
      icon_url: "/icons/api-metadata.svg",
      version: "v1.8.0",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/url-metadata",
      http_method: "POST",
      rate_limit_per_minute: 90,
      features: [
        "Cascading title & description fallback: og:title -> twitter:title -> <title>",
        "High-resolution favicon & Apple touch icon discovery",
        "SSRF protection blocking loopback and RFC 1918 private subnets",
        "Fast streaming HTML parser with 5MB size guardrails",
        "Safe HTTP redirect traversal (up to 3 hops)",
        "Structured JSON response containing Canonical and Site Name"
      ],
      use_cases: [
        "Rich link previews in chat applications and collaborative docs",
        "Social media bookmarking and reader applications",
        "Automated SEO audit pipelines and competitor monitoring",
        "Content aggregator and newsletter summary engines"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/url-metadata",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          required: ["url"],
          properties: {
            url: { type: "string", format: "uri", description: "Public HTTP/HTTPS webpage URL" }
          }
        },
        exampleRequest: {
          url: "https://github.com/features/actions"
        },
        exampleResponse: {
          success: true,
          metadata: {
            url: "https://github.com/features/actions",
            title: "Features • GitHub Actions · GitHub",
            description: "Automate your workflow from idea to production with GitHub Actions.",
            image: "https://github.githubassets.com/images/modules/actions/actions-og.png",
            siteName: "GitHub",
            favicon: "https://github.githubassets.com/favicons/favicon.svg"
          }
        },
        statusCodes: [
          { code: 200, description: "Metadata parsed successfully." },
          { code: 400, description: "Invalid URL or blocked private host (SSRF guard)." },
          { code: 401, description: "Missing or invalid API key." },
          { code: 429, description: "Rate limit exceeded." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Test URL unfurling in your development sandbox.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 50,
          rate_limit_per_minute: 30,
          features: ["50 requests / month", "30 req/min rate limit", "SSRF security filter", "Community support"]
        },
        {
          name: "Developer Pro",
          description: "Essential for apps with link preview or unfurl capabilities.",
          plan_type: "prepaid",
          price_amount: 79900, // ₹799.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 5000,
          rate_limit_per_minute: 120,
          features: ["5,000 requests / month", "120 req/min rate limit", "Fast headless parser", "Priority support"]
        },
        {
          name: "Enterprise Scale",
          description: "Massive scale for social networks and aggregators.",
          plan_type: "prepaid",
          price_amount: 249900, // ₹2,499.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 50000,
          rate_limit_per_minute: 600,
          features: ["50,000 requests / month", "600 req/min rate limit", "99.95% uptime SLA", "Custom DNS cache tuning"]
        }
      ]
    },

    {
      category_slug: "developer-validation",
      name: "JSON Validator & Schema Inspector",
      slug: "json-validator",
      description: "Validate JSON syntax compliance, calculate object depth, count keys, and pinpoint parse errors with precise line and column coordinates.",
      overview: "High-performance JSON syntax verification and structure profiling microservice. Ideal for API gateways, payload validation, and pre-processing pipelines.",
      provider_name: "Kruu Core",
      icon_url: "/icons/api-validator.svg",
      version: "v2.0.1",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/json-validator",
      http_method: "POST",
      rate_limit_per_minute: 300,
      features: [
        "Deep JSON grammar check adhering to RFC 8259",
        "Exact line and column number reporting on syntax failure",
        "Object hierarchy depth and total key count calculation",
        "Zero-allocation streaming parser for payloads up to 10MB",
        "Sub-5ms evaluation latency"
      ],
      use_cases: [
        "Webhook ingestion payload sanitization",
        "Developer tool JSON input verification",
        "Automated CI/CD schema validation jobs",
        "Form submission payload pre-check"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/json-validator",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          required: ["json"],
          properties: {
            json: { type: "string", description: "Raw JSON string or object to validate" }
          }
        },
        exampleRequest: {
          json: "{\"service\":\"kruu\",\"version\":\"2.0\",\"ready\":true}"
        },
        exampleResponse: {
          success: true,
          isValid: true,
          stats: {
            totalKeys: 3,
            maxDepth: 1,
            byteLength: 47
          }
        },
        statusCodes: [
          { code: 200, description: "Validation complete (check isValid in response)." },
          { code: 400, description: "Invalid payload or unparseable input." },
          { code: 401, description: "Missing or invalid API key." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Get started with JSON validation.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 200,
          rate_limit_per_minute: 60,
          features: ["200 requests / month", "60 req/min rate limit", "Syntax error locator", "Community support"]
        },
        {
          name: "Developer Pro",
          description: "Heavy automation and gateway pipeline checks.",
          plan_type: "prepaid",
          price_amount: 39900, // ₹399.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 25000,
          rate_limit_per_minute: 500,
          features: ["25,000 requests / month", "500 req/min rate limit", "Sub-5ms response time", "Priority support"]
        },
        {
          name: "Enterprise Scale",
          description: "Mission-critical data pipeline processing.",
          plan_type: "prepaid",
          price_amount: 129900, // ₹1,299.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 250000,
          rate_limit_per_minute: 2000,
          features: ["250,000 requests / month", "2,000 req/min rate limit", "99.99% uptime SLA", "Dedicated throughput"]
        }
      ]
    },

    {
      category_slug: "developer-validation",
      name: "JSON Formatter & Minifier",
      slug: "json-formatter",
      description: "Prettify or minify JSON payloads with configurable indentation, byte-savings calculation, and compression ratios.",
      overview: "Streamline raw JSON data for human readability or compress payloads for network transmission savings with exact byte metrics.",
      provider_name: "Kruu Core",
      icon_url: "/icons/api-formatter.svg",
      version: "v1.6.0",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/json-formatter",
      http_method: "POST",
      rate_limit_per_minute: 300,
      features: [
        "Prettify mode with custom indentation (2 or 4 spaces)",
        "Minify mode removing all unnecessary whitespace and linefeeds",
        "Calculates original size, result size, and byte savings percentage",
        "Validates syntax before formatting"
      ],
      use_cases: [
        "Log aggregation formatting",
        "Network payload optimization before mobile transmission",
        "Developer IDE code beautification"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/json-formatter",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          required: ["input"],
          properties: {
            input: { type: "string", description: "JSON string or object" },
            action: { type: "string", enum: ["format", "minify"], default: "format" },
            indent: { type: "integer", enum: [2, 4], default: 2 }
          }
        },
        exampleRequest: {
          action: "minify",
          input: {
            title: "Kruu",
            features: ["Marketplace", "Playground", "Checkout"]
          }
        },
        exampleResponse: {
          success: true,
          output: "{\"title\":\"Kruu\",\"features\":[\"Marketplace\",\"Playground\",\"Checkout\"]}",
          action: "minify",
          originalBytes: 124,
          formattedBytes: 67,
          byteSavings: 57,
          compressionPercent: "46.0%"
        },
        statusCodes: [
          { code: 200, description: "Successfully formatted or minified." },
          { code: 400, description: "Invalid JSON syntax." },
          { code: 401, description: "Missing or invalid API key." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Essential formatting utilities.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 200,
          rate_limit_per_minute: 60,
          features: ["200 requests / month", "60 req/min rate limit", "Prettify & minify support"]
        },
        {
          name: "Developer Pro",
          description: "High-volume payload optimization.",
          plan_type: "prepaid",
          price_amount: 39900,
          currency: "INR",
          billing_interval: "month",
          included_requests: 25000,
          rate_limit_per_minute: 500,
          features: ["25,000 requests / month", "500 req/min rate limit", "Detailed byte savings stats"]
        },
        {
          name: "Enterprise Scale",
          description: "Continuous log formatting pipelines.",
          plan_type: "prepaid",
          price_amount: 129900,
          currency: "INR",
          billing_interval: "month",
          included_requests: 250000,
          rate_limit_per_minute: 2000,
          features: ["250,000 requests / month", "2,000 req/min rate limit", "99.99% SLA"]
        }
      ]
    },

    {
      category_slug: "financial-validation",
      name: "Credit Card Validator & Network Identifier",
      slug: "card-validator",
      description: "Instant Luhn-10 mathematical verification, major card network identification (Visa, Mastercard, Amex, Discover, RuPay), and length checks with zero cardholder data storage.",
      overview: "Zero-retention card validation service designed to sanitize checkout forms, reject mistyped account numbers before payment gateway submission, and identify issuing networks.",
      provider_name: "Kruu Vault",
      icon_url: "/icons/api-card.svg",
      version: "v1.4.2",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/card-validator",
      http_method: "POST",
      rate_limit_per_minute: 180,
      features: [
        "Mod-10 (Luhn) mathematical algorithm verification",
        "Network brand identification (Visa, Mastercard, Amex, Discover, JCB, RuPay)",
        "Zero data retention and PCI-DSS compliance architecture",
        "Masked number generation for secure client logging",
        "Sub-10ms response time"
      ],
      use_cases: [
        "Checkout form client-side pre-flight validation",
        "POS terminal input sanitization",
        "Payment gateway cost optimization by rejecting typos early"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/card-validator",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          required: ["cardNumber"],
          properties: {
            cardNumber: { type: "string", description: "Credit or debit card number string" }
          }
        },
        exampleRequest: {
          cardNumber: "4532718928371928"
        },
        exampleResponse: {
          success: true,
          isValid: true,
          cardType: "Visa",
          lengthValid: true,
          luhnCheck: true,
          masked: "4532-****-****-1928"
        },
        statusCodes: [
          { code: 200, description: "Validation performed successfully." },
          { code: 400, description: "Empty card number." },
          { code: 401, description: "Missing or invalid API key." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Test card validations in your checkout flow.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 100,
          rate_limit_per_minute: 60,
          features: ["100 requests / month", "60 req/min rate limit", "Luhn-10 verification"]
        },
        {
          name: "Developer Pro",
          description: "For active e-commerce and SaaS platforms.",
          plan_type: "prepaid",
          price_amount: 59900, // ₹599.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 15000,
          rate_limit_per_minute: 300,
          features: ["15,000 requests / month", "300 req/min rate limit", "Instant brand detection", "Priority support"]
        },
        {
          name: "Enterprise Scale",
          description: "High-volume checkout gateways.",
          plan_type: "prepaid",
          price_amount: 189900, // ₹1,899.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 150000,
          rate_limit_per_minute: 1500,
          features: ["150,000 requests / month", "1,500 req/min rate limit", "99.99% uptime SLA"]
        }
      ]
    },

    {
      category_slug: "security-cryptography",
      name: "Cryptographic Password & Token Generator",
      slug: "password-generator",
      description: "Generate cryptographically secure passwords, random tokens, API secrets, and alphanumeric keys with configurable character classes and entropy constraints.",
      overview: "Uses Node.js CSPRNG cryptographic primitives to generate unguessable passwords, session tokens, and API secrets with guaranteed entropy levels.",
      provider_name: "Kruu Crypto",
      icon_url: "/icons/api-keygen.svg",
      version: "v1.2.0",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/password",
      http_method: "POST",
      rate_limit_per_minute: 300,
      features: [
        "Cryptographically secure pseudo-random number generator (CSPRNG)",
        "Configurable length from 8 to 128 characters",
        "Toggle uppercase, lowercase, numbers, and special symbols",
        "Option to exclude ambiguous characters (e.g. 0/O, 1/l/I)",
        "Instant entropy bits estimation"
      ],
      use_cases: [
        "Automated initial password generation on user onboarding",
        "Cryptographic secret token generation for webhooks and APIs",
        "One-time provisioning keys for IoT devices"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/password",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          properties: {
            length: { type: "integer", minimum: 8, maximum: 128, default: 16 },
            includeUppercase: { type: "boolean", default: true },
            includeLowercase: { type: "boolean", default: true },
            includeNumbers: { type: "boolean", default: true },
            includeSymbols: { type: "boolean", default: true },
            excludeAmbiguous: { type: "boolean", default: false }
          }
        },
        exampleRequest: {
          length: 24,
          includeSymbols: true,
          includeNumbers: true,
          excludeAmbiguous: true
        },
        exampleResponse: {
          success: true,
          password: "K9m#qW7#vL2*pY8!xR5^bT3&",
          length: 24,
          entropyBits: 132.8
        },
        statusCodes: [
          { code: 200, description: "Password generated successfully." },
          { code: 400, description: "Invalid length or no character sets selected." },
          { code: 401, description: "Missing or invalid API key." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Generate secrets for development.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 200,
          rate_limit_per_minute: 60,
          features: ["200 requests / month", "60 req/min rate limit", "Full CSPRNG security"]
        },
        {
          name: "Developer Pro",
          description: "Automated user and token generation.",
          plan_type: "prepaid",
          price_amount: 34900, // ₹349.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 20000,
          rate_limit_per_minute: 400,
          features: ["20,000 requests / month", "400 req/min rate limit", "Sub-5ms generation"]
        },
        {
          name: "Enterprise Scale",
          description: "Fleet provisioning and device onboarding.",
          plan_type: "prepaid",
          price_amount: 99900, // ₹999.00
          currency: "INR",
          billing_interval: "month",
          included_requests: 200000,
          rate_limit_per_minute: 1500,
          features: ["200,000 requests / month", "1,500 req/min rate limit", "99.99% uptime SLA"]
        }
      ]
    },

    {
      category_slug: "security-cryptography",
      name: "Password Strength & Entropy Analyzer",
      slug: "password-checker",
      description: "High-precision password strength evaluation using Shannon entropy scoring, character pool analysis, dictionary leak alerts, and estimated crack times.",
      overview: "Protect your users from weak passwords before account creation. Analyzes password complexity, Shannon entropy, and provides real-time security suggestions.",
      provider_name: "Kruu Crypto",
      icon_url: "/icons/api-security.svg",
      version: "v2.1.0",
      status: "published",
      playground_enabled: true,
      playground_auth_required: false,
      base_url: "/api/v1",
      endpoint_path: "/passwordchecker",
      http_method: "POST",
      rate_limit_per_minute: 300,
      features: [
        "Shannon entropy calculation in bits (0 to 128+ bits)",
        "Detailed character diversity metrics (uppercase, lowercase, numbers, symbols)",
        "Time-to-crack simulation estimation",
        "Actionable security recommendations",
        "Conforms to NIST SP 800-63B guidelines"
      ],
      use_cases: [
        "Registration form real-time password strength meter",
        "Active Directory and employee password compliance auditing",
        "Security policy posture enforcement"
      ],
      documentation: {
        baseUrl: "/api/v1",
        endpoint: "/passwordchecker",
        method: "POST",
        auth: "x-api-key header or Bearer token",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dh_live_YOUR_API_KEY"
        },
        requestBodySchema: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string", description: "Candidate password string to analyze" }
          }
        },
        exampleRequest: {
          password: "P@ssw0rd!Secure2026"
        },
        exampleResponse: {
          success: true,
          score: 4,
          strength: "Strong",
          entropyBits: 86.4,
          estimatedCrackTime: "12,000 centuries",
          checks: {
            hasUppercase: true,
            hasLowercase: true,
            hasNumbers: true,
            hasSymbols: true,
            length: 19
          },
          suggestions: ["Meets enterprise security standards."]
        },
        statusCodes: [
          { code: 200, description: "Analysis completed successfully." },
          { code: 400, description: "Empty password string." },
          { code: 401, description: "Missing or invalid API key." }
        ]
      },
      plans: [
        {
          name: "Free Community",
          description: "Analyze passwords in local sandboxes.",
          plan_type: "free",
          price_amount: 0,
          currency: "INR",
          billing_interval: "month",
          included_requests: 200,
          rate_limit_per_minute: 60,
          features: ["200 requests / month", "60 req/min rate limit", "Shannon entropy scoring"]
        },
        {
          name: "Developer Pro",
          description: "For active user registration flows.",
          plan_type: "prepaid",
          price_amount: 34900,
          currency: "INR",
          billing_interval: "month",
          included_requests: 20000,
          rate_limit_per_minute: 400,
          features: ["20,000 requests / month", "400 req/min rate limit", "Sub-5ms evaluation"]
        },
        {
          name: "Enterprise Scale",
          description: "High-volume identity authentication gates.",
          plan_type: "prepaid",
          price_amount: 99900,
          currency: "INR",
          billing_interval: "month",
          included_requests: 200000,
          rate_limit_per_minute: 1500,
          features: ["200,000 requests / month", "1,500 req/min rate limit", "99.99% SLA"]
        }
      ]
    }
  ]
};

export async function seedMarketplace() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding Kruu API Marketplace catalogue into PostgreSQL...");
    await client.query("BEGIN");

    // 1. Seed Categories
    const categoryMap = {};
    for (const cat of MARKETPLACE_SEED_DATA.categories) {
      const res = await client.query(
        `
        INSERT INTO api_product_categories (name, slug, description, icon_name, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, TRUE)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            icon_name = EXCLUDED.icon_name,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
        RETURNING id, slug;
        `,
        [cat.name, cat.slug, cat.description, cat.icon_name, cat.sort_order]
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }
    console.log(`✅ Seeded ${MARKETPLACE_SEED_DATA.categories.length} API Categories.`);

    // 2. Seed API Products & Plans
    let productCount = 0;
    let planCount = 0;

    for (const prod of MARKETPLACE_SEED_DATA.products) {
      const categoryId = categoryMap[prod.category_slug];
      if (!categoryId) {
        console.warn(`Category not found for slug: ${prod.category_slug}`);
        continue;
      }

      const prodRes = await client.query(
        `
        INSERT INTO api_products (
          category_id, name, slug, description, overview, provider_name,
          icon_url, version, status, playground_enabled, playground_auth_required,
          base_url, endpoint_path, http_method, rate_limit_per_minute,
          documentation, features, use_cases
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (slug) DO UPDATE
        SET category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            overview = EXCLUDED.overview,
            provider_name = EXCLUDED.provider_name,
            icon_url = EXCLUDED.icon_url,
            version = EXCLUDED.version,
            status = EXCLUDED.status,
            playground_enabled = EXCLUDED.playground_enabled,
            playground_auth_required = EXCLUDED.playground_auth_required,
            base_url = EXCLUDED.base_url,
            endpoint_path = EXCLUDED.endpoint_path,
            http_method = EXCLUDED.http_method,
            rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
            documentation = EXCLUDED.documentation,
            features = EXCLUDED.features,
            use_cases = EXCLUDED.use_cases,
            updated_at = NOW()
        RETURNING id;
        `,
        [
          categoryId,
          prod.name,
          prod.slug,
          prod.description,
          prod.overview,
          prod.provider_name,
          prod.icon_url,
          prod.version,
          prod.status,
          prod.playground_enabled,
          prod.playground_auth_required,
          prod.base_url,
          prod.endpoint_path,
          prod.http_method,
          prod.rate_limit_per_minute,
          JSON.stringify(prod.documentation),
          prod.features,
          prod.use_cases,
        ]
      );

      const productId = prodRes.rows[0].id;
      productCount++;

      // Seed Plans for this product idempotently
      let planSort = 0;
      for (const plan of prod.plans) {
        planSort++;
        const existingPlanRes = await client.query(
          `SELECT id FROM api_plans WHERE api_product_id = $1 AND name = $2 LIMIT 1;`,
          [productId, plan.name]
        );

        if (existingPlanRes.rows.length > 0) {
          await client.query(
            `
            UPDATE api_plans
            SET description = $2,
                plan_type = $3,
                price_amount = $4,
                currency = $5,
                billing_interval = $6,
                included_requests = $7,
                rate_limit_per_minute = $8,
                features = $9,
                is_active = TRUE,
                sort_order = $10,
                updated_at = NOW()
            WHERE id = $1;
            `,
            [
              existingPlanRes.rows[0].id,
              plan.description,
              plan.plan_type,
              plan.price_amount,
              plan.currency,
              plan.billing_interval,
              plan.included_requests,
              plan.rate_limit_per_minute,
              plan.features,
              planSort,
            ]
          );
        } else {
          await client.query(
            `
            INSERT INTO api_plans (
              api_product_id, name, description, plan_type, price_amount, currency,
              billing_interval, included_requests, rate_limit_per_minute,
              features, is_active, sort_order
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11);
            `,
            [
              productId,
              plan.name,
              plan.description,
              plan.plan_type,
              plan.price_amount,
              plan.currency,
              plan.billing_interval,
              plan.included_requests,
              plan.rate_limit_per_minute,
              plan.features,
              planSort,
            ]
          );
        }
        planCount++;
      }
    }

    await client.query("COMMIT");
    console.log(`✅ Seeded ${productCount} API Products and ${planCount} API Plans.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Marketplace seeding failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed_marketplace.js")) {
  seedMarketplace()
    .then(() => {
      console.log("🎉 API Marketplace database seeding completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

import api from '../api/client';

export const PLAYGROUND_TOOLS = [
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    endpoint: '/api/v1/qr',
    browserEndpoint: '/api/utilities/qr',
    method: 'POST',
    description: 'Synthesize custom high-resolution PNG data URLs and vector SVG QR codes.',
    defaultPayload: JSON.stringify(
      {
        text: 'https://kruu.dev/developer/quickstart',
        format: 'png',
        size: 320,
        margin: 2,
        errorCorrectionLevel: 'H',
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/qr', body, apiKey);
      }
      return await api.generateQr(body);
    },
  },
  {
    id: 'url-metadata',
    name: 'URL Metadata Extractor',
    endpoint: '/api/v1/url-metadata',
    browserEndpoint: '/api/utilities/url-metadata',
    method: 'POST',
    description: 'SSRF-protected engine extracting OpenGraph, Twitter Cards, favicons, and page titles.',
    defaultPayload: JSON.stringify(
      {
        url: 'https://github.com/features/actions',
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/url-metadata', body, apiKey);
      }
      return await api.extractUrlMetadata(body);
    },
  },
  {
    id: 'json-validator',
    name: 'JSON Validator & Inspector',
    endpoint: '/api/v1/json-validator',
    browserEndpoint: '/api/utilities/json-validator',
    method: 'POST',
    description: 'Verify syntax compliance, calculate object depth, key count, and pin syntax errors.',
    defaultPayload: JSON.stringify(
      {
        service: 'kruu-api',
        version: '2.0.0',
        protocols: ['http/2', 'tls1.3'],
        features: {
          rateLimiting: 'Redis Lua 60 req/min',
          auth: 'HttpOnly Cookies + API Keys',
        },
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/json-validator', body, apiKey);
      }
      return await api.validateJson(body);
    },
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Minifier',
    endpoint: '/api/v1/json-formatter',
    browserEndpoint: '/api/utilities/json-formatter',
    method: 'POST',
    description: 'Prettify or minify JSON payloads with precise byte savings and compression metrics.',
    defaultPayload: JSON.stringify(
      {
        action: 'minify',
        indent: 2,
        input: {
          service: 'Kruu',
          endpoints: ['/api/v1/qr', '/api/v1/url-metadata', '/api/v1/json-validator'],
          enabled: true,
        },
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/json-formatter', body, apiKey);
      }
      return await api.formatJson(body);
    },
  },
  {
    id: 'card-validator',
    name: 'Credit Card Validator',
    endpoint: '/api/v1/card-validator',
    browserEndpoint: '/api/utilities/card-validator',
    method: 'POST',
    description: 'Verify card checksums with Luhn-10 algorithm and detect major issuing networks.',
    defaultPayload: JSON.stringify(
      {
        cardNumber: '4532 7189 2837 1928',
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/card-validator', body, apiKey);
      }
      return await api.validateCard(body);
    },
  },
  {
    id: 'password-gen',
    name: 'Cryptographic Password Generator',
    endpoint: '/api/v1/password',
    browserEndpoint: '/api/utilities/password',
    method: 'POST',
    description: 'Generate high-entropy randomized API tokens and cryptographic passphrases.',
    defaultPayload: JSON.stringify(
      {
        length: 24,
        hasSymbols: true,
        hasNumbers: true,
        hasUppercase: true,
        hasLowercase: true,
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/password', body, apiKey);
      }
      return await api.generatePassword(body);
    },
  },
  {
    id: 'password-checker',
    name: 'Password Strength Analyzer',
    endpoint: '/api/v1/passwordchecker',
    browserEndpoint: '/api/utilities/passwordchecker',
    method: 'POST',
    description: 'Calculate Shannon entropy bits, charset coverage, and estimated crack resilience.',
    defaultPayload: JSON.stringify(
      {
        password: 'Tr0ub4dor&3_Secure99!',
      },
      null,
      2
    ),
    execute: async (payload, apiKey) => {
      let body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (apiKey) {
        return await api.developerCall('/passwordchecker', body, apiKey);
      }
      return await api.checkPassword(body);
    },
  },
];

export default PLAYGROUND_TOOLS;

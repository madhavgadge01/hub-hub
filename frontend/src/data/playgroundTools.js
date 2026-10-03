// Real client-side utility functions to simulate and power the Tools Playground

// 1. Luhn Algorithm and Card Network Identifier
export function validateCardNumber(numStr) {
  const clean = (numStr || '').replace(/[\s-]/g, '');
  if (!clean || !/^\d+$/.test(clean)) {
    return {
      valid: false,
      error: 'Card number must contain digits only',
      cardType: 'Unknown',
      luhnCheck: false,
      lengthValid: false
    };
  }

  // Detect brand
  let cardType = 'Unknown';
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(clean) || /^4/.test(clean)) {
    cardType = 'Visa';
  } else if (/^5[1-5][0-9]{14}$/.test(clean) || /^2(?:2[2-9][0-9]{2}|[3-6][0-9]{3}|7[0-1][0-9]{2}|720[0-9])[0-9]{10}$/.test(clean)) {
    cardType = 'Mastercard';
  } else if (/^3[47][0-9]{13}$/.test(clean)) {
    cardType = 'American Express';
  } else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(clean)) {
    cardType = 'Discover';
  } else if (/^(?:2131|1800|35\d{3})\d{11}$/.test(clean)) {
    cardType = 'JCB';
  } else if (/^(?:508[5-9]|652[1-2]|606[1-9]|607[0-9]|608[0-4])\d{12}$/.test(clean)) {
    cardType = 'RuPay';
  }

  // Luhn check
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const luhnCheck = sum % 10 === 0;
  const lengthValid = clean.length >= 13 && clean.length <= 19;
  const masked = clean.length > 8 
    ? `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`
    : '****';

  return {
    valid: luhnCheck && lengthValid,
    cardType,
    length: clean.length,
    lengthValid,
    luhnCheck,
    masked,
    checksum: sum % 10,
    timestamp: new Date().toISOString()
  };
}

// 2. Password Strength & Entropy Evaluator
export function evaluatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      strength: 'Empty',
      entropyBits: 0,
      crackTimeDisplay: 'Instant',
      checks: {
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSymbols: false,
        minLengthPassed: false
      },
      feedback: {
        warning: 'Password is empty',
        suggestions: ['Enter at least 8 characters with numbers and symbols']
      }
    };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);
  const minLength = password.length >= 8;

  let poolSize = 0;
  if (hasUpper) poolSize += 26;
  if (hasLower) poolSize += 26;
  if (hasNum) poolSize += 10;
  if (hasSym) poolSize += 33;
  if (poolSize === 0) poolSize = 1;

  // Shannon entropy R = L * log2(poolSize)
  const entropy = Math.round(password.length * Math.log2(poolSize) * 10) / 10;

  let score = 1;
  let strength = 'Weak';
  let crackTimeDisplay = '< 1 second';

  if (entropy > 80 && password.length >= 14) {
    score = 4;
    strength = 'Very Strong';
    crackTimeDisplay = '2.4 million years';
  } else if (entropy > 60 && password.length >= 10) {
    score = 3;
    strength = 'Strong';
    crackTimeDisplay = '140 years';
  } else if (entropy > 40 && password.length >= 8) {
    score = 2;
    strength = 'Moderate';
    crackTimeDisplay = '3 days';
  } else if (entropy > 25) {
    score = 1;
    strength = 'Weak';
    crackTimeDisplay = '2 minutes';
  }

  const suggestions = [];
  if (!hasUpper) suggestions.push('Add uppercase characters (A-Z)');
  if (!hasNum) suggestions.push('Include numbers (0-9)');
  if (!hasSym) suggestions.push('Include symbols (!@#$%^&*)');
  if (password.length < 12) suggestions.push('Increase length to 12+ characters');

  return {
    score,
    strength,
    entropyBits: entropy,
    poolSize,
    crackTimeDisplay,
    checks: {
      hasUppercase: hasUpper,
      hasLowercase: hasLower,
      hasNumbers: hasNum,
      hasSymbols: hasSym,
      minLengthPassed: minLength
    },
    feedback: {
      warning: score < 3 ? 'Consider generating a stronger cryptographic passphrase' : null,
      suggestions: suggestions.length > 0 ? suggestions : ['Meets high security standards']
    }
  };
}

// 3. Mock URL Metadata Extractor
export function extractUrlMetadata(targetUrl) {
  try {
    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    const host = parsed.hostname;
    
    // Provide realistic meta responses
    let title = `${host.charAt(0).toUpperCase() + host.slice(1)} — Modern Cloud Services`;
    let description = `Official landing platform, documentation, and APIs for ${host}. Optimized for high concurrency and microservices.`;
    let siteName = host.replace('www.', '').split('.')[0];
    siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    
    if (host.includes('github')) {
      title = 'GitHub: Let’s build from here';
      description = 'GitHub is where over 100 million developers shape the future of software, together.';
    } else if (host.includes('stripe')) {
      title = 'Stripe | Financial Infrastructure for the Internet';
      description = 'Millions of companies of all sizes use Stripe online and in person to accept payments, send payouts, and manage their businesses online.';
    } else if (host.includes('vercel')) {
      title = 'Vercel: Build and deploy the best Web experiences';
      description = 'Vercel’s Frontend Cloud provides the developer experience and infrastructure to build, scale, and secure a faster, more personalized web.';
    }

    return {
      url: parsed.href,
      protocol: parsed.protocol,
      hostname: host,
      pathname: parsed.pathname,
      title,
      description,
      siteName,
      image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600`,
      favicon: `https://${host}/favicon.ico`,
      statusCode: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'server': 'cloudflare'
      },
      parsedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      error: 'Invalid URL provided. Please include a valid host like https://example.com',
      statusCode: 400
    };
  }
}

// 4. Cryptographic Password / Token Generator
export function generateSecurePassword({ length = 20, symbols = true, numbers = true, uppercase = true }) {
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+~|}{[]:;?><,./-=';

  let result = '';
  const cryptoObj = window.crypto || window.msCrypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const randomVals = new Uint32Array(length);
    cryptoObj.getRandomValues(randomVals);
    for (let i = 0; i < length; i++) {
      result += chars[randomVals[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return {
    password: result,
    length,
    entropy: Math.round(length * Math.log2(chars.length) * 10) / 10,
    generatedAt: new Date().toISOString()
  };
}

export const PLAYGROUND_TOOLS = [
  {
    id: 'card-validator',
    name: 'Credit Card Validator',
    endpoint: '/api/v1/card-validator',
    method: 'POST',
    description: 'Verify credit card checksums via Luhn algorithm & detect card network.',
    defaultPayload: JSON.stringify({
      cardNumber: "4532 7189 2837 1928"
    }, null, 2),
    handler: (input) => {
      let data = {};
      try { data = JSON.parse(input); } catch(e) { data = { cardNumber: input }; }
      return validateCardNumber(data.cardNumber || input);
    }
  },
  {
    id: 'password-checker',
    name: 'Password Strength Checker',
    endpoint: '/api/v1/passwordchecker',
    method: 'POST',
    description: 'Calculate password entropy bits, attack resilience & brute-force times.',
    defaultPayload: JSON.stringify({
      password: "Tr0ub4dor&3_Secure99!"
    }, null, 2),
    handler: (input) => {
      let data = {};
      try { data = JSON.parse(input); } catch(e) { data = { password: input }; }
      return evaluatePasswordStrength(data.password || input);
    }
  },
  {
    id: 'url-metadata',
    name: 'URL Metadata Extractor',
    endpoint: '/api/v1/url-metadata',
    method: 'POST',
    description: 'Parse OpenGraph tags, page titles, descriptions, and metadata headers.',
    defaultPayload: JSON.stringify({
      url: "https://stripe.com"
    }, null, 2),
    handler: (input) => {
      let data = {};
      try { data = JSON.parse(input); } catch(e) { data = { url: input }; }
      return extractUrlMetadata(data.url || input);
    }
  },
  {
    id: 'password-gen',
    name: 'Cryptographic Password Generator',
    endpoint: '/api/v1/password',
    method: 'POST',
    description: 'Generate high-entropy randomized API tokens and secure passwords.',
    defaultPayload: JSON.stringify({
      length: 24,
      symbols: true,
      numbers: true,
      uppercase: true
    }, null, 2),
    handler: (input) => {
      let data = { length: 24, symbols: true, numbers: true, uppercase: true };
      try { data = { ...data, ...JSON.parse(input) }; } catch(e) {}
      return generateSecurePassword(data);
    }
  }
];

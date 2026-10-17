/**
 * Universal Tool Logo Resolver for Kruu
 * Ensures all developer tool logos render in their authentic, recognizable brand colors
 * instead of grayscale or monochrome Simple-Icons assets.
 */

const LOCAL_BRAND_LOGOS = {
  // AI & Machine Learning
  'openai': '/logos/openai.svg',
  'openai-api': '/logos/openai.svg',
  'anthropic-claude': '/logos/claude.svg',
  'anthropic': '/logos/claude.svg',
  'claude': '/logos/claude.svg',
  'gemini': '/logos/gemini.svg',
  'google-gemini': '/logos/gemini.svg',

  // Developer Platforms & Infrastructure
  'github': '/logos/github.svg',
  'cloudflare': '/logos/cloudflare.svg',
  'amazons3': '/logos/amazon-s3.svg',
  'amazon-s3': '/logos/amazon-s3.svg',
  'aws-s3': '/logos/amazon-s3.svg',

  // Payments & Auth
  'stripe': '/logos/stripe.svg',
  'supabase': '/logos/supabase.svg',
  'supabase-auth': '/logos/supabase.svg',
  'auth0': '/logos/auth0.svg',

  // Communication & Email
  'resend': '/logos/resend.svg',
  'sendgrid': '/logos/sendgrid.svg',
  'twilio': '/logos/twilio.svg',
  'mailgun': '/logos/mailgun.svg',

  // Maps & Location
  'googlemaps': '/logos/google-maps.svg',
  'google-maps': '/logos/google-maps.svg',
  'google-maps-platform': '/logos/google-maps.svg',
  'mapbox': '/logos/mapbox.svg',

  // Analytics & DevTools
  'postman': '/logos/postman.svg',
  'posthog': '/logos/posthog.svg',
};

/**
 * Resolves the authentic, original brand-color logo URL for a tool.
 *
 * @param {Object|string} tool - Tool object containing slug, name, icon_url OR a slug/name string.
 * @returns {string} Fully resolved authentic brand-color logo URL
 */
export function getToolLogoUrl(tool) {
  if (!tool) return '/icons/api-qrcode.svg';

  const slug = typeof tool === 'string' ? tool.toLowerCase().trim() : (tool.slug || '').toLowerCase().trim();
  const iconUrl = typeof tool === 'object' && tool.icon_url ? tool.icon_url.trim() : '';
  const name = typeof tool === 'object' && tool.name ? tool.name.toLowerCase().trim() : '';

  // 1. Direct slug match
  if (LOCAL_BRAND_LOGOS[slug]) {
    return LOCAL_BRAND_LOGOS[slug];
  }

  // 2. Check if icon_url is a monochrome simple-icons URL and replace with authentic brand colored SVG
  if (iconUrl.includes('simple-icons')) {
    const filenameMatch = iconUrl.match(/\/icons\/([^.]+)\.svg/);
    if (filenameMatch && filenameMatch[1]) {
      const iconKey = filenameMatch[1].toLowerCase();
      if (LOCAL_BRAND_LOGOS[iconKey]) {
        return LOCAL_BRAND_LOGOS[iconKey];
      }
    }
  }

  // 3. Match against known brand names in name or slug
  for (const [key, path] of Object.entries(LOCAL_BRAND_LOGOS)) {
    if (slug.includes(key) || name.includes(key)) {
      return path;
    }
  }

  // 4. If already an authentic local or custom logo
  if (iconUrl && !iconUrl.includes('simple-icons')) {
    return iconUrl;
  }

  // 5. Fallback
  return iconUrl || '/icons/api-qrcode.svg';
}

export default getToolLogoUrl;

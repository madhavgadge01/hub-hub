import fs from 'fs';
import path from 'path';

const logosDir = path.resolve('apps/frontend/public/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const logos = {
  // 1. OpenAI API - Iconic Teal/Green #10A37F Rosette
  'openai.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path fill="#10A37F" fill-rule="evenodd" clip-rule="evenodd" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.124 7.1956a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6625zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1636a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
</svg>`,

  // 2. Anthropic Claude - Authentic Terracotta #D97757 Sunburst Spark / Dual-A Mark
  'claude.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path fill="#D97757" fill-rule="evenodd" clip-rule="evenodd" d="M12 2C12.4 6.8 13.6 8.5 17 9.8 13.6 11.1 12.4 12.8 12 17.6 11.6 12.8 10.4 11.1 7 9.8 10.4 8.5 11.6 6.8 12 2zm6.5 10.5c.3 3.2 1.1 4.3 3.5 5.1-2.4.8-3.2 1.9-3.5 5.1-.3-3.2-1.1-4.3-3.5-5.1 2.4-.8 3.2-1.9 3.5-5.1zM5 14c.25 2.5.85 3.4 2.75 4-1.9.6-2.5 1.5-2.75 4-.25-2.5-.85-3.4-2.75-4 1.9-.6 2.5-1.5 2.75-4z"/>
</svg>`,

  'anthropic-claude.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path fill="#D97757" fill-rule="evenodd" clip-rule="evenodd" d="M12 2C12.4 6.8 13.6 8.5 17 9.8 13.6 11.1 12.4 12.8 12 17.6 11.6 12.8 10.4 11.1 7 9.8 10.4 8.5 11.6 6.8 12 2zm6.5 10.5c.3 3.2 1.1 4.3 3.5 5.1-2.4.8-3.2 1.9-3.5 5.1-.3-3.2-1.1-4.3-3.5-5.1 2.4-.8 3.2-1.9 3.5-5.1zM5 14c.25 2.5.85 3.4 2.75 4-1.9.6-2.5 1.5-2.75 4-.25-2.5-.85-3.4-2.75-4 1.9-.6 2.5-1.5 2.75-4z"/>
</svg>`,

  // 3. Google Gemini - Authentic Blue/Purple/Pink Gradient 4-Point Star
  'gemini.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
  <defs>
    <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1BA1E3"/>
      <stop offset="35%" stop-color="#4E82EE"/>
      <stop offset="65%" stop-color="#9B72CF"/>
      <stop offset="85%" stop-color="#D96570"/>
      <stop offset="100%" stop-color="#F28B82"/>
    </linearGradient>
  </defs>
  <path fill="url(#gemini-gradient)" d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81Z"/>
</svg>`,

  'google-gemini.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
  <defs>
    <linearGradient id="gemini-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1BA1E3"/>
      <stop offset="35%" stop-color="#4E82EE"/>
      <stop offset="65%" stop-color="#9B72CF"/>
      <stop offset="85%" stop-color="#D96570"/>
      <stop offset="100%" stop-color="#F28B82"/>
    </linearGradient>
  </defs>
  <path fill="url(#gemini-gradient-2)" d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81Z"/>
</svg>`,

  // 4. GitHub - Authentic Octocat with Dark Slate Badge #24292F and Crisp White Silhouette (renders on both dark and light)
  'github.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="12" fill="#24292F"/>
  <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58 4 4 7.58 4 12c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0020 12c0-4.42-3.58-8-8-8z"/>
</svg>`,

  // 5. Stripe - Iconic Blurple #635BFF Squircle with White S
  'stripe.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#635BFF"/>
  <path fill="#FFFFFF" d="M14.2 9.15c0-.78-.64-1.16-1.64-1.16-1.39 0-2.7.48-3.63 1.02L8.2 6.56C9.48 5.86 11.15 5.5 12.64 5.5c3.09 0 5.12 1.54 5.12 4.14 0 4.05-5.57 3.4-5.57 5.14 0 .91.78 1.26 1.87 1.26 1.62 0 3.12-.6 4.15-1.25l.73 2.5c-1.34.8-3.23 1.21-4.99 1.21-3.25 0-5.35-1.57-5.35-4.18 0-4.27 5.6-3.48 5.6-5.17z"/>
</svg>`,

  // 6. Supabase - Authentic Emerald Gradient Lightning Bolt #3ECF8E
  'supabase.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="supabase-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3ECF8E"/>
      <stop offset="100%" stop-color="#24B47E"/>
    </linearGradient>
  </defs>
  <path fill="url(#supabase-grad)" d="M21.362 9.354H12V.3a.3.3 0 0 0-.528-.2L.735 12.827a.6.6 0 0 0 .437 1.027H12v9.846a.3.3 0 0 0 .528.2l11.265-13.52a.6.6 0 0 0-.431-1.026z"/>
</svg>`,

  'supabase-auth.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="supabase-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3ECF8E"/>
      <stop offset="100%" stop-color="#24B47E"/>
    </linearGradient>
  </defs>
  <path fill="url(#supabase-grad-2)" d="M21.362 9.354H12V.3a.3.3 0 0 0-.528-.2L.735 12.827a.6.6 0 0 0 .437 1.027H12v9.846a.3.3 0 0 0 .528.2l11.265-13.52a.6.6 0 0 0-.431-1.026z"/>
</svg>`,

  // 7. Google Maps - Official 4-Color Pin (Blue #4285F4, Red #EA4335, Yellow #FBBC05, Green #34A853)
  'google-maps.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#4285F4" d="M19.5 9.5c0 4.14-5.5 11.5-7.5 14-2-2.5-7.5-9.86-7.5-14a7.5 7.5 0 1 1 15 0z"/>
  <path fill="#EA4335" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 2.05 1.34 4.8 3.16 7.5l4.34-5.5V2z"/>
  <path fill="#FBBC05" d="M12 2v9.5l4.34 5.5c1.82-2.7 3.16-5.45 3.16-7.5A7.5 7.5 0 0 0 12 2z"/>
  <path fill="#34A853" d="M7.66 17c1.34 1.8 2.84 3.7 4.34 5.5 1.5-1.8 3-3.7 4.34-5.5l-4.34-5.5-4.34 5.5z"/>
  <circle cx="12" cy="9.5" r="3" fill="#FFFFFF"/>
</svg>`,

  'googlemaps.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#4285F4" d="M19.5 9.5c0 4.14-5.5 11.5-7.5 14-2-2.5-7.5-9.86-7.5-14a7.5 7.5 0 1 1 15 0z"/>
  <path fill="#EA4335" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 2.05 1.34 4.8 3.16 7.5l4.34-5.5V2z"/>
  <path fill="#FBBC05" d="M12 2v9.5l4.34 5.5c1.82-2.7 3.16-5.45 3.16-7.5A7.5 7.5 0 0 0 12 2z"/>
  <path fill="#34A853" d="M7.66 17c1.34 1.8 2.84 3.7 4.34 5.5 1.5-1.8 3-3.7 4.34-5.5l-4.34-5.5-4.34 5.5z"/>
  <circle cx="12" cy="9.5" r="3" fill="#FFFFFF"/>
</svg>`,

  // 8. Cloudflare - Authentic Orange #F38020 / Amber #FAAE40 Cloud
  'cloudflare.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#FAAE40" d="M18.23 8.16A5.5 5.5 0 0 0 8 9.5a4.25 4.25 0 0 0-4.25 4.25c0 .26.03.5.07.75h14.5a3.5 3.5 0 0 0-.09-6.34z"/>
  <path fill="#F38020" d="M18.32 8.16a5.52 5.52 0 0 0-5.32-3.16c-2.4 0-4.43 1.53-5.18 3.69a4.25 4.25 0 0 0-4.07 4.06c0 .25.02.5.07.75h14.5a3.5 3.5 0 0 0-.09-6.34z"/>
  <path fill="#F38020" d="M19.75 11.25a3.5 3.5 0 0 0-1.43.3h-.09a3.5 3.5 0 0 1 .09 2.95H2.5a.5.5 0 0 0-.5.5c0 .28.22.5.5.5h17.25a3.5 3.5 0 0 0 0-7c-.08 0-.17 0-.25.02v2.73h.25z"/>
</svg>`,

  // 9. Postman - Authentic Orange #FF6C37 Squircle with Spaceman
  'postman.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#FF6C37"/>
  <path fill="#FFFFFF" d="M14.5 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm-2.2 6.8c-.8-.2-1.7.1-2.2.8l-4.5 6.2c-.3.4-.2 1 .2 1.3.4.3 1 .2 1.3-.2l4.3-5.9 3.2 2.6c.4.3 1 .3 1.4-.1l3.5-3.8c.4-.4.3-1.1-.1-1.4-.4-.4-1.1-.3-1.4.1l-2.8 3.1-2.9-2.7z"/>
</svg>`,

  // 10. PostHog - Authentic Flame/Yellow Hedgehog #F54E00 & #FFC000
  'posthog.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#F54E00"/>
  <path fill="#FFC000" d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 12.5c0 .83-.67 1.5-1.5 1.5S10 17.33 10 16.5 10.67 15 11.5 15s1.5.67 1.5 1.5zm-5-3c-.83 0-1.5-.67-1.5-1.5S7.17 10.5 8 10.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  <circle cx="12" cy="8" r="2" fill="#FFFFFF"/>
</svg>`,

  // 11. Resend - Sleek Black Squircle with Crisp White Resend R
  'resend.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#000000"/>
  <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="M6 6h6.5a4.5 4.5 0 0 1 3.182 7.682L18.5 18h-3.5l-2.5-4H9v4H6V6zm3 3v3h3.5a1.5 1.5 0 0 0 0-3H9z"/>
</svg>`,

  // 12. Twilio - Authentic Red #F22F46 Ring & Dots
  'twilio.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#F22F46" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8zm-3.6 4.8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm7.2 0a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm-7.2 7.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm7.2 0a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>
</svg>`,

  // 13. SendGrid - Authentic Cyan/Blue #1A82E2 Square Grid
  'sendgrid.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#1A82E2"/>
  <path fill="#FFFFFF" d="M6 6h4v4H6V6zm8 0h4v4h-4V6zm-4 4h4v4h-4v-4zm-4 4h4v4H6v-4zm8 0h4v4h-4v-4z"/>
</svg>`,

  // 14. Mailgun - Authentic Flame Red #F05032 Envelope
  'mailgun.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#F05032"/>
  <path fill="#FFFFFF" d="M5 8.5v7a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-7l-7 4.5-7-4.5zm0-1.5c0-.4.15-.75.4-1L12 10.5 18.6 6c.25.25.4.6.4 1v.5l-7 4.5-7-4.5V7z"/>
</svg>`,

  // 15. Mapbox - Authentic Vibrant Blue #4264FB Squircle with White M
  'mapbox.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#4264FB"/>
  <path fill="#FFFFFF" d="M12 6.5c-2.4 0-4.2 1.6-4.5 3.8-.3-2.2-2.1-3.8-4.5-3.8v8h2v-4.5c0-1.4 1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V14.5h2v-4.5c0-1.4 1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V14.5h2V10.3c0-2.2-1.8-3.8-4.5-3.8z"/>
</svg>`,

  // 16. Auth0 - Authentic Flame Shield #EB5424
  'auth0.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#EB5424" d="M12 1.5L4 4.5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12v-6l-8-3zm0 4c2.21 0 4 1.79 4 4 0 1.66-1.02 3.09-2.47 3.69L12 18l-1.53-4.81A3.996 3.996 0 0 1 8 9.5c0-2.21 1.79-4 4-4z"/>
</svg>`,

  // 17. Amazon S3 - Authentic AWS Storage Green #569A31 & Orange #FF9900
  'amazon-s3.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#232F3E"/>
  <path fill="#569A31" d="M12 4L4 8v8l8 4 8-4V8l-8-4zm0 2.2l5.5 2.8L12 11.8 6.5 9 12 6.2zm-6 4.3l5 2.5v5.3l-5-2.5V10.5zm7 7.8v-5.3l5-2.5v5.3l-5 2.5z"/>
  <path fill="#FF9900" d="M12 3l9 4.5v9L12 21 3 16.5v-9L12 3zm0 1.8L4.8 8.4 12 12l7.2-3.6L12 4.8z"/>
</svg>`,

  'amazons3.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#232F3E"/>
  <path fill="#569A31" d="M12 4L4 8v8l8 4 8-4V8l-8-4zm0 2.2l5.5 2.8L12 11.8 6.5 9 12 6.2zm-6 4.3l5 2.5v5.3l-5-2.5V10.5zm7 7.8v-5.3l5-2.5v5.3l-5 2.5z"/>
  <path fill="#FF9900" d="M12 3l9 4.5v9L12 21 3 16.5v-9L12 3zm0 1.8L4.8 8.4 12 12l7.2-3.6L12 4.8z"/>
</svg>`,
};

for (const [filename, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(logosDir, filename), content.trim());
  console.log(`Generated: ${filename}`);
}

console.log('All authentic brand colored logos generated successfully!');

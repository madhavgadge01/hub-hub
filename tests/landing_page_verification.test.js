import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Kruu Landing Page & Public Navigation Verification', async (t) => {
  const repoRoot = process.cwd();
  const landingPagePath = path.join(repoRoot, 'apps/frontend/src/pages/LandingPage.jsx');
  const publicNavbarPath = path.join(repoRoot, 'apps/frontend/src/components/navigation/PublicNavbar.jsx');
  const topNavPath = path.join(repoRoot, 'apps/frontend/src/components/navigation/TopNavigation.jsx');
  const appPath = path.join(repoRoot, 'apps/frontend/src/App.jsx');

  const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');
  const publicNavbarContent = fs.readFileSync(publicNavbarPath, 'utf8');
  const topNavContent = fs.readFileSync(topNavPath, 'utf8');
  const appContent = fs.readFileSync(appPath, 'utf8');

  await t.test('1. Public Navbar contains only required links and excludes app-specific tabs', () => {
    assert.ok(publicNavbarContent.includes('Kruu'), 'Public navbar should show Kruu brand');
    assert.ok(publicNavbarContent.includes('/kruu_logo.png'), 'Public navbar should show logo');
    assert.ok(publicNavbarContent.includes('About Us'), 'Public navbar should include About Us');
    assert.ok(publicNavbarContent.includes('Careers'), 'Public navbar should include Careers');
    assert.ok(publicNavbarContent.includes('Login'), 'Public navbar should include Login');
    assert.ok(publicNavbarContent.includes('Get Started'), 'Public navbar should include Get Started');
    assert.ok(!publicNavbarContent.includes('Tool Discovery'), 'Public navbar must NOT include Tool Discovery');
    assert.ok(!publicNavbarContent.includes('API Market'), 'Public navbar must NOT include API Market');
  });

  await t.test('2. Authentication-Aware behavior in LandingPage and App', () => {
    assert.ok(landingPageContent.includes('useApp'), 'LandingPage must use actual existing auth state');
    assert.ok(landingPageContent.includes('<Navigate to="/tools" replace />'), 'Authenticated user must be redirected to /tools');
    assert.ok(landingPageContent.includes('authLoading'), 'LandingPage handles authLoading cleanly');
    assert.ok(topNavContent.includes("navigate('/tools')"), 'TopNavigation brand click directs authenticated users to /tools');
  });

  await t.test('3. Hero Section conforms to specifications', () => {
    assert.ok(landingPageContent.includes('Everything Developers Need.'), 'Hero contains required headline');
    assert.ok(landingPageContent.includes('One Platform.'), 'Hero contains required headline suffix');
    assert.ok(landingPageContent.includes('Discover the software you need. Explore developer APIs and test them in one place.'), 'Hero contains required supporting copy');
    assert.ok(landingPageContent.includes('Explore Kruu'), 'Hero contains Explore Kruu CTA');
    assert.ok(landingPageContent.includes('Get Started'), 'Hero contains Get Started CTA');
    assert.ok(landingPageContent.includes('API Sandbox'), 'Hero contains real API sandbox preview');
    assert.ok(landingPageContent.includes('Tool Compare'), 'Hero contains real Tool Compare preview');
  });

  await t.test('4. Product Overview Section (#overview)', () => {
    assert.ok(landingPageContent.includes('id="overview"'), 'Overview section has #overview anchor');
    assert.ok(landingPageContent.includes('Tool Discovery'), 'Overview describes Tool Discovery');
    assert.ok(landingPageContent.includes('Find and compare developer software.'), 'Overview includes exact Tool Discovery subtitle');
    assert.ok(landingPageContent.includes('API Marketplace'), 'Overview describes API Marketplace');
    assert.ok(landingPageContent.includes('to="/tools"'), 'Tool Discovery card links to existing /tools route');
    assert.ok(landingPageContent.includes('to="/api-market"'), 'API Marketplace card links to existing /api-market route');
  });

  await t.test('5. Compact How Kruu Helps Section', () => {
    assert.ok(landingPageContent.includes('Discover useful developer software'), 'How Kruu Helps includes benefit 1');
    assert.ok(landingPageContent.includes('Compare tools before choosing one'), 'How Kruu Helps includes benefit 2');
    assert.ok(landingPageContent.includes('Explore APIs and test supported endpoints'), 'How Kruu Helps includes benefit 3');
    assert.ok(landingPageContent.includes('Manage API access and usage in one place'), 'How Kruu Helps includes benefit 4');
  });

  await t.test('6. Small About Us Section (#about-us)', () => {
    assert.ok(landingPageContent.includes('id="about-us"'), 'About Us section has #about-us anchor');
    assert.ok(landingPageContent.includes('Why We Built Kruu'), 'About Us heading exists');
    assert.ok(!landingPageContent.includes('50+ Tools & Microservices'), 'Unverified metrics excluded from About Us');
  });

  await t.test('7. Compact Careers / Work With Us Section with Mailto links', () => {
    assert.ok(landingPageContent.includes('id="careers"'), 'Careers section has #careers anchor');
    assert.ok(landingPageContent.includes('Want to Build with Kruu?'), 'Careers has required headline');
    assert.ok(landingPageContent.includes("We're interested in connecting with developers, designers"), 'Careers has required supporting copy');
    assert.ok(landingPageContent.includes('mailto:kruu.online@gmail.com'), 'All buttons point to kruu.online@gmail.com');
    assert.ok(landingPageContent.includes("'Working with Kruu'"), 'Work With Us subject is present and passed to encodeURIComponent');
    assert.ok(landingPageContent.includes("'Technical Collaboration with Kruu'"), 'Technical Collaboration subject is present and passed to encodeURIComponent');
    assert.ok(landingPageContent.includes("'Enquiry about Kruu'"), 'General Enquiry subject is present and passed to encodeURIComponent');
  });

  await t.test('8. Removal of unverified claims and fake hiring data', () => {
    const unverifiedClaims = [
      'Sub-15ms Edge Latency',
      '99.99% Gateway Uptime SLA',
      'TLS 1.3 Certified',
      'Zero Payload Retention',
      '$3,000 Workspace Stipend',
      '$1,500 Annual Learning Budget',
      'Senior Distributed Systems Engineer',
      'Staff Database & Cache Infrastructure Architect',
      '$140k – $180k',
    ];

    for (const claim of unverifiedClaims) {
      assert.ok(!landingPageContent.includes(claim), `Landing page should not contain unverified claim: "${claim}"`);
    }
  });

  await t.test('9. Minimal public footer', () => {
    assert.ok(landingPageContent.includes('About Us'), 'Footer includes About Us');
    assert.ok(landingPageContent.includes('Careers'), 'Footer includes Careers');
    assert.ok(landingPageContent.includes('/login'), 'Footer includes Login link');
    assert.ok(landingPageContent.includes('/signup'), 'Footer includes Get Started link');
    assert.ok(landingPageContent.includes('All rights reserved.'), 'Footer includes copyright line');
  });

  await t.test('10. App navigation separation', () => {
    assert.ok(appContent.includes('!isLandingRoute && <TopNavigation'), 'TopNavigation is excluded from public landing page');
    assert.ok(!topNavContent.includes('Careers'), 'TopNavigation does not contain Careers tab in segmented control');
  });
});

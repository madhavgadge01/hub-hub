import 'dotenv/config';
import { pool } from '../apps/backend/src/config/db.js';

async function seed() {
  console.log('Inserting Google Gemini and GitHub tools...');

  // 1. Get Category IDs
  const catAi = await pool.query("SELECT id FROM tool_categories WHERE slug = 'ai-machine-learning'");
  const catDev = await pool.query("SELECT id FROM tool_categories WHERE slug = 'developer-utilities'");

  if (!catAi.rows[0] || !catDev.rows[0]) {
    console.error('Categories not found!');
    process.exit(1);
  }

  const aiCatId = catAi.rows[0].id;
  const devCatId = catDev.rows[0].id;

  // 2. Insert Google Gemini
  const geminiRes = await pool.query(`
    INSERT INTO tools (
      category_id, name, slug, provider_name, icon_url, short_description,
      overview, main_purpose, typical_use_cases, intended_audience,
      deployment_model, official_website_url, is_published, published_at
    ) VALUES (
      $1, 'Google Gemini', 'google-gemini', 'Google DeepMind', '/logos/gemini.svg',
      'Multimodal AI intelligence with 1M+ token context window and native video, audio, and code reasoning.',
      'Google Gemini is a multimodal frontier foundation model family designed from the ground up to operate across text, code, audio, image, and video modalities seamlessly.',
      'Advanced multimodal reasoning, long-document processing, and native code generation.',
      ARRAY['Analyzing 1-hour videos and audio recordings', 'Querying 1M+ token codebases and PDF libraries', 'High-throughput multimodal agent architectures'],
      'AI researchers, software engineers, and enterprise cloud development teams.',
      'Cloud (Google AI Studio & Vertex AI)', 'https://deepmind.google/technologies/gemini/',
      TRUE, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      icon_url = EXCLUDED.icon_url,
      is_published = TRUE
    RETURNING id, name, slug, icon_url;
  `, [aiCatId]);

  console.log('Gemini saved:', geminiRes.rows[0]);

  // 3. Insert GitHub
  const githubRes = await pool.query(`
    INSERT INTO tools (
      category_id, name, slug, provider_name, icon_url, short_description,
      overview, main_purpose, typical_use_cases, intended_audience,
      deployment_model, official_website_url, is_published, published_at
    ) VALUES (
      $1, 'GitHub', 'github', 'GitHub, Inc. (Microsoft)', '/logos/github.svg',
      'The world leading AI-powered developer platform for version control, CI/CD, and collaboration.',
      'GitHub provides cloud Git repositories, automated CI/CD workflows through GitHub Actions, security vulnerability scanning, and Copilot AI developer assistance.',
      'Source code management, automated continuous integration/deployment, and developer collaboration.',
      ARRAY['Git version control and pull request reviews', 'Automated testing and multi-platform CI/CD via GitHub Actions', 'Package hosting and automated security Dependabot alerts'],
      'Software developers, DevOps teams, and open source communities globally.',
      'Cloud & Self-Hosted (GitHub Enterprise)', 'https://github.com',
      TRUE, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      icon_url = EXCLUDED.icon_url,
      is_published = TRUE
    RETURNING id, name, slug, icon_url;
  `, [devCatId]);

  console.log('GitHub saved:', githubRes.rows[0]);

  await pool.end();
  console.log('Done!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

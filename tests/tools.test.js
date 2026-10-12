import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import pool from "../apps/backend/src/config/db.js";
import app from "../apps/backend/src/app.js";
import { env } from "../apps/backend/src/config/env.js";

describe("Section 1: Tools Directory & Software Discovery Platform Tests", () => {
  let server;
  let baseUrl;
  let testCategoryId = null;
  let testToolId = null;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    // Cleanup any created test items
    if (testToolId) {
      await pool.query("DELETE FROM tools WHERE id = $1;", [testToolId]);
    }
    if (testCategoryId) {
      await pool.query("DELETE FROM tool_categories WHERE id = $1;", [testCategoryId]);
    }
    server.close();
    await pool.end();
    try {
      const { closeRedisClient } = await import("../apps/backend/src/config/redis.js");
      await closeRedisClient();
    } catch {}
  });

  // 1. Dynamic category retrieval and alphabetical ordering
  test("Dynamic category retrieval returns active categories in alphabetical A-Z order", async () => {
    const res = await fetch(`${baseUrl}/api/tools/categories`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(Array.isArray(data.categories));
    assert.ok(data.categories.length > 0);

    // Verify alphabetical ordering (A to Z)
    const names = data.categories.map((c) => c.name);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(names, sortedNames, "Categories must be sorted alphabetically ascending A to Z");

    // Verify all returned categories are active and have tools_count
    for (const cat of data.categories) {
      assert.equal(cat.is_active, true, "Only active categories should be returned");
      assert.ok(typeof cat.tools_count === "number");
    }
  });

  // 2. Latest-product ordering
  test("Latest software entries are ordered by publication recency (descending)", async () => {
    const res = await fetch(`${baseUrl}/api/tools/latest?limit=10`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(Array.isArray(data.tools));
    assert.ok(data.tools.length > 0);

    // Verify descending publication date order
    for (let i = 0; i < data.tools.length - 1; i++) {
      const current = new Date(data.tools[i].published_at).getTime();
      const next = new Date(data.tools[i + 1].published_at).getTime();
      assert.ok(
        current >= next,
        `Tool ${data.tools[i].name} (${data.tools[i].published_at}) should be >= ${data.tools[i + 1].name} (${data.tools[i + 1].published_at})`
      );
    }
  });

  // 3. Search across products, categories, providers, tags, and features
  test("Search finds software by name, provider, tag, and feature", async () => {
    // Search by product name
    const resName = await fetch(`${baseUrl}/api/tools?q=resend`).then((r) => r.json());
    assert.ok(resName.tools.some((t) => t.slug === "resend"));

    // Search by provider
    const resProvider = await fetch(`${baseUrl}/api/tools?q=Stripe`).then((r) => r.json());
    assert.ok(resProvider.tools.some((t) => t.slug === "stripe"));

    // Search by tag (e.g. 'smtp')
    const resTag = await fetch(`${baseUrl}/api/tools?q=smtp`).then((r) => r.json());
    assert.ok(resTag.tools.length > 0);
    assert.ok(resTag.tools.some((t) => t.slug === "resend" || t.slug === "sendgrid"));

    // Search by feature keyword ('React Email')
    const resFeature = await fetch(`${baseUrl}/api/tools?q=React%20Email`).then((r) => r.json());
    assert.ok(resFeature.tools.some((t) => t.slug === "resend"));
  });

  // 4. Category-specific filtering
  test("Filtering by category returns only tools belonging to that category", async () => {
    const res = await fetch(`${baseUrl}/api/tools?category=communication-email`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(data.tools.length > 0);
    for (const tool of data.tools) {
      assert.equal(tool.category_slug, "communication-email");
    }
  });

  // 5. Pricing filters and sorting
  test("Pricing filters and sorting work accurately using real database records", async () => {
    // Free plan filter = true
    const resFree = await fetch(`${baseUrl}/api/tools?free_plan=true`).then((r) => r.json());
    assert.ok(resFree.tools.length > 0);
    for (const t of resFree.tools) {
      assert.equal(t.has_free_tier, true);
    }

    // Pricing model filter
    const resModel = await fetch(`${baseUrl}/api/tools?pricing_model=usage_based`).then((r) => r.json());
    assert.ok(resModel.tools.length > 0);

    // Sorting by Name A-Z
    const resSortNameAsc = await fetch(`${baseUrl}/api/tools?sort=name_asc`).then((r) => r.json());
    const names = resSortNameAsc.tools.map((t) => t.name.toLowerCase());
    const sorted = [...names].sort();
    assert.deepEqual(names, sorted);

    // Sorting by Name Z-A
    const resSortNameDesc = await fetch(`${baseUrl}/api/tools?sort=name_desc`).then((r) => r.json());
    const namesDesc = resSortNameDesc.tools.map((t) => t.name.toLowerCase());
    const sortedDesc = [...names].sort().reverse();
    assert.deepEqual(namesDesc, sortedDesc);
  });

  // 6. Pagination validation
  test("Pagination handles page limits, offsets, and sensible bounds", async () => {
    const res = await fetch(`${baseUrl}/api/tools?page=1&limit=4`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.tools.length, 4);
    assert.equal(data.pagination.page, 1);
    assert.equal(data.pagination.limit, 4);
    assert.ok(data.pagination.total >= 10);
    assert.equal(data.pagination.hasMore, true);
  });

  // 7. Missing and unpublished products
  test("Requesting non-existent tool returns 404, unpublished tools are not exposed", async () => {
    const res = await fetch(`${baseUrl}/api/tools/non-existent-unknown-tool`);
    assert.equal(res.status, 404);

    // Check unpublished tool
    const insertUnpub = await pool.query(
      `
      INSERT INTO tools (
        category_id, name, slug, provider_name, icon_url,
        short_description, official_website_url, is_published
      )
      SELECT id, 'Unpublished Draft Tool', 'draft-tool-xyz', 'Secret Provider', 'https://example.com/icon.svg',
             'Draft description', 'https://example.com', FALSE
      FROM tool_categories LIMIT 1
      RETURNING id;
      `
    );
    const draftId = insertUnpub.rows[0].id;

    try {
      // Must not appear in public listing
      const listRes = await fetch(`${baseUrl}/api/tools?q=draft-tool-xyz`).then((r) => r.json());
      assert.equal(listRes.tools.length, 0, "Unpublished tool must not appear in directory list");

      // Must return 404 on slug detail endpoint
      const detailRes = await fetch(`${baseUrl}/api/tools/draft-tool-xyz`);
      assert.equal(detailRes.status, 404, "Unpublished tool must return 404 on public detail API");
    } finally {
      await pool.query("DELETE FROM tools WHERE id = $1;", [draftId]);
    }
  });

  // 8. Software details multi-section payload
  test("Software details endpoint returns complete sections: pricing, features, specs, security, resources", async () => {
    const res = await fetch(`${baseUrl}/api/tools/resend`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(data.tool);
    assert.equal(data.tool.name, "Resend");
    assert.ok(Array.isArray(data.tool.plans));
    assert.ok(data.tool.plans.length > 0);
    assert.ok(data.tool.plans[0].calculated_monthly !== undefined);
    assert.ok(Array.isArray(data.tool.features));
    assert.ok(Array.isArray(data.tool.integrations));
    assert.ok(Array.isArray(data.tool.specifications));
    assert.ok(data.tool.security);
    assert.ok(data.tool.security.encryption_in_transit);
    assert.ok(Array.isArray(data.tool.resources));
  });

  // 9. Comparison: 1, 2, and 3 products
  test("Comparison API successfully compares 1, 2, and 3 products side-by-side", async () => {
    // 1 Product
    const res1 = await fetch(`${baseUrl}/api/tools/compare?slugs=resend`).then((r) => r.json());
    assert.equal(res1.compared_tools.length, 1);

    // 2 Products
    const res2 = await fetch(`${baseUrl}/api/tools/compare?slugs=resend,stripe`).then((r) => r.json());
    assert.equal(res2.compared_tools.length, 2);

    // 3 Products
    const res3 = await fetch(`${baseUrl}/api/tools/compare?slugs=resend,stripe,postman`).then((r) => r.json());
    assert.equal(res3.compared_tools.length, 3);
    assert.ok(Array.isArray(res3.available_spec_keys));
  });

  // 10. Rejection of more than 3 comparison items
  test("Comparison API rejects more than 3 items with HTTP 400 Bad Request", async () => {
    const res = await fetch(`${baseUrl}/api/tools/compare?slugs=resend,stripe,postman,mapbox`);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("maximum of 3 software products"));
  });

  // 11. Comparison with 0 items returns HTTP 400
  test("Comparison API rejects empty selection with HTTP 400", async () => {
    const res = await fetch(`${baseUrl}/api/tools/compare?slugs=`);
    assert.equal(res.status, 400);
  });

  // 12. Dynamic catalogue management & Admin CRUD authorization
  test("Admin catalogue management: unauthorized access rejected, authorized access creates dynamic category and tool", async () => {
    // 1. Unauthenticated request to admin endpoint must be rejected
    const unauthRes = await fetch(`${baseUrl}/api/tools/admin/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauth Category", slug: "unauth-cat" }),
    });
    assert.ok(unauthRes.status === 401 || unauthRes.status === 403);

    // 2. Authorized request using master API key
    const uniqueSlug = `test-cat-${Date.now()}`;
    const authRes = await fetch(`${baseUrl}/api/tools/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.masterApiKey || "your_super_secret_api_key_here",
      },
      body: JSON.stringify({
        name: `Automated Test Category ${Date.now()}`,
        slug: uniqueSlug,
        description: "Created dynamically by test suite.",
      }),
    });

    assert.equal(authRes.status, 201);
    const catData = await authRes.json();
    testCategoryId = catData.category.id;
    assert.ok(testCategoryId);

    // 3. Verify category is IMMEDIATELY available on public category list without code change
    const listRes = await fetch(`${baseUrl}/api/tools/categories`).then((r) => r.json());
    assert.ok(listRes.categories.some((c) => c.slug === uniqueSlug));

    // 4. Create tool in this new category
    const toolSlug = `dynamic-test-tool-${Date.now()}`;
    const toolRes = await fetch(`${baseUrl}/api/tools/admin/tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.masterApiKey || "your_super_secret_api_key_here",
      },
      body: JSON.stringify({
        category_id: testCategoryId,
        name: "Dynamic Test Tool",
        slug: toolSlug,
        provider_name: "Dynamic Test Labs",
        icon_url: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg",
        short_description: "Automatically created test tool profile.",
        official_website_url: "https://example.com/test-tool",
        tags: ["dynamic", "testing"],
      }),
    });

    assert.equal(toolRes.status, 201);
    const toolData = await toolRes.json();
    testToolId = toolData.tool.id;
    assert.ok(testToolId);

    // 5. Verify tool is immediately searchable on public API
    const searchRes = await fetch(`${baseUrl}/api/tools?q=${toolSlug}`).then((r) => r.json());
    assert.ok(searchRes.tools.some((t) => t.slug === toolSlug));
  });

  // 13. Invalid filter parameters resilience
  test("API gracefully handles invalid and extreme filter parameters without crashing", async () => {
    const res = await fetch(`${baseUrl}/api/tools?min_price=invalid&max_price=abc&page=-5&limit=99999`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.tools));
    assert.ok(data.pagination.limit <= 100, "Limit must be clamped to safe maximum");
  });
});

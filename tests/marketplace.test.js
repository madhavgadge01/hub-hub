import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import pool from "../apps/backend/src/config/db.js";
import {
  listMarketplaceCategories,
  listMarketplaceApis,
  getMarketplaceApiDetails,
  getMarketplaceApiPlans,
  getMarketplaceApiDocumentation,
  adminCreateCategory as createMarketplaceCategory,
  adminCreateApiProduct as createMarketplaceApiProduct,
} from "../apps/backend/src/services/marketplace.service.js";

describe("Marketplace & Catalogue Integration Tests", () => {
  let createdCategoryId = null;
  let createdProductId = null;

  after(async () => {
    if (createdProductId) {
      await pool.query("DELETE FROM api_plans WHERE api_product_id = $1;", [createdProductId]);
      await pool.query("DELETE FROM api_products WHERE id = $1;", [createdProductId]);
    }
    if (createdCategoryId) {
      await pool.query("DELETE FROM api_product_categories WHERE id = $1;", [createdCategoryId]);
    }
    await pool.end();
  });

  test("Marketplace categories load from PostgreSQL in display order", async () => {
    const categories = await listMarketplaceCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length >= 3);

    // Verify properties
    const first = categories[0];
    assert.ok(first.id);
    assert.ok(first.name);
    assert.ok(first.slug);
    assert.equal(typeof first.activeToolsCount, "number");
  });

  test("Marketplace APIs load from PostgreSQL with pagination, pricing indicators, and icons", async () => {
    const result = await listMarketplaceApis({ page: 1, limit: 10 });
    assert.ok(result.apis);
    assert.ok(result.total >= 5);
    assert.ok(result.apis.length >= 5);

    const qrProduct = result.apis.find((p) => p.slug === "qr-code");
    assert.ok(qrProduct, "QR Code API product should exist in seeded database");
    assert.ok(qrProduct.name.includes("Dynamic QR Code"));
    assert.ok((qrProduct.icon_url || qrProduct.iconUrl || "").includes(".svg"));
    assert.equal(qrProduct.playground_enabled ?? qrProduct.playgroundEnabled, true);
    assert.ok(Array.isArray(qrProduct.plans));
    assert.ok(qrProduct.plans.length >= 1);
  });

  test("Marketplace search finds products by name, description, tags, and category", async () => {
    // Search by name substring
    const nameSearch = await listMarketplaceApis({ search: "Metadata" });
    assert.ok(nameSearch.apis.some((p) => p.slug === "url-metadata"));

    // Search by tag
    const tagSearch = await listMarketplaceApis({ search: "luhn" });
    assert.ok(tagSearch.apis.some((p) => p.slug === "card-validator"));

    // Filter by category
    const catSearch = await listMarketplaceApis({ category: "security-cryptography" });
    assert.ok(catSearch.apis.length >= 1);
    assert.ok(catSearch.apis.every((p) => (p.category_slug || p.categorySlug) === "security-cryptography"));
  });

  test("Marketplace detail page loads dynamic sections: overview, plans, features, and docs", async () => {
    const apiDetail = await getMarketplaceApiDetails("qr-code");
    assert.ok(apiDetail);
    assert.ok(apiDetail.name.includes("Dynamic QR Code"));
    assert.ok(apiDetail.category);
    assert.ok(Array.isArray(apiDetail.features));
    assert.ok(apiDetail.features.length >= 1);
    assert.ok(Array.isArray(apiDetail.plans));
    assert.ok(apiDetail.plans.length >= 1);

    // Plans endpoint
    const plans = await getMarketplaceApiPlans("qr-code");
    assert.ok(plans.length >= 2);
    const freePlan = plans.find((pl) => (pl.price_amount ?? pl.priceAmount) === 0);
    assert.ok(freePlan, "Should include a free developer sandbox plan");

    // Documentation endpoint
    const docs = await getMarketplaceApiDocumentation("qr-code");
    assert.ok(docs.documentation);
    assert.equal(docs.endpoint, "/qr");
    assert.equal(docs.httpMethod, "POST");
    assert.ok(docs.documentation.exampleRequest);
    assert.ok(docs.documentation.exampleResponse);
  });

  test("Unpublished / draft API products are omitted from public listing", async () => {
    // 1. Create a draft product with valid category
    const catRes = await pool.query(`SELECT id FROM api_product_categories LIMIT 1;`);
    const validCatId = catRes.rows[0].id;

    const draftRes = await pool.query(
      `
      INSERT INTO api_products (
        category_id, name, slug, provider_name, icon_url, description, overview, endpoint_path,
        status, playground_enabled
      ) VALUES (
        $1, 'Secret Internal Tool', 'secret-internal-tool', 'Internal Labs', '/icons/api-qrcode.svg',
        'Unpublished test', 'Should never appear in marketplace', '/api/v1/secret', 'draft', false
      ) RETURNING id;
      `,
      [validCatId]
    );
    const draftId = draftRes.rows[0].id;

    try {
      // 2. Listing should NOT contain draft
      const list = await listMarketplaceApis({ search: "Secret Internal" });
      assert.equal(list.apis.length, 0);

      // 3. Direct detail lookup should throw 404
      await assert.rejects(
        async () => getMarketplaceApiDetails("secret-internal-tool"),
        /not found/i
      );
    } finally {
      await pool.query("DELETE FROM api_products WHERE id = $1;", [draftId]);
    }
  });

  test("Dynamic administration: Adding category and product automatically reflects in catalogue", async () => {
    const cat = await createMarketplaceCategory({
      name: "Cloud Telemetry & Metrics",
      slug: "cloud-telemetry",
      description: "Observability and APM microservices",
    });
    createdCategoryId = cat.id;
    assert.ok(cat.slug);

    const prod = await createMarketplaceApiProduct({
      name: "Metric Stream API",
      slug: "metric-stream",
      category_id: createdCategoryId,
      provider_name: "Telemetry Labs",
      description: "Ultra low-latency APM telemetry ingestion engine.",
      overview: "High-throughput real-time stream aggregation.",
      endpoint_path: "/api/v1/metrics",
      status: "published",
      playground_enabled: true,
      features: ["Sub-millisecond ingestion", "Prometheus compatible"],
    });
    createdProductId = prod.id;
    assert.ok(prod.slug);

    // Verify it immediately appears in public list without code changes
    const refreshed = await listMarketplaceApis({ query: "Metric Stream" });
    assert.ok(refreshed.apis.length >= 1);
    assert.equal(refreshed.apis[0].name, "Metric Stream API");
  });
});

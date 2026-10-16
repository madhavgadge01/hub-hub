import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Retrieves all active marketplace categories with dynamic product counts.
 */
export async function listMarketplaceCategories() {
  const result = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.slug,
      c.description,
      c.icon_name,
      c.sort_order,
      COUNT(p.id)::int AS api_count
    FROM api_product_categories c
    LEFT JOIN api_products p ON c.id = p.category_id AND p.status = 'published'
    WHERE c.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC;
  `);

  return result.rows.map((r) => ({
    ...r,
    apiCount: r.api_count,
    activeToolsCount: r.api_count,
  }));
}

/**
 * Retrieves paginated marketplace APIs with real usage metrics, category filtering,
 * price filtering, search, and sorting.
 */
export async function listMarketplaceApis({
  category = null,
  query = null,
  search = null,
  price = "all", // 'all' | 'free' | 'paid'
  sort = "latest", // 'latest' | 'name' | 'price_asc' | 'price_desc' | 'popular'
  page = 1,
  limit = 12,
  includeUnpublished = false,
} = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (safePage - 1) * safeLimit;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (!includeUnpublished) {
    conditions.push(`p.status = 'published'`);
  }

  if (
    category &&
    category !== "All" &&
    category !== "all" &&
    category !== "undefined" &&
    category !== "null"
  ) {
    conditions.push(`c.slug = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  const effectiveSearch = query || search;
  if (
    effectiveSearch &&
    typeof effectiveSearch === "string" &&
    effectiveSearch.trim().length > 0 &&
    effectiveSearch.trim() !== "undefined" &&
    effectiveSearch.trim() !== "null"
  ) {
    const searchTerm = `%${effectiveSearch.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(p.name) LIKE $${paramIndex} OR
      LOWER(p.description) LIKE $${paramIndex} OR
      LOWER(p.provider_name) LIKE $${paramIndex} OR
      LOWER(c.name) LIKE $${paramIndex} OR
      EXISTS (
        SELECT 1 FROM unnest(p.features) f
        WHERE LOWER(f) LIKE $${paramIndex}
      )
    )`);
    params.push(searchTerm);
    paramIndex++;
  }

  // Price tier filtering
  if (price === "free") {
    conditions.push(`EXISTS (
      SELECT 1 FROM api_plans pl
      WHERE pl.api_product_id = p.id AND pl.is_active = TRUE AND pl.price_amount = 0
    )`);
  } else if (price === "paid") {
    conditions.push(`EXISTS (
      SELECT 1 FROM api_plans pl
      WHERE pl.api_product_id = p.id AND pl.is_active = TRUE AND pl.price_amount > 0
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Dynamic sorting
  let orderByClause = "ORDER BY p.published_at DESC";
  if (sort === "name") {
    orderByClause = "ORDER BY p.name ASC";
  } else if (sort === "price_asc") {
    orderByClause = "ORDER BY min_price ASC NULLS LAST, p.name ASC";
  } else if (sort === "price_desc") {
    orderByClause = "ORDER BY max_price DESC NULLS LAST, p.name ASC";
  } else if (sort === "popular") {
    orderByClause = "ORDER BY usage_count DESC, p.published_at DESC";
  }

  // Count total matches
  const countSql = `
    SELECT COUNT(DISTINCT p.id)::int as total
    FROM api_products p
    JOIN api_product_categories c ON p.category_id = c.id
    ${whereClause};
  `;
  const countRes = await pool.query(countSql, params);
  const totalItems = countRes.rows[0]?.total || 0;

  // Retrieve paginated results with plans and real usage metrics
  const apisSql = `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.overview,
      p.provider_name,
      p.icon_url,
      p.version,
      p.status,
      p.playground_enabled,
      p.playground_auth_required,
      p.endpoint_path,
      p.http_method,
      p.rate_limit_per_minute,
      p.features,
      p.use_cases,
      p.published_at,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      COALESCE(
        (SELECT MIN(price_amount) FROM api_plans WHERE api_product_id = p.id AND is_active = TRUE),
        0
      ) AS min_price,
      COALESCE(
        (SELECT MAX(price_amount) FROM api_plans WHERE api_product_id = p.id AND is_active = TRUE),
        0
      ) AS max_price,
      EXISTS (
        SELECT 1 FROM api_plans
        WHERE api_product_id = p.id AND is_active = TRUE AND price_amount = 0
      ) AS has_free_plan,
      COALESCE(
        (SELECT COUNT(*)::int FROM api_usage u WHERE u.api_product_id = p.id),
        0
      ) AS usage_count
    FROM api_products p
    JOIN api_product_categories c ON p.category_id = c.id
    ${whereClause}
    ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;

  params.push(safeLimit, offset);
  const apisRes = await pool.query(apisSql, params);

  const productIds = apisRes.rows.map((r) => r.id);
  const plansByProduct = {};
  if (productIds.length > 0) {
    const plansRes = await pool.query(
      `SELECT * FROM api_plans WHERE api_product_id = ANY($1) AND is_active = TRUE ORDER BY price_amount ASC;`,
      [productIds]
    );
    for (const plan of plansRes.rows) {
      if (!plansByProduct[plan.api_product_id]) plansByProduct[plan.api_product_id] = [];
      plansByProduct[plan.api_product_id].push(plan);
    }
  }

  const items = apisRes.rows.map((row) => ({
    ...row,
    plans: plansByProduct[row.id] || [],
  }));

  return {
    items,
    apis: items,
    total: totalItems,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: totalItems,
      totalPages: Math.ceil(totalItems / safeLimit) || 1,
    },
  };
}

/**
 * Retrieves a single API product by slug with category and plans.
 */
export async function getMarketplaceApiBySlug(slug, { includeUnpublished = false } = {}) {
  if (!slug) {
    throw new ApiError(400, "API slug is required.");
  }

  const statusCheck = includeUnpublished ? "" : "AND p.status = 'published'";

  const res = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.overview,
      p.provider_name,
      p.icon_url,
      p.version,
      p.status,
      p.playground_enabled,
      p.playground_auth_required,
      p.base_url,
      p.endpoint_path,
      p.http_method,
      p.rate_limit_per_minute,
      p.documentation,
      p.features,
      p.use_cases,
      p.created_at,
      p.published_at,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      c.description AS category_description,
      COALESCE(
        (SELECT COUNT(*)::int FROM api_usage u WHERE u.api_product_id = p.id),
        0
      ) AS usage_count
    FROM api_products p
    JOIN api_product_categories c ON p.category_id = c.id
    WHERE p.slug = $1 ${statusCheck}
    LIMIT 1;
    `,
    [slug]
  );

  const product = res.rows[0];
  if (!product) {
    throw new ApiError(404, `API product "${slug}" not found.`);
  }

  // Load active plans
  const plansRes = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      plan_type,
      price_amount,
      currency,
      billing_interval,
      included_requests,
      rate_limit_per_minute,
      overage_policy,
      features,
      is_active,
      sort_order
    FROM api_plans
    WHERE api_product_id = $1 AND is_active = TRUE
    ORDER BY sort_order ASC, price_amount ASC;
    `,
    [product.id]
  );

  return {
    ...product,
    category: {
      id: product.category_id,
      name: product.category_name,
      slug: product.category_slug,
      description: product.category_description,
    },
    plans: plansRes.rows,
  };
}

/**
 * Retrieves documentation for an API product by slug.
 */
export async function getMarketplaceApiDocs(slug) {
  const product = await getMarketplaceApiBySlug(slug);
  return {
    slug: product.slug,
    name: product.name,
    version: product.version,
    baseUrl: product.base_url,
    endpoint: product.endpoint_path,
    httpMethod: product.http_method,
    rateLimitPerMinute: product.rate_limit_per_minute,
    documentation: product.documentation || {},
    features: product.features,
    plans: product.plans,
  };
}

export const getMarketplaceApiDetails = getMarketplaceApiBySlug;
export async function getMarketplaceApiPlans(slug) {
  const product = await getMarketplaceApiBySlug(slug);
  return product.plans;
}
export const getMarketplaceApiDocumentation = getMarketplaceApiDocs;


/**
 * Admin: Create a new API product.
 */
export async function adminCreateApiProduct(data) {
  const {
    category_id,
    name,
    slug,
    description,
    overview,
    provider_name = "Kruu Edge",
    icon_url,
    version = "v1.0.0",
    status = "published",
    playground_enabled = true,
    playground_auth_required = false,
    base_url = "/api/v1",
    endpoint_path,
    http_method = "POST",
    rate_limit_per_minute = 60,
    documentation = {},
    features = [],
    use_cases = [],
  } = data;

  if (!category_id || !name || !slug || !endpoint_path) {
    throw new ApiError(400, "Missing required fields: category_id, name, slug, endpoint_path.");
  }

  const res = await pool.query(
    `
    INSERT INTO api_products (
      category_id, name, slug, description, overview, provider_name,
      icon_url, version, status, playground_enabled, playground_auth_required,
      base_url, endpoint_path, http_method, rate_limit_per_minute,
      documentation, features, use_cases
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *;
    `,
    [
      category_id,
      name,
      slug,
      description || "",
      overview || "",
      provider_name,
      icon_url || "/icons/api-qrcode.svg",
      version,
      status,
      playground_enabled,
      playground_auth_required,
      base_url,
      endpoint_path,
      http_method,
      rate_limit_per_minute,
      JSON.stringify(documentation),
      features,
      use_cases,
    ]
  );

  return res.rows[0];
}

/**
 * Admin: Create an API category.
 */
export async function adminCreateCategory({ name, slug, description, icon_name = "Sparkles", sort_order = 0 }) {
  if (!name || !slug) {
    throw new ApiError(400, "Category name and slug are required.");
  }

  const res = await pool.query(
    `
    INSERT INTO api_product_categories (name, slug, description, icon_name, sort_order)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [name, slug, description, icon_name, sort_order]
  );

  return res.rows[0];
}

/**
 * Admin: Add plan to API product.
 */
export async function adminAddPlanToProduct(productId, planData) {
  const {
    name,
    description,
    plan_type = "prepaid",
    price_amount = 0,
    currency = "INR",
    billing_interval = "month",
    included_requests = 1000,
    rate_limit_per_minute = 120,
    features = [],
    sort_order = 0,
  } = planData;

  if (!productId || !name) {
    throw new ApiError(400, "Product ID and Plan Name are required.");
  }

  const res = await pool.query(
    `
    INSERT INTO api_plans (
      api_product_id, name, description, plan_type, price_amount, currency,
      billing_interval, included_requests, rate_limit_per_minute, features, sort_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
    `,
    [
      productId,
      name,
      description,
      plan_type,
      price_amount,
      currency,
      billing_interval,
      included_requests,
      rate_limit_per_minute,
      features,
      sort_order,
    ]
  );

  return res.rows[0];
}

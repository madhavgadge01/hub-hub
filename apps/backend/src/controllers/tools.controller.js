import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

// In-memory cache for fast category & filter retrieval
const cache = {
  categories: { data: null, expiresAt: 0 },
  filters: { data: null, expiresAt: 0 },
};

export function invalidateToolsCache() {
  cache.categories.data = null;
  cache.categories.expiresAt = 0;
  cache.filters.data = null;
  cache.filters.expiresAt = 0;
}

/**
 * 1. GET /api/tools/categories
 * Returns active categories sorted alphabetically (A to Z) with count of published software.
 */
export async function getCategories(req, res, next) {
  try {
    const now = Date.now();
    if (cache.categories.data && cache.categories.expiresAt > now) {
      return res.status(200).json({ categories: cache.categories.data });
    }

    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon_url,
        c.sort_order,
        c.is_active,
        c.created_at,
        c.updated_at,
        COUNT(t.id) FILTER (WHERE t.is_published = TRUE)::int AS tools_count
      FROM tool_categories c
      LEFT JOIN tools t ON t.category_id = c.id
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.name ASC;
    `;

    const result = await pool.query(query);
    cache.categories = {
      data: result.rows,
      expiresAt: now + 60000, // 60s cache
    };

    res.status(200).json({ categories: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. GET /api/tools/latest
 * Returns latest published software entries ordered by published_at DESC.
 */
export async function getLatestTools(req, res, next) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "24", 10), 1), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const query = `
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.provider_name,
        t.icon_url,
        t.short_description,
        t.is_published,
        t.published_at,
        t.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(
          (SELECT json_agg(tt.tag) FROM tool_tags tt WHERE tt.tool_id = t.id),
          '[]'::json
        ) AS tags,
        COALESCE(
          (
            SELECT json_build_object(
              'starting_price', MIN(p.amount),
              'has_free_tier', BOOL_OR(p.free_tier_available OR p.amount = 0 OR p.pricing_model = 'free'),
              'pricing_models', array_agg(DISTINCT p.pricing_model)
            )
            FROM tool_pricing_plans p
            WHERE p.tool_id = t.id
          ),
          json_build_object('starting_price', 0, 'has_free_tier', false, 'pricing_models', ARRAY[]::varchar[])
        ) AS pricing_summary
      FROM tools t
      INNER JOIN tool_categories c ON t.category_id = c.id
      WHERE t.is_published = TRUE AND c.is_active = TRUE
      ORDER BY t.published_at DESC, t.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM tools t INNER JOIN tool_categories c ON t.category_id = c.id WHERE t.is_published = TRUE AND c.is_active = TRUE;"
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const result = await pool.query(query, [limit, offset]);
    res.status(200).json({
      tools: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + result.rows.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. GET /api/tools
 * Comprehensive searchable & filterable directory endpoint.
 */
export async function getTools(req, res, next) {
  try {
    const {
      q,
      search,
      category,
      tag,
      free_plan,
      pricing_model,
      min_price,
      max_price,
      billing_interval,
      deployment_model,
      sort = "latest",
      page = "1",
      limit = "24",
    } = req.query;

    const searchTerm = (q || search || "").trim();
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["t.is_published = TRUE", "c.is_active = TRUE"];
    const params = [];

    // Search filter across name, provider, description, tags, features, category
    if (searchTerm) {
      params.push(`%${searchTerm}%`);
      const pIdx = params.length;
      conditions.push(`(
        t.name ILIKE $${pIdx} OR
        t.slug ILIKE $${pIdx} OR
        t.provider_name ILIKE $${pIdx} OR
        t.short_description ILIKE $${pIdx} OR
        t.overview ILIKE $${pIdx} OR
        c.name ILIKE $${pIdx} OR
        EXISTS (SELECT 1 FROM tool_tags tt WHERE tt.tool_id = t.id AND tt.tag ILIKE $${pIdx}) OR
        EXISTS (SELECT 1 FROM tool_features tf WHERE tf.tool_id = t.id AND tf.name ILIKE $${pIdx})
      )`);
    }

    // Category filter
    if (category && category !== "All") {
      params.push(category);
      const pIdx = params.length;
      conditions.push(`(c.slug = $${pIdx} OR c.id::text = $${pIdx})`);
    }

    // Tag filter
    if (tag && tag !== "All") {
      params.push(tag);
      const pIdx = params.length;
      conditions.push(`EXISTS (SELECT 1 FROM tool_tags tt WHERE tt.tool_id = t.id AND tt.tag = $${pIdx})`);
    }

    // Deployment model filter
    if (deployment_model && deployment_model !== "All") {
      params.push(`%${deployment_model}%`);
      const pIdx = params.length;
      conditions.push(`t.deployment_model ILIKE $${pIdx}`);
    }

    // Free plan filter
    if (free_plan === "true" || free_plan === true) {
      conditions.push(`EXISTS (
        SELECT 1 FROM tool_pricing_plans p 
        WHERE p.tool_id = t.id 
          AND (p.free_tier_available = TRUE OR p.amount = 0 OR p.pricing_model = 'free')
      )`);
    } else if (free_plan === "false") {
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM tool_pricing_plans p 
        WHERE p.tool_id = t.id 
          AND (p.free_tier_available = TRUE OR p.amount = 0 OR p.pricing_model = 'free')
      )`);
    }

    // Pricing model filter
    if (pricing_model && pricing_model !== "All") {
      params.push(pricing_model);
      const pIdx = params.length;
      conditions.push(`EXISTS (SELECT 1 FROM tool_pricing_plans p WHERE p.tool_id = t.id AND p.pricing_model = $${pIdx})`);
    }

    // Billing interval filter
    if (billing_interval && billing_interval !== "All") {
      params.push(billing_interval);
      const pIdx = params.length;
      conditions.push(`EXISTS (SELECT 1 FROM tool_pricing_plans p WHERE p.tool_id = t.id AND p.billing_interval = $${pIdx})`);
    }

    // Minimum price filter
    if (min_price !== undefined && min_price !== "") {
      const minNum = parseFloat(min_price);
      if (!isNaN(minNum)) {
        params.push(minNum);
        const pIdx = params.length;
        conditions.push(`EXISTS (SELECT 1 FROM tool_pricing_plans p WHERE p.tool_id = t.id AND p.amount >= $${pIdx})`);
      }
    }

    // Maximum price filter
    if (max_price !== undefined && max_price !== "") {
      const maxNum = parseFloat(max_price);
      if (!isNaN(maxNum)) {
        params.push(maxNum);
        const pIdx = params.length;
        conditions.push(`EXISTS (SELECT 1 FROM tool_pricing_plans p WHERE p.tool_id = t.id AND p.amount <= $${pIdx})`);
      }
    }

    // Sorting
    let orderByClause = "t.published_at DESC, t.created_at DESC";
    switch (sort) {
      case "name_asc":
        orderByClause = "LOWER(t.name) ASC, t.id ASC";
        break;
      case "name_desc":
        orderByClause = "LOWER(t.name) DESC, t.id DESC";
        break;
      case "price_asc":
        orderByClause = "starting_price ASC NULLS LAST, t.name ASC";
        break;
      case "price_desc":
        orderByClause = "starting_price DESC NULLS LAST, t.name ASC";
        break;
      case "free_first":
        orderByClause = "has_free_tier DESC, starting_price ASC NULLS LAST, t.name ASC";
        break;
      case "latest":
      default:
        orderByClause = "t.published_at DESC, t.created_at DESC";
        break;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countSql = `
      SELECT COUNT(DISTINCT t.id) AS total
      FROM tools t
      INNER JOIN tool_categories c ON t.category_id = c.id
      ${whereClause};
    `;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Data query with aggregated pricing summary
    params.push(limitNum);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const dataSql = `
      WITH tool_starting_prices AS (
        SELECT 
          tool_id,
          MIN(amount) AS starting_price,
          BOOL_OR(free_tier_available OR amount = 0 OR pricing_model = 'free') AS has_free_tier,
          array_agg(DISTINCT pricing_model) AS pricing_models
        FROM tool_pricing_plans
        GROUP BY tool_id
      )
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.provider_name,
        t.icon_url,
        t.short_description,
        t.deployment_model,
        t.official_website_url,
        t.is_published,
        t.published_at,
        t.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(tsp.starting_price, 0) AS starting_price,
        COALESCE(tsp.has_free_tier, false) AS has_free_tier,
        COALESCE(tsp.pricing_models, ARRAY[]::varchar[]) AS pricing_models,
        COALESCE(
          (SELECT json_agg(tt.tag) FROM tool_tags tt WHERE tt.tool_id = t.id),
          '[]'::json
        ) AS tags
      FROM tools t
      INNER JOIN tool_categories c ON t.category_id = c.id
      LEFT JOIN tool_starting_prices tsp ON tsp.tool_id = t.id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const dataRes = await pool.query(dataSql, params);
    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      tools: dataRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. GET /api/tools/filters
 * Returns dynamic available filter options based on real database records.
 */
export async function getFilterMetadata(req, res, next) {
  try {
    const now = Date.now();
    if (cache.filters.data && cache.filters.expiresAt > now) {
      return res.status(200).json(cache.filters.data);
    }

    const [categoriesRes, providersRes, tagsRes, modelsRes, deploymentsRes, priceRangeRes] = await Promise.all([
      pool.query(`
        SELECT c.id, c.name, c.slug, COUNT(t.id)::int AS count
        FROM tool_categories c
        LEFT JOIN tools t ON t.category_id = c.id AND t.is_published = TRUE
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY c.name ASC;
      `),
      pool.query(`
        SELECT DISTINCT provider_name
        FROM tools
        WHERE is_published = TRUE
        ORDER BY provider_name ASC;
      `),
      pool.query(`
        SELECT tt.tag AS name, COUNT(tt.tool_id)::int AS count
        FROM tool_tags tt
        INNER JOIN tools t ON tt.tool_id = t.id
        WHERE t.is_published = TRUE
        GROUP BY tt.tag
        ORDER BY count DESC, name ASC;
      `),
      pool.query(`
        SELECT DISTINCT pricing_model
        FROM tool_pricing_plans
        WHERE pricing_model IS NOT NULL
        ORDER BY pricing_model ASC;
      `),
      pool.query(`
        SELECT DISTINCT deployment_model
        FROM tools
        WHERE deployment_model IS NOT NULL AND is_published = TRUE
        ORDER BY deployment_model ASC;
      `),
      pool.query(`
        SELECT 
          COALESCE(MIN(amount), 0)::numeric AS min_price,
          COALESCE(MAX(amount), 0)::numeric AS max_price
        FROM tool_pricing_plans;
      `),
    ]);

    const payload = {
      categories: categoriesRes.rows,
      providers: providersRes.rows.map((r) => r.provider_name),
      tags: tagsRes.rows,
      pricing_models: modelsRes.rows.map((r) => r.pricing_model),
      deployment_models: deploymentsRes.rows.map((r) => r.deployment_model),
      price_range: {
        min: parseFloat(priceRangeRes.rows[0]?.min_price || 0),
        max: parseFloat(priceRangeRes.rows[0]?.max_price || 100),
      },
    };

    cache.filters = {
      data: payload,
      expiresAt: now + 60000,
    };

    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * 5. GET /api/tools/:slug
 * Full software profile with all sections.
 */
export async function getToolBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    // Find tool
    const toolRes = await pool.query(
      `
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.provider_name,
        t.icon_url,
        t.short_description,
        t.overview,
        t.main_purpose,
        t.typical_use_cases,
        t.intended_audience,
        t.deployment_model,
        t.official_website_url,
        t.is_published,
        t.published_at,
        t.created_at,
        t.updated_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description
      FROM tools t
      INNER JOIN tool_categories c ON t.category_id = c.id
      WHERE (t.slug = $1 OR t.id::text = $1) AND t.is_published = TRUE
      LIMIT 1;
      `,
      [slug]
    );

    if (toolRes.rows.length === 0) {
      throw new ApiError(404, `Software tool "${slug}" not found.`);
    }

    const tool = toolRes.rows[0];
    const toolId = tool.id;

    // Parallel fetch related sections
    const [
      tagsRes,
      plansRes,
      featuresRes,
      integrationsRes,
      specificationsRes,
      prosConsRes,
      securityRes,
      resourcesRes,
    ] = await Promise.all([
      pool.query("SELECT tag FROM tool_tags WHERE tool_id = $1 ORDER BY tag ASC;", [toolId]),
      pool.query(
        "SELECT * FROM tool_pricing_plans WHERE tool_id = $1 ORDER BY amount ASC, id ASC;",
        [toolId]
      ),
      pool.query(
        "SELECT * FROM tool_features WHERE tool_id = $1 ORDER BY group_name ASC, name ASC;",
        [toolId]
      ),
      pool.query(
        "SELECT * FROM tool_integrations WHERE tool_id = $1 ORDER BY category ASC, name ASC;",
        [toolId]
      ),
      pool.query(
        "SELECT * FROM tool_specifications WHERE tool_id = $1 ORDER BY group_name ASC, attribute_label ASC;",
        [toolId]
      ),
      pool.query(
        "SELECT * FROM tool_pros_cons WHERE tool_id = $1 ORDER BY type DESC, id ASC;",
        [toolId]
      ),
      pool.query(
        "SELECT * FROM tool_security_compliance WHERE tool_id = $1 LIMIT 1;",
        [toolId]
      ),
      pool.query(
        "SELECT * FROM tool_resources WHERE tool_id = $1 ORDER BY resource_type ASC, title ASC;",
        [toolId]
      ),
    ]);

    // Format plans with calculated intervals
    const plans = plansRes.rows.map(formatPlanCalculations);

    // Group features by group_name
    const featuresByGroup = {};
    for (const f of featuresRes.rows) {
      const g = f.group_name || "General";
      if (!featuresByGroup[g]) featuresByGroup[g] = [];
      featuresByGroup[g].push(f);
    }

    // Group specifications by group_name
    const specsByGroup = {};
    for (const s of specificationsRes.rows) {
      const g = s.group_name || "General";
      if (!specsByGroup[g]) specsByGroup[g] = [];
      specsByGroup[g].push(s);
    }

    // Group pros & cons
    const pros = prosConsRes.rows.filter((r) => r.type === "pro").map((r) => r.content);
    const cons = prosConsRes.rows.filter((r) => r.type === "con").map((r) => r.content);

    // Summary calculation
    const startingPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.amount)) : 0;
    const hasFreePlan = plans.some((p) => p.free_tier_available || p.amount === 0 || p.pricing_model === "free");

    res.status(200).json({
      tool: {
        ...tool,
        tags: tagsRes.rows.map((r) => r.tag),
        pricing_summary: {
          starting_price: startingPrice,
          has_free_plan: hasFreePlan,
          pricing_models: [...new Set(plans.map((p) => p.pricing_model))],
          default_currency: plans[0]?.currency || "USD",
        },
        plans,
        features: featuresRes.rows,
        features_by_group: featuresByGroup,
        integrations: integrationsRes.rows,
        specifications: specificationsRes.rows,
        specifications_by_group: specsByGroup,
        pros_cons: { pros, cons },
        security: securityRes.rows[0] || null,
        resources: resourcesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. GET /api/tools/:slug/pricing
 * Dedicated pricing endpoint with intervals calculation (daily, monthly, yearly).
 */
export async function getToolPricing(req, res, next) {
  try {
    const { slug } = req.params;

    const toolRes = await pool.query(
      "SELECT id, name, slug FROM tools WHERE (slug = $1 OR id::text = $1) AND is_published = TRUE LIMIT 1;",
      [slug]
    );

    if (toolRes.rows.length === 0) {
      throw new ApiError(404, `Tool "${slug}" not found.`);
    }

    const tool = toolRes.rows[0];
    const plansRes = await pool.query(
      "SELECT * FROM tool_pricing_plans WHERE tool_id = $1 ORDER BY amount ASC;",
      [tool.id]
    );

    const plans = plansRes.rows.map(formatPlanCalculations);

    res.status(200).json({
      tool_id: tool.id,
      name: tool.name,
      slug: tool.slug,
      plans,
      supported_intervals: ["day", "month", "year"],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 7. GET /api/tools/:slug/features
 */
export async function getToolFeatures(req, res, next) {
  try {
    const { slug } = req.params;
    const toolRes = await pool.query(
      "SELECT id, name, slug FROM tools WHERE (slug = $1 OR id::text = $1) AND is_published = TRUE LIMIT 1;",
      [slug]
    );

    if (toolRes.rows.length === 0) {
      throw new ApiError(404, `Tool "${slug}" not found.`);
    }

    const tool = toolRes.rows[0];
    const featRes = await pool.query(
      "SELECT * FROM tool_features WHERE tool_id = $1 ORDER BY group_name ASC, name ASC;",
      [tool.id]
    );

    const grouped = {};
    for (const f of featRes.rows) {
      const g = f.group_name || "General";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(f);
    }

    res.status(200).json({
      tool_id: tool.id,
      name: tool.name,
      slug: tool.slug,
      features: featRes.rows,
      grouped,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 8. GET /api/tools/:slug/integrations
 */
export async function getToolIntegrations(req, res, next) {
  try {
    const { slug } = req.params;
    const toolRes = await pool.query(
      "SELECT id, name, slug FROM tools WHERE (slug = $1 OR id::text = $1) AND is_published = TRUE LIMIT 1;",
      [slug]
    );

    if (toolRes.rows.length === 0) {
      throw new ApiError(404, `Tool "${slug}" not found.`);
    }

    const tool = toolRes.rows[0];
    const integRes = await pool.query(
      "SELECT * FROM tool_integrations WHERE tool_id = $1 ORDER BY category ASC, name ASC;",
      [tool.id]
    );

    res.status(200).json({
      tool_id: tool.id,
      name: tool.name,
      slug: tool.slug,
      integrations: integRes.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 9. GET /api/tools/:slug/specifications
 */
export async function getToolSpecifications(req, res, next) {
  try {
    const { slug } = req.params;
    const toolRes = await pool.query(
      "SELECT id, name, slug FROM tools WHERE (slug = $1 OR id::text = $1) AND is_published = TRUE LIMIT 1;",
      [slug]
    );

    if (toolRes.rows.length === 0) {
      throw new ApiError(404, `Tool "${slug}" not found.`);
    }

    const tool = toolRes.rows[0];
    const specRes = await pool.query(
      "SELECT * FROM tool_specifications WHERE tool_id = $1 ORDER BY group_name ASC, attribute_label ASC;",
      [tool.id]
    );

    const grouped = {};
    for (const s of specRes.rows) {
      const g = s.group_name || "Technical Specifications";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(s);
    }

    res.status(200).json({
      tool_id: tool.id,
      name: tool.name,
      slug: tool.slug,
      specifications: specRes.rows,
      grouped,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 10. GET /api/tools/compare
 * Compares 1 to 3 tools side by side.
 * Validates maximum of 3 tools! Rejects if > 3 with HTTP 400.
 */
export async function compareTools(req, res, next) {
  try {
    const idsParam = req.query.ids || "";
    const slugsParam = req.query.slugs || "";

    const rawList = (idsParam ? idsParam.split(",") : slugsParam.split(","))
      .map((s) => s.trim())
      .filter(Boolean);

    // Deduplicate
    const uniqueIdentifiers = [...new Set(rawList)];

    if (uniqueIdentifiers.length === 0) {
      throw new ApiError(400, "Please provide at least one tool ID or slug to compare.");
    }

    // STRICT REQUIREMENT: Maximum 3 tools
    if (uniqueIdentifiers.length > 3) {
      throw new ApiError(400, "You can compare a maximum of 3 software products simultaneously.");
    }

    const placeholders = uniqueIdentifiers.map((_, i) => `$${i + 1}`).join(", ");
    const toolsRes = await pool.query(
      `
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.provider_name,
        t.icon_url,
        t.short_description,
        t.deployment_model,
        t.official_website_url,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM tools t
      INNER JOIN tool_categories c ON t.category_id = c.id
      WHERE (t.id::text IN (${placeholders}) OR t.slug IN (${placeholders}))
        AND t.is_published = TRUE;
      `,
      uniqueIdentifiers
    );

    const tools = toolsRes.rows;
    if (tools.length === 0) {
      throw new ApiError(404, "No published tools matched the requested comparison IDs.");
    }

    const toolIds = tools.map((t) => t.id);

    // Fetch related comparison attributes in parallel
    const [plansRes, featuresRes, integrationsRes, specsRes, securityRes, resourcesRes] = await Promise.all([
      pool.query("SELECT * FROM tool_pricing_plans WHERE tool_id = ANY($1) ORDER BY amount ASC;", [toolIds]),
      pool.query("SELECT * FROM tool_features WHERE tool_id = ANY($1) ORDER BY name ASC;", [toolIds]),
      pool.query("SELECT * FROM tool_integrations WHERE tool_id = ANY($1) ORDER BY name ASC;", [toolIds]),
      pool.query("SELECT * FROM tool_specifications WHERE tool_id = ANY($1) ORDER BY attribute_label ASC;", [toolIds]),
      pool.query("SELECT * FROM tool_security_compliance WHERE tool_id = ANY($1);", [toolIds]),
      pool.query("SELECT * FROM tool_resources WHERE tool_id = ANY($1);", [toolIds]),
    ]);

    // Build comparison matrix
    const matrix = tools.map((tool) => {
      const toolPlans = plansRes.rows.filter((p) => p.tool_id === tool.id).map(formatPlanCalculations);
      const toolFeatures = featuresRes.rows.filter((f) => f.tool_id === tool.id);
      const toolIntegrations = integrationsRes.rows.filter((i) => i.tool_id === tool.id);
      const toolSpecs = specsRes.rows.filter((s) => s.tool_id === tool.id);
      const toolSecurity = securityRes.rows.find((s) => s.tool_id === tool.id) || null;
      const toolResources = resourcesRes.rows.filter((r) => r.tool_id === tool.id);

      const startingPrice = toolPlans.length > 0 ? Math.min(...toolPlans.map((p) => p.amount)) : 0;
      const hasFreePlan = toolPlans.some((p) => p.free_tier_available || p.amount === 0 || p.pricing_model === "free");

      // Find monthly and annual plans if available
      const monthlyPlan = toolPlans.find((p) => p.billing_interval === "month");
      const annualPlan = toolPlans.find((p) => p.billing_interval === "year");

      const specsMap = {};
      toolSpecs.forEach((s) => {
        specsMap[s.attribute_key] = {
          label: s.attribute_label,
          value: s.attribute_value,
          unit: s.unit,
        };
      });

      return {
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        provider_name: tool.provider_name,
        icon_url: tool.icon_url,
        short_description: tool.short_description,
        official_website_url: tool.official_website_url,
        deployment_model: tool.deployment_model,
        category: {
          id: tool.category_id,
          name: tool.category_name,
          slug: tool.category_slug,
        },
        pricing: {
          starting_price: startingPrice,
          has_free_tier: hasFreePlan,
          pricing_models: [...new Set(toolPlans.map((p) => p.pricing_model))],
          monthly_amount: monthlyPlan ? monthlyPlan.amount : (annualPlan ? annualPlan.calculated_monthly : null),
          annual_amount: annualPlan ? annualPlan.amount : (monthlyPlan ? monthlyPlan.calculated_yearly : null),
          plans_count: toolPlans.length,
          plans: toolPlans,
        },
        features: toolFeatures.map((f) => ({ name: f.name, group: f.group_name, is_available: f.is_available })),
        integrations: toolIntegrations.map((i) => ({ name: i.name, category: i.category })),
        specifications: specsMap,
        security: toolSecurity,
        resources: toolResources,
      };
    });

    // Collect all distinct specification keys across all compared tools
    const allSpecKeys = new Map();
    specsRes.rows.forEach((s) => {
      if (!allSpecKeys.has(s.attribute_key)) {
        allSpecKeys.set(s.attribute_key, s.attribute_label);
      }
    });

    res.status(200).json({
      compared_tools: matrix,
      count: matrix.length,
      available_spec_keys: Array.from(allSpecKeys.entries()).map(([key, label]) => ({ key, label })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN CRUD:
 * Categories
 */
export async function adminCreateCategory(req, res, next) {
  try {
    const { name, slug, description, icon_url, sort_order = 0, is_active = true } = req.body;
    if (!name || !slug) {
      throw new ApiError(400, "Category name and slug are required.");
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const result = await pool.query(
      `
      INSERT INTO tool_categories (name, slug, description, icon_url, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [name.trim(), cleanSlug, description || null, icon_url || null, sort_order, is_active]
    );

    invalidateToolsCache();
    res.status(201).json({ category: result.rows[0], message: "Category created successfully." });
  } catch (err) {
    if (err.code === "23505") {
      return next(new ApiError(409, "A category with this name or slug already exists."));
    }
    next(err);
  }
}

export async function adminUpdateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description, icon_url, sort_order, is_active } = req.body;

    const result = await pool.query(
      `
      UPDATE tool_categories
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          icon_url = COALESCE($4, icon_url),
          sort_order = COALESCE($5, sort_order),
          is_active = COALESCE($6, is_active),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *;
      `,
      [name, slug, description, icon_url, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Category not found.");
    }

    invalidateToolsCache();
    res.status(200).json({ category: result.rows[0], message: "Category updated successfully." });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    // Check if category has tools
    const countCheck = await pool.query("SELECT COUNT(*) FROM tools WHERE category_id = $1;", [id]);
    if (parseInt(countCheck.rows[0].count, 10) > 0) {
      // Soft-disable instead of hard delete to preserve relationships
      await pool.query("UPDATE tool_categories SET is_active = FALSE, updated_at = NOW() WHERE id = $1;", [id]);
      invalidateToolsCache();
      return res.status(200).json({ message: "Category deactivated (contains existing tools)." });
    }

    await pool.query("DELETE FROM tool_categories WHERE id = $1;", [id]);
    invalidateToolsCache();
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN CRUD:
 * Software Tools
 */
export async function adminCreateTool(req, res, next) {
  try {
    const {
      category_id,
      name,
      slug,
      provider_name,
      icon_url,
      short_description,
      overview,
      main_purpose,
      typical_use_cases = [],
      intended_audience,
      deployment_model = "Cloud",
      official_website_url,
      is_published = true,
      published_at = new Date().toISOString(),
      tags = [],
    } = req.body;

    if (!category_id || !name || !slug || !provider_name || !icon_url || !short_description || !official_website_url) {
      throw new ApiError(400, "Missing required tool fields (category_id, name, slug, provider_name, icon_url, short_description, official_website_url).");
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertRes = await client.query(
        `
        INSERT INTO tools (
          category_id, name, slug, provider_name, icon_url,
          short_description, overview, main_purpose, typical_use_cases,
          intended_audience, deployment_model, official_website_url,
          is_published, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
        `,
        [
          category_id,
          name.trim(),
          cleanSlug,
          provider_name.trim(),
          icon_url.trim(),
          short_description.trim(),
          overview || null,
          main_purpose || null,
          typical_use_cases,
          intended_audience || null,
          deployment_model,
          official_website_url.trim(),
          is_published,
          published_at,
        ]
      );

      const createdTool = insertRes.rows[0];

      // Add tags if provided
      if (Array.isArray(tags) && tags.length > 0) {
        for (const t of tags) {
          if (t && typeof t === "string") {
            await client.query(
              "INSERT INTO tool_tags (tool_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
              [createdTool.id, t.trim().toLowerCase()]
            );
          }
        }
      }

      await client.query("COMMIT");
      invalidateToolsCache();
      res.status(201).json({ tool: createdTool, message: "Software tool registered successfully." });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === "23505") {
      return next(new ApiError(409, "A software product with this slug already exists."));
    }
    next(err);
  }
}

export async function adminUpdateTool(req, res, next) {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      slug,
      provider_name,
      icon_url,
      short_description,
      overview,
      main_purpose,
      typical_use_cases,
      intended_audience,
      deployment_model,
      official_website_url,
      is_published,
      published_at,
      tags,
    } = req.body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateRes = await client.query(
        `
        UPDATE tools
        SET category_id = COALESCE($1, category_id),
            name = COALESCE($2, name),
            slug = COALESCE($3, slug),
            provider_name = COALESCE($4, provider_name),
            icon_url = COALESCE($5, icon_url),
            short_description = COALESCE($6, short_description),
            overview = COALESCE($7, overview),
            main_purpose = COALESCE($8, main_purpose),
            typical_use_cases = COALESCE($9, typical_use_cases),
            intended_audience = COALESCE($10, intended_audience),
            deployment_model = COALESCE($11, deployment_model),
            official_website_url = COALESCE($12, official_website_url),
            is_published = COALESCE($13, is_published),
            published_at = COALESCE($14, published_at),
            updated_at = NOW()
        WHERE id = $15
        RETURNING *;
        `,
        [
          category_id,
          name,
          slug,
          provider_name,
          icon_url,
          short_description,
          overview,
          main_purpose,
          typical_use_cases,
          intended_audience,
          deployment_model,
          official_website_url,
          is_published,
          published_at,
          id,
        ]
      );

      if (updateRes.rows.length === 0) {
        throw new ApiError(404, "Software tool not found.");
      }

      if (Array.isArray(tags)) {
        await client.query("DELETE FROM tool_tags WHERE tool_id = $1;", [id]);
        for (const t of tags) {
          if (t && typeof t === "string") {
            await client.query(
              "INSERT INTO tool_tags (tool_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
              [id, t.trim().toLowerCase()]
            );
          }
        }
      }

      await client.query("COMMIT");
      invalidateToolsCache();
      res.status(200).json({ tool: updateRes.rows[0], message: "Software tool updated successfully." });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteTool(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tools WHERE id = $1 RETURNING id, name;", [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, "Software tool not found.");
    }
    invalidateToolsCache();
    res.status(200).json({ message: `Tool "${result.rows[0].name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Pricing Plans, Features, Specs
 */
export async function adminAddPricingPlan(req, res, next) {
  try {
    const { id: toolId } = req.params;
    const {
      plan_name,
      plan_type = "subscription",
      amount = 0.0,
      currency = "USD",
      billing_interval = "month",
      interval_count = 1,
      pricing_model = "subscription",
      per_unit,
      minimum_commitment,
      free_tier_available = false,
      pricing_source_url,
    } = req.body;

    if (!plan_name) {
      throw new ApiError(400, "Plan name is required.");
    }

    const resPlan = await pool.query(
      `
      INSERT INTO tool_pricing_plans (
        tool_id, plan_name, plan_type, amount, currency,
        billing_interval, interval_count, pricing_model,
        per_unit, minimum_commitment, free_tier_available,
        pricing_source_url, last_verified_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *;
      `,
      [
        toolId,
        plan_name,
        plan_type,
        amount,
        currency,
        billing_interval,
        interval_count,
        pricing_model,
        per_unit,
        minimum_commitment,
        free_tier_available,
        pricing_source_url,
      ]
    );

    invalidateToolsCache();
    res.status(201).json({ plan: resPlan.rows[0], message: "Pricing plan added successfully." });
  } catch (err) {
    next(err);
  }
}

export async function adminAddFeature(req, res, next) {
  try {
    const { id: toolId } = req.params;
    const { name, description, group_name = "Core Features", is_available = true } = req.body;

    if (!name) throw new ApiError(400, "Feature name is required.");

    const resFeat = await pool.query(
      `
      INSERT INTO tool_features (tool_id, name, description, group_name, is_available)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [toolId, name, description, group_name, is_available]
    );

    res.status(201).json({ feature: resFeat.rows[0], message: "Feature added successfully." });
  } catch (err) {
    next(err);
  }
}

export async function adminAddSpecification(req, res, next) {
  try {
    const { id: toolId } = req.params;
    const { attribute_key, attribute_label, attribute_value, unit, group_name = "Technical Specifications" } = req.body;

    if (!attribute_key || !attribute_label || attribute_value === undefined) {
      throw new ApiError(400, "attribute_key, attribute_label, and attribute_value are required.");
    }

    const resSpec = await pool.query(
      `
      INSERT INTO tool_specifications (tool_id, attribute_key, attribute_label, attribute_value, unit, group_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [toolId, attribute_key, attribute_label, String(attribute_value), unit, group_name]
    );

    res.status(201).json({ specification: resSpec.rows[0], message: "Specification added successfully." });
  } catch (err) {
    next(err);
  }
}

// Helper function to format pricing intervals and projections mathematically
function formatPlanCalculations(plan) {
  const amount = parseFloat(plan.amount) || 0;
  const interval = plan.billing_interval || "month";

  let calculatedMonthly = null;
  let calculatedYearly = null;
  let calculatedDaily = null;
  let calculationNote = null;

  if (plan.pricing_model === "custom") {
    calculationNote = "Custom pricing — contact sales.";
  } else if (plan.pricing_model === "usage_based") {
    calculationNote = "Usage-based metered billing.";
  } else if (interval === "month") {
    calculatedMonthly = amount;
    calculatedYearly = amount * 12;
    calculatedDaily = +(amount / 30).toFixed(2);
    calculationNote = "Billed monthly.";
  } else if (interval === "year") {
    calculatedYearly = amount;
    calculatedMonthly = +(amount / 12).toFixed(2);
    calculatedDaily = +(amount / 365).toFixed(2);
    calculationNote = `Billed annually at $${amount}/yr ($${calculatedMonthly}/mo equivalent).`;
  } else if (interval === "day") {
    calculatedDaily = amount;
    calculatedMonthly = amount * 30;
    calculatedYearly = amount * 365;
    calculationNote = "Billed daily.";
  }

  return {
    ...plan,
    amount,
    calculated_daily: calculatedDaily,
    calculated_monthly: calculatedMonthly,
    calculated_yearly: calculatedYearly,
    calculation_note: calculationNote,
    is_free: plan.free_tier_available || amount === 0 || plan.pricing_model === "free",
  };
}

import {
  listMarketplaceCategories,
  listMarketplaceApis,
  getMarketplaceApiBySlug,
  getMarketplaceApiDocs,
  adminCreateApiProduct,
  adminCreateCategory,
  adminAddPlanToProduct,
} from "../services/marketplace.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleGetCategories = asyncHandler(async (req, res) => {
  const categories = await listMarketplaceCategories();
  res.status(200).json({
    success: true,
    categories,
  });
});

export const handleGetApis = asyncHandler(async (req, res) => {
  const { category, q, price, sort, page, limit } = req.query;
  const result = await listMarketplaceApis({
    category,
    query: q,
    price,
    sort,
    page,
    limit,
    includeUnpublished: req.isAdmin === true,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const handleGetApiBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const api = await getMarketplaceApiBySlug(slug, {
    includeUnpublished: req.isAdmin === true,
  });

  res.status(200).json({
    success: true,
    api,
  });
});

export const handleGetApiPlans = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const api = await getMarketplaceApiBySlug(slug);

  res.status(200).json({
    success: true,
    api: {
      id: api.id,
      name: api.name,
      slug: api.slug,
    },
    plans: api.plans || [],
  });
});

export const handleGetApiDocs = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const docs = await getMarketplaceApiDocs(slug);

  res.status(200).json({
    success: true,
    docs,
  });
});

export const handleAdminCreateCategory = asyncHandler(async (req, res) => {
  const category = await adminCreateCategory(req.body);
  res.status(201).json({
    success: true,
    message: "Marketplace category created successfully.",
    category,
  });
});

export const handleAdminCreateProduct = asyncHandler(async (req, res) => {
  const product = await adminCreateApiProduct(req.body);
  res.status(201).json({
    success: true,
    message: "Marketplace API product created successfully.",
    product,
  });
});

export const handleAdminAddPlan = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const plan = await adminAddPlanToProduct(productId, req.body);
  res.status(201).json({
    success: true,
    message: "Plan added to product successfully.",
    plan,
  });
});

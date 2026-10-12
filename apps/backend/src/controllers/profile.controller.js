import {
  getUserProfile,
  updateUserProfile,
  getUserPurchases,
  getUserPayments,
  getUserEntitlements,
  getUserUsageAnalytics,
  getUserRecentUsage,
} from "../services/profile.service.js";
import {
  createApiKeyForUser,
  listApiKeysForUser,
  revokeApiKeyForUser,
  rotateApiKeyForUser,
} from "../services/apiKey.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleGetProfile = asyncHandler(async (req, res) => {
  const profile = await getUserProfile(req.user.id);
  res.status(200).json({
    success: true,
    user: profile,
  });
});

export const handleUpdateProfile = asyncHandler(async (req, res) => {
  const updated = await updateUserProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: updated,
  });
});

export const handleGetPurchases = asyncHandler(async (req, res) => {
  const purchases = await getUserPurchases(req.user.id);
  res.status(200).json({
    success: true,
    purchases,
  });
});

export const handleGetPayments = asyncHandler(async (req, res) => {
  const payments = await getUserPayments(req.user.id);
  res.status(200).json({
    success: true,
    payments,
  });
});

export const handleGetEntitlements = asyncHandler(async (req, res) => {
  const entitlements = await getUserEntitlements(req.user.id);
  res.status(200).json({
    success: true,
    entitlements,
  });
});

export const handleGetUsage = asyncHandler(async (req, res) => {
  const analytics = await getUserUsageAnalytics(req.user.id);
  res.status(200).json({
    success: true,
    analytics,
  });
});

export const handleGetRecentUsage = asyncHandler(async (req, res) => {
  const recent = await getUserRecentUsage(req.user.id, req.query.limit);
  res.status(200).json({
    success: true,
    recent,
  });
});

export const handleGetProfileApiKeys = asyncHandler(async (req, res) => {
  const apiKeys = await listApiKeysForUser(req.user.id);
  res.status(200).json({
    success: true,
    apiKeys,
  });
});

export const handleCreateProfileApiKey = asyncHandler(async (req, res) => {
  const { name, apiProductId, entitlementId } = req.body;
  const apiKey = await createApiKeyForUser(req.user.id, name, { apiProductId, entitlementId });
  res.status(201).json({
    success: true,
    message: "API key created successfully. Save your key now as it will not be displayed again.",
    apiKey,
  });
});

export const handleRevokeProfileApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const revoked = await revokeApiKeyForUser(req.user.id, id);
  res.status(200).json({
    success: true,
    message: "API key revoked successfully.",
    revokedKey: revoked,
  });
});

export const handleRotateProfileApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rotated = await rotateApiKeyForUser(req.user.id, id);
  res.status(200).json({
    success: true,
    message: "API key rotated successfully. Save your new key now as it will not be displayed again.",
    apiKey: rotated,
  });
});

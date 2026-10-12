import {
  createApiKeyForUser,
  listApiKeysForUser,
  revokeApiKeyForUser,
  rotateApiKeyForUser,
} from "../services/apiKey.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleCreateApiKey = asyncHandler(async (req, res) => {
  const { name, apiProductId, entitlementId } = req.body;
  const result = await createApiKeyForUser(req.user.id, name, { apiProductId, entitlementId });

  res.status(201).json({
    success: true,
    message: "API key created successfully. Save your raw key now as it will not be displayed again.",
    apiKey: result,
  });
});

export const handleListApiKeys = asyncHandler(async (req, res) => {
  const keys = await listApiKeysForUser(req.user.id);

  res.status(200).json({
    success: true,
    apiKeys: keys,
  });
});

export const handleRevokeApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const revoked = await revokeApiKeyForUser(req.user.id, id);

  res.status(200).json({
    success: true,
    message: "API key revoked successfully.",
    revokedKey: revoked,
  });
});

export const handleRotateApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rotated = await rotateApiKeyForUser(req.user.id, id);

  res.status(200).json({
    success: true,
    message: "API key rotated successfully. Save your new raw key now as it will not be displayed again.",
    apiKey: rotated,
  });
});

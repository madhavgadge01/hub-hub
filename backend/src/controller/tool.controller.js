export const pingTool = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API key verified",
    apiKey: req.apiKey,
  });
};
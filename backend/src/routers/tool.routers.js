import { Router } from "express";
import { generateQr,mataDataUrl,password,passwordCheaker } from "../controller/tool.controller.js";
import {verifyApiKey}from "../middleware/apiKey.middleware.js"
const ToolRouter = Router()


ToolRouter.post("/QRcode",verifyApiKey,generateQr);

ToolRouter.post("/url-metadata",
  verifyApiKey,
  mataDataUrl);

ToolRouter.post("/password",verifyApiKey,password)
ToolRouter.post("/passwordchecker",verifyApiKey,passwordCheaker)




export default ToolRouter;
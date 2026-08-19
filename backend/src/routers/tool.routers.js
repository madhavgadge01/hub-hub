import { Router } from "express";
import { generateQr } from "../controller/tool.controller.js";
import {verifyApiKey}from "../middleware/apiKey.middleware.js"
const ToolRouter = Router()


ToolRouter.post("/QRcode",verifyApiKey,generateQr);











export default ToolRouter;
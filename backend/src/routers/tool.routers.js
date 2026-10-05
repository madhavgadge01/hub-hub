import { Router } from "express";
import { generateQr,mataDataUrl,password,passwordCheaker,cardValidator,ytVideo} from "../controller/tool.controller.js";
import {verifyApiKey}from "../middleware/apiKey.middleware.js"
const ToolRouter = Router()


ToolRouter.post("/QRcode",verifyApiKey,generateQr);

ToolRouter.post("/url-metadata",
  verifyApiKey,
  mataDataUrl);

ToolRouter.post("/password",verifyApiKey,password)
ToolRouter.post("/passwordchecker",verifyApiKey,passwordCheaker)
ToolRouter.post("/card-validator",verifyApiKey,cardValidator)
ToolRouter.post("/ytVideo",verifyApiKey,ytVideo)


export default ToolRouter;
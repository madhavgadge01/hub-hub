import express from "express"
import cors from "cors"
import userRouter from "./routers/user.routers.js"
import ToolRouter from "./routers/tool.routers.js"
import cookieParser from "cookie-parser"

const app=express();
app.use(cors({

    origin:process.env.CORS_ORIGIN ||["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept"
    ]

}));

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(cookieParser())



const router = express.Router();
const health = (req,res)=>{


        console.log("it's working")


    res.json({
       "success": true,
  "message": "DevHub API is running"
    })
}
router.get("/health",health);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/",ToolRouter)

export default app;


import Redis from "ioredis"
import express from "express"
const app = express();
const redis = new Redis(process.env.REDIS_URL||'redis://localhost:6379')

app.get('/redis',async(req,res)=>{
    const replay = await redis.ping();
    res.status(200).json({redis:replay})
})

export default redis;
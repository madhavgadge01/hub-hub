import "dotenv/config";
import app from "./app.js"
import pool from "./models/db.js";

const Port = process.env.CORS_ORIGIN||8000

const startServer = async()=>{
    try {
        
        await pool.query("SELECT 1")
        console.log("PostgreSQL connected 🥰")
        app.listen(Port,()=>{
            console.log("port is runing ${Port} 🥂")
        })
    } catch (error) {
        console.error("❌ Database connection failed");
    console.error(error.message);

    process.exit(1);
    }

};
startServer();
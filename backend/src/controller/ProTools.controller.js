import { ApiError } from "../utils/api.error.js";
import { marked } from "marked";
import puppeteer from 'puppeteer';
import redis from "../config/redis.js"
import pool from "../models/db.js"

import { Buffer } from 'node:buffer';
import { url } from "node:inspector";

export const analyze_repo = async (req, res) => {
    const { url } = req.query;

    let parsedUrl;
   
    try {
        // 5
        parsedUrl = new URL(url);
    } catch (error) {
       
        return res.status(400).json({ success: false, message: "Invalid URL format" });
    }

    // Domain check
    if (parsedUrl.hostname !== "github.com") {
        return res.status(400).json({ success: false, message: "Sirf GitHub URLs allowed hain" });
    }
// 6
    const pathParts = parsedUrl.pathname.split('/');
    
    if (pathParts.length < 3) {
        return res.status(400).json({ success: false, message: "URL mein owner aur repo name nahi mila" });
    }

    const owner = pathParts[1];
    const repo = pathParts[2];  

    // Step 3: GitHub API call
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;

    try {
        const response = await fetch(githubApiUrl); 
        
        if (response.status == 404) {
            return res.status(404).json({ success: false, message: "package.json not found. It is not a Node/React project." });
        }
        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: "GitHub API fetch fail ho gaya" });
        }
        
        const data = await response.json();

        // Base64 decode
        const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
        const packageJsonData = JSON.parse(decodedContent);
        
        // Project type logic
        let projectType = "Node.js backend";
        if (packageJsonData.dependencies?.react || packageJsonData.dependencies?.next) {
            projectType = "React/Next.js Frontend";
        }
        
        return res.status(200).json({
            success: true,
            owner,
            repo,
            type: projectType,
            dependencies: packageJsonData.dependencies || {},
            scripts: packageJsonData.scripts || {}
        });

    } catch (error) {

        console.error("API Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}



export const generatePdf = async (req, res) => {
    const { markdown } = req.body;

    // Validation
    if (!markdown) {
        throw new ApiError(400, "Markdown is empty, it is required");
    }

    // Step 1: Parse Markdown to HTML
    const generatedHtml = marked.parse(markdown);

    // Step 2: Launch Browser with Linux/EC2 safety flags
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Wait lagana zaroori hai kyunki content set hone mein time lagta hai
        await page.setContent(generatedHtml);

        // Wait lagakar raw PDF data (Buffer) extract karo
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

       
        console.log("PDF Buffer Generated:", pdfBuffer);

 res.setHeader('Content-Type', 'application/pdf');


res.setHeader('Content-Disposition', 'attachment; filename="kruu-document.pdf"');
      
        return res.send(Buffer.from(pdfBuffer));
    } finally {
      
        if (browser) {
            await browser.close();
        }
    }
};


export const sortenLink = async(req,res)=>{
    const { url } = req.body;
    if(!url){
        throw new ApiError(400,"url required bro");
    }

    function generateRandomString(n) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < n; i++) {
            const randomIndex = Math.floor(Math.random() * letters.length);
            result += letters.charAt(randomIndex);
        }
        return result;
    }

    const shortCode = generateRandomString(6);

   
    const finnallink = `https://kruu.online/${shortCode}`;


    await pool.query(
        `
        INSERT INTO urls (
          original_url,
          short_code
        )
        VALUES (
          $1,
          $2
        )
        `,
        [url, shortCode]
    );

    return res.status(200).json({ originalUrl: url, shortCode: shortCode, mainCode: finnallink });
}


export const getLongLink = async (req, res) => {
  
    const { url } = req.params;

    if (!url) {
        return res.status(400).json({ success: false, message: "Code is required" });
    }


  const click_count=  pool.query(
        `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`,
        [url]
    ).catch(err => console.log("Analytics Error:", err));


    const cachedUrl = await redis.get(url);
    if (cachedUrl) {
       
        return res.redirect(cachedUrl);
    }


    const ogURL = await pool.query(
        `SELECT original_url FROM urls WHERE short_code = $1`,
        [url]
    );

    if (ogURL.rows.length === 0) {
        return res.status(404).send("Link not found");
    }

    const actualLongUrl = ogURL.rows[0].original_url;

  
    await redis.set(url, actualLongUrl, 'EX', 3600);


    return res.redirect(actualLongUrl);
}





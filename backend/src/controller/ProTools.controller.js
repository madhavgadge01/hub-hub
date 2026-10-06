import { ApiError } from "../utils/api.error.js";
import pool from "../models/db.js"

import { Buffer } from 'node:buffer';

export const analyze_repo = async (req, res, next) => {
    const { url } = req.query;

    let parsedUrl;
    // Step 1: URL validation
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
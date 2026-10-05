import QRCode from "qrcode";
import dns from "dns/promises";
import * as cheerio from "cheerio";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { ApiError } from "../utils/api.error.js";
import pool from "../models/db.js"
import { json } from "express";


// 1
export const pingTool = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API key verified",
    apiKey: req.apiKey,
  });
};

// 2
export const getApiKeys = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(401, "User id required");
  }

  const result = await pool.query(
    `
    SELECT
      id,
      name,
      key_prefix,
      created_at,
      last_used_at,
      revoked_at
    FROM api_keys
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return res.status(200).json({
    success: true,
    message: "Get API keys success",
    apiKeys: result.rows
  });
};
// 3
export const generateQr = async(req,res)=>{
  const { text } = req.body;
  if (!text) {
  throw new ApiError(400, "Text is required");
}
  console.log(text);
  const qrDataUrl = await QRCode.toDataURL(text);

  if(!qrDataUrl){
    throw new ApiError(401,"qrDataUrl error ::tool controller.js")
  }
  return res.status(200).json({
    success: true,
    message: "qr code generated",
    qrDataUrl,text

  })

}
// 4
export const revokeApiKey = async(req,res)=>{
  const { id } = req.params;
  const userId = req.user.id;
  const result = await pool.query(
  `
  UPDATE api_keys
  SET revoked_at = NOW()
  WHERE id = $1
    AND user_id = $2
  RETURNING id, name, key_prefix, revoked_at
  `,
  [id, userId]
);

const resultRow = result.rows[0];
if(!resultRow){
  throw new ApiError(401,"result not faoud");
}
return res.status(200).json({
  success:true
})
}
// 5
export const mataDataUrl = async(req,res)=>{
  const { url} = req.body;
  if(!url){
    throw new ApiError(400,"url is required")
  }


  // ye url check ke liye kahi galat url na utha le 

  let parsedUrl;
  try {
    parsedUrl = new URL(url);

  } catch (error) {
     throw new ApiError(400, "Invalid URL");
  }

  if(parsedUrl.protocol!=="http:"&&parsedUrl.protocol!=="https:"){
      throw new ApiError(400, "Only HTTP and HTTPS URLs are allowed");
  }


const hostname = parsedUrl.hostname;

if (
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1"
) {
  throw new ApiError(400, "Local URLs are not allowed");
}

  console.log(url);




  const response = await fetch(parsedUrl.href,{
    signal:AbortSignal.timeout(5000)
  });

  if (!response.ok) {
  throw new ApiError(
    response.status,
    "Failed to fetch the requested URL"
  );
}

const contentType = response.headers.get("content-type");

if (!contentType?.includes("text/html")) {
  throw new ApiError(400, "URL does not point to an HTML page");
}

const privateIpPattern =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

if (privateIpPattern.test(hostname)) {
  throw new ApiError(400, "Private network URLs are not allowed");
}
  const html = await response.text();
const $ = cheerio.load(html);
const title = $("title").text();

const description = $('meta[name="description"]').attr("content");

const ogTitle = $('meta[property="og:title"]').attr("content");

const ogDescription = $('meta[property="og:description"]').attr("content");

const ogImage = $('meta[property="og:image"]').attr("content");

const favicon =
  $('link[rel="icon"]').attr("href") ||
  $('link[rel="shortcut icon"]').attr("href");

  const imageUrl = ogImage
  ? new URL(ogImage, parsedUrl.href).href
  : null;

const faviconUrl = favicon
  ? new URL(favicon, parsedUrl.href).href
  : null;

return res.status(200).json({
  success: true,
  message: "metadata generated",
  data: {
    url,
    title: ogTitle || title || null,
    description: ogDescription || description || null,
    image: imageUrl,
    favicon: faviconUrl
  }
});
}
// 6
export const password = async(req,res)=>{
  const {length ,hasNumbers,hasSymbols,hasUppercase,hasLowercase}= req.body;
  let password =[];

  if(length<4 || length>128){
    throw new ApiError(400,"length is min 4 and max 128");
  }
  if(hasNumbers==false &&hasSymbols==false&&hasUppercase==false &&hasLowercase == false){
     throw new ApiError(400,"any one condition must be true");
  }
const UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

let allowed ="";

if(hasNumbers){
  allowed+=NUMBERS;
  password.push(NUMBERS[Math.floor(Math.random()*NUMBERS.length)])
}
if(hasSymbols){
  allowed+=SYMBOLS;
  password.push(SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)])
}
if(hasUppercase){
  allowed+=UPPER_CASE;
  password.push(UPPER_CASE[Math.floor(Math.random()*UPPER_CASE.length)])
}
if(hasLowercase){
  allowed+=LOWER_CASE;
  password.push(LOWER_CASE[Math.floor(Math.random()*LOWER_CASE.length)])
}

const remaing = length-password.length;

for(let i=0;i<remaing;i++){
  const randomIndex = Math.floor(Math.random()*allowed.length)
  password.push(allowed[randomIndex]);
}

password = password.sort(() => Math.random() - 0.5);
if(password.length==0){
  throw new ApiError(400,"length 0 hai matlb kahi toh dikkat hai")
}
const finalPasword = password.join("");

return res.status(200).json({
    success: true,
    password: finalPasword,
    length: finalPasword.length
  });
}
// 7
export const passwordCheaker = async(req,res)=>{
  const {password}=req.body;
  let score =0;

  if(password.length==0){
    throw new ApiError(400,"password must have minimum 1 char")
  }
  const hasLowercase = /[a-z]/.test(password);
  if(hasLowercase)score++;

  const hasUppercase = /[A-Z]/.test(password);
   if(hasUppercase)score++;
const hasNumber = /[0-9]/.test(password);
 if(hasNumber)score++;
const hasSymbol = /[^a-zA-Z0-9]/.test(password);
 if(hasSymbol)score++;

 if(password.length.length>=8)score++;

 let strength = "";
if (score <= 2) strength = "Weak";
else if (score === 3 || score === 4) strength = "Medium";
else strength = "Strong";

 if(score==0){
  throw new ApiError("may be a issue in the controller or user password is worst")
 }


 return res.status(200).json({
  success:true,
  score: score,
  strength: strength,
 })
}
// 8
export const emailchecker= async(req,res)=>{
  const { email } = req.body;

  if(!email){
    throw new ApiError(400,"email is requierd");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidSyntax = emailRegex.test(email);
 if(isValidSyntax==false){
  throw new ApiError(400,"it not valid")
 }
const domain = email.split("@")[1];

try {
  const records = await dns.resolveMx(domain);

  if (!records || records.length === 0) {
    throw new ApiError(400, "No mail servers found for this domain");
}
} catch (error) {
  throw new ApiError("email domain is not vaild you need gmail.com aur other offical email")
}
return res.status(200).json({
    success: true,
    message: "email is perfect"
});
}

// 9
export const cardValidator = async (req, res) => {
  const { Cardnumber } = req.body;


  if (!Cardnumber) {
    throw new ApiError(400, "Card number is required");
  }

if(Cardnumber.length<13 &&  Cardnumber.length>19){
  throw new ApiError(400,"Invalid card length");
}
  const cleanNumber = Cardnumber.replace(/\s|-/g, "");

  if (!/^\d+$/.test(cleanNumber)) {
    throw new ApiError(400, "Card can only contain numbers");
  }

  let cardType = "Unknown";
  if (cleanNumber.startsWith("4")) {
    cardType = "Visa";
  } else if (cleanNumber.startsWith("5")) {
    cardType = "Mastercard";
  } else if (cleanNumber.startsWith("34") || cleanNumber.startsWith("37")) {
    cardType = "Amex";
  }

  let sum = 0;
  let isAlternate = false;


  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10); 

    if (isAlternate) {
      digit = digit * 2;
      if (digit > 9) {
        digit = digit - 9; 
      }
    }

    sum += digit;
    isAlternate = !isAlternate;
  }

  const isValid = sum % 10 === 0;

  return res.status(200).json({
    success: true,
    isValid: isValid,
    cardType: cardType,
    message: isValid ? "Mathematical validation passed" : "Invalid card number"
  });
};


// 10
export const ytVideo = async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        throw new ApiError(400, "URL is required"); // Yahan 400 add kiya hai
    }
    
    const isValid = ytdl.validateURL(url);
    if (!isValid) {
        throw new ApiError(400, "URL is not valid");
    }

    // Browser ko signal dena ki file download karni hai
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');

    try {
        // Video ki hidden details nikalna
        const info = await ytdl.getInfo(url);

        // Direct raw links nikalna
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoonly' });

        // FFmpeg se direct links mix karke bhejna
        ffmpeg()
            .input(videoFormat.url)
            .input(audioFormat.url)
            .outputOptions([
                '-c:v copy',
                '-c:a aac'
            ])
            .format('mp4')
            .pipe(res)
            .on('error', (err) => {
                console.error("FFmpeg Error:", err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: "Video process hone mein error aaya" });
                }
            });
            
    } catch (error) {
        console.error("YouTube Fetch Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "YouTube se video fetch nahi ho payi" });
        }
    }
};

require("dotenv").config(); // Load environment variables

console.log("🔍 Debugging Environment Variables:");
console.log("M-Pesa Consumer Key:", process.env.MPESA_CONSUMER_KEY);
console.log("M-Pesa Consumer Secret:", process.env.MPESA_CONSUMER_SECRET);
console.log("M-Pesa Shortcode:", process.env.MPESA_SHORTCODE);
console.log("M-Pesa Passkey:", process.env.MPESA_PASSKEY);
console.log("M-Pesa Callback URL:", process.env.MPESA_CALLBACK_URL);

const axios = require("axios");
const consumerKey = "YA1AnAZSOAHPUUKWzFASFITDfAF1If2wi0GCt5uSpnnIxIdc"; 
const consumerSecret = "qerFGsxTmDG4uDOvllAVLclbdYZT4lfN1gy6LAjCWGTX7vy88A8OHv2wZLIwveiM";

const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    console.log("🔄 Requesting M-Pesa Access Token...");
    
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` }
      }
    );

    console.log("✅ Access Token Retrieved Successfully:", response.data);
    return response.data.access_token;

  } catch (error) {
    console.error("❌ Error Getting Access Token:");
    
    if (error.response) {
      console.error("🔴 Status Code:", error.response.status);
      console.error("📌 Error Data:", error.response.data);
    } else {
      console.error("⚠️ Unknown Error:", error.message);
    }
  }
};

// Run function
getAccessToken();

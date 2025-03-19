const axios = require("axios");

const consumerKey = "YA1AnAZSOAHPUUKWzFASFITDfAF1If2wi0GCt5uSpnnIxIdc"; // Replace with your consumer key
const consumerSecret = "qerFGsxTmDG4uDOvllAVLclbdYZT4lfN1gy6LAjCWGTX7vy88A8OHv2wZLIwveiM"; // Replace with your consumer secret
const shortcode = "174379"; 
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2c2cfc9137b9f48badd3b5db9f708f58"; 
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

// Function to generate access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error generating access token:", error.response?.data || error.message);
  }
};

// STK Push request
const stkPushRequest = async () => {
  const accessToken = await getAccessToken(); // Get a fresh token
  if (!accessToken) {
    console.error("Failed to get access token");
    return;
  }

  const requestData = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: "10",
    PartyA: "254702276873",
    PartyB: shortcode,
    PhoneNumber: "254702276873",
    CallBackURL: "https://d617-105-29-165-232.ngrok-free.app/mpesa/callback",
    AccountReference: "SwiftMart",
    TransactionDesc: "Payment for order"
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("STK Push Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

// Run function
stkPushRequest();

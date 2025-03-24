const axios = require("axios");

// Use environment variables for sensitive data
const consumerKey = process.env.MPESA_CONSUMER_KEY; // Consumer key
const consumerSecret = process.env.MPESA_CONSUMER_SECRET; // Consumer secret
const shortcode = "174379";  // Your Paybill or Till number
const passkey = process.env.MPESA_PASSKEY;  // M-Pesa passkey
const callbackURL = "https://d617-105-29-165-232.ngrok-free.app/mpesa/callback";  // Your Ngrok URL or backend URL

// Function to generate M-Pesa access token
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
const stkPushRequest = async (phone, amount) => {
  const accessToken = await getAccessToken(); // Get a fresh token
  if (!accessToken) {
    console.error("Failed to get access token");
    return;
  }

  // Timestamp and password for M-Pesa security
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  const requestData = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,  // Dynamic amount from client input
    PartyA: phone,   // Dynamic phone number from client input
    PartyB: shortcode,
    PhoneNumber: phone,  // Phone number to receive the STK push
    CallBackURL: callbackURL,  // Replace with your actual callback URL
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
    return response.data;
  } catch (error) {
    console.error("Error processing STK Push:", error.response?.data || error.message);
  }
};

// Call stkPushRequest with dynamic data (for testing, pass phone and amount)
stkPushRequest("254702276873", "50");  // Example phone and amount

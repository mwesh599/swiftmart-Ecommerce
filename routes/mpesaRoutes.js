const express = require("express");
const router = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Generate M-Pesa Access Token
async function getAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    try {
        const { data } = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: { Authorization: `Basic ${auth}` },
            }
        );
        return data.access_token;
    } catch (error) {
        console.error("Error getting M-Pesa access token:", error.response.data);
        throw error;
    }
}

// STK Push Route
router.post("/stkpush", async (req, res) => {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ message: "Phone number and amount are required!" });
    }

    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const shortcode = "174379"; // Use your Paybill/Till number
    const passkey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const requestBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://your-ngrok-url/callback",
        AccountReference: "Test",
        TransactionDesc: "Payment"
    };

    try {
        const { data } = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            requestBody,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        res.json(data);
    } catch (error) {
        console.error("Error processing STK Push:", error.response.data);
        res.status(500).json(error.response.data);
    }
});

module.exports = router;

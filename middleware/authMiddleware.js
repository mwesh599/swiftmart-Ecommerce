const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    console.log("🔹 Authorization Header:", authHeader);

    if (!authHeader) {
        return res.status(403).json({ message: "❌ Access Denied: No Token Provided" });
    }

    const tokenParts = authHeader.split(" ");
    console.log("🔹 Token Parts:", tokenParts);

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ message: "❌ Invalid Authorization Header Format" });
    }

    const token = tokenParts[1];
    console.log("🔹 Token:", token);

    if (!token) {
        return res.status(401).json({ message: "❌ Invalid Token: Token part missing" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔹 Verified Token (decoded):", verified); // Critical log
        req.user = verified;
        next();
    } catch (error) {
        console.error("🔹 Token Verification Error:", error);
        return res.status(401).json({ message: "❌ Invalid Token", error: error.message });
    }
};

module.exports = verifyToken;
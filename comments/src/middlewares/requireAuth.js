const axios = require("axios");

function extractBearerToken(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

module.exports = async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "Missing Bearer token" });
      return;
    }

    const AUTH_URL = process.env.AUTH_URL || "http://auth-srv:5006";

    const r = await axios.post(
      `${AUTH_URL}/auth/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000,
      }
    );

    req.user = r.data?.user || r.data || null;

    // ÄRA return'i next()
    next();
  } catch (err) {
    res.status(err.response?.status || 401).json({
      message: "Unauthorized",
      detail: err.response?.data || err.message,
    });
  }
};
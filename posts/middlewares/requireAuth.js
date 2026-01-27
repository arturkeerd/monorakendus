const AUTH_URL = process.env.AUTH_URL || "http://localhost:5006";

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "missing Authorization header" });

    const r = await fetch(`${AUTH_URL}/auth/verify`, {
      method: "POST",
      headers: { Authorization: authHeader }
    });

    if (!r.ok) return res.status(401).json({ error: "unauthorized" });

    const data = await r.json();
    req.user = data.payload;
    next();
  } catch {
    return res.status(401).json({ error: "auth service unreachable" });
  }
}

module.exports = requireAuth;
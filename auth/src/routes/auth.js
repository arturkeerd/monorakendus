const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const DUMMY_USER = { id: "u1", email: "demo@blog.local", role: "user" };

// Secrets: 
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret_change_me";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret_change_me";

// Token TTL-id 
const ACCESS_TTL = process.env.ACCESS_TTL || "24h";
const REFRESH_TTL = process.env.REFRESH_TTL || "7d";

const validRefreshTokens = new Set();

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TTL });
}

function extractBearerToken(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

/**
 * POST /auth/login
 * Body: { email?: string, password?: string } (dummy)
 * Returns: { accessToken, refreshToken, user }
 */
router.post("/login", (req, res) => {
  // Dummy login: ei kontrolli passwordi
  const payload = { sub: DUMMY_USER.id, email: DUMMY_USER.email, role: DUMMY_USER.role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: DUMMY_USER.id });

  validRefreshTokens.add(refreshToken);

  res.json({
    user: DUMMY_USER,
    accessToken,
    refreshToken
  });
});

/**
 * POST /auth/verify
 * Header: Authorization: Bearer <accessToken>
 * Returns: { valid: true, payload } OR 401
 *
 * NB! Teised teenused kutsuvad seda ja EI valideeri JWT-d ise.
 */
router.post("/verify", (req, res) => {
  const token = extractBearerToken(req);
  if (!token) return res.status(401).json({ valid: false, error: "missing bearer token" });

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return res.json({ valid: true, payload });
  } catch (e) {
    return res.status(401).json({ valid: false, error: "invalid or expired token" });
  }
});

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken }
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });
  if (!validRefreshTokens.has(refreshToken)) return res.status(401).json({ error: "refresh token not recognized" });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    // uus access token sama kasutaja jaoks
    const accessToken = signAccessToken({
      sub: payload.sub,
      email: DUMMY_USER.email,
      role: DUMMY_USER.role
    });
    return res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: "invalid or expired refresh token" });
  }
});

/**
 * POST /auth/logout
 * Body: { refreshToken }
 * Removes refreshToken from allow-list
 */
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });

  validRefreshTokens.delete(refreshToken);
  res.json({ ok: true });
});

module.exports = router;
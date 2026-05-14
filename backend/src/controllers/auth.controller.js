import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { signAccessToken } from "../services/jwt.js";
import { env } from "../config/env.js";

const COOKIE_NAME = "careerpath.token";
const isProduction = env.NODE_ENV === "production";

function setTokenCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,                          // Not accessible via JS (XSS protection)
    secure: isProduction,                    // HTTPS only in production
    sameSite: isProduction ? "strict" : "lax", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
    path: "/",
  });
}

function clearTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new HttpError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = signAccessToken({ sub: user._id.toString(), email: user.email, name: user.name });

    // Set httpOnly cookie instead of sending token in body
    setTokenCookie(res, token);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token, // Keep for backward compat during migration
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = signAccessToken({ sub: user._id.toString(), email: user.email, name: user.name });

    // Set httpOnly cookie
    setTokenCookie(res, token);

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token, // Keep for backward compat during migration
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: { id: req.user.sub, email: req.user.email, name: req.user.name } });
}

export async function logout(_req, res) {
  clearTokenCookie(res);
  res.json({ ok: true });
}

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "gcet-resources-dev-secret-change-in-prod";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:8080").split(",").map(s => s.trim());
const DATA_DIR = path.resolve(__dirname, "..", "data");

const app = express();

// ─── Security middleware ───────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // In dev, allow all
    if (process.env.NODE_ENV !== "production") return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ─── Rate limiting ─────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/request-access", authLimiter);

// ─── In-memory stores (replace with DB in production) ─────────────
const pendingRequests = [];
const approvedUsers = [];
const sessions = new Map(); // token -> session data

// Load persisted data if available
function loadPersistedData() {
  try {
    const pendingFile = path.join(DATA_DIR, "pending-requests.json");
    if (fs.existsSync(pendingFile)) {
      const data = JSON.parse(fs.readFileSync(pendingFile, "utf-8"));
      pendingRequests.push(...data);
    }
  } catch (e) { /* ignore */ }
  try {
    const approvedFile = path.join(DATA_DIR, "approved-users.json");
    if (fs.existsSync(approvedFile)) {
      const data = JSON.parse(fs.readFileSync(approvedFile, "utf-8"));
      approvedUsers.push(...data);
    }
  } catch (e) { /* ignore */ }
}

function persistPendingRequests() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, "pending-requests.json"), JSON.stringify(pendingRequests, null, 2));
  } catch (e) { /* ignore */ }
}

function persistApprovedUsers() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, "approved-users.json"), JSON.stringify(approvedUsers, null, 2));
  } catch (e) { /* ignore */ }
}

loadPersistedData();

// ─── Auth helpers ──────────────────────────────────────────────────
function isAllowedDomain(email) {
  return email.trim().toLowerCase().endsWith("@galgotiacollege.edu");
}

function authenticateToken(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function adminAuth(req, res, next) {
  const adminToken = req.cookies?.admin_token || req.headers["x-admin-token"];
  if (adminToken === ADMIN_PASSWORD) {
    req.isAdmin = true;
    return next();
  }

  // Also accept JWT-based admin auth
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === "admin") {
        req.isAdmin = true;
        req.user = decoded;
        return next();
      }
    }
  } catch { /* fall through */ }

  return res.status(403).json({ error: "Admin access required" });
}

// ─── Healthcheck ───────────────────────────────────────────────────
app.get("/healthz", (req, res) => res.send("ok"));

// ─── PDF Proxy ─────────────────────────────────────────────────────
// Usage: GET /api/pdf-proxy?url=<encoded remote url>
app.get("/api/pdf-proxy", async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== "string")
    return res.status(400).json({ error: "missing url" });

  try {
    const range = req.headers.range;
    const headers = {};
    if (range) headers["range"] = range;

    const upstream = await fetch(url, {
      method: "GET",
      headers,
      redirect: "follow",
    });

    upstream.headers.forEach((v, k) => {
      if (["transfer-encoding", "connection", "keep-alive", "proxy-authenticate",
           "proxy-authorization", "te", "trailers", "upgrade"].includes(k.toLowerCase()))
        return;
      res.setHeader(k, v);
    });

    res.setHeader("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400");

    res.status(upstream.status);
    const body = upstream.body;
    if (body) {
      body.pipe(res);
    } else {
      const buf = await upstream.arrayBuffer();
      res.send(Buffer.from(buf));
    }
  } catch (err) {
    console.error("pdf-proxy error", err);
    res.status(502).json({ error: "proxy error" });
  }
});

// ─── Auth endpoints ────────────────────────────────────────────────

// Check if an email can log in without approval (allowed domain or already approved)
app.get("/api/auth/check-email", (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "email required" });

  if (isAllowedDomain(email)) {
    return res.json({ status: "allowed" });
  }

  const alreadyApproved = approvedUsers.some(u => u.email === email);
  if (alreadyApproved) return res.json({ status: "allowed" });

  const alreadyPending = pendingRequests.some(p => p.email === email && p.status === "pending");
  if (alreadyPending) return res.json({ status: "pending" });

  return res.json({ status: "new" });
});

// Request access
app.post("/api/auth/request-access", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@"))
    return res.status(400).json({ error: "valid email required" });

  const normalized = email.trim().toLowerCase();
  if (isAllowedDomain(normalized))
    return res.status(400).json({ error: "Domain emails are auto-approved, please login directly" });

  const existing = pendingRequests.find(p => p.email === normalized && p.status === "pending");
  if (existing) return res.json({ message: "Already pending", id: existing.id });

  const reqEntry = {
    id: uuidv4(),
    email: normalized,
    createdAt: Date.now(),
    status: "pending",
  };
  pendingRequests.push(reqEntry);
  persistPendingRequests();

  res.status(201).json({ message: "Request submitted", id: reqEntry.id });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, name, year } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });

  const normalized = email.trim().toLowerCase();

  // Check if domain is allowed or user is approved
  if (!isAllowedDomain(normalized)) {
    const approved = approvedUsers.find(u => u.email === normalized);
    if (!approved) {
      return res.status(403).json({ error: "Not approved. Request access first." });
    }
  }

  const user = { email: normalized, name: name || "", year: year || "" };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

  // Set httpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  sessions.set(token, user);

  res.json({ user, token });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies?.token;
  if (token) sessions.delete(token);
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out" });
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Admin auth
app.post("/api/auth/admin-login", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(403).json({ error: "Invalid password" });

  const adminToken = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2h" });
  res.cookie("admin_token", ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 2 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ token: adminToken });
});

// Admin: get pending requests
app.get("/api/auth/pending-requests", adminAuth, (req, res) => {
  res.json(pendingRequests.filter(r => r.status === "pending"));
});

// Admin: approve request
app.post("/api/auth/approve/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  const idx = pendingRequests.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Request not found" });

  pendingRequests[idx].status = "approved";
  if (req.body.name) pendingRequests[idx].name = req.body.name;
  if (req.body.year) pendingRequests[idx].year = req.body.year;

  approvedUsers.push({
    email: pendingRequests[idx].email,
    name: pendingRequests[idx].name || "",
    year: pendingRequests[idx].year || "",
  });

  persistPendingRequests();
  persistApprovedUsers();

  res.json({ message: "Approved" });
});

// Admin: reject request
app.post("/api/auth/reject/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  const idx = pendingRequests.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Request not found" });

  pendingRequests[idx].status = "rejected";
  persistPendingRequests();

  res.json({ message: "Rejected" });
});

// ─── Data endpoints ────────────────────────────────────────────────

// Load JSON data
function loadJson(filename) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, "utf-8"));
    }
  } catch (e) {
    console.error(`Failed to load ${filename}:`, e.message);
  }
  return null;
}

// Get all subjects
app.get("/api/subjects", (req, res) => {
  const subjects = loadJson("subjects.json");
  if (!subjects) return res.status(500).json({ error: "Subjects data not available" });
  res.json(subjects);
});

// Get subjects for a year
app.get("/api/subjects/:year", (req, res) => {
  const subjects = loadJson("subjects.json");
  if (!subjects) return res.status(500).json({ error: "Subjects data not available" });
  res.json(subjects[req.params.year] || []);
});

// Get a single subject name
app.get("/api/subject/:year/:subjectId", (req, res) => {
  const { year, subjectId } = req.params;
  const subjects = loadJson("subjects.json");
  if (!subjects) return res.status(500).json({ error: "Subjects data not available" });

  const yearSubjects = subjects[year] || [];
  const subject = yearSubjects.find(s => s.id === subjectId);
  if (!subject) return res.status(404).json({ error: "Subject not found" });

  res.json(subject);
});

// Get PDF mappings for a year
app.get("/api/pdf-mappings/:year", (req, res) => {
  const { year } = req.params;
  const mappings = loadJson(`pdfMappings/${year}.json`);
  if (!mappings) return res.status(404).json({ error: "No mappings for this year" });
  res.json(mappings);
});

// Get chapters for a specific resource
app.get("/api/pdf-mappings/:year/:subjectId/:resourceType/chapters", (req, res) => {
  const { year, subjectId, resourceType } = req.params;
  const mappings = loadJson(`pdfMappings/${year}.json`);
  if (!mappings) return res.status(404).json({ error: "No mappings for this year" });

  const entry = mappings.find(m => m.subjectId === subjectId && m.resourceType === resourceType);
  if (!entry) return res.json([]);

  res.json(entry.chapters || []);
});

// Get availability data
app.get("/api/availability", (req, res) => {
  const availability = loadJson("pdfMappings/availability.json");
  res.json(availability || {});
});

// Get search index
app.get("/api/search-index", (req, res) => {
  const searchIndex = loadJson("search-index.json");
  res.json(searchIndex || []);
});

// Get exam calendar
app.get("/api/exam-calendar", (req, res) => {
  const calendar = loadJson("exam-calendar.json");
  res.json(calendar || []);
});

// Get notices
app.get("/api/notices", (req, res) => {
  const notices = loadJson("notices.json");
  res.json(notices || []);
});

// ─── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 GCET Resources API server running on port ${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/healthz`);
  console.log(`   PDF proxy:   http://localhost:${PORT}/api/pdf-proxy?url=<url>`);
  console.log(`   Auth:        http://localhost:${PORT}/api/auth/login`);
  console.log(`   Subjects:    http://localhost:${PORT}/api/subjects`);
});

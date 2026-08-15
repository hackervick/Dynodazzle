// Minimal file-based storage for leads.
// This avoids requiring a native database dependency (like sqlite3) to be
// compiled — everything lives in a plain JSON file. Good enough for a
// small business site; swap for a real database later if volume grows.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, "[]", "utf-8");
}

function readLeads() {
  ensureStore();
  const raw = fs.readFileSync(LEADS_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLeads(leads) {
  ensureStore();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

function addLead(lead) {
  const leads = readLeads();
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    status: "new",
    ...lead,
  };
  leads.unshift(record); // newest first
  writeLeads(leads);
  return record;
}

module.exports = { readLeads, writeLeads, addLead };

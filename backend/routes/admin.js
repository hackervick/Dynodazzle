const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const { readLeads, writeLeads } = require("../db");

// A lightweight "login" check the admin page uses to verify the password
// before showing the dashboard.
router.post("/login", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

router.get("/leads", requireAdmin, (req, res) => {
  res.json({ leads: readLeads() });
});

// Mark a lead as contacted / archived, etc.
router.patch("/leads/:id", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const leads = readLeads();
  const lead = leads.find((l) => l.id === req.params.id);

  if (!lead) return res.status(404).json({ error: "Lead not found" });
  if (status) lead.status = status;

  writeLeads(leads);
  res.json({ ok: true, lead });
});

router.delete("/leads/:id", requireAdmin, (req, res) => {
  const leads = readLeads();
  const next = leads.filter((l) => l.id !== req.params.id);

  if (next.length === leads.length) {
    return res.status(404).json({ error: "Lead not found" });
  }

  writeLeads(next);
  res.json({ ok: true });
});

module.exports = router;

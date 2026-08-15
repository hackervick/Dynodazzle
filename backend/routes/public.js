const express = require("express");
const router = express.Router();
const { addLead } = require("../db");

// Services offered by Dyno Dazzle — drives the dropdown on the contact form.
// Edit this list any time you want to change what you offer.
const SERVICES = [
  { id: "custom-software", label: "Custom Software" },
  { id: "web-app", label: "Web Application" },
  { id: "mobile-app", label: "Mobile App" },
  { id: "finance-tool", label: "Business & Finance Tool" },
  { id: "it-consulting", label: "IT Consulting" },
  { id: "support", label: "Support & Maintenance" },
  { id: "other", label: "Something else" },
];

router.get("/services", (req, res) => {
  res.json({ services: SERVICES });
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/contact", (req, res) => {
  const { name, email, phone, service, budget, message } = req.body || {};

  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!email || !isValidEmail(email)) errors.push("A valid email is required.");
  if (!service) errors.push("Please select a service.");
  if (!message || !message.trim()) errors.push("Please add a short message.");

  if (errors.length) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  const lead = addLead({
    name: name.trim(),
    email: email.trim(),
    phone: (phone || "").trim(),
    service,
    budget: budget || "not-sure",
    message: message.trim(),
  });

  // In production you'd likely also send yourself an email/Slack notification
  // here (e.g. with nodemailer). Left out to keep dependencies minimal.

  res.status(201).json({ ok: true, id: lead.id });
});

module.exports = router;

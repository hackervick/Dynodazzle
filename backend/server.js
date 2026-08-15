require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Serve the admin panel as a static page (admin.html calls the API below)
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "dyno-dazzle-backend" });
});

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Dyno Dazzle backend running at http://localhost:${PORT}`);
  console.log(`Admin panel: https://dynodazzle-1.onrender.com/admin.html`);
});

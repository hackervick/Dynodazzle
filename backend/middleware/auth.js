// Very small auth guard for the admin endpoints.
// The admin panel sends the password in the `x-admin-password` header.
// This is intentionally simple — good for a solo-run small business site.
// For a bigger team, swap this for real sessions / hashed passwords.

function requireAdmin(req, res, next) {
  const provided = req.header("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return res.status(500).json({
      error: "Server misconfigured: ADMIN_PASSWORD is not set in .env",
    });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Invalid admin password" });
  }

  next();
}

module.exports = { requireAdmin };

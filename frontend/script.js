// ---- config ----
// Points at the backend API. Change this if you deploy the backend elsewhere.
const API_BASE = window.API_BASE || "http://localhost:4000/api";

// ---- footer year ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- mobile nav ----
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.style.display === "flex";
    navLinks.style.display = open ? "none" : "flex";
    navLinks.style.cssText += open
      ? ""
      : "position:absolute; top:100%; left:0; right:0; background:#1C1A3C; flex-direction:column; padding:1rem 1.5rem; gap:1rem; border-bottom:1px solid rgba(245,243,255,0.12);";
  });
}

// ---- load services into the contact form select ----
const FALLBACK_SERVICES = [
  { id: "custom-software", label: "Custom Software" },
  { id: "web-app", label: "Web Application" },
  { id: "mobile-app", label: "Mobile App" },
  { id: "finance-tool", label: "Business & Finance Tool" },
  { id: "it-consulting", label: "IT Consulting" },
  { id: "support", label: "Support & Maintenance" },
  { id: "other", label: "Something else" },
];

function populateServices(list) {
  const select = document.getElementById("service");
  list.forEach((svc) => {
    const opt = document.createElement("option");
    opt.value = svc.id;
    opt.textContent = svc.label;
    select.appendChild(opt);
  });
}

async function loadServices() {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    populateServices(Array.isArray(data.services) ? data.services : FALLBACK_SERVICES);
  } catch (err) {
    // Backend not running or unreachable — fall back to a static list
    // so the form still works visually.
    populateServices(FALLBACK_SERVICES);
  }
}
loadServices();

// ---- contact form submission ----
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    service: form.service.value,
    budget: form.budget.value,
    message: form.message.value.trim(),
  };

  if (!payload.name || !payload.email || !payload.service || !payload.message) {
    statusEl.textContent = "Please fill in the required fields.";
    statusEl.classList.add("error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Something went wrong");

    statusEl.textContent = "Thanks — we'll be in touch within a business day.";
    statusEl.classList.add("success");
    form.reset();
  } catch (err) {
    statusEl.textContent =
      "Couldn't send that. Is the backend running? (" + err.message + ")";
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send it over";
  }
});

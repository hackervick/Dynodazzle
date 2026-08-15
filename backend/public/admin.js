const API_BASE = "/api/admin";

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");
const leadsBody = document.getElementById("leadsBody");
const leadCount = document.getElementById("leadCount");
const emptyState = document.getElementById("emptyState");

let adminPassword = sessionStorage.getItem("dd_admin_pw") || "";

function headers() {
  return { "Content-Type": "application/json", "x-admin-password": adminPassword };
}

async function tryLogin(pw) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Login failed");
  adminPassword = pw;
  sessionStorage.setItem("dd_admin_pw", pw);
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadLeads();
}

function showLogin(message) {
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  if (message) loginError.textContent = message;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  try {
    await tryLogin(passwordInput.value);
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("dd_admin_pw");
  adminPassword = "";
  showLogin();
});

document.getElementById("refreshBtn").addEventListener("click", loadLeads);

const SERVICE_LABELS = {
  "custom-software": "Custom Software",
  "web-app": "Web Application",
  "mobile-app": "Mobile App",
  "finance-tool": "Business & Finance Tool",
  "it-consulting": "IT Consulting",
  support: "Support & Maintenance",
  other: "Other",
};

const BUDGET_LABELS = {
  "not-sure": "Not sure",
  "under-2k": "Under $2k",
  "2k-5k": "$2k–5k",
  "5k-15k": "$5k–15k",
  "15k-plus": "$15k+",
};

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function renderLeads(leads) {
  leadCount.textContent = `${leads.length} lead${leads.length === 1 ? "" : "s"}`;
  leadsBody.innerHTML = "";
  emptyState.classList.toggle("hidden", leads.length > 0);

  leads.forEach((lead) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${fmtDate(lead.createdAt)}</td>
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.email)}${lead.phone ? "<br>" + escapeHtml(lead.phone) : ""}</td>
      <td>${SERVICE_LABELS[lead.service] || escapeHtml(lead.service)}</td>
      <td>${BUDGET_LABELS[lead.budget] || escapeHtml(lead.budget || "")}</td>
      <td class="msg">${escapeHtml(lead.message)}</td>
      <td></td>
      <td></td>
    `;

    const statusSelect = document.createElement("select");
    statusSelect.className = "status-select";
    ["new", "contacted", "in-progress", "closed"].forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (lead.status === s) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.addEventListener("change", () => updateStatus(lead.id, statusSelect.value));
    tr.children[6].appendChild(statusSelect);

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteLead(lead.id));
    tr.children[7].appendChild(delBtn);

    leadsBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function loadLeads() {
  try {
    const res = await fetch(`${API_BASE}/leads`, { headers: headers() });
    if (res.status === 401) return showLogin("Session expired — log in again.");
    const data = await res.json();
    renderLeads(data.leads || []);
  } catch (err) {
    console.error(err);
  }
}

async function updateStatus(id, status) {
  await fetch(`${API_BASE}/leads/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status }),
  });
}

async function deleteLead(id) {
  if (!confirm("Delete this lead? This can't be undone.")) return;
  await fetch(`${API_BASE}/leads/${id}`, { method: "DELETE", headers: headers() });
  loadLeads();
}

// auto-login if we have a saved password
if (adminPassword) {
  tryLogin(adminPassword).then(showDashboard).catch(() => showLogin());
}

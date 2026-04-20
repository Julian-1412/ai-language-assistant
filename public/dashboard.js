/* =============================================
   AI Language Assistant — Dashboard Logic
   ============================================= */

const API_BASE = window.location.origin;

// DOM refs
const metricTotal = document.getElementById("metric-total");
const metricResolved = document.getElementById("metric-resolved");
const metricEscalated = document.getElementById("metric-escalated");
const metricCost = document.getElementById("metric-cost");
const metricRate = document.getElementById("metric-rate");
const rateBar = document.getElementById("rate-bar");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const activityList = document.getElementById("activity-list");
const btnRefresh = document.getElementById("btn-refresh");

// ----- Metrics Fetch -----
async function fetchMetrics() {
  try {
    const res = await fetch(`${API_BASE}/api/metrics`);
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    updateMetrics(data);
    updateActivity(data.recentQueries);
    setOnline(true);
  } catch (err) {
    setOnline(false);
  }
}

function updateMetrics(data) {
  animateNumber(metricTotal, data.totalQueries);
  metricResolved.textContent = `${data.resolvedQueries} resueltas`;
  metricEscalated.textContent = `${data.escalatedQueries} escaladas`;
  metricCost.textContent = data.totalCostUSD;
  metricRate.textContent = data.escalationRate;

  const rateNum = parseFloat(data.escalationRate) || 0;
  rateBar.style.width = `${Math.min(rateNum, 100)}%`;
}

function animateNumber(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  const duration = 600;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(current + (target - current) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function setOnline(online) {
  statusDot.className = `status-dot ${online ? "status-dot--online" : "status-dot--error"}`;
  statusText.textContent = online ? "En línea" : "Sin conexión";
}

// ----- Activity List -----
function updateActivity(queries) {
  if (!queries || queries.length === 0) {
    activityList.innerHTML = `<p class="activity-list__empty">No hay actividad aún.</p>`;
    return;
  }

  activityList.innerHTML = queries
    .map((q) => {
      const indicatorClass = q.escalated ? "activity-item__indicator--escalated" : "activity-item__indicator--resolved";
      const time = formatTime(q.timestamp);
      return `
        <div class="activity-item">
          <div class="activity-item__indicator ${indicatorClass}"></div>
          <div class="activity-item__content">
            <p class="activity-item__question">${escapeHtml(q.message)}</p>
            <p class="activity-item__answer">${escapeHtml(q.answer)}</p>
          </div>
          <span class="activity-item__time">${time}</span>
        </div>
      `;
    })
    .join("");
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr}h`;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ----- Chat -----
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  // Clear welcome
  const welcome = chatMessages.querySelector(".chat__welcome");
  if (welcome) welcome.remove();

  // User bubble
  appendBubble(message, "user");
  chatInput.value = "";
  chatSend.disabled = true;

  // Loading indicator
  const loading = appendLoading();

  try {
    const res = await fetch(`${API_BASE}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    loading.remove();

    if (!res.ok) throw new Error("Request failed");

    const data = await res.json();

    appendBubble(data.answer, "bot", data.escalate);

    // Refresh metrics
    await fetchMetrics();
  } catch (err) {
    loading.remove();
    appendBubble("Error al conectarse con el servidor.", "bot", false);
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
});

function appendBubble(text, role, escalated = false) {
  const bubble = document.createElement("div");
  bubble.className = `chat__bubble chat__bubble--${role}`;
  if (role === "bot" && escalated) {
    bubble.classList.add("chat__bubble--escalated");
  }

  bubble.textContent = text;

  if (role === "bot" && escalated) {
    const tag = document.createElement("span");
    tag.className = "chat__escalate-tag";
    tag.textContent = "⚡ Escalado";
    bubble.appendChild(tag);
  }

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoading() {
  const loading = document.createElement("div");
  loading.className = "chat__bubble--loading";
  loading.innerHTML = `<span class="chat__dot"></span><span class="chat__dot"></span><span class="chat__dot"></span>`;
  chatMessages.appendChild(loading);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return loading;
}

// ----- Refresh Button -----
btnRefresh.addEventListener("click", () => {
  fetchMetrics();
});

// ----- Init -----
fetchMetrics();
setInterval(fetchMetrics, 10000); // Refresh every 10s

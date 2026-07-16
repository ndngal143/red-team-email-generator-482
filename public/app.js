const form = document.querySelector("#generatorForm");
const statusBox = document.querySelector("#status");
const result = document.querySelector("#result");
const logs = document.querySelector("#logs");
const refreshLogs = document.querySelector("#refreshLogs");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form).entries());
  statusBox.textContent = "Generating draft...";
  result.className = "result empty";
  result.innerHTML = "<p>Working...</p>";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Generation failed");

    renderResult(payload);
    await loadLogs();
    statusBox.textContent = payload.email.generationNote;
  } catch (error) {
    statusBox.textContent = error.message;
    result.innerHTML = "<p>Generation failed. Check server logs and configuration.</p>";
  }
});

refreshLogs.addEventListener("click", loadLogs);

function renderResult(entry) {
  const spamLevel = entry.spam.level.toLowerCase();
  result.className = "result";
  result.innerHTML = `
    <div class="email-card">
      <h3>${escapeHtml(entry.email.subject)}</h3>
      <p><strong>From:</strong> ${escapeHtml(entry.email.senderName)}</p>
      <div class="email-body">${escapeHtml(entry.email.body)}</div>
      <p class="email-cta"><strong>Call to action:</strong> ${escapeHtml(entry.email.callToAction)}</p>
    </div>

    <div class="meta-grid">
      <div class="meta">
        <span>Training Link</span>
        <a href="${escapeAttr(entry.link.url)}" target="_blank" rel="noreferrer">${escapeHtml(entry.link.url)}</a>
      </div>
      <div class="meta">
        <span>Spam Score</span>
        <strong>${entry.spam.score}</strong> <span class="pill ${spamLevel}">${entry.spam.level}</span>
      </div>
      <div class="meta">
        <span>Log ID</span>
        ${escapeHtml(entry.id)}
      </div>
    </div>

    <h3>Spam Indicator Notes</h3>
    <ul>
      ${entry.spam.indicators.length ? entry.spam.indicators.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>No major indicators detected.</li>"}
    </ul>
  `;
}

async function loadLogs() {
  const response = await fetch("/api/logs");
  const payload = await response.json();
  if (!payload.logs.length) {
    logs.innerHTML = "<p>No logs yet.</p>";
    return;
  }

  logs.innerHTML = payload.logs.map((entry) => `
    <div class="log-row">
      <strong>${escapeHtml(entry.email.subject)}</strong>
      <small>${escapeHtml(formatTimestamp(entry.timestamp))} | ${escapeHtml(entry.input.department)} | ${escapeHtml(entry.input.tone)} | score ${entry.spam.score} | clicks ${entry.clickMetrics?.count || 0}${entry.clickMetrics?.lastClickedAt ? ` | last click ${escapeHtml(formatTimestamp(entry.clickMetrics.lastClickedAt))}` : ""}</small>
    </div>
  `).join("");
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

loadLogs();

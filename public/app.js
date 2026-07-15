const form = document.querySelector("#generatorForm");
const statusBox = document.querySelector("#status");
const result = document.querySelector("#result");
const logs = document.querySelector("#logs");
const refreshLogs = document.querySelector("#refreshLogs");
let currentEntry = null;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form).entries());
  currentEntry = null;
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
  currentEntry = entry;
  const spamLevel = entry.spam.level.toLowerCase();
  result.className = "result";
  result.innerHTML = `
    <div class="email-card">
      <h3>${escapeHtml(entry.email.subject)}</h3>
      <p><strong>From:</strong> ${escapeHtml(entry.email.senderName)}</p>
      <div class="email-body">${escapeHtml(entry.email.body)}</div>
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

    <form id="revisionForm" class="revision-form">
      <label>
        Request changes
        <textarea name="revisionRequest" placeholder="Example: Make this shorter and friendlier while keeping the same training link." required></textarea>
      </label>
      <button type="submit">Revise Draft</button>
    </form>
  `;
}

result.addEventListener("submit", async (event) => {
  if (event.target.id !== "revisionForm") return;
  event.preventDefault();
  if (!currentEntry) return;

  const revisionRequest = new FormData(event.target).get("revisionRequest");
  statusBox.textContent = "Revising draft...";

  try {
    const response = await fetch("/api/revise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalId: currentEntry.id,
        revisionRequest,
        input: currentEntry.input,
        email: currentEntry.email,
        trainingLink: currentEntry.link,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Revision failed");

    renderResult(payload);
    await loadLogs();
    statusBox.textContent = payload.email.generationNote;
  } catch (error) {
    statusBox.textContent = error.message;
  }
});

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
      <small>${escapeHtml(entry.timestamp)} | ${escapeHtml(entry.input.department)} | ${escapeHtml(entry.input.tone)} | score ${entry.spam.score}</small>
    </div>
  `).join("");
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

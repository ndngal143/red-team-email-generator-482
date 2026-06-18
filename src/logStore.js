const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.join(process.cwd(), "data");
const logFile = path.join(dataDir, "generated-emails.jsonl");

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function appendLog(entry) {
  // TODO Milestone 4 / Alex: Add filtering, search, pagination, and role-based access
  // before using logs in a larger deployment.
  ensureDataDir();
  fs.appendFileSync(logFile, `${JSON.stringify(entry)}\n`, "utf8");
}

function readLogs(limit = 50) {
  ensureDataDir();
  if (!fs.existsSync(logFile)) return [];
  const lines = fs.readFileSync(logFile, "utf8").trim().split(/\r?\n/).filter(Boolean);
  return lines.slice(-limit).reverse().map((line) => JSON.parse(line));
}

function logsAsCsv() {
  const logs = readLogs(500).reverse();
  const headers = [
    "timestamp",
    "targetProfile",
    "department",
    "tone",
    "intensity",
    "subject",
    "spamScore",
    "spamLevel",
    "trainingUrl",
  ];

  const rows = logs.map((entry) => [
    entry.timestamp,
    entry.input.targetProfile,
    entry.input.department,
    entry.input.tone,
    entry.input.intensity,
    entry.email.subject,
    entry.spam.score,
    entry.spam.level,
    entry.link.url,
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

module.exports = { appendLog, readLogs, logsAsCsv };

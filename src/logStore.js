const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.join(process.cwd(), "data");
const logFile = path.join(dataDir, "generated-emails.jsonl");
const clickFile = path.join(dataDir, "link-clicks.jsonl");
const feedbackFile = path.join(dataDir, "feedback-notifications.jsonl");

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function appendLog(entry) {
  // TODO Milestone 4 / Alex: Add filtering, search, pagination, and role-based access
  // before using logs in a larger deployment.
  appendJsonLine(logFile, entry);
}

function readLogs(limit = 50) {
  return readJsonLines(logFile, limit);
}

function findLogByLinkToken(token) {
  return readJsonLines(logFile, 1000).find((entry) => entry.link?.token === token) || null;
}

function appendClickEvent(entry) {
  appendJsonLine(clickFile, entry);
}

function readClickEvents(limit = 500) {
  return readJsonLines(clickFile, limit);
}

function appendFeedbackNotification(entry) {
  appendJsonLine(feedbackFile, entry);
}

function readFeedbackNotifications(limit = 500) {
  return readJsonLines(feedbackFile, limit);
}

function findFeedbackNotificationByGeneratedEmailId(generatedEmailId) {
  return (
    readJsonLines(feedbackFile, 1000).find(
      (entry) => entry.generatedEmailId === generatedEmailId && entry.type === "PHISHING_CLICK_FEEDBACK",
    ) || null
  );
}

function readJsonLines(filePath, limit = 50) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/).filter(Boolean);
  return lines.slice(-limit).reverse().map((line) => JSON.parse(line));
}

function appendJsonLine(filePath, entry) {
  ensureDataDir();
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

function logsAsCsv() {
  const logs = readLogs(500).reverse();
  const clicks = readClickEvents(2000);
  const notifications = readFeedbackNotifications(2000);
  const headers = [
    "timestamp",
    "recipientEmail",
    "targetProfile",
    "department",
    "tone",
    "intensity",
    "subject",
    "spamScore",
    "spamLevel",
    "trainingUrl",
    "internalPreviewUrl",
    "clickCount",
    "feedbackStatus",
  ];

  const rows = logs.map((entry) => {
    const clickCount = clicks.filter((click) => click.generatedEmailId === entry.id).length;
    const notification = notifications.find((item) => item.generatedEmailId === entry.id);
    return [
      entry.timestamp,
      entry.input.recipientEmail,
      entry.input.targetProfile,
      entry.input.department,
      entry.input.tone,
      entry.input.intensity,
      entry.email.subject,
      entry.spam.score,
      entry.spam.level,
      entry.link.url,
      entry.link.internalPreviewUrl,
      clickCount,
      notification?.status || "not_sent",
    ];
  });

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

module.exports = {
  appendLog,
  readLogs,
  findLogByLinkToken,
  appendClickEvent,
  readClickEvents,
  appendFeedbackNotification,
  readFeedbackNotifications,
  findFeedbackNotificationByGeneratedEmailId,
  logsAsCsv,
};

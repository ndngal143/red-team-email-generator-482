const fs = require("node:fs");
const path = require("node:path");

function loadEnv() {
  if (process.env.EMAILGEN_SKIP_DOTENV === "1") return;

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    process.env[key] = value;
  }
}

loadEnv();

module.exports = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "",
  demoBaseDomain: process.env.DEMO_BASE_DOMAIN || "training.example.internal",
  trainingBaseUrl: process.env.TRAINING_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  feedbackEmailWebhookUrl: process.env.FEEDBACK_EMAIL_WEBHOOK_URL || "",
  feedbackFromEmail: process.env.FEEDBACK_FROM_EMAIL || "security-awareness@example.internal",
};

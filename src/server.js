const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { port } = require("./config");
const { generateEmail } = require("./generator");
const { generateTrainingLink } = require("./linkGenerator");
const { checkSpamIndicators } = require("./spamChecker");
const { sendFeedbackEmail } = require("./feedbackMailer");
const {
  appendLog,
  readLogs,
  findLogByLinkToken,
  appendClickEvent,
  readClickEvents,
  appendFeedbackNotification,
  readFeedbackNotifications,
  findFeedbackNotificationByGeneratedEmailId,
  logsAsCsv,
} = require("./logStore");

const publicDir = path.join(process.cwd(), "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && requestUrl.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, service: "capstone-prototype" });
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/generate") {
      const input = await readJson(req);
      const validationError = validateInput(input);
      if (validationError) return sendJson(res, 400, { error: validationError });

      const safetyError = validateSafety(input); //milestone 2
      if (safetyError) return sendJson(res, 400, { error: safetyError }); //milestone 2

      const link = generateTrainingLink(input);
      const email = await generateEmail(input, link);
      const spam = checkSpamIndicators({ subject: email.subject, body: email.body });
      const entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        input,
        email,
        link,
        spam,
      };
      appendLog(entry);
      return sendJson(res, 200, entry);
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/logs") {
      return sendJson(res, 200, { logs: enrichLogs(readLogs()) });
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/clicks") {
      return sendJson(res, 200, { clicks: readClickEvents() });
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/feedback-notifications") {
      return sendJson(res, 200, { notifications: readFeedbackNotifications() });
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/logs.csv") {
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"generated-emails.csv\"",
      });
      return res.end(logsAsCsv());
    }

    const trackingMatch = requestUrl.pathname.match(/^\/r\/([a-f0-9]{32})$/);
    if (req.method === "GET" && trackingMatch) {
      return handleTrackedLink(req, res, trackingMatch[1]);
    }

    if (req.method === "GET" && requestUrl.pathname.startsWith("/training/")) {
      return sendTrainingLanding(res);
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "Unexpected server error" });
  }
});

function validateInput(input) {
  // TODO Milestone 2 / Sebastian: Replace starter validation with a formal schema.
  const required = ["targetProfile", "department", "scenarioContext", "tone", "intensity"];
  for (const key of required) {
    if (!String(input[key] || "").trim()) return `Missing required field: ${key}`;
  }
  if (!["urgent", "professional", "friendly"].includes(input.tone)) return "Invalid tone";
  if (!["low", "medium", "high"].includes(input.intensity)) return "Invalid intensity";
  if (input.recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.recipientEmail)) {
    return "Invalid recipient email";
  }
  return "";
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

async function handleTrackedLink(req, res, token) {
  const generatedEmail = findLogByLinkToken(token);
  if (!generatedEmail) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Training link not found");
  }

  const clickEvent = {
    id: crypto.randomUUID(),
    generatedEmailId: generatedEmail.id,
    linkToken: token,
    recipientEmail: generatedEmail.input.recipientEmail || "",
    clickedAt: new Date().toISOString(),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    destinationUrl: generatedEmail.link.destinationUrl,
  };
  appendClickEvent(clickEvent);

  let notification = findFeedbackNotificationByGeneratedEmailId(generatedEmail.id);
  if (!notification) {
    const delivery = await sendFeedbackEmail(generatedEmail, clickEvent);
    notification = {
      id: crypto.randomUUID(),
      type: "PHISHING_CLICK_FEEDBACK",
      generatedEmailId: generatedEmail.id,
      clickEventId: clickEvent.id,
      timestamp: new Date().toISOString(),
      ...delivery,
    };
    appendFeedbackNotification(notification);
  }

  res.writeHead(302, {
    Location: generatedEmail.link.destinationUrl || "/",
    "Cache-Control": "no-store",
  });
  return res.end();
}

function enrichLogs(logs) {
  const clicks = readClickEvents(2000);
  const notifications = readFeedbackNotifications(2000);
  return logs.map((entry) => {
    const entryClicks = clicks.filter((click) => click.generatedEmailId === entry.id);
    const notification = notifications.find((item) => item.generatedEmailId === entry.id);
    return {
      ...entry,
      clickMetrics: {
        count: entryClicks.length,
        lastClickedAt: entryClicks[0]?.clickedAt || "",
      },
      feedbackNotification: notification
        ? {
            status: notification.status,
            deliveryMode: notification.deliveryMode,
            reason: notification.reason,
            timestamp: notification.timestamp,
          }
        : null,
    };
  });
}

function getClientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwardedFor || req.socket.remoteAddress || "";
}

function sendTrainingLanding(res) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Security Awareness Training</title>
    <style>
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #eef1f4; color: #17202a; }
      main { width: min(760px, calc(100% - 32px)); margin: 0 auto; padding: 56px 0; }
      section { background: #fff; border: 1px solid #d7dde5; border-radius: 8px; padding: 24px; }
      h1 { margin-top: 0; }
      li { margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>Security Awareness Training</h1>
        <p>This was a safe training destination for an authorized awareness exercise.</p>
        <p>Before clicking links in real email, check:</p>
        <ul>
          <li>whether the sender and request were expected,</li>
          <li>whether the link destination matches the message,</li>
          <li>whether the message creates unusual urgency or pressure, and</li>
          <li>whether it asks for credentials or sensitive information.</li>
        </ul>
      </section>
    </main>
  </body>
</html>`;
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  return res.end(html);
}

function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.normalize(path.join(publicDir, urlPath));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Capstone prototype running at http://localhost:${port}`);
  });
}

// milestone 2
function validateSafety(input) {
  const text = [
    input.targetProfile,
    input.recipientEmail,
    input.department,
    input.organization,
    input.senderRole,
    input.scenarioContext,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

  const blockedPatterns = [
    {
      label: "credential collection",
      pattern: /\b(collect|capture|harvest|steal|grab|obtain)\b.{0,40}\b(password|passwords|credential|credentials|login|logins)\b/,
    },
    {
      label: "MFA code collection",
      pattern: /\b(collect|capture|harvest|steal|grab|obtain)\b.{0,40}\b(mfa|2fa|otp|code|codes|token|tokens)\b/,
    },
    {
      label: "malicious payload",
      pattern: /\b(malware|payload|keylogger|ransomware|trojan|macro)\b/,
    },
    {
      label: "security bypass",
      pattern: /\b(bypass|evade|avoid|disable)\b.{0,40}\b(spam|filter|security|defender|antivirus|detection)\b/,
    },
    {
      label: "credential portal",
      pattern: /\b(credential|login|password)\b.{0,40}\b(portal|page|form|site)\b/,
    },
  ];

  const matched = blockedPatterns.find((rule) => rule.pattern.test(text));

  if (matched) {
    return `Blocked unsafe request content: ${matched.label}`;
  }

  return "";
}

module.exports = { server };

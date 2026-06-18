const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { port } = require("./config");
const { generateEmail } = require("./generator");
const { generateTrainingLink } = require("./linkGenerator");
const { checkSpamIndicators } = require("./spamChecker");
const { appendLog, readLogs, logsAsCsv } = require("./logStore");

const publicDir = path.join(process.cwd(), "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      return sendJson(res, 200, { ok: true, service: "capstone-prototype" });
    }

    if (req.method === "POST" && req.url === "/api/generate") {
      const input = await readJson(req);
      const validationError = validateInput(input);
      if (validationError) return sendJson(res, 400, { error: validationError });

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

    if (req.method === "GET" && req.url === "/api/logs") {
      return sendJson(res, 200, { logs: readLogs() });
    }

    if (req.method === "GET" && req.url === "/api/logs.csv") {
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"generated-emails.csv\"",
      });
      return res.end(logsAsCsv());
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

module.exports = { server };

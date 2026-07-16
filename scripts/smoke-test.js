const testPort = 3099;
const baseUrl = `http://localhost:${testPort}`;
process.env.EMAILGEN_SKIP_DOTENV = "1";
process.env.TRAINING_BASE_URL = baseUrl;

const { server } = require("../src/server");

async function main() {
  await new Promise((resolve) => server.listen(testPort, resolve));

  const health = await fetch(`${baseUrl}/api/health`).then((res) => res.json());
  if (!health.ok) throw new Error("Health check failed");

  const payload = await generateCase({
    targetProfile: "Finance employee",
    recipientEmail: "learner@example.com",
    department: "Finance",
    organization: "Example Corp",
    senderRole: "Finance Operations",
    scenarioContext: "Recent reimbursement policy change",
    tone: "professional",
    intensity: "medium",
  });

  const urgentHigh = await generateCase({
    targetProfile: "Finance employee",
    recipientEmail: "learner@example.com",
    department: "Finance",
    organization: "Example Corp",
    senderRole: "Finance Operations",
    scenarioContext: "Recent reimbursement policy change",
    tone: "urgent",
    intensity: "high",
  });

  const friendlyLow = await generateCase({
    targetProfile: "Finance employee",
    recipientEmail: "learner@example.com",
    department: "Finance",
    organization: "Example Corp",
    senderRole: "Finance Operations",
    scenarioContext: "Recent reimbursement policy change",
    tone: "friendly",
    intensity: "low",
  });

  if (new Set([payload.email.subject, urgentHigh.email.subject, friendlyLow.email.subject]).size !== 3) {
    throw new Error("Tone/intensity templates did not produce distinct subject lines");
  }

  if (!urgentHigh.email.callToAction.includes("now") || !friendlyLow.email.callToAction.includes("when convenient")) {
    throw new Error("Deception intensity did not change call-to-action strength");
  }

  if (!payload.email.linkText || !payload.email.body.includes(payload.email.linkText)) {
    throw new Error("Generated draft did not include embedded safe link text");
  }

  if (!urgentHigh.email.body.includes("now") || !friendlyLow.email.body.includes("Quick heads up")) {
    throw new Error("Tone/intensity templates did not change body urgency");
  }

  const revision = await reviseCase(payload, "Make it shorter and more friendly with a softer call to action.");
  if (revision.revisionOf !== payload.id) {
    throw new Error("Revision response did not reference the original generated email");
  }
  if (revision.link.url !== payload.link.url) {
    throw new Error("Revision did not keep the same safe training link");
  }
  if (revision.email.subject === payload.email.subject || revision.email.body === payload.email.body) {
    throw new Error("Revision did not change the generated wording");
  }
  if (!revision.email.callToAction.includes("when you can")) {
    throw new Error("Revision did not apply the requested softer call to action");
  }
  if (!revision.email.linkText || !revision.email.body.includes(revision.email.linkText)) {
    throw new Error("Revision did not preserve embedded safe link text");
  }

  const clickResponse = await fetch(payload.link.url, { redirect: "manual" });
  if (clickResponse.status !== 302) {
    throw new Error(`Tracking link did not redirect: ${clickResponse.status}`);
  }

  const logs = await fetch(`${baseUrl}/api/logs`).then((res) => res.json());
  const generatedLog = logs.logs.find((entry) => entry.link?.token === payload.link.token && entry.clickMetrics?.count);
  if (!generatedLog?.clickMetrics?.count) {
    throw new Error("Tracking click was not recorded in the logs");
  }
  if (!generatedLog.feedbackNotification) {
    throw new Error("Feedback notification was not recorded");
  }

  console.log("Smoke test passed");
  console.log(`Subject: ${payload.email.subject}`);
  console.log(`Urgent/high subject: ${urgentHigh.email.subject}`);
  console.log(`Friendly/low subject: ${friendlyLow.email.subject}`);
  console.log(`Revision subject: ${revision.email.subject}`);
  console.log(`Training URL: ${payload.link.url}`);
  console.log(`Click count: ${generatedLog.clickMetrics.count}`);
  console.log(`Feedback status: ${generatedLog.feedbackNotification.status}`);
  console.log(`Spam score: ${payload.spam.score}`);
}

async function generateCase(input) {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Generate endpoint failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.email?.subject || !payload.email?.linkText || !payload.link?.url || typeof payload.spam?.score !== "number") {
    throw new Error("Generate payload is missing expected fields");
  }
  return payload;
}

async function reviseCase(entry, changeRequest) {
  const response = await fetch(`${baseUrl}/api/revise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      originalId: entry.id,
      input: entry.input,
      email: entry.email,
      link: entry.link,
      changeRequest,
    }),
  });

  if (!response.ok) {
    throw new Error(`Revise endpoint failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.email?.subject || !payload.email?.linkText || !payload.link?.url || typeof payload.spam?.score !== "number") {
    throw new Error("Revision payload is missing expected fields");
  }
  return payload;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    server.close();
  });

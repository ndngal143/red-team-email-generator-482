const testPort = 3099;
const baseUrl = `http://localhost:${testPort}`;
process.env.TRAINING_BASE_URL = baseUrl;

const { server } = require("../src/server");

async function main() {
  await new Promise((resolve) => server.listen(testPort, resolve));

  const health = await fetch(`${baseUrl}/api/health`).then((res) => res.json());
  if (!health.ok) throw new Error("Health check failed");

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetProfile: "Finance employee",
      recipientEmail: "learner@example.com",
      department: "Finance",
      organization: "Example Corp",
      senderRole: "Finance Operations",
      scenarioContext: "Recent reimbursement policy change",
      tone: "professional",
      intensity: "medium",
    }),
  });

  if (!response.ok) {
    throw new Error(`Generate endpoint failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.email?.subject || !payload.link?.url || typeof payload.spam?.score !== "number") {
    throw new Error("Generate payload is missing expected fields");
  }

  const clickResponse = await fetch(payload.link.url, { redirect: "manual" });
  if (clickResponse.status !== 302) {
    throw new Error(`Tracking link did not redirect: ${clickResponse.status}`);
  }

  const logs = await fetch(`${baseUrl}/api/logs`).then((res) => res.json());
  const generatedLog = logs.logs.find((entry) => entry.id === payload.id);
  if (!generatedLog?.clickMetrics?.count) {
    throw new Error("Tracking click was not recorded in the logs");
  }
  if (!generatedLog.feedbackNotification) {
    throw new Error("Feedback notification was not recorded");
  }

  console.log("Smoke test passed");
  console.log(`Subject: ${payload.email.subject}`);
  console.log(`Training URL: ${payload.link.url}`);
  console.log(`Click count: ${generatedLog.clickMetrics.count}`);
  console.log(`Feedback status: ${generatedLog.feedbackNotification.status}`);
  console.log(`Spam score: ${payload.spam.score}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    server.close();
  });

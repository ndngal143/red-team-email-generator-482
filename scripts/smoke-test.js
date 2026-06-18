const { server } = require("../src/server");

const testPort = 3099;
const baseUrl = `http://localhost:${testPort}`;

async function main() {
  await new Promise((resolve) => server.listen(testPort, resolve));

  const health = await fetch(`${baseUrl}/api/health`).then((res) => res.json());
  if (!health.ok) throw new Error("Health check failed");

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetProfile: "Finance employee",
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

  console.log("Smoke test passed");
  console.log(`Subject: ${payload.email.subject}`);
  console.log(`Training URL: ${payload.link.url}`);
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

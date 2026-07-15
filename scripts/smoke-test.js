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

  const revisionResponse = await fetch(`${baseUrl}/api/revise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      originalId: payload.id,
      revisionRequest: "Make the draft shorter and friendlier while keeping the same training link.",
      input: payload.input,
      email: payload.email,
      trainingLink: payload.link,
    }),
  });

  if (!revisionResponse.ok) {
    throw new Error(`Revision endpoint failed: ${revisionResponse.status}`);
  }

  const revisionPayload = await revisionResponse.json();
  if (!revisionPayload.email?.subject || !revisionPayload.revisionOf || typeof revisionPayload.spam?.score !== "number") {
    throw new Error("Revision payload is missing expected fields");
  }

  console.log("Smoke test passed");
  console.log(`Subject: ${payload.email.subject}`);
  console.log(`Revised Subject: ${revisionPayload.email.subject}`);
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

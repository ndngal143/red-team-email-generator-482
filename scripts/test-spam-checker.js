const { checkSpamIndicators } = require("../src/spamChecker");

const cases = [
  {
    name: "Low risk professional email",
    input: {
      subject: "Updated reimbursement policy",
      body:
        "Hello team, the finance department has published an updated reimbursement policy for internal training review. Please read the summary when you have time this week.",
    },
    expected: "Low",
    expectedIndicatorText: "",
  },
  {
    name: "Medium risk generic click prompt",
    input: {
      subject: "Benefits enrollment update",
      body:
        "Hello, benefits enrollment has changed for this quarter. Please use this link today only to review the updated internal enrollment information.",
    },
    expected: "Medium",
    expectedIndicatorText: "Generic Click Prompt",
  },
  {
    name: "High risk urgent credential email",
    input: {
      subject: "URGENT FINAL NOTICE!!!",
      body:
        "Act now! Verify your account password immediately or your account will be suspended. Click here! FINANCE ACTION REQUIRED TODAY!",
    },
    expected: "High",
    expectedIndicatorText: "Credential Risk",
  },
];

for (const testCase of cases) {
  const result = checkSpamIndicators(testCase.input);
  console.log(`${testCase.name}: ${result.level} (${result.score})`);
  console.log(`Indicators: ${result.indicators.join(" | ") || "none"}`);

  if (result.level !== testCase.expected) {
    throw new Error(`${testCase.name} expected ${testCase.expected}, got ${result.level}`);
  }

  if (
    testCase.expectedIndicatorText &&
    !result.indicators.some((indicator) => indicator.includes(testCase.expectedIndicatorText))
  ) {
    throw new Error(`${testCase.name} did not flag ${testCase.expectedIndicatorText}`);
  }
}

console.log("Spam checker tests passed");

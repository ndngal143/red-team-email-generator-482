const crypto = require("node:crypto");
const { demoBaseDomain } = require("./config");

const departmentPaths = {
  finance: ["finance/reimbursements", "finance/policy-update", "payroll/verification"],
  hr: ["hr/benefits", "people/policy-acknowledgement", "hr/forms"],
  it: ["it/service-desk", "security/device-review", "it/account-notice"],
  operations: ["operations/schedule", "ops/announcement", "facilities/access"],
  default: ["portal/notice", "intranet/update", "training/awareness"],
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function pickDepartmentKey(department) {
  const normalized = normalize(department);
  if (normalized.includes("finance") || normalized.includes("accounting")) return "finance";
  if (normalized.includes("hr") || normalized.includes("human")) return "hr";
  if (normalized.includes("it") || normalized.includes("security")) return "it";
  if (normalized.includes("operations") || normalized.includes("facilities")) return "operations";
  return "default";
}

function generateTrainingLink({ department, scenarioContext }) {
  // TODO Milestone 4 / Sebastian: Replace this deterministic demo link with a richer
  // pattern library and optional local route tracking.
  const key = pickDepartmentKey(department);
  const paths = departmentPaths[key];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const scenario = normalize(scenarioContext) || "training-notice";
  const token = crypto.randomBytes(4).toString("hex");

  return {
    url: `https://${demoBaseDomain}/${path}/${scenario}?ref=awareness-${token}`,
    domain: demoBaseDomain,
    path,
    token,
    safeDemoOnly: true,
  };
}

module.exports = { generateTrainingLink };

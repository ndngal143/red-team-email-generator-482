const crypto = require("node:crypto");
const { demoBaseDomain } = require("./config");

const urlPatterns = [
  {
    id: "finance-reimbursement-review",
    departmentKey: "finance",
    label: "Finance reimbursement review",
    pathTemplate: "finance/reimbursements/{scenario}",
    queryTemplate: "ref=awareness-{token}",
  },
  {
    id: "finance-policy-acknowledgement",
    departmentKey: "finance",
    label: "Finance policy acknowledgement",
    pathTemplate: "finance/policies/{scenario}/acknowledge",
    queryTemplate: "case=training-{token}",
  },
  {
    id: "payroll-document-review",
    departmentKey: "finance",
    label: "Payroll document review",
    pathTemplate: "payroll/documents/{scenario}",
    queryTemplate: "notice=demo-{token}",
  },
  {
    id: "hr-benefits-update",
    departmentKey: "hr",
    label: "HR benefits update",
    pathTemplate: "hr/benefits/{scenario}",
    queryTemplate: "ref=awareness-{token}",
  },
  {
    id: "people-policy-acknowledgement",
    departmentKey: "hr",
    label: "People policy acknowledgement",
    pathTemplate: "people/policies/{scenario}/review",
    queryTemplate: "ticket=training-{token}",
  },
  {
    id: "hr-forms-center",
    departmentKey: "hr",
    label: "HR forms center",
    pathTemplate: "hr/forms/{scenario}",
    queryTemplate: "source=demo-{token}",
  },
  {
    id: "it-service-desk-ticket",
    departmentKey: "it",
    label: "IT service desk ticket",
    pathTemplate: "it/service-desk/{scenario}",
    queryTemplate: "ticket=awareness-{token}",
  },
  {
    id: "security-device-review",
    departmentKey: "it",
    label: "Security device review",
    pathTemplate: "security/device-review/{scenario}",
    queryTemplate: "ref=training-{token}",
  },
  {
    id: "account-notice-center",
    departmentKey: "it",
    label: "Account notice center",
    pathTemplate: "it/account-notices/{scenario}",
    queryTemplate: "notice=demo-{token}",
  },
  {
    id: "operations-schedule-update",
    departmentKey: "operations",
    label: "Operations schedule update",
    pathTemplate: "operations/schedules/{scenario}",
    queryTemplate: "ref=awareness-{token}",
  },
  {
    id: "facilities-access-review",
    departmentKey: "operations",
    label: "Facilities access review",
    pathTemplate: "facilities/access/{scenario}",
    queryTemplate: "case=training-{token}",
  },
  {
    id: "intranet-policy-notice",
    departmentKey: "default",
    label: "Intranet policy notice",
    pathTemplate: "intranet/policy-notices/{scenario}",
    queryTemplate: "ref=awareness-{token}",
  },
  {
    id: "portal-training-awareness",
    departmentKey: "default",
    label: "Portal training awareness",
    pathTemplate: "portal/training/{scenario}",
    queryTemplate: "session=demo-{token}",
  },
  {
    id: "compliance-review-center",
    departmentKey: "default",
    label: "Compliance review center",
    pathTemplate: "compliance/review/{scenario}",
    queryTemplate: "case=awareness-{token}",
  },
];

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
  const key = pickDepartmentKey(department);
  const patterns = getPatternsForDepartment(key);
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const scenario = normalize(scenarioContext) || "training-notice";
  const token = crypto.randomBytes(4).toString("hex");
  const path = buildPath(pattern, scenario);
  const query = buildQuery(pattern, token);

  return {
    url: `https://${demoBaseDomain}/${path}?${query}`,
    domain: demoBaseDomain,
    path,
    patternId: pattern.id,
    patternLabel: pattern.label,
    token,
    safeDemoOnly: true,
  };
}

function getPatternsForDepartment(departmentKey) {
  const matches = urlPatterns.filter((pattern) => pattern.departmentKey === departmentKey);
  return matches.length ? matches : urlPatterns.filter((pattern) => pattern.departmentKey === "default");
}

function buildPath(pattern, scenario) {
  return pattern.pathTemplate.replace("{scenario}", scenario);
}

function buildQuery(pattern, token) {
  return pattern.queryTemplate.replace("{token}", token);
}

function buildSampleLinks(domain = demoBaseDomain, scenarioContext = "sample policy update") {
  const scenario = normalize(scenarioContext) || "training-notice";
  return urlPatterns.map((pattern, index) => {
    const token = String(index + 1).padStart(4, "0");
    const path = buildPath(pattern, scenario);
    const query = buildQuery(pattern, token);
    return {
      id: pattern.id,
      label: pattern.label,
      departmentKey: pattern.departmentKey,
      format: `https://${domain}/${pattern.pathTemplate}?${pattern.queryTemplate}`,
      sampleUrl: `https://${domain}/${path}?${query}`,
      safeDemoOnly: true,
    };
  });
}

module.exports = { buildSampleLinks, generateTrainingLink, urlPatterns };

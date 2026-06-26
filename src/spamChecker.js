const ruleGroups = [
  {
    category: "Urgency",
    weight: 12,
    terms: ["urgent", "immediately", "act now", "final notice", "limited time", "today only"],
    recommendation: "Reduce extreme urgency and use normal business timing.",
  },
  {
    category: "Credential Risk",
    weight: 20,
    terms: ["verify your account", "password", "login now", "account suspended", "mfa code", "2fa code"],
    recommendation: "Avoid credential-related language in training drafts.",
  },
  {
    category: "Generic Click Prompt",
    weight: 10,
    terms: ["click here", "open this link", "use this link", "download now"],
    recommendation: "Use specific internal context instead of generic click prompts.",
  },
  {
    category: "Financial Pressure",
    weight: 14,
    terms: ["wire transfer", "payment overdue", "invoice attached", "bank details", "reimbursement issue"],
    recommendation: "Keep finance wording specific, calm, and clearly tied to the training scenario.",
  },
  {
    category: "Suspicious Wording",
    weight: 10,
    terms: ["do not share", "confidential action required", "avoid delay", "failure to respond"],
    recommendation: "Remove secrecy or pressure-based wording.",
  },
];

function checkSpamIndicators({ subject = "", body = "" }) {
  const text = `${subject}\n${body}`;
  const lower = text.toLowerCase();
  const indicators = [];
  const recommendations = new Set();
  let score = 0;

  for (const group of ruleGroups) {
    const matches = group.terms.filter((term) => lower.includes(term));
    if (matches.length) {
      score += group.weight + Math.min(matches.length - 1, 3) * 4;
      indicators.push(`${group.category}: ${matches.join(", ")}`);
      recommendations.add(group.recommendation);
    }
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount >= 3) {
    score += 10 + exclamationCount;
    indicators.push(`Formatting: excessive exclamation points (${exclamationCount})`);
    recommendations.add("Keep punctuation professional and minimal.");
  }

  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
  if (allCapsWords.length >= 3) {
    score += 12 + allCapsWords.length * 2;
    indicators.push(`Formatting: multiple all-caps words (${allCapsWords.slice(0, 5).join(", ")})`);
    recommendations.add("Use sentence case instead of all-caps emphasis.");
  }

  if (subject.length > 80) {
    score += 8;
    indicators.push("Subject: longer than 80 characters");
    recommendations.add("Shorten the subject line.");
  }

  if (body.length < 120) {
    score += 8;
    indicators.push("Structure: body may be too short for a realistic internal email");
    recommendations.add("Add normal business context and a clear reason for the message.");
  }

  score = Math.min(100, score);
  const level = score >= 70 ? "High" : score >= 20 ? "Medium" : "Low";

  return {
    score,
    level,
    indicators,
    recommendations: recommendations.size
      ? [...recommendations]
      : ["No major spam indicators detected by the checker."],
  };
}

module.exports = { checkSpamIndicators };

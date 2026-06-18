const riskyTerms = [
  "urgent",
  "immediately",
  "act now",
  "verify your account",
  "password",
  "limited time",
  "click here",
  "suspended",
  "final notice",
  "wire transfer",
];

function checkSpamIndicators({ subject = "", body = "" }) {
  // TODO Milestone 3 / Alex: Replace this starter scoring with a more complete
  // ruleset and test cases for false positives/false negatives.
  const text = `${subject}\n${body}`;
  const lower = text.toLowerCase();
  const indicators = [];

  for (const term of riskyTerms) {
    if (lower.includes(term)) indicators.push(`Contains risky phrase: "${term}"`);
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount >= 3) indicators.push("Uses excessive exclamation points");

  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
  if (allCapsWords.length >= 3) indicators.push("Uses multiple all-caps words");

  if (subject.length > 80) indicators.push("Subject line is longer than 80 characters");
  if (body.length < 120) indicators.push("Body may be too short for a professional internal email");

  const score = Math.min(100, indicators.length * 15 + exclamationCount * 3 + allCapsWords.length * 4);
  const level = score >= 60 ? "High" : score >= 30 ? "Medium" : "Low";

  return {
    score,
    level,
    indicators,
    recommendations: buildRecommendations(indicators),
  };
}

function buildRecommendations(indicators) {
  if (indicators.length === 0) {
    return ["No major spam indicators detected by the starter checker."];
  }

  return [
    "Reduce extreme urgency and suspicious wording where possible.",
    "Keep punctuation and capitalization professional.",
    "Use clear internal context instead of generic click prompts.",
  ];
}

module.exports = { checkSpamIndicators };

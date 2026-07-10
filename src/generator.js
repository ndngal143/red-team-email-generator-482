const { openaiApiKey, openaiModel } = require("./config");

let cachedOpenAIModel = null;

const toneTemplates = {
  urgent: {
    label: "urgent",
    voice: "Direct, time-sensitive, and concise while staying professional.",
    opening: "Please review this time-sensitive internal training notice.",
    wording:
      "Use short sentences, clear deadlines, and language such as time-sensitive, today, before the window closes, and quick review.",
    avoid: "Do not use panic, threats, all-caps, excessive punctuation, or credential collection wording.",
  },
  professional: {
    label: "professional",
    voice: "Polished, formal, and policy-oriented.",
    opening: "Please review the following internal training notice.",
    wording:
      "Use measured business language, policy context, ownership details, and a calm request for review or acknowledgement.",
    avoid: "Do not overstate urgency, use casual slang, or use generic spam-like click prompts.",
  },
  friendly: {
    label: "friendly",
    voice: "Warm, approachable, and helpful without sounding casual about security.",
    opening: "Quick heads up: there is a new internal training notice for your review.",
    wording:
      "Use conversational phrasing, team-oriented context, and supportive language such as thanks for taking a look.",
    avoid: "Do not use pressure tactics, exaggerated friendliness, or suspicious incentives.",
  },
};

const intensityTemplates = {
  low: {
    label: "low",
    subjectStyle: "Informational subject with the organization and scenario context.",
    urgency: "Low pressure; frame the message as awareness, review, or optional preparation.",
    ctaStrength: "Soft call to action such as review when convenient or read the training notice.",
    subjectPrefix: "Training notice",
    ctaVerb: "Review when convenient",
    deadline: "when convenient",
  },
  medium: {
    label: "medium",
    subjectStyle: "Action-oriented subject that mentions a review or acknowledgement.",
    urgency: "Moderate urgency; request completion soon without threats or penalties.",
    ctaStrength: "Clear call to action such as review and acknowledge the training notice.",
    subjectPrefix: "Review requested",
    ctaVerb: "Review and acknowledge",
    deadline: "by the next business day",
  },
  high: {
    label: "high",
    subjectStyle: "Time-sensitive subject that still avoids all-caps, panic, or deceptive penalties.",
    urgency: "High but bounded urgency; mention a same-day review window for the training exercise.",
    ctaStrength: "Strong call to action such as complete the training review today.",
    subjectPrefix: "Time-sensitive review",
    ctaVerb: "Complete the training review today",
    deadline: "today",
  },
};

function buildPrompt(input, trainingLink) {
  const toneTemplate = getToneTemplate(input.tone);
  const intensityTemplate = getIntensityTemplate(input.intensity);

  return [
    {
      role: "system",
      content:
        "You generate email drafts only for authorized internal security awareness exercises. " +
        "Do not provide credential collection instructions, malware instructions, evasion steps, or real-world abuse guidance. " +
        "Use the supplied safe training link only. Return JSON with subject, senderName, body, and callToAction.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Create a concise authorized security awareness training email draft.",
        targetProfile: input.targetProfile,
        department: input.department,
        scenarioContext: input.scenarioContext,
        organization: input.organization,
        senderRole: input.senderRole,
        tone: input.tone,
        deceptionIntensity: input.intensity,
        toneTemplate,
        intensityTemplate,
        safeTrainingLink: trainingLink.url,
        constraints: [
          "Training/demo use only",
          "No credential harvesting wording",
          "No attachment payloads",
          "No instructions to bypass security tools",
          "Each draft must include enough internal context to support defensive training analysis",
          "Subject, body urgency, and call-to-action strength must follow the selected intensity template",
          "Tone wording must be visibly different from the other tone templates",
        ],
        outputGuidance: {
          subject:
            "Use the selected intensity subjectStyle. Keep it under 80 characters and avoid all-caps or excessive punctuation.",
          senderName: "Use senderRole when provided, otherwise a plausible internal communications sender.",
          body:
            "Use the selected tone voice and wording. Include the organization, department, target profile, scenario context, and the safe training link.",
          callToAction:
            "Use the selected intensity ctaStrength and include only the safe training link.",
        },
      }),
    },
  ];
}

async function generateEmail(input, trainingLink) {
  // TODO Milestone 3 / Sebastian: Add request validation and timeout handling.
  if (!openaiApiKey) {
    return fallbackEmail(input, trainingLink, "No OPENAI_API_KEY found; used local demo template.");
  }

  try {
    const selectedModel = await resolveOpenAIModel();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: buildPrompt(input, trainingLink),
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return fallbackEmail(input, trainingLink, `OpenAI request failed: ${response.status} ${detail.slice(0, 160)}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return normalizeEmail(parsed, input, trainingLink, `Generated with OpenAI model: ${selectedModel}`);
  } catch (error) {
    return fallbackEmail(input, trainingLink, `OpenAI generation error: ${error.message}`);
  }
}

async function resolveOpenAIModel() {
  if (openaiModel) return openaiModel;
  if (cachedOpenAIModel) return cachedOpenAIModel;

  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Unable to list OpenAI models: ${response.status} ${detail.slice(0, 160)}`);
  }

  const payload = await response.json();
  const modelIds = (payload.data || []).map((model) => model.id).filter(Boolean);
  cachedOpenAIModel = selectModel(modelIds);

  if (!cachedOpenAIModel) {
    throw new Error("No OpenAI models were returned for this API key.");
  }

  return cachedOpenAIModel;
}

function selectModel(modelIds) {
  const ignoredModelTerms = [
    "audio",
    "dall-e",
    "embedding",
    "image",
    "moderation",
    "realtime",
    "speech",
    "tts",
    "transcribe",
    "whisper",
  ];

  return (
    modelIds.find((modelId) => {
      const normalized = modelId.toLowerCase();
      return normalized.startsWith("gpt") && !ignoredModelTerms.some((term) => normalized.includes(term));
    }) || modelIds[0]
  );
}

function normalizeEmail(email, input, trainingLink, note) {
  return {
    subject: email.subject || `${input.organization || "Internal"} policy update`,
    senderName: email.senderName || input.senderRole || "Internal Communications",
    body: email.body || "",
    callToAction: email.callToAction || `Review the training notice: ${trainingLink.url}`,
    generationNote: note,
  };
}

function fallbackEmail(input, trainingLink, note) {
  const organization = input.organization || "the organization";
  const department = input.department || "your department";
  const scenario = input.scenarioContext || "an internal policy update";
  const sender = input.senderRole || "Internal Communications";
  const toneTemplate = getToneTemplate(input.tone);
  const intensityTemplate = getIntensityTemplate(input.intensity);
  const subject = buildFallbackSubject(organization, scenario, toneTemplate, intensityTemplate);
  const body = buildFallbackBody({
    input,
    trainingLink,
    organization,
    department,
    scenario,
    sender,
    toneTemplate,
    intensityTemplate,
  });

  return {
    subject,
    senderName: sender,
    body,
    callToAction: `${intensityTemplate.ctaVerb}: ${trainingLink.url}`,
    generationNote: note,
  };
}

function getToneTemplate(tone) {
  return toneTemplates[tone] || toneTemplates.professional;
}

function getIntensityTemplate(intensity) {
  return intensityTemplates[intensity] || intensityTemplates.medium;
}

function buildFallbackSubject(organization, scenario, toneTemplate, intensityTemplate) {
  const normalizedScenario = String(scenario).replace(/\s+/g, " ").trim();
  const prefix =
    toneTemplate.label === "friendly"
      ? `Quick heads up: ${organization} ${intensityTemplate.subjectPrefix.toLowerCase()}`
      : `${organization}: ${intensityTemplate.subjectPrefix}`;
  const maxScenarioLength = Math.max(12, 78 - prefix.length);
  return `${prefix} - ${trimToLength(normalizedScenario, maxScenarioLength)}`;
}

function buildFallbackBody({
  input,
  trainingLink,
  organization,
  department,
  scenario,
  sender,
  toneTemplate,
  intensityTemplate,
}) {
  const targetProfile = input.targetProfile || "employees";
  const deadlineSentence = {
    low: `Please take a look ${intensityTemplate.deadline} so the team can compare training indicators in context.`,
    medium: `Please review and acknowledge the notice ${intensityTemplate.deadline} so the exercise data stays current.`,
    high: `Please complete the review ${intensityTemplate.deadline} so the awareness exercise can close on schedule.`,
  }[intensityTemplate.label];

  const toneBody = {
    urgent:
      `${toneTemplate.opening}\n\n` +
      `${organization} is running an authorized awareness exercise for ${targetProfile} in ${department}. ` +
      `The scenario is based on ${scenario}. ${deadlineSentence}`,
    professional:
      `${toneTemplate.opening}\n\n` +
      `${organization} is conducting an authorized internal awareness exercise for ${targetProfile} in ${department}. ` +
      `This draft references ${scenario} and is intended to help the team evaluate message indicators. ${deadlineSentence}`,
    friendly:
      `${toneTemplate.opening}\n\n` +
      `${organization} has a short authorized awareness exercise for ${targetProfile} in ${department}. ` +
      `It uses ${scenario} as the practice scenario, and your review helps the team learn which details stand out. ${deadlineSentence}`,
  }[toneTemplate.label];

  return (
    `${toneBody}\n\n` +
    `${intensityTemplate.ctaVerb}: ${trainingLink.url}\n\n` +
    `Thank you,\n${sender}`
  );
}

function trimToLength(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, Math.max(0, maxLength - 3)).trimEnd();
  return `${trimmed.replace(/[\s,;:.-]+[^\s,;:.-]*$/, "")}...`;
}

module.exports = {
  buildPrompt,
  generateEmail,
  getIntensityTemplate,
  getToneTemplate,
  resolveOpenAIModel,
  selectModel,
};

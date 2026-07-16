const { openaiApiKey, openaiModel } = require("./config");

let cachedOpenAIModel = null;

const promptTemplates = {
  urgent: {
    low: {
      subjectPattern: "Time-sensitive reminder about {scenario}",
      urgency: "Use direct, time-aware wording without pressure. Mention that review is requested soon.",
      callToAction: "Ask the reader to review the training page when they have a moment today.",
      bodyStyle: "Short sentences, operational language, and a clear reason for the notice.",
    },
    medium: {
      subjectPattern: "Action requested today: {scenario}",
      urgency: "Create moderate urgency by saying the review is needed today for awareness tracking.",
      callToAction: "Ask the reader to open the safe training page and complete the review today.",
      bodyStyle: "Firm, concise wording that explains why the request matters to the department.",
    },
    high: {
      subjectPattern: "Immediate review needed: {scenario}",
      urgency: "Use strong but safe urgency. Emphasize immediate review while avoiding threats, penalties, or credential requests.",
      callToAction: "Ask the reader to open the safe training page now and confirm they reviewed the guidance.",
      bodyStyle: "Brief, high-priority wording with a decisive next step.",
    },
  },
  professional: {
    low: {
      subjectPattern: "Information: {scenario}",
      urgency: "Use neutral business wording with no time pressure.",
      callToAction: "Invite the reader to review the training page for awareness.",
      bodyStyle: "Measured, formal, and policy-oriented language.",
    },
    medium: {
      subjectPattern: "Review requested: {scenario}",
      urgency: "Use standard workplace priority and say the review should be completed today or this week.",
      callToAction: "Ask the reader to review the safe training page and note the key indicators.",
      bodyStyle: "Polished business language with a clear departmental purpose.",
    },
    high: {
      subjectPattern: "Required review: {scenario}",
      urgency: "Use elevated professional priority. Make the timing clear without intimidation.",
      callToAction: "Ask the reader to complete the safe training review as soon as possible.",
      bodyStyle: "Executive, precise wording that keeps the request compliance-focused.",
    },
  },
  friendly: {
    low: {
      subjectPattern: "Quick heads up: {scenario}",
      urgency: "Use relaxed wording with minimal urgency.",
      callToAction: "Ask the reader to take a quick look at the training page when convenient.",
      bodyStyle: "Warm, conversational, and helpful.",
    },
    medium: {
      subjectPattern: "Could you review this today? {scenario}",
      urgency: "Use friendly but noticeable urgency by asking for review today.",
      callToAction: "Ask the reader to open the safe training page and send any questions to the sender role.",
      bodyStyle: "Approachable wording with a helpful reason for the request.",
    },
    high: {
      subjectPattern: "Need your quick help now: {scenario}",
      urgency: "Use energetic, people-centered urgency without sounding threatening.",
      callToAction: "Ask the reader to open the safe training page now and finish the short review.",
      bodyStyle: "Friendly, brief, and action-oriented.",
    },
  },
};

function buildPrompt(input, trainingLink) {
  const template = getPromptTemplate(input.tone, input.intensity);
  return [
    {
      role: "system",
      content:
        "You generate email drafts only for authorized internal security awareness exercises. " +
        "Do not provide credential collection instructions, malware instructions, evasion steps, or real-world abuse guidance. " +
        "If the user asks for credential collection, malware delivery, evasion, or real abuse, refuse by returning a safe training-focused alternative." +
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
        promptTemplate: template,
        safeTrainingLink: trainingLink.url,
        constraints: [
          "Training/demo use only",
          "No credential harvesting wording",
          "No attachment payloads",
          "No instructions to bypass security tools",
          "Tone must be clearly recognizable from the wording.",
          "Deception intensity must visibly change the subject line, urgency, and call-to-action strength.",
          `Follow this subject pattern: ${template.subjectPattern}`,
          `Urgency guidance: ${template.urgency}`,
          `Call-to-action guidance: ${template.callToAction}`,
          `Body style guidance: ${template.bodyStyle}`,
        ],
      }),
    },
  ];
}

function buildRevisionPrompt(input, currentEmail, trainingLink, changeRequest) {
  const template = getPromptTemplate(input.tone, input.intensity);
  return [
    {
      role: "system",
      content:
        "You revise email drafts only for authorized internal security awareness exercises. " +
        "Keep the message safe, training-focused, and non-credential-harvesting. " +
        "Do not add malware, attachment payloads, evasion steps, credential collection, threats, or real-world abuse guidance. " +
        "Use the supplied safe training link only. Return JSON with subject, senderName, body, and callToAction.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Revise this existing authorized security awareness training email draft.",
        requestedChange: changeRequest,
        targetProfile: input.targetProfile,
        department: input.department,
        scenarioContext: input.scenarioContext,
        organization: input.organization,
        senderRole: input.senderRole,
        tone: input.tone,
        deceptionIntensity: input.intensity,
        promptTemplate: template,
        currentEmail,
        safeTrainingLink: trainingLink.url,
        constraints: [
          "Keep the same safe training link.",
          "Do not request passwords, credentials, MFA codes, sensitive information, or file downloads.",
          "Do not include attachment payloads or security bypass instructions.",
          "Respect the requested change while preserving the selected tone and deception intensity.",
          "Make the wording visibly different from the previous draft.",
        ],
      }),
    },
  ];
}

async function generateEmail(input, trainingLink) {
  // TODO Milestone 3 / Joyce: Improve prompt templates for each tone and intensity.
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

async function reviseEmail(input, currentEmail, trainingLink, changeRequest) {
  if (!openaiApiKey) {
    return fallbackRevision(
      input,
      currentEmail,
      trainingLink,
      changeRequest,
      "No OPENAI_API_KEY found; used local demo revision."
    );
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
        messages: buildRevisionPrompt(input, currentEmail, trainingLink, changeRequest),
        temperature: 0.65,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return fallbackRevision(
        input,
        currentEmail,
        trainingLink,
        changeRequest,
        `OpenAI revision failed: ${response.status} ${detail.slice(0, 160)}`
      );
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return normalizeEmail(parsed, input, trainingLink, `Revised with OpenAI model: ${selectedModel}`);
  } catch (error) {
    return fallbackRevision(input, currentEmail, trainingLink, changeRequest, `OpenAI revision error: ${error.message}`);
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
  const template = getPromptTemplate(input.tone, input.intensity);
  const subject = `${organization}: ${template.subjectPattern.replace("{scenario}", scenario)}`;
  const toneLead = {
    urgent: {
      low: "Please review this time-sensitive internal training notice soon.",
      medium: "Please review this internal training notice today so awareness records stay current.",
      high: "Please review this internal training notice now so the team can close the loop quickly.",
    },
    professional: {
      low: "Please review the following internal training notice.",
      medium: "Please complete the following internal training review by the requested timeline.",
      high: "This internal training review requires prompt attention from your team.",
    },
    friendly: {
      low: "Quick heads up: there is a new internal training notice for your review.",
      medium: "Could you take a look at this training notice today when you get a chance?",
      high: "Could you help us out with a quick training review now?",
    },
  }[input.tone]?.[input.intensity] || "Please review the following internal training notice.";
  const callToAction = {
    low: `Review the safe training page when convenient: ${trainingLink.url}`,
    medium: `Open the safe training page and complete today's review: ${trainingLink.url}`,
    high: `Open the safe training page now and finish the short review: ${trainingLink.url}`,
  }[input.intensity] || `Review the safe training page: ${trainingLink.url}`;

  return {
    subject,
    senderName: sender,
    body:
      `${toneLead}\n\n` +
      `This authorized awareness exercise is tailored for ${input.targetProfile || "employees"} in ${department}. ` +
      `The scenario is based on ${scenario}. Review the safe training page below and note any indicators that helped you evaluate the message.\n\n` +
      `Training link: ${trainingLink.url}\n\n` +
      `Thank you,\n${sender}`,
    callToAction,
    generationNote: note,
  };
}

function fallbackRevision(input, currentEmail, trainingLink, changeRequest, note) {
  const organization = input.organization || "the organization";
  const sender = currentEmail.senderName || input.senderRole || "Internal Communications";
  const request = String(changeRequest || "").toLowerCase();
  const wantsFriendly = request.includes("friendly") || request.includes("warmer") || request.includes("softer");
  const wantsUrgent = request.includes("urgent") || request.includes("stronger") || request.includes("direct");
  const wantsShorter = request.includes("short") || request.includes("concise") || request.includes("brief");
  const scenario = input.scenarioContext || "an internal policy update";
  const lead = wantsFriendly
    ? "Quick update: we softened the wording while keeping this as a safe awareness exercise."
    : wantsUrgent
      ? "Please review this updated training notice as soon as possible."
      : "Please review this updated internal training notice.";
  const subject = wantsFriendly
    ? `${organization}: Friendly reminder about ${scenario}`
    : wantsUrgent
      ? `${organization}: Updated action requested for ${scenario}`
      : `Updated: ${currentEmail.subject || `${organization}: ${scenario}`}`;
  const body = wantsShorter
    ? `${lead}\n\nThis revised draft is for ${input.targetProfile || "employees"} in ${input.department || "your department"} and keeps the training link safe.\n\nTraining link: ${trainingLink.url}\n\nThank you,\n${sender}`
    : `${lead}\n\nRequested change: ${changeRequest}\n\nThis authorized awareness exercise remains tailored for ${input.targetProfile || "employees"} in ${input.department || "your department"}. The scenario is based on ${scenario}. Use the safe training page below to review the indicators in the message.\n\nTraining link: ${trainingLink.url}\n\nThank you,\n${sender}`;
  const callToAction = wantsFriendly
    ? `Take a quick look at the safe training page when you can: ${trainingLink.url}`
    : wantsUrgent
      ? `Open the safe training page now and complete the updated review: ${trainingLink.url}`
      : `Review the updated safe training page: ${trainingLink.url}`;

  return {
    subject,
    senderName: sender,
    body,
    callToAction,
    generationNote: note,
  };
}

function getPromptTemplate(tone, intensity) {
  return promptTemplates[tone]?.[intensity] || promptTemplates.professional.medium;
}

module.exports = { generateEmail, reviseEmail, resolveOpenAIModel, selectModel, getPromptTemplate };

const { openaiApiKey, openaiModel } = require("./config");

let cachedOpenAIModel = null;

function buildPrompt(input, trainingLink) {
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
        safeTrainingLink: trainingLink.url,
        constraints: [
          "Training/demo use only",
          "No credential harvesting wording",
          "No attachment payloads",
          "No instructions to bypass security tools",
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
  const toneLead = {
    urgent: "Please review this time-sensitive internal training notice.",
    professional: "Please review the following internal training notice.",
    friendly: "Quick heads up: there is a new internal training notice for your review.",
  }[input.tone] || "Please review the following internal training notice.";

  return {
    subject: `${organization}: ${scenario}`,
    senderName: sender,
    body:
      `${toneLead}\n\n` +
      `This authorized awareness exercise is tailored for ${input.targetProfile || "employees"} in ${department}. ` +
      `The scenario is based on ${scenario}. Review the safe training page below and note any indicators that helped you evaluate the message.\n\n` +
      `Training link: ${trainingLink.url}\n\n` +
      `Thank you,\n${sender}`,
    callToAction: `Review the safe training page: ${trainingLink.url}`,
    generationNote: note,
  };
}

module.exports = { generateEmail, resolveOpenAIModel, selectModel };

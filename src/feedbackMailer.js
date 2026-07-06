const { feedbackEmailWebhookUrl, feedbackFromEmail } = require("./config");

function buildFeedbackEmail(generatedEmail, clickEvent) {
  const recipientEmail = generatedEmail.input.recipientEmail || "";
  const organization = generatedEmail.input.organization || "your organization";
  const subject = "Training notice: simulated phishing link clicked";
  const body = [
    `Hi${recipientEmail ? "" : " there"},`,
    "",
    `This message is part of an authorized security awareness exercise for ${organization}.`,
    "The link you clicked was a simulated phishing link, not a real attack.",
    "",
    "A few things to check next time:",
    "- Was the sender expected?",
    "- Did the link destination match the message?",
    "- Was there urgency, pressure, or unusual wording?",
    "- Did the message ask for credentials or sensitive information?",
    "",
    "No credential collection or malicious action was performed. This result is intended for awareness training and defensive reporting.",
    "",
    `Training event: ${generatedEmail.id}`,
    `Clicked at: ${clickEvent.clickedAt}`,
  ].join("\n");

  return {
    to: recipientEmail,
    from: feedbackFromEmail,
    subject,
    body,
  };
}

async function sendFeedbackEmail(generatedEmail, clickEvent) {
  const email = buildFeedbackEmail(generatedEmail, clickEvent);
  if (!email.to) {
    return {
      status: "skipped",
      deliveryMode: "outbox",
      reason: "No recipientEmail was provided for this generated email.",
      email,
    };
  }

  if (!feedbackEmailWebhookUrl) {
    return {
      status: "queued",
      deliveryMode: "outbox",
      reason: "Set FEEDBACK_EMAIL_WEBHOOK_URL to send through an email provider.",
      email,
    };
  }

  try {
    const response = await fetch(feedbackEmailWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PHISHING_CLICK_FEEDBACK",
        generatedEmailId: generatedEmail.id,
        clickEventId: clickEvent.id,
        email,
      }),
    });

    if (!response.ok) {
      return {
        status: "failed",
        deliveryMode: "webhook",
        reason: `Webhook returned ${response.status}`,
        email,
      };
    }

    return {
      status: "sent",
      deliveryMode: "webhook",
      reason: "Feedback email sent through webhook.",
      email,
    };
  } catch (error) {
    return {
      status: "failed",
      deliveryMode: "webhook",
      reason: error.message,
      email,
    };
  }
}

module.exports = { buildFeedbackEmail, sendFeedbackEmail };

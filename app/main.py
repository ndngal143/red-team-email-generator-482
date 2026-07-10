import json
import os
import re
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - app can still run in offline demo mode.
    OpenAI = None


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_PATH = Path(os.getenv("LOG_PATH", "data/generated_email_logs.jsonl"))
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")
USE_OPENAI = os.getenv("USE_OPENAI", "1") == "1"
INTERNAL_LINK_DOMAIN = os.getenv("INTERNAL_LINK_DOMAIN", "training.internal.example")
APP_ENV = os.getenv("APP_ENV", "development")

app = FastAPI(
    title="Authorized Social Engineering Email Generator Prototype",
    description="Internal security awareness exercise prototype with defensive logging.",
)
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


class EmailDraft(BaseModel):
    subject: str = Field(..., min_length=4)
    preheader: str = Field(..., min_length=4)
    body: str = Field(..., min_length=20)
    call_to_action: str = Field(..., min_length=4)
    training_link: str
    spam_findings: list[str]
    safety_notes: list[str]
    log_id: str


EMAIL_DRAFT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "subject": {"type": "string"},
        "preheader": {"type": "string"},
        "body": {"type": "string"},
        "call_to_action": {"type": "string"},
        "safety_notes": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["subject", "preheader", "body", "call_to_action", "safety_notes"],
}

SPAM_PATTERNS = {
    "Excessive urgency": re.compile(r"\b(act now|immediately|final notice|urgent!!!)\b", re.I),
    "Prize or money lure": re.compile(r"\b(winner|free money|cash bonus|guaranteed)\b", re.I),
    "Credential harvesting wording": re.compile(r"\b(password|credentials|ssn|social security|bank account)\b", re.I),
    "Shouting": re.compile(r"\b[A-Z]{8,}\b"),
    "Suspicious punctuation": re.compile(r"(!{2,}|\?{2,})"),
}


def normalize_user_text(value: str, max_length: int) -> str:
    """Keep prototype inputs bounded before logging or prompt construction."""
    compact = re.sub(r"\s+", " ", value).strip()
    return compact[:max_length]


def generate_training_link(target_profile: str) -> str:
    """Create an internal-looking training URL without pointing at a real external service."""
    token = secrets.token_urlsafe(12)
    department = re.sub(r"[^a-z0-9]+", "-", target_profile.lower()).strip("-") or "general"
    return f"https://{INTERNAL_LINK_DOMAIN}/awareness/{department}/{token}"


def detect_spam_indicators(text: str) -> list[str]:
    findings = [name for name, pattern in SPAM_PATTERNS.items() if pattern.search(text)]
    return findings or ["No configured spam indicators detected"]


def write_log(event: dict) -> None:
    # TODO Milestone 4: Replace JSONL with a database table and add retention controls.
    log_file = BASE_DIR / LOG_PATH
    log_file.parent.mkdir(parents=True, exist_ok=True)
    with log_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=True) + "\n")


def build_prompt(
    target_profile: str,
    context: str,
    tone: str,
    intensity: int,
    training_link: str,
) -> str:
    # TODO Milestone 2: Add organization-approved scenario templates and reviewer sign-off fields.
    return f"""
You are assisting an authorized internal security awareness team.
Create a realistic but safe phishing-simulation email draft for defensive training only.

Rules:
- Do not request passwords, SSNs, bank details, MFA codes, or other secrets.
- Do not impersonate a real public company or government agency.
- Use this safe training URL as the only link: {training_link}
- Keep the email professional and plausible for an internal workplace exercise.
- Include a safety note that reminds the reviewer this is for authorized testing.
- Return only the requested structured fields.

Target profile: {target_profile}
Context: {context}
Tone: {tone}
Deception intensity from 1 low to 5 high: {intensity}
"""


def sample_email(
    target_profile: str,
    context: str,
    tone: str,
    intensity: int,
    training_link: str,
) -> dict:
    urgency = "today" if intensity >= 4 else "this week"
    return {
        "subject": f"Action requested: {context}",
        "preheader": f"Please review the update for {target_profile} {urgency}.",
        "body": (
            f"Hello,\n\n"
            f"We are sharing an internal update related to {context}. "
            f"Because this affects {target_profile}, please review the summary {urgency} "
            f"and confirm that your team has seen the change.\n\n"
            f"Review the internal notice here: {training_link}\n\n"
            f"Thank you,\nInternal Operations"
        ),
        "call_to_action": "Review internal notice",
        "safety_notes": [
            "Demo mode used because OpenAI generation is unavailable or disabled.",
            "The link uses the configured training domain only.",
        ],
    }


def generate_email(
    target_profile: str,
    context: str,
    tone: Literal["urgent", "professional", "friendly"],
    intensity: int,
    training_link: str,
) -> dict:
    # TODO Milestone 3: Add prompt/version metadata and automated eval cases for approved outputs.
    if not USE_OPENAI or not os.getenv("OPENAI_API_KEY") or OpenAI is None:
        return sample_email(target_profile, context, tone, intensity, training_link)

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt = build_prompt(target_profile, context, tone, intensity, training_link)
    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "authorized_email_draft",
                    "schema": EMAIL_DRAFT_SCHEMA,
                    "strict": True,
                }
            },
        )
        return json.loads(response.output_text)
    except Exception as exc:
        fallback = sample_email(target_profile, context, tone, intensity, training_link)
        fallback["safety_notes"].append(f"OpenAI fallback used: {exc.__class__.__name__}")
        return fallback


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request, "index.html")


@app.post("/generate", response_class=HTMLResponse)
async def generate(
    request: Request,
    target_profile: str = Form(...),
    context: str = Form(...),
    tone: Literal["urgent", "professional", "friendly"] = Form("professional"),
    intensity: int = Form(3),
    authorization_attested: str = Form(...),
) -> HTMLResponse:
    # TODO Milestone 1: Replace browser-only attestation with authenticated RBAC and approval workflow.
    target_profile = normalize_user_text(target_profile, 120)
    context = normalize_user_text(context, 500)
    intensity = max(1, min(5, intensity))
    training_link = generate_training_link(target_profile)
    raw = generate_email(target_profile, context, tone, intensity, training_link)

    combined_text = " ".join(
        [raw.get("subject", ""), raw.get("preheader", ""), raw.get("body", ""), raw.get("call_to_action", "")]
    )
    draft = EmailDraft(
        subject=raw.get("subject", "Generated training email"),
        preheader=raw.get("preheader", ""),
        body=raw.get("body", ""),
        call_to_action=raw.get("call_to_action", "Open training link"),
        training_link=training_link,
        spam_findings=detect_spam_indicators(combined_text),
        safety_notes=raw.get("safety_notes", []),
        log_id=secrets.token_hex(8),
    )

    write_log(
        {
            "event": "email_generated",
            "log_id": draft.log_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "target_profile": target_profile,
            "context": context,
            "tone": tone,
            "intensity": intensity,
            "authorization_attested": authorization_attested == "yes",
            "training_link": training_link,
            "subject": draft.subject,
            "spam_findings": draft.spam_findings,
        }
    )
    return templates.TemplateResponse(request, "result.html", {"draft": draft})


@app.get("/awareness/{department}/{token}")
async def awareness_click(department: str, token: str) -> RedirectResponse:
    # TODO Milestone 5: Add signed tokens, campaign IDs, and anonymized click analytics.
    write_log(
        {
            "event": "training_link_clicked",
            "clicked_at": datetime.now(timezone.utc).isoformat(),
            "department": department,
            "token_prefix": token[:6],
        }
    )
    return RedirectResponse(url="/")


@app.get("/health")
async def health() -> dict:
    # TODO Milestone 7: Split public liveness from authenticated readiness diagnostics.
    return {"status": "ok", "environment": APP_ENV, "model": OPENAI_MODEL, "use_openai": USE_OPENAI}

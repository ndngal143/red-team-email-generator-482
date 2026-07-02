# Capstone Project Plan

| Field | Details |
|---------|---------|
| Course | CSC482 Capstone Project II |
| Team | Team 3: Joyce, Sebastian, Alex |
| Project Window | June 15, 2026 through July 24, 2026 |
| Final Presentation/Demo | July 27–28, 2026 |

## Project Goal

Build a web-based form generator for authorized red-team security awareness exercises. Users enter a target profile and scenario context, choose tone and deception intensity, and receive a customized phishing-style training email draft.

The system will also include:

- Anti-spam indicator checks
- Realistic internal-looking training URL generation
- Generated email logs for defensive model training

## Safety and Scope

This project is for authorized internal awareness exercises only.

Generated links should be training/demo links, not credential-harvesting pages. Logs should support defensive analysis and model training, not real-world abuse.

---

# Timeline Overview

| Completion | Dates | Milestone |
|---------|---------|---------|
| ☑ | 6/15–6/19 | Milestone 1: Requirements, Architecture, and Project Setup |
| ☑ | 6/22–6/26 | Milestone 2: Form Design, Data Model, and Safety Controls |
| ☑ | 6/29–7/3 | Milestone 3: Email Generation Engine and Spam Indicator Checks |
| ☐ | 7/6–7/10 | Milestone 4: Link Generator, Logging, and Storage |
| ☐ | 7/13–7/17 | Milestone 5: Full Integration, Testing, and Defensive Dataset Export |
| ☐ | 7/20–7/24 | Milestone 6: Polish, Deployment, Documentation, and Demo Prep |
| ☐ | 7/27–7/28 | Final Presentation and Demonstration |

---

# Milestone 1: Requirements, Architecture, and Project Setup

**Dates:** 6/15–6/19

**Goal:** Define the project clearly, set up the development environment, and create the technical foundation.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☑ | Joyce | Define user requirements and project use cases | Requirements document, user stories, feature list | Requirements reviewed by all 3 members; scope includes generator, tone controls, intensity controls, link generator, and logging |
| ☑ | Sebastian | Design system architecture | Architecture diagram, technology stack decision, data flow diagram | Architecture includes frontend, backend/API, LLM generation layer, URL generator, logging storage, and safety checks |
| ☑ | Alex | Set up repository and development environment | GitHub repository, initial folder structure, README, setup instructions | Repo runs locally; README includes install/run steps; all team members can clone and start the app |

---

# Milestone 2: Form Design, Data Model, and Safety Controls

**Dates:** 6/22–6/26

**Goal:** Build the user input workflow and define the structured data needed for generation and logging.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☑ | Joyce | Design web form fields and user workflow | Form wireframe, field list, validation rules | Form includes target profile, department, scenario context, tone, deception intensity, sender role, and organization details |
| ☑ | Sebastian | Create backend data model | Schema for generation requests, generated emails, generated links, and logs | Schema supports all required form fields; log entries include timestamp, inputs, generated output, spam score, and link metadata |
| ☑ | Alex | Define safety and authorization controls | Safety checklist, warning labels, allowed-use notice, blocked content rules | App displays authorized-use notice; generated content avoids credential collection instructions and real malicious payloads |

---

# Milestone 3: Email Generation Engine and Spam Indicator Checks

**Dates:** 6/29–7/3

**Goal:** Implement the core email draft generator and basic anti-spam analysis.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☑ | Joyce | Create tone and intensity prompt templates | Prompt template set for urgent, professional, and friendly tones | Each tone produces clearly different wording; deception intensity changes subject line, urgency, and call-to-action strength |
| ☑ | Sebastian | Implement backend generation endpoint | API endpoint that accepts form data and returns generated email draft | Endpoint returns subject, sender name, body, call-to-action, and generated link placeholder within 5 seconds locally |
| ☑ | Alex | Build spam indicator checker | Spam keyword/risk scoring function and recommendations | Checker flags common spam indicators such as excessive urgency, suspicious wording, all-caps, too many exclamation points, and risky phrases |

---

# Milestone 4: Link Generator, Logging, and Storage

**Dates:** 7/6–7/10

**Goal:** Add realistic internal-looking training URLs and persistent logs for defensive analysis.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☐ | Joyce | Define internal-looking URL patterns | URL pattern list and sample generated links | At least 10 realistic training-safe URL formats, such as policy, HR, finance, IT, and benefits paths |
| ☐ | Sebastian | Implement link generator | Function/API that generates training URLs based on department and scenario | Generated links contain safe demo domains or local routes; no real credential capture URLs are produced |
| ☐ | Alex | Implement email logging | Log storage, generated email history view, exportable records | Every generation creates a log entry; logs can be viewed and exported as CSV or JSON |

---

# Milestone 5: Full Integration, Testing, and Defensive Dataset Export

**Dates:** 7/13–7/17

**Goal:** Connect all components, test the full workflow, and prepare logs for defensive model training.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☐ | Joyce | Conduct user workflow testing | Test cases, user feedback notes, revised UI checklist | At least 10 test scenarios covering different departments, tones, and intensity levels |
| ☐ | Sebastian | Integrate frontend, backend, generator, link generator, and logging | Working end-to-end application | User can submit form, generate email, receive spam check results, get generated URL, and see log entry |
| ☐ | Alex | Create defensive dataset export | CSV/JSON export format with labeled generated emails | Export includes email body, subject, tone, intensity, scenario, spam indicators, and generated link metadata |

---

# Milestone 6: Polish, Deployment, Documentation, and Demo Prep

**Dates:** 7/20–7/24

**Goal:** Prepare the final working project for demonstration and presentation.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☐ | Joyce | Polish UI and prepare demo script | Final UI revisions, demo walkthrough script | Demo script covers form input, email generation, spam check, URL generation, and log export |
| ☐ | Sebastian | Prepare deployment or local demo environment | Deployed app or reliable local demo setup | App runs consistently on demo machine; setup time under 5 minutes |
| ☐ | Alex | Write final documentation and presentation content | Final README, project report sections, presentation slides outline | Documentation explains purpose, setup, features, safety limits, architecture, and testing results |

---

# Final Presentation and Demonstration

**Dates:** 7/27–7/28

## Presentation Focus

- Problem statement: why organizations need authorized phishing-awareness training
- Project goal and scope
- System architecture
- Live demonstration of the web form generator
- Demonstration of tone and deception intensity controls
- Demonstration of anti-spam indicator checks
- Demonstration of internal-looking training URL generation
- Demonstration of generated email logs and defensive export
- Lessons learned and future improvements

## Final Demo Success Criteria

| Demo Area | Measurement |
|---------|---------|
| Web form | All required fields accept and validate input |
| Email generation | Produces complete email with subject, sender, body, and call-to-action |
| Tone control | Urgent, professional, and friendly outputs are visibly different |
| Intensity control | Low, medium, and high settings affect urgency and persuasion level |
| Spam checker | Flags common risky indicators and provides a score/recommendations |
| Link generator | Produces realistic but safe internal-looking training URLs |
| Logging | Each generated email is saved with metadata |
| Export | Logs export successfully as CSV or JSON |
| Demo reliability | Full workflow completes without errors during presentation |

---

# Suggested Weekly Meeting Schedule

| Date | Meeting Focus |
|---------|---------|
| 6/15 | Kickoff, assign roles, confirm tools |
| 6/19 | Review requirements and architecture |
| 6/26 | Review form design, data model, and safety rules |
| 7/3 | Review generation engine and spam checker |
| 7/10 | Review link generator and logs |
| 7/17 | End-to-end testing review |
| 7/24 | Final demo rehearsal |
| 7/27–7/28 | Final presentation and demonstration |

---

## Prerequisites

- Git
- Node.js 20 or newer
- A ChatGPT/OpenAI API key
- PowerShell on Windows Server 2025 or Bash on Ubuntu 24.04 LTS

The prototype has no npm package dependencies. It uses built-in Node.js modules and `fetch`.

## Install Prerequisites

### Windows Server 2025

Install Git:

```powershell
winget install --id Git.Git -e
```

Install Node.js LTS:

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

Confirm installation:

```powershell
git --version
node --version
npm --version
```

### Ubuntu 24.04 LTS

Install Git and Node.js:

```bash
sudo apt update
sudo apt install -y git nodejs npm
```

If Ubuntu's default Node.js version is older than 20, install Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Confirm installation:

```bash
git --version
node --version
npm --version
```

## Configure

Create a local environment file from the example.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
notepad .env
```

Ubuntu Bash:

```bash
cp .env.example .env
nano .env
```

Set:

```text
OPENAI_API_KEY=your_api_key_here
# Optional: leave OPENAI_MODEL unset to select an available model at runtime.
PORT=3000
DEMO_BASE_DOMAIN=training.example.internal
```

The app lists available OpenAI models at runtime when `OPENAI_MODEL` is not set, then uses the selected model for email generation. To force a specific model for testing, add `OPENAI_MODEL=model_id_here` to `.env`.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

The app still runs without an API key by using a local demo template. Add your API key to enable OpenAI-generated drafts.

On Windows PowerShell, if `npm` is blocked by the script execution policy, use:

```powershell
npm.cmd start
```

## Smoke Test

Run this to confirm the backend can start, generate a sample draft, create a safe training link, score spam indicators, and write a log entry:

```bash
npm test
```

Windows PowerShell fallback:

```powershell
npm.cmd test
```

## Deploy

### Windows Server 2025 VM

1. Install Git and Node.js.
2. Clone or copy this project folder onto the server.
3. Create `.env` from `.env.example`.
4. Run:

```powershell
npm start
```

5. Allow inbound traffic for the selected port if accessing from another machine.

```powershell
New-NetFirewallRule -DisplayName "Capstone Prototype Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### Ubuntu 24.04 LTS VM

1. Install Git and Node.js.
2. Clone or copy this project folder onto the server.
3. Create `.env` from `.env.example`.
4. Run:

```bash
npm start
```

5. Allow inbound traffic for the selected port if using UFW.

```bash
sudo ufw allow 3000/tcp
```

For a longer-running demo server, use a process manager such as `pm2` or a systemd service later in the project.

## Project Structure

```text
src/server.js           Backend server and API routes
src/generator.js        OpenAI integration and safe fallback generation
src/linkGenerator.js    Safe internal-looking training link generator
src/spamChecker.js      Simple spam indicator scoring
src/logStore.js         JSONL log storage and export
public/index.html       Prototype UI
public/styles.css       UI styles
public/app.js           Browser-side form logic
docs/MILESTONE_TODOS.md Team TODOs organized by milestone
data/.gitkeep           Log directory placeholder
```

## Safety Notes

- Generated links use safe demo domains or local routes.
- The prompt instructs the model to create training drafts only.
- The prototype does not create credential collection pages.
- Logs are local JSONL files intended for defensive analysis and export.

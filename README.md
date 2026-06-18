# Red Team Social Engineering Email Generator

## Project Description

This project is a web-based form generator for authorized red-team and security-awareness exercises. Users provide a target profile and contextual details, then the application generates a customized phishing email draft for internal training use.

The tool includes adjustable deception intensity, tone controls, anti-spam indicator checks, realistic internal-looking URL generation, and generated email logs for defensive model training.

## Course Information

CSC482 Capstone Project II  
Summer Session: June 1 - July 28  
Team: Capstone Project Team 3

## Team Members

- Alex
- Joyce
- Sebastian

## Team Member Descriptions

### Alex

Add description here.

### Joyce

Add description here.

### Sebastian

Add description here.

## Project Milestones

| Milestone | Status | Target Date |
|---|---|---|
| Project topic selected | Achieved | Week 1 |
| Development environment installed | Achieved | Week 2 |
| Initial prototype created | To be achieved | Week 3 |
| Email generator form completed | To be achieved | Week 4 |
| Tone and deception controls completed | To be achieved | Week 5 |
| Link generator completed | To be achieved | Week 6 |
| Email logging completed | To be achieved | Week 7 |
| Final testing and demo preparation | To be achieved | Week 8 |

## Weekly Tasks

| Week | Tasks | Status |
|---|---|---|
| Week 1 | Review syllabus, set up VMs, choose topic, form team | Complete |
| Week 2 | Install Git, Python, Node.js, VS Code; create project plan | Complete |
| Week 3 | Build initial prototype and repository structure | To be completed |
| Week 4 | Build web form and basic email generation flow | To be completed |
| Week 5 | Add tone and deception intensity settings | To be completed |
| Week 6 | Add internal-looking link generator | To be completed |
| Week 7 | Add generated email logs and defensive training dataset export | To be completed |
| Week 8 | Test, polish, prepare final presentation and demo | To be completed |

# Red Team Social Engineering Email Generator Prototype

Initial runnable prototype for Team 3's CSC482 Capstone Project II.

This app is for authorized internal security awareness exercises only. It generates training email drafts, safe demo links, spam-indicator feedback, and local JSONL logs for defensive review. No model training is required.

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
OPENAI_MODEL=gpt-5.4-mini
PORT=3000
DEMO_BASE_DOMAIN=training.example.internal
```

If your OpenAI account uses a different available model name, update `OPENAI_MODEL` in `.env`.

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

# Setup Guide

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
HOST=0.0.0.0
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

To test from another computer on the same network, set `HOST=0.0.0.0` and set `TRAINING_BASE_URL` to the server machine's reachable address, for example:

```text
TRAINING_BASE_URL=http://192.168.1.25:3000
```

Then open that same URL from the other computer. If it does not load, confirm Windows Firewall allows inbound TCP traffic on the configured `PORT`.

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

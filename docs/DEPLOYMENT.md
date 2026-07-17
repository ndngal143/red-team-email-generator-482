# Deployment Guide

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

# n8n Automation Workbench - System Instructions
**Last Update**: 2025-12-20

## Stack Overview

| Component | Version/Tool | Path |
|-----------|--------------|------|
| n8n | 2.0.1 (local npm) | `/Volumes/VRMini/n8n` |
| Node.js | 24.10.0 (mise) | Managed via `.tool-versions` |
| Python | 3.11.11 (mise + uv venv) | `/Volumes/VRMini/n8n/.venv` |
| IDE | Cursor + Playwright browser | MCP tools |
| Data | SQLite | `/Volumes/VRMini/n8n/data/.n8n/` |

**NOT USED**: Global installs, Docker, n8n Cloud

---

## Directory Structure

```
/Volumes/VRMini/n8n/
├── CLAUDE.md              # Bootstrap instructions for agents
├── .cursor/rules/         # Cursor-specific rules (auto-loaded)
├── design/
│   ├── 00-agent-init.sh   # REQUIRED: Shell init for non-interactive tools
│   └── *.md               # Design documentation
├── scripts/
│   ├── start-n8n.sh       # Starts n8n with task runners
│   ├── stop-n8n.sh        # Kills n8n process
│   ├── update-n8n.sh      # Updates + recreates symlink
│   ├── start-full-session.sh  # Full dev session startup
│   └── start-task-runner.sh   # Manual task runner start
├── start-n8n.sh           # Symlink → scripts/start-n8n.sh
├── stop-n8n.sh            # Symlink → scripts/stop-n8n.sh
├── update-n8n.sh          # Symlink → scripts/update-n8n.sh
├── workflows/
│   ├── _template/         # Copy for new workflows
│   └── job-hunter/        # X Jobs automation (in progress)
│       ├── README.md
│       ├── ACTIONS.md
│       ├── BUILD-GUIDE.md
│       ├── COMPLETION-SUMMARY.md
│       ├── PROGRESS.md
│       ├── UPDATE-GUIDE.md
│       ├── scripts/       # Workflow-specific scripts
│       ├── data/          # Job tracking data
│       └── debug/         # Debug artifacts
├── lib/
│   ├── n8n/               # Code node helpers
│   ├── python/            # Python utilities
│   └── prompts/           # LLM prompt templates
├── data/                  # Runtime (gitignored)
│   ├── .n8n/              # n8n config, database
│   └── logs/              # n8n.log
├── node_modules/          # npm packages (gitignored)
│   └── @n8n/task-runner-python/.venv → /Volumes/VRMini/n8n/.venv (SYMLINK)
├── .venv/                 # Python venv (gitignored)
├── .tool-versions         # mise version config
└── package.json           # n8n@^2.0.1
```

---

## Critical Rules

### 0. Agent Shell Initialization (MANDATORY FIRST STEP)

**ANY non-interactive terminal commands**, agents MUST initialize the shell environment:

```bash
cd /Volumes/VRMini/n8n && source design/00-agent-init.sh
```

This activates:
- mise (Node.js 24.10.0, Python 3.11.11)
- Python virtual environment (.venv)

**Why:** Cursor's `run_terminal_cmd` spawns non-interactive shells that don't load `.zshrc`. Without this init, you'll get wrong tool versions and inconsistent behavior.

### 1. Package Managers

| Language | Use | Never Use |
|----------|-----|-----------|
| Python | `uv pip install` | `pip install` |
| Node.js | `npm install` | `yarn`, global npm |

### 2. The Symlink Rule (Mandatory)

After ANY npm operation that modifies `node_modules`:

```bash
ln -sf /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv
```

Failure to recreate = task runner failure.

### 3. Running n8n

```bash
# Start
./scripts/start-n8n.sh

# Stop
./scripts/stop-n8n.sh

# Check status
lsof -i :5678

# Health check
curl http://localhost:5678/healthz
```

Never run `n8n start` directly—use the script (it sets required env vars).

---

## Environment Variables (set in start-n8n.sh)

```bash
# Data location
N8N_USER_FOLDER="/Volumes/VRMini/n8n/data"

# Task runners (n8n 2.0)
N8N_RUNNERS_ENABLED=true
N8N_RUNNERS_MODE=internal
N8N_RUNNERS_INSECURE_MODE=true  # Debug mode

# Security (2.0 defaults)
N8N_BLOCK_ENV_ACCESS_IN_NODE=true
N8N_GIT_NODE_DISABLE_BARE_REPOS=true

# Performance
DB_SQLITE_POOL_SIZE=20
N8N_CACHE_BACKEND=memory

# Logging
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=console,file
N8N_LOG_FILE_LOCATION="/Volumes/VRMini/n8n/data/logs/n8n.log"
N8N_LOG_SCOPES=task-runner,task-runner-js,task-runner-py,task-broker
```

---

## Agent Development with Cursor IDE

### Playwright Browser Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_snapshot` | Get accessibility tree (use over screenshots) |
| `browser_click` | Click element by ref |
| `browser_type` | Type into input |
| `browser_wait_for` | Wait for element/text |

### Workflow

```
1. browser_navigate({ url: "http://localhost:5678" })
2. browser_snapshot() → returns element refs
3. browser_click/type using refs
4. browser_snapshot() → verify result
```

### Browser Tools MCP (Debugging)

| Tool | Purpose |
|------|---------|
| `getConsoleLogs` | All console output |
| `getNetworkLogs` | Network requests |
| `takeScreenshot` | Visual capture |

Server: `http://localhost:3025` or `3026`

---

## Active Workflows

### job-hunter (🟡 In Progress)

**Purpose**: X Jobs discovery, evaluation, application tracking

| Action | Description | Automation |
|--------|-------------|------------|
| 1. Session Setup | Auth browser, navigate to X Jobs | Assisted |
| 2. Discovery | Find new jobs, dedupe | Full |
| 3. Extraction | Pull job details | Full |
| 4. Evaluation | Score fit, gen materials | Assisted |
| 5. Apply & Track | Submit, record | Manual |

**Target URL**:
```
https://x.com/jobs?q=python&lstr=remote&sr=junior%2Cmid_level%2Csenior&ltype=remote
```

**Data Files**:
- `workflows/job-hunter/data/pending_jobs.json`
- `workflows/job-hunter/data/applied_jobs.json`
- `workflows/job-hunter/data/candidate-profile.json`
- `workflows/job-hunter/data/extracts/{job_id}.json`
- `workflows/job-hunter/data/applications/{job_id}.md`

**Documentation**:
- `README.md` - Purpose and prerequisites
- `ACTIONS.md` - Step-by-step workflow actions
- `BUILD-GUIDE.md` - How workflow was built
- `COMPLETION-SUMMARY.md` - Project completion status
- `PROGRESS.md` - Development progress tracking
- `UPDATE-GUIDE.md` - Maintenance and updates

---

## n8n CLI Commands

```bash
cd /Volumes/VRMini/n8n

# List workflows
./node_modules/.bin/n8n list:workflow

# Export workflow
./node_modules/.bin/n8n export:workflow --id=<id> --output=./workflow.json

# Export all
./node_modules/.bin/n8n export:workflow --all --output=./workflows-backup/

# Import workflow
./node_modules/.bin/n8n import:workflow --input=./workflow.json

# Version
./node_modules/.bin/n8n --version
```

---

## n8n REST API

```bash
# Health
curl http://localhost:5678/healthz

# Workflows (local dev - no auth required)
curl http://localhost:5678/rest/workflows
curl http://localhost:5678/rest/workflows/<id>
```

---

## Update n8n

```bash
./scripts/update-n8n.sh

# Or manually:
./scripts/stop-n8n.sh
npm update n8n --legacy-peer-deps
ln -sf /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv
./scripts/start-n8n.sh
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| n8n won't start | `lsof -i :5678` → kill stale process |
| Task runner fails | Recreate symlink (see Critical Rules #2) |
| Python package missing | `source .venv/bin/activate && uv pip install <pkg>` |
| npm error | `rm -rf node_modules && npm install` → recreate symlink |
| Playwright browser won't open | Restart Cursor IDE |
| Browser Tools empty | Normal if no activity; trigger action first |

---

## Code Node Constraints (n8n 2.0)

| Feature | Status |
|---------|--------|
| JavaScript Code nodes | ✅ Working |
| Python Code nodes | ❌ Not available (npm install limitation) |
| Environment variable access | ❌ Blocked by default |
| External modules | Requires `NODE_FUNCTION_ALLOW_EXTERNAL` |

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | Bootstrap for AI agents |
| `design/00-agent-init.sh` | **REQUIRED shell init for agents** |
| `design/00-install.md` | Fresh installation |
| `design/01-manage-n8n-cursor.md` | Cursor IDE workflow |
| `design/02-manage-n8n-terminal.md` | Terminal/CLI workflow |
| `design/02-build-job-hunter.md` | Job hunter workflow build process |
| `design/05-autonomous-agent-enhancement.md` | Agent enhancement patterns |
| `.cursor/rules/*.mdc` | Project rules (auto-loaded in Cursor) |
| `workflows/[name]/README.md` | Workflow purpose, prerequisites |
| `workflows/[name]/ACTIONS.md` | Step-by-step actions |

---

## Key URLs

| Resource | URL |
|----------|-----|
| n8n UI | http://localhost:5678 |
| n8n Docs | https://docs.n8n.io |
| n8n 2.0 Breaking Changes | https://docs.n8n.io/2-0-breaking-changes/ |
| X Node Docs | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twitter/ |
| X Credentials | https://docs.n8n.io/integrations/builtin/credentials/twitter/ |

---

## X API Integration Notes

- **Authentication**: OAuth 2.0 (OAuth 1.0a deprecated)
- **Callback URL**: `http://localhost:5678/rest/oauth2-credential/callback`
- **Rate limits**: App-level (varies by tier)
- **Node operations**: Post, Delete, Search, Like, Retweet, DM, Get User

For job-hunter workflow, browser automation via Playwright is primary method (not API) to avoid rate limits and access X Jobs which has no public API.
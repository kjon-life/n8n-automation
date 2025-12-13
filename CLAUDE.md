# n8n Automation Workbench

Multi-workflow automation platform built on n8n. Each workflow is discrete, documented, and agent-friendly.

## Bootstrap Protocol (READ THIS FIRST)

**You are an AI assistant. Before doing ANY work, you MUST read context files SEQUENTIALLY.**

### Step 1: Read Project Rules (SEQUENTIAL - DO NOT PARALLELIZE)

```
Read these files ONE AT A TIME, in order, waiting for each to complete:

1. .cursor/rules/00-tooling.mdc      → Package managers (uv, npm, mise)
2. .cursor/rules/01-project-setup.mdc → Directory structure, symlinks
3. .cursor/rules/02-start-stop-update.mdc → How to run n8n
4. .cursor/rules/03-browser-tools-workflows.mdc → Browser automation
5. .cursor/rules/04-error-handling.mdc → Error patterns
```

**WHY SEQUENTIAL:** Later files reference earlier files. Parallel reads cause you to miss critical dependencies (like the Python venv symlink).

### Step 2: Identify the Workflow

When user says "work on [workflow-name]" or describes a task:

1. Check if workflow exists: `ls workflows/`
2. If exists, read workflow docs (SEQUENTIAL):
   ```
   1. workflows/[name]/README.md   → Purpose, prerequisites
   2. workflows/[name]/ACTIONS.md  → Step-by-step actions
   ```
3. If new workflow, use template: `workflows/_template/`

### Step 3: Verify System State

Before making changes:

```bash
# Is n8n running?
lsof -i :5678

# Start if needed
./scripts/start-n8n.sh
```

---

## Project Structure

```
/Volumes/VRMini/n8n/
├── CLAUDE.md              ← You are here
├── .cursor/rules/         ← Project rules (read first)
├── scripts/               ← System scripts (start, stop, update)
├── workflows/             ← Discrete workflow projects
│   ├── _template/         ← Template for new workflows
│   ├── job-hunter/        ← X Jobs application automation
│   └── [other-workflows]/
├── lib/                   ← Shared code libraries
│   ├── n8n/               ← n8n code node helpers
│   ├── python/            ← Python utilities
│   └── prompts/           ← LLM prompt templates
├── data/                  ← Runtime data (gitignored)
├── node_modules/          ← npm packages (gitignored)
└── .venv/                 ← Python venv (gitignored)
```

---

## Available Workflows

| Workflow | Status | Description |
|----------|--------|-------------|
| `job-hunter` | 🟡 In Progress | X Jobs discovery and application |
| `_template` | 📋 Template | Copy this to create new workflows |

---

## Quick Commands

```bash
# Start n8n
./scripts/start-n8n.sh

# Stop n8n  
./scripts/stop-n8n.sh

# Check if running
lsof -i :5678

# Access n8n UI
open http://localhost:5678

# Update n8n
./scripts/update-n8n.sh
```

---

## Critical Rules (MEMORIZE THESE)

### 1. Package Managers
- **Python:** Use `uv pip install`, NEVER `pip`
- **Node.js:** Use `npm install`
- **Versions:** Managed by `mise`

### 2. The Symlink Rule
After ANY npm operation that touches node_modules:
```bash
ln -sf /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv
```

### 3. Workflow Isolation
- Each workflow is self-contained in `workflows/[name]/`
- Don't mix workflow code - keep them discrete
- Shared code goes in `lib/`

### 4. Data Privacy
- `data/` is gitignored - contains credentials and runtime data
- `config.json` files are gitignored - contain secrets
- Only `config.example.json` goes to git

---

## Working on a Workflow

### To work on existing workflow:

```
1. Read workflows/[name]/README.md
2. Read workflows/[name]/ACTIONS.md  
3. Check prerequisites are met
4. Start n8n if not running
5. Begin work on specific action
```

### To create new workflow:

```bash
# Copy template
cp -r workflows/_template workflows/[new-name]

# Edit README.md - describe the workflow
# Edit ACTIONS.md - define the actions
# Edit config.example.json - define required config
```

---

## Agent Behavior Guidelines

### DO:
- Read files sequentially when instructed
- Check system state before making changes
- Use the correct package managers
- Keep workflows isolated
- Document changes in workflow files

### DON'T:
- Batch-read rules files in parallel
- Assume n8n is running without checking
- Use pip instead of uv
- Mix code between workflows
- Commit secrets to git

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| n8n won't start | Check port 5678: `lsof -i :5678` |
| Task runner fails | Recreate symlink (see Critical Rules #2) |
| Python package missing | `source .venv/bin/activate && uv pip install [pkg]` |
| npm error | `rm -rf node_modules && npm install` then recreate symlink |

---

## Documentation

| Document | Purpose |
|----------|---------|
| `design/00-install.md` | Fresh installation from scratch |
| `design/01-manage-n8n-cursor.md` | Cursor IDE with Playwright browser |
| `design/02-manage-n8n-terminal.md` | Terminal agents (Claude CLI) |

## For Cursor IDE Users

Cursor reads `.cursor/rules/` automatically. Use Playwright browser for interaction.
See `design/01-manage-n8n-cursor.md` for details.

## For Claude CLI / Terminal Users

Run the full session startup:
```bash
./scripts/start-full-session.sh
```

This starts n8n, browser tools server, and checks Chrome debugging.
See `design/02-manage-n8n-terminal.md` for complete guide.

## For Other Assistants

Read the `.cursor/rules/` files in numerical order, then this file, then the specific workflow documentation.

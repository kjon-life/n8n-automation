# n8n Automation Workbench

Multi-workflow automation platform built on n8n. Each workflow is discrete, documented, and agent-friendly.

## Bootstrap Protocol (READ THIS FIRST)

**You are an AI assistant. Before doing ANY work, you MUST read context files SEQUENTIALLY.**

### Tier 1: Engineering Standards (Every Session)

Read these files in order before any work:

```
1. .cursor/rules/00-coding-style.mdc          → Code style principles
2. .cursor/rules/01-core-engineering.mdc      → Engineering philosophy
3. .cursor/rules/02-development-standards.mdc → Branch/commit, security, workflow naming
4. .cursor/rules/03-writing-good-interfaces.mdc → Function/API design patterns
5. .cursor/rules/04-error-handling.mdc        → Error message patterns
6. .cursor/rules/05-documentation.mdc         → Documentation rules
```

### Tier 2: n8n Operations (Sequential, in order)

Read these after Tier 1, in order:

```
7. .cursor/rules/06-tooling.mdc               → Package managers (uv, npm, mise)
8. .cursor/rules/07-project-setup.mdc         → Directory structure, symlinks
9. .cursor/rules/08-start-stop-update.mdc     → How to run n8n
10. .cursor/rules/09-browser-tools-workflows.mdc → Browser automation
```

### Tier 3: Optional / As Needed

Reference when relevant:

```
11. .cursor/rules/10-n8n-v2-resources.mdc     → n8n 2.0 docs links
12. .cursor/rules/11-claude-rememberings.md   → Condensed quick reference
13. .cursor/rules/12-agent-instructions.md    → Agent behavior guidance
```

**WHY SEQUENTIAL:** Later files reference earlier files. Parallel reads cause you to miss critical dependencies (like the Python venv symlink).

### Step 1: Initialize Shell Environment (MANDATORY)

Before ANY **non-interactive** terminal commands, agents MUST initialize:

```bash
cd /Volumes/VRMini/n8n && source design/00-agent-init.sh
```

This activates mise (Node.js 24.10.0, Python 3.11.11) and the Python virtual environment.

**Why:** Non-interactive shells don't load `.zshrc`. Without this init, you'll get wrong tool versions.
**Why:** Interactive shells only need `source .venv/bin/activate` 

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
├── .cursor/rules/         ← Project rules (auto-loaded in Cursor)
├── design/
│   ├── 00-agent-init.sh   ← REQUIRED: Shell init for agents
│   └── *.md               ← Design documentation
├── scripts/
│   ├── start-n8n.sh       ← Starts n8n with task runners
│   ├── stop-n8n.sh        ← Kills n8n process
│   ├── update-n8n.sh      ← Updates + recreates symlink
│   └── start-full-session.sh ← Full dev session startup
├── start-n8n.sh           ← Symlink → scripts/start-n8n.sh
├── stop-n8n.sh            ← Symlink → scripts/stop-n8n.sh
├── update-n8n.sh          ← Symlink → scripts/update-n8n.sh
├── workflows/
│   ├── _template/         ← Template for new workflows
│   └── job-hunter/        ← X Jobs automation (in progress)
├── lib/
│   ├── n8n/               ← n8n code node helpers
│   ├── python/            ← Python utilities
│   └── prompts/           ← LLM prompt templates
├── data/                  ← Runtime (gitignored)
│   ├── .n8n/              ← n8n config, database
│   └── logs/              ← n8n.log
├── node_modules/          ← npm packages (gitignored)
│   └── @n8n/task-runner-python/.venv → .venv (SYMLINK)
├── .venv/                 ← Python venv (gitignored)
├── .tool-versions         ← mise version config
└── package.json           ← n8n@^2.0.1
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

### 5. Python Code Nodes NOT Available
- Python Code nodes do NOT work in n8n 2.0 npm installations
- Use JavaScript Code nodes only
- The `.venv` symlink exists only to prevent runtime errors, not to enable Python

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
- Run `n8n start` directly (use `./scripts/start-n8n.sh`)
- Skip shell initialization (`source design/00-agent-init.sh`)

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| n8n won't start | Check port 5678: `lsof -i :5678` |
| Task runner fails | Recreate symlink (see Critical Rules #2) |
| Python package missing | `source .venv/bin/activate && uv pip install [pkg]` |
| npm error | `rm -rf node_modules && npm install` then recreate symlink |
| Playwright browser won't open | Restart Cursor IDE |
| Browser Tools empty | Normal if no activity; trigger action first |

---

## Documentation

| Document | Purpose |
|----------|---------|
| `design/00-agent-init.sh` | **REQUIRED shell init for any non-interactive shells!!** |
| `design/00-install.md` | Fresh installation from scratch |
| `design/01-manage-n8n-cursor.md` | Cursor IDE with Playwright browser |
| `design/02-manage-n8n-terminal.md` | Terminal agents (Claude CLI) |
| `design/02-build-job-hunter.md` | Job hunter workflow build process |
| `design/05-autonomous-agent-enhancement.md` | Agent enhancement patterns |
| `.cursor/rules/*.mdc` | Project rules (auto-loaded in Cursor) |
| `workflows/[name]/README.md` | Workflow purpose, prerequisites |
| `workflows/[name]/ACTIONS.md` | Step-by-step actions |

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

Follow the Bootstrap Protocol at the top of this file. Read rules files sequentially in three tiers, then workflow-specific documentation.

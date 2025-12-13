# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-12-13

### Initial Release - Project Structure & Foundation

#### Core Infrastructure
- n8n 2.0.1 local installation with npm (not Docker)
- Task runner support with internal mode
- Python 3.11 virtual environment with symlink workaround for task runner
- SQLite database with connection pooling

#### Project Organization
- Multi-workflow architecture with discrete, self-contained workflows
- Template system (`workflows/_template/`) for creating new workflows
- Shared code library structure (`lib/n8n/`, `lib/python/`, `lib/prompts/`)
- Proper `.gitignore` for public GitHub deployment

#### Scripts
- `scripts/start-n8n.sh` - Start n8n with all environment configuration
- `scripts/stop-n8n.sh` - Graceful shutdown
- `scripts/update-n8n.sh` - Update with automatic symlink recreation
- `scripts/start-full-session.sh` - Full session startup (n8n + browser tools + Chrome check)

#### Documentation
- `CLAUDE.md` - Agent bootstrap with sequential file reading protocol
- `README.md` - Public-facing project documentation
- `design/00-install.md` - Clean installation guide
- `design/01-manage-n8n-cursor.md` - Cursor IDE workflow (Playwright browser)
- `design/02-manage-n8n-terminal.md` - Terminal/Claude CLI workflow (Chrome + Browser Tools)

#### Agent Support
- `.cursor/rules/` - Cursor IDE context rules (5 files, numbered for sequential reading)
- Sequential file reading protocol to prevent context loss
- Workflow-specific documentation pattern (README.md + ACTIONS.md per workflow)

#### First Workflow: Job Hunter
- `workflows/job-hunter/` - X Jobs application automation
- 5-action workflow design documented in ACTIONS.md
- Local tracking database structure (applied_jobs.json, pending_jobs.json)
- Cover letter prompt template in `lib/prompts/`

### Known Limitations
- Python Code nodes not available (npm installation limitation)
- JavaScript Code nodes fully functional
- Browser Tools MCP requires Chrome with remote debugging (port 9222)

## [Unreleased]

### Planned
- Job Hunter workflow implementation (Actions 1-5)
- n8n workflow JSON exports
- Additional workflow templates

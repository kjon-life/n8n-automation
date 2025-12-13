# Workflow: [NAME]

## Purpose

[One sentence: What does this workflow do?]

## Value Proposition

- **Manual time:** X hours/week
- **Automated time:** Y minutes/week
- **ROI:** Z hours saved

## Prerequisites

- [ ] n8n running (`lsof -i :5678`)
- [ ] Required credentials configured (see `config.example.json`)
- [ ] Any external services set up

## Quick Start

```bash
# 1. Copy config template
cp config.example.json config.json

# 2. Fill in your credentials
# Edit config.json with your API keys

# 3. Import workflow to n8n
# Use n8n UI: Settings → Import from file → workflow.json
```

## Inputs

| Input | Type | Source | Example |
|-------|------|--------|---------|
| ... | ... | ... | ... |

## Outputs

| Output | Type | Destination | Example |
|--------|------|-------------|---------|
| ... | ... | ... | ... |

## Actions Overview

See `ACTIONS.md` for detailed step-by-step breakdown.

| Action | Description | Automation Level |
|--------|-------------|------------------|
| 1 | ... | Full / Assisted / Manual |
| 2 | ... | Full / Assisted / Manual |

## Error Handling

- **Retry logic:** 3 attempts with exponential backoff
- **Failure notification:** [Slack/Email/None]
- **Recovery:** [Manual intervention required / Auto-recovers]

## Maintenance

- **Update frequency:** [Daily/Weekly/As needed]
- **Common issues:** See troubleshooting section in ACTIONS.md


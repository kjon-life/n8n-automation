# Workflow: Job Hunter

## Purpose

Systematically discover, evaluate, and apply to remote Python developer jobs posted on X (Twitter) Jobs.

## Value Proposition

- **Manual time:** 2-3 hours/day scanning, evaluating, applying
- **Automated time:** 15 minutes/day reviewing curated matches
- **ROI:** 10+ hours/week saved, higher application quality

## Prerequisites

- [ ] n8n running (`lsof -i :5678`)
- [ ] X (Twitter) logged in via Playwright browser session
- [ ] Local tracking database initialized (`data/applied_jobs.json`)

## Quick Start

```bash
# 1. Ensure n8n is running
cd /Volumes/VRMini/n8n
./scripts/start-n8n.sh

# 2. Initialize tracking files (first time only)
mkdir -p workflows/job-hunter/data
echo "[]" > workflows/job-hunter/data/applied_jobs.json
echo "[]" > workflows/job-hunter/data/pending_jobs.json

# 3. Start browser session (for X login)
# Use Cursor IDE Playwright browser or Chrome with remote debugging
```

## Inputs

| Input | Type | Source | Example |
|-------|------|--------|---------|
| Search query | String | Config | `python`, `remote` |
| Experience level | Array | Config | `["junior", "mid_level", "senior"]` |
| Applied jobs | JSON | Local file | `data/applied_jobs.json` |

## Outputs

| Output | Type | Destination | Example |
|--------|------|-------------|---------|
| New job listings | JSON | `data/pending_jobs.json` | Job metadata |
| Job extracts | JSON | `data/extracts/` | Full job details |
| Application packages | Markdown | `data/applications/` | Cover letter, notes |

## Actions Overview

See `ACTIONS.md` for detailed step-by-step breakdown.

| # | Action | Description | Automation Level |
|---|--------|-------------|------------------|
| 1 | Session Setup | Authenticate browser, navigate to X Jobs | Assisted |
| 2 | Discovery | Find new jobs, filter against applied | Full |
| 3 | Extraction | Pull full job details | Full |
| 4 | Evaluation | Score job fit, generate materials | Assisted |
| 5 | Application | Submit and track | Manual |

## Target URL

```
https://x.com/jobs?q=python&lstr=remote&sr=junior%2Cmid_level%2Csenior&ltype=remote
```

## Error Handling

- **Rate limiting:** Exponential backoff, max 3 retries
- **Session expiry:** Alert user, pause workflow
- **Missing data:** Log and skip, continue with next job

## Data Privacy

- Credentials stored in n8n (encrypted)
- Applied jobs tracked locally only
- No personal data sent to external services

## Maintenance

- **Update frequency:** Run daily or on-demand
- **Database cleanup:** Archive old applications monthly
- **Common issues:** X login session expires, rate limits


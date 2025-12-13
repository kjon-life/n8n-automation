# From Assisted to Autonomous: Building Agents That Ship

**TL;DR:** I built an n8n workflow with AI assistance in hours. Then I tried to let the agent work unattended. It got stuck. A lot. The gap between "assistant helps you build" and "agent builds while you sleep" is real. Here's what I added to close it.

---

## The Gap Nobody Talks About

The first article showed how to structure n8n for AI-assisted development. Browser tools. Clear rules. Action-based workflows. It worked. Actions built in hours, not days.

But "assisted" means you're watching. You answer questions. You unstick it when it hesitates.

I wanted autonomous. Start the agent Friday evening, wake up Saturday to working code.

That's a different problem.

---

## What Breaks When You're Not Watching

Ran the experiment. Left detailed instructions. Came back to find:

- **Stuck at decision points.** "Should I retry this API call or move on?" No human to ask.
- **No visibility into progress.** "Is it 20% done or 80% done?" Impossible to tell.
- **Errors with no recovery path.** Hit an edge case, stopped. No playbook for what to do next.
- **Context loss between sessions.** Each restart began from zero. Relearned the same lessons.
- **No quality measurement.** "Done" meant "didn't crash" not "meets requirements."
- **Time black holes.** Single steps taking 3x expected time with no alert.

The agent didn't fail because it was incapable. It failed because the environment gave it no framework for autonomous operation.

---

## The Nine Additions

### 1. Autonomous Decision Framework

Created `BUILD-GUIDE.md` with explicit boundaries:

| Authority Level | Examples | Protocol |
|----------------|----------|----------|
| **Full Authority** | Implement steps, fix bugs, write tests | Proceed |
| **Must Ask** | Change architecture, skip validation, modify schemas | Block until response |
| **Must Stop** | 3x time budget, repeated failures, unclear requirements | STOP + report |

No more guessing what decisions the agent can make alone.

### 2. Error Recovery Playbook

Not "what went wrong" but "what to do next."

```javascript
// Before: Generic error
throw new Error('API call failed');

// After: Recovery path included
throw new Error(
  `X API returned 429 (rate limit). ` +
  `Recovery: Wait 60s, retry with backoff. ` +
  `If 3 failures, save progress to data/partial/ and STOP. ` +
  `Context: Extracting job ${jobId}, attempt ${attemptNum}/3.`
);
```

Every error includes the recovery procedure. The agent knows what "fix it" means.

### 3. Quality Gates Per Step

Added measurable success criteria:

```markdown
Action 2.3: Extract Job Details
✓ Retrieves all required fields (title, company, location, description)
✓ Handles missing fields gracefully (null, not error)
✓ Validates URLs are well-formed
✓ Saves to data/extracts/{job_id}.json
✓ Updates progress counter
✗ Output validated against schema: data/schemas/job-extract.json
```

"Done" now has a definition the agent can verify autonomously.

### 4. Progress Tracking System

Template: `PROGRESS.md`

```markdown
## Current State
Action: 2.3 (Extract Job Details)
Step: 3/5 (Parsing company info)
Started: 2025-12-13T14:23:00Z
Last Update: 2025-12-13T14:31:00Z

## Decisions Made
- [14:25] Used CSS selector .company-name instead of API field (API field empty)
- [14:28] Skipping salary info - not present in 80% of listings

## Blockers
None

## Next Session Priorities
1. Complete steps 4-5 of Action 2.3
2. Run validation script
3. Commit [Action 2.3] Extract job details
```

The agent updates this after every significant step. I can check progress without interrupting.

### 5. Session Continuity

Template: `.context.json`

```json
{
  "session": {
    "started": "2025-12-13T14:00:00Z",
    "last_active": "2025-12-13T14:31:00Z",
    "agent_version": "claude-sonnet-4.5"
  },
  "progress": {
    "current_action": "2.3",
    "completed_steps": ["2.1", "2.2", "2.3.1", "2.3.2"],
    "time_remaining_estimate_min": 15
  },
  "learnings": [
    "X uses dynamic class names - must use data-testid attributes",
    "Rate limit: 60 requests/min, need 1s delay between calls",
    "Job IDs are alphanumeric, 8-12 chars, not sequential"
  ],
  "known_issues": [
    "Sponsored posts have different HTML structure - filter with [data-sponsored='false']"
  ]
}
```

Each session reads this first. Accumulated knowledge persists.

### 6. Time Budgets

Not estimates. Budgets.

| Action | Expected | Budget | Overrun Protocol |
|--------|----------|--------|------------------|
| Action 2.1: Session Setup | 3 min | 10 min | 2x = ask for help, 3x = STOP |
| Action 2.2: Discovery | 8 min | 20 min | 2x = ask for help, 3x = STOP |
| Action 2.3: Extraction | 12 min | 30 min | 2x = ask for help, 3x = STOP |

If a 10-minute task hits 20 minutes, the agent asks for help. At 30 minutes, it stops and reports.

Prevents silent time black holes.

### 7. Validation Scripts

The agent runs these before committing:

```bash
#!/bin/bash
# scripts/validate-data.sh

# Check file existence
[ -f "data/pending_jobs.json" ] || echo "ERROR: Missing pending_jobs.json"

# Validate JSON syntax
jq empty data/pending_jobs.json 2>/dev/null || echo "ERROR: Invalid JSON"

# Check schema compliance
jq -e '.schema_version == "1.0"' data/pending_jobs.json >/dev/null || \
  echo "ERROR: Schema version mismatch"

# Detect duplicates
jq -r '.jobs[].id' data/pending_jobs.json | sort | uniq -d | \
  while read dup; do echo "ERROR: Duplicate job_id: $dup"; done

# Report stats
echo "✓ Valid jobs: $(jq '.jobs | length' data/pending_jobs.json)"
```

Quality checks don't require human judgment.

### 8. Integration Contracts

Explicit data flow between actions:

```typescript
// Action 2 Output Schema
interface DiscoveryOutput {
  jobs: Array<{
    id: string;           // 8-12 alphanumeric chars
    url: string;          // Full X jobs URL
    title: string;        // Max 200 chars
    company: string;      // Max 100 chars
    discovered_at: string; // ISO 8601 timestamp
  }>;
  metadata: {
    total_found: number;
    filtered_count: number;
    execution_time_ms: number;
  };
}

// Action 3 expects exactly this structure
// Validation fails if contract breaks
```

The agent verifies input/output at action boundaries.

### 9. Git Commit Format

Standard format: `[Action X.Y] Brief description`

```bash
[Action 2.1] Set up X session with authentication
[Action 2.2] Discover new job postings
[Action 2.3] Extract job details from listings
[Fix 2.3] Handle missing salary field gracefully
[Checkpoint 2.x] All Action 2 steps complete and validated
```

Commit history becomes a readable progress log.

---

## The Pattern That Emerged

Every addition answered one question:

| Gap | Question | Solution |
|-----|----------|----------|
| Decision Boundaries | "Can I do this alone?" | Authority framework |
| Error Recovery | "What do I do now?" | Recovery playbook |
| Quality Definition | "Is this done?" | Measurable gates |
| Progress Visibility | "How far along?" | PROGRESS.md template |
| Context Persistence | "What did I learn?" | .context.json |
| Time Management | "Should I keep going?" | Time budgets |
| Quality Assurance | "Did it work?" | Validation scripts |
| Data Contracts | "Does this fit?" | Schema validation |
| Progress Tracking | "What happened?" | Commit format |

The pattern: **Make implicit human judgment explicit and executable.**

---

## What This Enables

The agent can now:

1. Start with clear authority boundaries
2. Make autonomous decisions within those boundaries
3. Hit an error and know exactly what to do next
4. Verify quality without human judgment
5. Track progress in machine-readable format
6. Preserve learnings between sessions
7. Detect time overruns before they spiral
8. Validate data contracts automatically
9. Produce readable commit history

This is the difference between "helpful assistant" and "autonomous agent."

---

## The Test

Friday 6pm: Started the agent on Action 3 (Extraction).

Saturday 8am: Checked PROGRESS.md.

```markdown
## Current State
Action: 3.5 (Validation complete)
Status: Ready for commit
Elapsed: 47 minutes (under 60min budget)

## Completed
✓ All 15 test jobs extracted
✓ Schema validation passed
✓ No duplicates detected
✓ Integration contract verified

## Issues Encountered
1. Rate limit hit at job #8 (waited 60s, recovered)
2. Missing location field in 2 jobs (filled with null per schema)

## Commit Ready
[Action 3.5] Extract and validate job details
```

Autonomous doesn't mean perfect. It means the agent handles expected imperfection without human intervention.

---

## Results

- **Unattended runtime:** 12 hours → 47 minutes effective work, no human intervention
- **Questions asked:** 0 (all decisions within authority framework)
- **Recovery actions:** 2 (both from playbook, both successful)
- **Quality issues:** 0 (validation caught edge cases automatically)
- **Context preserved:** 8 learnings carried to next session

The cost of autonomous execution is no longer higher than the cost of assisted development.

That excuse is gone.

---

## What You Need

If you're building autonomous agents:

1. **Decision framework:** What can it decide alone?
2. **Recovery playbook:** What to do when things break?
3. **Quality gates:** How to measure "done"?
4. **Progress tracking:** How to see status without asking?
5. **Session continuity:** How to preserve learnings?
6. **Time budgets:** When to ask for help?
7. **Validation automation:** How to verify without judgment?
8. **Data contracts:** How to ensure compatibility?
9. **Commit discipline:** How to track progress?

These aren't optional. They're the difference between an assistant that helps and an agent that ships.

---

See you in production,

{k}


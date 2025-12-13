# n8n for AI-Native Automation

**TL;DR:** I set up n8n locally with a structure that lets AI assistants build workflows incrementally. Not "vibe coding" that produces elegant garbage. Discrete actions, observable execution, persistent state. The assistant sees what it builds, tests what it ships.

---

## The Problem We're Solving

Most workflow automation follows the old pattern: human designs the flow, human configures the nodes, human debugs when things break. AI assists by generating snippets you paste in.

This is bolting AI onto existing workflows. The instinct that produces chaos.

AI-native automation inverts this. The assistant builds the workflow while observing its execution. It sees the browser. It reads the console. It verifies output matches schema before moving to the next step.

But this only works if we design the environment for assistants to be effective.

---

## What I Built

A local n8n installation structured for AI-assisted workflow development:

```
/Volumes/VRMini/n8n/
├── .cursor/rules/          # 10 rule files, numbered 00-09
│   ├── 00-coding-style     # Universal: How to write code
│   ├── 01-core-engineering # Universal: Engineering philosophy
│   ├── 02-dev-standards    # Universal: Branch, commit, security
│   ├── 03-interfaces       # Universal: Function and API design
│   ├── 04-error-handling   # Universal: Actionable errors
│   ├── 05-documentation    # Universal: Document why, not what
│   ├── 06-tooling          # Project: uv, npm, mise
│   ├── 07-project-setup    # Project: n8n structure, symlinks
│   ├── 08-start-stop       # Project: Operations
│   └── 09-browser-tools    # Project: MCP integration
├── workflows/
│   └── job-hunter/         # Discrete workflow project
│       ├── README.md       # What it does
│       ├── ACTIONS.md      # 5 actions, 3-5 steps each
│       └── data/           # Persistent state between actions
├── design/
│   └── 02-build-prompt.md  # Iterative build instructions
└── scripts/                # start, stop, update
```

---

## The Key Insight

**Documentation is the build instruction.**

Every `.cursor/rules/` file isn't documentation for humans to read someday. It's context the assistant loads before writing a single line. Without it, 60% of every session is re-explaining constraints.

With it? Compliant code on the first pass.

I numbered the rules 00-09 deliberately:

- **00-05:** Universal standards (coding style, engineering philosophy, interfaces, errors, docs)
- **06-09:** Project-specific n8n context (tooling, setup, operations, browser tools)

The assistant reads them sequentially. Later files depend on earlier ones. This isn't a suggestion—it's in `rules.md` as a mandatory protocol.

---

## Actions, Not Workflows

Here's what actually changed my approach: I stopped thinking about "workflows" and started thinking about "actions."

A workflow is the whole thing. An action is one discrete capability:

| Action | Steps | Automation |
|--------|-------|------------|
| Session Setup | 3 | Assisted |
| Discovery | 4 | Full |
| Extraction | 5 | Full |
| Evaluation | 4 | Assisted |
| Apply & Track | 3 | Manual |

Each action:
- **Testable in isolation.** Don't need the others to verify it works.
- **Observable.** Browser snapshot after every execution.
- **Persistent.** Saves state to files for the next action.

The assistant builds Action 1, tests it, commits. Builds Action 2, tests it, commits. No massive workflow that fails somewhere in the middle with no visibility into why.

---

## Browser Tools Change Everything

The assistant has access to the browser via MCP:

```
mcp_cursor-ide-browser_browser_navigate
mcp_cursor-ide-browser_browser_snapshot
mcp_cursor-ide-browser_browser_click
mcp_browser-tools_getConsoleLogs
mcp_browser-tools_getNetworkLogs
```

This means:
- Navigate to X Jobs page, snapshot to verify it loaded
- Execute workflow, snapshot to see results
- Check console for errors
- Check network for failed requests

The assistant doesn't guess whether code works. It sees the result.

---

## The Build Protocol

For each action, the iterative process:

1. **Implement** minimal step
2. **Execute** in n8n 
3. **Snapshot** page state
4. **Verify** output matches schema
5. **Fix** before moving to next step

This is the engineering discipline that makes AI-native velocity possible. Not "move fast and break things." Move fast because we designed systems that let us know when they're broken.

---

## Practical Setup Details

### The Critical Symlink

n8n's Python task runner expects `.venv` in a specific location:

```bash
ln -sf /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv
```

This breaks on every `npm install`. The start script recreates it. The rules document it. The assistant knows to check it.

### State Persistence

Actions save state to files:

```
workflows/job-hunter/data/
├── pending_jobs.json    # Jobs discovered, not yet processed
├── applied_jobs.json    # Jobs we've applied to
├── extracts/            # Full job details per job_id
└── applications/        # Generated cover letter points
```

Each action reads from and writes to these files. The assistant can verify state between runs.

### Error Handling

Every error includes: what failed, why it failed, how to fix it.

```javascript
throw new Error(
  `Missing required field 'email' in input item: ` +
  `Received keys: ${Object.keys(item).join(', ')}. ` +
  `Ensure the previous node includes 'email' in its output.`
);
```

Not `"Invalid input"`. Actionable context.

---

## What This Enables

The assistant can now:

1. Read the rules (sequentially, as instructed)
2. Understand the project structure
3. Navigate to n8n in the browser
4. Build an action step by step
5. Test each step with snapshots
6. Verify output against documented schemas
7. Commit working increments
8. Move to the next action

This is what "design your assistants to be effective" looks like in practice. Not better prompting. Better environment design.

---

## Results

- **Build time:** Actions built in hours, not days
- **Debug time:** Near zero—issues visible immediately via browser tools
- **Rework:** Minimal—each step verified before the next
- **Technical debt:** Low—rules enforce patterns from the start

The cost of building correctly is no longer higher than the cost of building quickly. That excuse is gone.

---

See you in production,

{k}

The way we did this until mid-2025 is in `design/02-build-job-hunter.md`

## The gaps in context...
...between prompt and workflow.

Missing: Autonomous Decision Framework
Add explicit decision boundaries:
Missing: Progress Tracking System
Add persistent state tracking:
Missing: Data Schemas & Validation
Add explicit schemas:
Missing: Error Recovery Playbook
Add specific recovery procedures:
Missing: Quality Gates (Beyond "Works")
Add measurable success criteria:
Missing: Check-in Protocol
Add structured reporting intervals:
Missing: Context Preservation Between Sessions
Add session continuity:
Missing: Integration Contract Between Actions
Add explicit data flow:
Missing: Working Code Examples
Add concrete patterns:
Missing: Rollback Procedure
Add safety nets:

Recommendations:

Add all above sections to the prompt
Create template files for PROGRESS.md and .context.json
Define X-specific selectors (requires reconnaissance of actual page)
Add timeout budgets per action (e.g., "Action 2 should take 10-20min max")
Create validation scripts agent can run: ./scripts/validate-data.sh
Add test data for offline testing (mocked pending_jobs.json, etc.)
Define commit message format: [Action X.Y] Description

The prompt is well-structured for human guidance but lacks the defensive programming, error boundaries, and autonomous decision framework needed for unattended agent execution. Add these elements and the agent can operate for hours with only strategic check-ins.

So we completed these steps within the workflow:
Recommendation 1: Add Autonomous Decision Framework. 
    created comprehensive `BUILD-GUIDE.md`
    BUILD-GUIDE.md - Autonomous Agent Framework
        Full agent authority boundaries (CAN/MUST ASK/MUST STOP)
        Error recovery playbook with specific procedures
        Quality gates per step with measurable criteria
        Check-in protocol (after action, mid-block, daily summary)
        Integration contracts between actions with TypeScript schemas
        Working code examples for n8n nodes
        Rollback procedures with git checkpoints
        Added "Action Time Budgets" section to BUILD-GUIDE.md
        Includes:
            High-level action budgets (5-30 minutes)
            Per-step granular budgets (1-20 minutes)
            Budget overrun protocol (2x = blocked, 3x = STOP)
            Common causes of delays
        Added "Git Commit Format" section to BUILD-GUIDE.md
        Includes:
            Standard format: [Action X.Y] Brief description
            Examples for all commit types (actions, steps, checkpoints, fixes, infra)
            Guidelines (present tense, specific, <72 chars)
            When to commit (required vs optional)
            Bad examples with explanations
Step 2: Create `PROGRESS.md` template
    PROGRESS.md - Progress Tracking Template
        Current state tracking
        Completed steps with timestamps
        Decisions log
        Issues tracker
        Learnings about X's UI
        Session history format
Step 3: Create `.context.json` template
    .context.json - Session Continuity
        Session metadata
        Progress state
        Accumulated learnings array
        Known selectors (placeholders for discovery)
        Environment health checks
        Known issues tracker
Step 4: Define X-specific selectors (requires reconnaissance of actual page)
Step 5: Add timeout budgets per action (e.g., "Action 2 should take 10-20min max")
Step 6: Create necessary directories
    ```markdown
    workflows/job-hunter/
    ├── data/
    │   ├── .backups/          ✅ Created
    │   ├── applications/      ✅ Created
    │   ├── extracts/          ✅ Created
    │   ├── pending_jobs.json  ✅ Initialized (empty)
    │   └── applied_jobs.json  ✅ Initialized (empty)
    ├── scripts/
    │   └── validate-data.sh   ✅ Created
    └── debug/                 ✅ Created
    ```
Step 7: Create validation scripts agent can run: `./scripts/validate-data.sh`
    scripts/validate-data.sh - Validation Script
        File existence checks
        JSON syntax validation
        Schema version verification
        Duplicate detection (within and across files)
        Required fields validation
        URL format validation
        File size sanity checks
        Statistics reporting
Step 8: Add test data for offline testing (mocked pending_jobs.json, etc.)
    Added 3 sample jobs to `pending_jobs.json`
    Added 2 sample jobs to `applied_jobs.json`
    Both files now have proper schema structure with version, updated_at, and jobs array
Step 9: Define commit message format: `[Action X.Y] Description`

### And we can close those gaps...
...with autonomous agents.

`design/05-autonomous-agent-execution.md`
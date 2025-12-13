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


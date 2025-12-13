# Build Job Hunter Workflow - Iterative Development Prompt

## Context

You are building the **job-hunter** workflow for n8n. The workflow automates discovering, evaluating, and preparing applications for remote Python developer jobs on X (Twitter) Jobs.

**Read these files first:**
1. `.cursor/rules.md` and ingest the files sequentially. confirm each task completed in this step
2. `workflows/job-hunter/README.md` - Overview and purpose
3. `workflows/job-hunter/ACTIONS.md` - Detailed 5-action breakdown

## Development Philosophy

### Incremental Delivery
Build ONE action at a time. Each action must be:
- **Testable in isolation** - Can run without other actions
- **Observable** - Use browser tools to verify behavior
- **Persistent** - Saves state to files for next action

### Test-Driven Iteration
For each step within an action:
1. **Implement** the minimal code
2. **Execute** in n8n (manually trigger)
3. **Observe** using browser tools (snapshot, console logs, network)
4. **Verify** output matches expected schema
5. **Fix** any issues before moving to next step

### Browser Tools Usage
You have access to browser tools. USE THEM:
- `mcp_cursor-ide-browser_browser_navigate` - Go to URLs
- `mcp_cursor-ide-browser_browser_snapshot` - See page state (preferred over screenshot)
- `mcp_cursor-ide-browser_browser_click` - Interact with elements
- `mcp_cursor-ide-browser_browser_type` - Enter text
- `mcp_browser-tools_getConsoleLogs` - Debug JavaScript
- `mcp_browser-tools_getNetworkLogs` - See API calls

**After every workflow execution, take a snapshot to verify results.**

---

## Build Order

### Phase 1: Action 1 - Session Setup (Assisted)

**Goal:** Get browser to X Jobs page with authenticated session.

#### Step 1.1: Navigate to X.com
```
Workflow: Manual Trigger → Code Node (navigate)
Test: Snapshot shows X homepage
```

#### Step 1.2: Verify Login State
```
Workflow: ... → Code Node (check auth)
Test: Snapshot shows profile icon OR login prompt
Output: { loggedIn: true/false }
```

#### Step 1.3: Navigate to Jobs with Filters
```
Workflow: ... → Code Node (navigate to jobs URL)
Test: Snapshot shows job listings
URL: https://x.com/jobs?q=python&lstr=remote&sr=junior,mid_level,senior&ltype=remote
```

**Deliverable:** Working workflow that lands on X Jobs page.
**Checkpoint:** Save workflow, commit to git.

---

### Phase 2: Action 2 - Discovery & Filtering (Full Auto)

**Goal:** Extract job listings, filter against applied, save new jobs.

#### Step 2.1: Extract Job Cards from DOM
```
Workflow: Manual Trigger → Code Node (parse jobs)
Test: Console log shows array of job objects
Schema: { job_id, title, company, url }
```

#### Step 2.2: Load Applied Jobs
```
Workflow: ... → Read File Node (applied_jobs.json)
Test: Returns array (empty initially)
```

#### Step 2.3: Filter New Jobs
```
Workflow: ... → Code Node (filter)
Test: Console log shows "Found X new, Y already applied"
```

#### Step 2.4: Save to Pending
```
Workflow: ... → Write File Node (pending_jobs.json)
Test: File contains new jobs array
Verify: cat workflows/job-hunter/data/pending_jobs.json | jq length
```

**Deliverable:** Workflow that discovers new jobs and saves to pending.
**Checkpoint:** Save workflow, commit to git.

---

### Phase 3: Action 3 - Job Extraction (Full Auto)

**Goal:** Navigate to each pending job, extract full details.

#### Step 3.1: Load Pending Jobs
```
Workflow: Manual Trigger → Read File Node (pending_jobs.json)
Test: Returns array of pending jobs
```

#### Step 3.2: Loop Through Jobs
```
Workflow: ... → Split In Batches Node (batch size: 1)
Test: Processes one job at a time
```

#### Step 3.3: Navigate to Job Detail
```
Workflow: ... → Code Node (navigate to job.url)
Test: Snapshot shows job detail page
```

#### Step 3.4: Extract Full Details
```
Workflow: ... → Code Node (parse job detail)
Test: Console log shows complete job object
Schema: { job_id, title, company, description, requirements, apply_url, ... }
```

#### Step 3.5: Save Extract
```
Workflow: ... → Write File Node (extracts/{job_id}.json)
Test: File created with full job data
Verify: ls workflows/job-hunter/data/extracts/
```

**Deliverable:** Workflow that extracts full details for pending jobs.
**Checkpoint:** Save workflow, commit to git.

---

### Phase 4: Action 4 - Evaluation & Prep (Assisted)

**Goal:** Score job fit, generate application materials.

#### Step 4.1: Load Extract and Resume
```
Workflow: Manual Trigger → Read File Nodes (extract, resume)
Test: Both loaded into workflow
```

#### Step 4.2: Score Job Fit
```
Workflow: ... → Code Node (scoring logic)
Test: Returns { score: 8, matches: [...], gaps: [...] }
```

#### Step 4.3: Check Red Flags
```
Workflow: ... → Code Node (red flag detection)
Test: Returns { redFlags: [] } or list of concerns
```

#### Step 4.4: Generate Materials
```
Workflow: ... → AI Node (generate cover letter points)
Test: Returns markdown with talking points
Output: Save to data/applications/{job_id}.md
```

**Deliverable:** Workflow that evaluates jobs and generates prep materials.
**Checkpoint:** Save workflow, commit to git.

---

### Phase 5: Action 5 - Apply & Track (Manual)

**Goal:** Open apply URL, track application status.

#### Step 5.1: Open Apply URL
```
Workflow: Manual Trigger → Code Node (navigate to apply_url)
Test: Snapshot shows application form
```

#### Step 5.2: Record Application (after manual submit)
```
Workflow: Manual Trigger → Code Node (update tracking)
Process: Move job from pending to applied
Test: applied_jobs.json updated
```

#### Step 5.3: Set Follow-up
```
Workflow: ... → Code Node (calculate follow-up date)
Test: Job record has follow_up_date
```

**Deliverable:** Tracking workflow for completed applications.
**Checkpoint:** Save workflow, commit to git.

---

## Testing Protocol

### Before Each Step
1. Ensure n8n is running: `lsof -i :5678`
2. Navigate browser to n8n: http://localhost:5678
3. Open the workflow being tested

### After Each Step
1. Execute the workflow (click "Test Workflow" or manual trigger)
2. **Take browser snapshot** to see results
3. **Check console logs** for errors
4. **Verify file outputs** if applicable
5. Document any issues

### Debugging Checklist
- [ ] Browser snapshot shows expected page?
- [ ] Console has no errors?
- [ ] Network requests succeeded?
- [ ] Output data matches schema?
- [ ] Files written correctly?

---

## File Locations

```
workflows/job-hunter/
├── data/
│   ├── applied_jobs.json      # Jobs already applied to
│   ├── pending_jobs.json      # Jobs awaiting processing
│   ├── extracts/              # Full job details
│   │   └── {job_id}.json
│   └── applications/          # Generated materials
│       └── {job_id}.md
├── config.example.json        # Search parameters
├── README.md                  # Workflow overview
└── ACTIONS.md                 # Step-by-step breakdown
```

---

## n8n Code Node Patterns

### Accessing Browser (Playwright via MCP)
```javascript
// Use browser tools MCP, not direct Playwright
// The browser is controlled via Cursor's MCP connection
// Code nodes handle data transformation, not browser control
```

### Reading Input Data
```javascript
const items = $input.all();
const job = items[0].json;
console.log('Processing job:', job.job_id);
```

### Returning Data
```javascript
// Always return array of items
return items.map(item => ({
  json: {
    ...item.json,
    processedAt: new Date().toISOString()
  }
}));
```

### Error Handling
```javascript
const items = $input.all();
if (!items || items.length === 0) {
  throw new Error('No input items: Check previous node output');
}
```

---

## Commands Reference

```bash
# Check n8n status
lsof -i :5678

# Start n8n
cd /Volumes/VRMini/n8n && ./start-n8n.sh

# View pending jobs
cat workflows/job-hunter/data/pending_jobs.json | jq length

# View applied jobs
cat workflows/job-hunter/data/applied_jobs.json | jq '.[].company'

# List extracts
ls workflows/job-hunter/data/extracts/

# View specific extract
cat workflows/job-hunter/data/extracts/{job_id}.json | jq
```

---

## Success Criteria

### Per Action
- [ ] All steps execute without errors
- [ ] Output matches documented schema
- [ ] Files persist correctly
- [ ] Can be triggered independently

### Overall Workflow
- [ ] Actions chain together correctly
- [ ] Data flows from discovery → extraction → evaluation
- [ ] Tracking accurately reflects job status
- [ ] User can intervene at assisted steps

---

## Notes for AI Assistant

1. **One step at a time.** Don't try to build everything at once.

2. **Verify with browser tools.** After every change, snapshot the page.

3. **Log liberally.** Use `console.log()` in code nodes - you can see output via browser tools.

4. **Save state.** Each action should save its output to files so the next action can pick up.

5. **Ask before assuming.** If X's page structure is unclear, snapshot and analyze before writing extraction code.

6. **Commit often.** After each working action, commit to git.

7. **The browser is shared.** You control it via MCP tools. The user may also be looking at it.

8. **Test with real data.** Use actual X Jobs page, not mocked data.


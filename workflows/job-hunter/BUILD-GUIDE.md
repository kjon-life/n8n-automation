# Build Job Hunter Workflow - Autonomous Agent Guide

## Context

You are building the **job-hunter** workflow for n8n. The workflow automates discovering, evaluating, and preparing applications for remote Python developer jobs on X (Twitter) Jobs.

**Read these files first:**
1. `/Volumes/VRMini/n8n/n8n-system-instructions.md` - System overview
2. `workflows/job-hunter/README.md` - Overview and purpose
3. `workflows/job-hunter/ACTIONS.md` - Detailed 5-action breakdown

---

## Agent Authority

### Agent CAN Decide:
- Selector strategies (CSS, XPath, text-based)
- Retry timing and counts (within reasonable limits: 3-5 retries, 2-10s delays)
- Code organization within nodes
- Variable naming and code style
- Error message formatting
- File naming patterns (within documented schema)
- Log verbosity and debug output format
- Minor adjustments to timeouts (<30s)

### Agent MUST Ask Before:
- Changing action sequence or dependencies
- Modifying data schema (breaking changes to JSON structure)
- Adding new external dependencies (npm packages, etc.)
- Changing file storage locations
- Architectural decisions affecting >1 action
- Discovering X's UI has fundamentally changed (requires strategy pivot)
- Changing authentication approach
- Modifying error recovery strategy
- Adding new data files beyond documented structure

### Agent MUST Stop and Report If:
- Blocked >15 minutes on same issue
- Same error occurs >3 times on same step
- Data schema validation fails repeatedly
- Browser tools become unavailable
- n8n won't start after troubleshooting
- X's page structure has changed significantly (>50% selectors broken)
- File system permissions prevent writes
- Disk space critically low
- Network connectivity issues persist

---

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
- `browser_navigate` - Go to URLs
- `browser_snapshot` - See page state (preferred over screenshot)
- `browser_click` - Interact with elements
- `browser_type` - Enter text
- `getConsoleLogs` - Debug JavaScript
- `getNetworkLogs` - See API calls

**After every workflow execution, take a snapshot to verify results.**

---

## Action Time Budgets

Each action has an estimated time budget. Use these to:
- Plan work sessions
- Detect when you're stuck (>2x budget = blocked)
- Report progress against expectations

| Action | Description | Time Budget | Notes |
|--------|-------------|-------------|-------|
| Action 1 | Session Setup | 5-10 minutes | One-time per session, browser positioning |
| Action 2 | Discovery & Filtering | 10-20 minutes | Full auto, includes extraction + dedup |
| Action 3 | Job Extraction | 15-30 minutes per job | Process in batches of 5 jobs |
| Action 4 | Evaluation & Prep | 10-15 minutes per job | Scoring + material generation |
| Action 5 | Apply & Track | 2-5 minutes per job | Manual step, just tracking |

### Per-Step Time Budgets

**Action 1 Steps:**
- 1.1 Navigate to X.com: 2-5 minutes
- 1.2 Verify Login: 2-3 minutes
- 1.3 Navigate to Jobs: 1-2 minutes

**Action 2 Steps:**
- 2.1 Extract Job Cards: 5-10 minutes (includes selector discovery)
- 2.2 Load Applied Jobs: 1 minute
- 2.3 Filter New Jobs: 2-3 minutes
- 2.4 Save to Pending: 1-2 minutes

**Action 3 Steps (per job):**
- 3.1 Load Pending: 1 minute
- 3.2 Loop Setup: 1 minute
- 3.3 Navigate to Detail: 1-2 minutes
- 3.4 Extract Full Details: 10-20 minutes (complex extraction)
- 3.5 Save Extract: 1 minute

**Action 4 Steps (per job):**
- 4.1 Load Extract & Resume: 1 minute
- 4.2 Score Job Fit: 3-5 minutes
- 4.3 Check Red Flags: 2-3 minutes
- 4.4 Generate Materials: 4-6 minutes

**Action 5 Steps (per job):**
- 5.1 Open Apply URL: 1 minute
- 5.2 Record Application: 1-2 minutes
- 5.3 Set Follow-up: 1 minute

### Budget Overrun Protocol

**If you exceed time budget:**
1. **<2x budget**: Continue, but note in PROGRESS.md why it took longer
2. **>2x budget**: You're stuck - initiate blocked report protocol
3. **>3x budget**: STOP - This is a critical issue requiring user intervention

**Common causes of overruns:**
- X's page structure changed (selectors broken)
- Network latency issues
- Complex debugging required
- Unforeseen edge cases in data

---

## Progress Tracking

### PROGRESS.md Format

Create/update `workflows/job-hunter/PROGRESS.md` after EVERY step:

```markdown
# Job Hunter Build Progress

## Current State
- **Active Action**: 2 (Discovery & Filtering)
- **Active Step**: 2.3 (Filter New Jobs)
- **Status**: Testing | Blocked | Complete
- **Last Updated**: 2024-01-15 14:32 CST
- **Blockers**: None | [Description]

## Completed Steps
- [x] 1.1 Navigate to X.com (2024-01-15 13:15) - 8min
- [x] 1.2 Verify Login State (2024-01-15 13:42) - 12min
- [x] 1.3 Navigate to Jobs (2024-01-15 14:01) - 5min
- [x] 2.1 Extract Job Cards (2024-01-15 14:15) - 18min
- [x] 2.2 Load Applied Jobs (2024-01-15 14:28) - 3min
- [ ] 2.3 Filter New Jobs (in progress)

## Decisions Made
- Using CSS selectors over XPath (better stability with X's dynamic DOM)
- 5-second timeout for page loads
- Retry failed requests 3x before escalating
- Job IDs extracted from URL pattern (more stable than data attributes)

## Issues Encountered
1. **X job cards lack stable IDs** 
   - Solution: Using data-testid pattern matching
   - Impact: May need updates if X changes attributes
   
2. **Session expires after 30min idle**
   - Solution: Added re-auth check before each major action
   - Impact: User must be available for re-auth

## Next Session Plan
- Complete Action 2 (Steps 2.3-2.4)
- Begin Action 3 if time permits
- Estimated: 1-2 hours
```

---

## Data Schemas

### pending_jobs.json
```json
{
  "version": "1.0",
  "updated_at": "2024-01-15T14:32:00Z",
  "jobs": [
    {
      "job_id": "1234567890",
      "discovered_at": "2024-01-15T14:15:00Z",
      "title": "Senior Python Developer",
      "company": "Example Corp",
      "url": "https://x.com/jobs/1234567890",
      "location": "Remote",
      "salary_range": "$120k-$180k"
    }
  ]
}
```

**Validation Rules:**
- `version`: Must be "1.0"
- `updated_at`: Must be valid ISO 8601 timestamp
- `job_id`: Required, must be unique across pending + applied, string
- `discovered_at`: Required, valid ISO 8601
- `title`: Required, non-empty string
- `company`: Required, non-empty string
- `url`: Required, must start with "https://x.com/jobs/"
- `location`: Optional, string
- `salary_range`: Optional, string

### applied_jobs.json
```json
{
  "version": "1.0",
  "updated_at": "2024-01-15T18:00:00Z",
  "jobs": [
    {
      "job_id": "1234567890",
      "discovered_at": "2024-01-15T14:15:00Z",
      "applied_at": "2024-01-15T17:45:00Z",
      "title": "Senior Python Developer",
      "company": "Example Corp",
      "url": "https://x.com/jobs/1234567890",
      "application_method": "X Jobs Form | External Link",
      "status": "submitted | rejected | interviewing",
      "follow_up_date": "2024-01-22T00:00:00Z",
      "notes": "Applied via X Jobs form. Good cultural fit."
    }
  ]
}
```

### extracts/{job_id}.json
```json
{
  "job_id": "1234567890",
  "extracted_at": "2024-01-15T15:30:00Z",
  "basic": {
    "title": "Senior Python Developer",
    "company": "Example Corp",
    "location": "Remote (US timezone preferred)",
    "type": "Full-time",
    "posted_date": "2024-01-10"
  },
  "details": {
    "description": "Full job description text...",
    "requirements": [
      "5+ years Python experience",
      "Django or Flask framework",
      "PostgreSQL expertise"
    ],
    "nice_to_have": [
      "FastAPI experience",
      "AWS deployment"
    ],
    "benefits": [
      "Health insurance",
      "401k matching",
      "Unlimited PTO"
    ]
  },
  "application": {
    "apply_url": "https://jobs.example.com/apply",
    "deadline": "2024-02-01",
    "company_url": "https://example.com"
  },
  "metadata": {
    "raw_html_preview": "First 500 chars of job page HTML...",
    "extraction_method": "CSS selectors | API | Manual"
  }
}
```

---

## Error Recovery Playbook

### Browser Won't Load X.com
1. Check network: `curl -I https://x.com`
2. Check browser tools MCP status
3. Restart browser tools MCP server
4. Try alternative URL: `https://twitter.com`
5. **If still fails after 3 attempts**: STOP and report (network/MCP issue)

### Session Expired
1. Detect: Snapshot shows login prompt OR redirect to login page
2. Take snapshot for verification
3. **Auto-recovery**: STOP and report - "Session expired, manual login required"
4. Never attempt auto-login (violates X TOS)
5. Wait for user to re-authenticate
6. Resume from last checkpoint

### Job Card Parsing Returns Empty Array
1. Take snapshot → save to `/Volumes/VRMini/n8n/workflows/job-hunter/debug/snapshot_[timestamp].txt`
2. Check console logs: `getConsoleLogs()`
3. Verify page loaded: Check for "Jobs" in page title
4. Check if filters cleared results (too narrow)
5. Retry with 5s delay (page may still be loading)
6. **If still empty after 3 tries**: STOP and report with snapshot (UI may have changed)

### File Write Fails
1. Check path exists: `ls -la /Volumes/VRMini/n8n/workflows/job-hunter/data/`
2. Check permissions: Should be writable
3. Check disk space: `df -h /Volumes/VRMini`
4. Try write to temp location: `/tmp/job-hunter-recovery/`
5. **If still fails**: STOP and report (filesystem issue)

### n8n Node Execution Error
1. Check n8n logs: `tail -50 /Volumes/VRMini/n8n/data/logs/n8n.log`
2. Verify previous node output format in n8n UI
3. Add defensive null checks in code
4. Log full error object: `console.error(JSON.stringify(error, null, 2))`
5. **If error persists >3 times**: STOP and report with:
   - Full error message
   - Node configuration
   - Input data sample
   - Relevant logs

### X Rate Limiting
1. Detect: HTTP 429 status OR "Rate limit exceeded" message
2. Log rate limit headers if available
3. Wait: Start with 60s, exponential backoff (60s → 120s → 300s)
4. Max 3 retries
5. **If persists**: STOP and report - "Rate limited, retry in 15 minutes"

---

## Quality Gates

Each step must pass ALL quality gates before proceeding.

### Step 1.1: Navigate to X.com
- [ ] Response time <10s
- [ ] Snapshot contains "X" or "Twitter" text
- [ ] No console errors logged
- [ ] URL is https://x.com or https://twitter.com
- [ ] Page title exists and non-empty

### Step 1.2: Verify Login State
- [ ] Detection completes in <5s
- [ ] Returns boolean `loggedIn` field
- [ ] If logged in: Profile element detected in snapshot
- [ ] If not logged in: Login button detected
- [ ] No false positives (verified manually once)

### Step 1.3: Navigate to Jobs with Filters
- [ ] URL matches expected pattern
- [ ] Page loads in <10s
- [ ] "Jobs" appears in page title or main heading
- [ ] At least 1 job card visible in snapshot OR "No results" message
- [ ] Filter chips visible (python, remote, etc.)

### Step 2.1: Extract Job Cards from DOM
- [ ] Returns 1-50 jobs (reasonable range for filtered search)
- [ ] Each job has all required fields (job_id, title, company, url)
- [ ] job_id format validates (10-digit numeric string)
- [ ] No duplicate job_ids in batch
- [ ] Extraction completes in <15s
- [ ] All URLs are valid (start with https://x.com/jobs/)
- [ ] No null/undefined values in required fields

### Step 2.2: Load Applied Jobs
- [ ] File loads successfully OR creates empty structure if missing
- [ ] JSON is valid (parseable)
- [ ] Schema version matches (1.0)
- [ ] All job_ids are strings
- [ ] No duplicate job_ids within file

### Step 2.3: Filter New Jobs
- [ ] Returns 0-50 new jobs (subset of discovered)
- [ ] Deduplication logic verified (no applied jobs in result)
- [ ] Logs show: "Total: X, Applied: Y, New: Z"
- [ ] Z = X - Y (math checks out)
- [ ] No false negatives (manually verify 1 known applied job filtered out)

### Step 2.4: Save to Pending
- [ ] File written successfully
- [ ] JSON is valid: `cat pending_jobs.json | jq empty` returns 0
- [ ] File size <1MB (sanity check)
- [ ] version field = "1.0"
- [ ] updated_at is current timestamp
- [ ] Jobs array is deduplicated (no duplicate job_ids)
- [ ] Backup created before overwrite

---

## Check-in Protocol

### After Each Action Completes
```
✅ Action [N] Complete: [Action Name]

**Completed Steps**: [List]
**Time Elapsed**: [X] minutes
**Quality Gates**: [X/Y] passed
**Issues Encountered**: [Summary or "None"]
**Files Changed**: [List paths]
**Git Commits**: [Count]
**Next Action**: [Name]

**Key Learnings**:
- [Finding 1]
- [Finding 2]

**Ready to proceed with Action [N+1]? (y/n)**
```

### Mid-Action Blocked Report
Triggered after 15 minutes stuck on same issue:
```
⚠️  BLOCKED on Step [X.Y]: [Step Name]

**Issue**: [One-line description]

**Attempted Solutions** (in order):
1. [Attempt 1] - Result: [Failed/Partial]
2. [Attempt 2] - Result: [Failed/Partial]  
3. [Attempt 3] - Result: [Failed/Partial]

**Error Logs**:
```
[Paste relevant error output, max 20 lines]
```

**Hypothesis**: [What you think is wrong]

**Suggested Next Steps**:
- Option A: [Description]
- Option B: [Description]

**Need Decision**: [What user needs to decide]
**Estimated Impact**: [How this affects timeline]
```

### Daily Summary
At end of work session (or every 4 hours):
```
📊 Session Summary - [Date] [Start Time] to [End Time]

**Duration**: [X] hours [Y] minutes

**Completed**:
- Actions: [List completed actions]
- Steps: [X/Y] total steps
- Quality Gates: [X/Y] passed on first try

**In Progress**:
- Action [N]: Step [N.Y] - [Status]

**Blockers Resolved**: [Count]
- [Brief description of each]

**Blockers Outstanding**: [Count]
- [Brief description if any]

**Git Activity**:
- Commits: [Count]
- Files changed: [Count]
- Lines added: [Count]

**Key Accomplishments**:
1. [Achievement 1]
2. [Achievement 2]

**Tomorrow's Plan**:
- Resume at: Step [X.Y]
- Goal: Complete Action [N]
- Estimated time: [X] hours

**Context for Next Session**:
- [Important note 1]
- [Important note 2]
```

---

## Session Context File

Create/update `.context.json` at start and end of each session:

```json
{
  "session": {
    "started_at": "2024-01-15T13:00:00Z",
    "last_updated": "2024-01-15T17:30:00Z",
    "status": "in_progress"
  },
  "progress": {
    "current_action": 2,
    "current_step": "2.3",
    "next_step": "2.4",
    "completed_actions": [1],
    "total_steps_completed": 8,
    "estimated_completion": "2024-01-17"
  },
  "accumulated_learnings": [
    "X job cards use data-testid='job-card-{id}' pattern",
    "Session expires after 30min idle - need re-auth check",
    "Job IDs are 10-digit numeric strings extracted from URLs",
    "Applied filter checkbox requires explicit wait for 2-3s",
    "X loads jobs progressively - wait for scroll to bottom",
    "Company logos load async - don't rely on them for extraction"
  ],
  "known_selectors": {
    "job_card": "[data-testid^='job-card-']",
    "job_title": "[data-testid='job-title']",
    "company_name": "[data-testid='company-name']",
    "location": "[data-testid='location']",
    "job_link": "a[href^='/jobs/']",
    "apply_button": "[data-testid='apply-button']"
  },
  "environment": {
    "n8n_running": true,
    "n8n_url": "http://localhost:5678",
    "browser_tools_connected": true,
    "files_writable": true,
    "disk_space_ok": true,
    "last_health_check": "2024-01-15T17:25:00Z"
  },
  "known_issues": [
    {
      "issue": "Job card pagination requires manual scroll",
      "workaround": "Extract first page only (20-25 jobs)",
      "permanent": false
    }
  ]
}
```

**Agent responsibilities:**
- Read this file at session start
- Update `last_updated` after each step
- Add learnings as discovered
- Update selectors when changed
- Check environment health every 30min

---

## Action Integration Contracts

### Action 1 → Action 2
**Output**: Browser session (ephemeral)  
**Side Effects**: Browser positioned at X Jobs page with filters applied  
**Required State**: User authenticated (manual verification required)  
**Handoff File**: None (browser state only)

### Action 2 → Action 3
**Output File**: `pending_jobs.json`  
**Contract**:
```typescript
interface PendingJobsOutput {
  version: "1.0";
  updated_at: string; // ISO 8601
  jobs: Array<{
    job_id: string;        // Required: 10-digit numeric
    discovered_at: string; // Required: ISO 8601
    title: string;         // Required: non-empty
    company: string;       // Required: non-empty
    url: string;           // Required: https://x.com/jobs/[id]
    location?: string;     // Optional
    salary_range?: string; // Optional
  }>;
}
```
**Validation**: Action 3 MUST validate schema before processing  
**Side Effects**: Browser still on Jobs list page

### Action 3 → Action 4
**Output Files**: `extracts/{job_id}.json` (one per job)  
**Contract**: See "Data Schemas" section above  
**Side Effects**: Browser navigated away from Jobs list (needs re-navigation for Action 2)  
**Batch Size**: Process 5 jobs at a time, then pause for review

### Action 4 → Action 5
**Output Files**: `applications/{job_id}.md`  
**Contract**:
```markdown
# Application Package: [Company] - [Title]

## Job Details
- **Company**: [Name]
- **Title**: [Title]
- **Location**: [Location]
- **Posted**: [Date]
- **Deadline**: [Date or "None specified"]

## Fit Score: [X]/10

### Strengths
- [Match point 1]
- [Match point 2]

### Gaps
- [Gap 1 - with mitigation strategy]

## Cover Letter Points
1. [Key point 1 - why them]
2. [Key point 2 - why you]
3. [Key point 3 - specific contribution]

## Red Flags
- [Any concerns or "None detected"]

## Application Strategy
[Recommended approach]
```

---

## Build Order

### Phase 1: Action 1 - Session Setup (Assisted)

**Goal**: Get browser to X Jobs page with authenticated session.

#### Step 1.1: Navigate to X.com
- Workflow: Manual Trigger → Code Node (navigate via browser tool)
- Test: Snapshot shows X homepage
- Quality gates: Response time, page title, no errors
- Estimated time: 5-10 minutes

#### Step 1.2: Verify Login State  
- Workflow: → Code Node (check auth state)
- Test: Snapshot shows profile icon OR login prompt
- Output: `{ loggedIn: boolean, username?: string }`
- Estimated time: 10-15 minutes

#### Step 1.3: Navigate to Jobs with Filters
- Workflow: → Code Node (navigate to jobs URL with query params)
- Test: Snapshot shows job listings page
- URL: `https://x.com/jobs?q=python&lstr=remote&sr=junior%2Cmid_level%2Csenior&ltype=remote`
- Estimated time: 5-10 minutes

**Deliverable**: Working workflow that lands on X Jobs page  
**Checkpoint**: 
- Update PROGRESS.md
- Commit: `git commit -m "[Action 1] Session setup complete"`
- Update .context.json

---

### Phase 2: Action 2 - Discovery & Filtering (Full Auto)

**Goal**: Extract job listings, filter against applied, save new jobs.

#### Step 2.1: Extract Job Cards from DOM
- Workflow: Manual Trigger → Code Node (parse jobs from snapshot)
- Test: Console log shows array of job objects
- Schema: `{ job_id, title, company, url }`
- Estimated time: 20-30 minutes (includes selector discovery)

#### Step 2.2: Load Applied Jobs
- Workflow: → Read File Node (`applied_jobs.json`)
- Test: Returns array (empty initially or existing data)
- Estimated time: 5 minutes

#### Step 2.3: Filter New Jobs
- Workflow: → Code Node (deduplication logic)
- Test: Console shows "Found X new, Y already applied"
- Estimated time: 10-15 minutes

#### Step 2.4: Save to Pending
- Workflow: → Write File Node (`pending_jobs.json`)
- Test: File contains new jobs array, validated with jq
- Command: `cat workflows/job-hunter/data/pending_jobs.json | jq length`
- Estimated time: 10 minutes

**Deliverable**: Workflow that discovers new jobs and saves to pending  
**Checkpoint**: Same as Phase 1

---

### Phase 3: Action 3 - Job Extraction (Full Auto)

**Goal**: Navigate to each pending job, extract full details.

#### Step 3.1: Load Pending Jobs
- Workflow: Manual Trigger → Read File Node
- Test: Returns array of pending jobs
- Estimated time: 5 minutes

#### Step 3.2: Loop Through Jobs
- Workflow: → Split In Batches Node (batch size: 1)
- Test: Processes one job at a time
- Estimated time: 10 minutes

#### Step 3.3: Navigate to Job Detail
- Workflow: → Code Node (navigate to job.url)
- Test: Snapshot shows job detail page
- Estimated time: 10 minutes

#### Step 3.4: Extract Full Details
- Workflow: → Code Node (parse job detail page)
- Test: Console log shows complete job object
- Schema: See "Data Schemas" section
- Estimated time: 30-45 minutes (complex extraction)

#### Step 3.5: Save Extract
- Workflow: → Write File Node (`extracts/{job_id}.json`)
- Test: File created with full job data
- Command: `ls workflows/job-hunter/data/extracts/`
- Estimated time: 10 minutes

**Deliverable**: Workflow that extracts full details for pending jobs  
**Checkpoint**: Same as Phase 1

---

### Phase 4: Action 4 - Evaluation & Prep (Assisted)

**Goal**: Score job fit, generate application materials.

#### Step 4.1: Load Extract and Resume
- Workflow: Manual Trigger → Read File Nodes
- Test: Both files loaded successfully
- Estimated time: 10 minutes

#### Step 4.2: Score Job Fit
- Workflow: → Code Node (scoring algorithm)
- Test: Returns `{ score: number, matches: string[], gaps: string[] }`
- Estimated time: 20-30 minutes

#### Step 4.3: Check Red Flags
- Workflow: → Code Node (red flag detection)
- Test: Returns `{ redFlags: string[] }`
- Examples: Unpaid, crypto/web3 spam, unrealistic requirements
- Estimated time: 15-20 minutes

#### Step 4.4: Generate Materials
- Workflow: → AI Node OR Code Node with template
- Test: Returns markdown with cover letter points
- Output: Save to `data/applications/{job_id}.md`
- Estimated time: 20-30 minutes

**Deliverable**: Workflow that evaluates jobs and generates prep materials  
**Checkpoint**: Same as Phase 1

---

### Phase 5: Action 5 - Apply & Track (Manual)

**Goal**: Open apply URL, track application status.

#### Step 5.1: Open Apply URL
- Workflow: Manual Trigger → Code Node (navigate)
- Test: Snapshot shows application form or external site
- Estimated time: 10 minutes

#### Step 5.2: Record Application
- Workflow: Manual Trigger (after user applies) → Code Node
- Process: Move job from pending to applied
- Test: `applied_jobs.json` updated, `pending_jobs.json` updated
- Estimated time: 15-20 minutes

#### Step 5.3: Set Follow-up
- Workflow: → Code Node (calculate follow-up date)
- Test: Job record has `follow_up_date` (7 days from application)
- Estimated time: 10 minutes

**Deliverable**: Tracking workflow for completed applications  
**Checkpoint**: Same as Phase 1

---

## n8n Code Node Patterns

### Pattern: Extract Job Cards (Step 2.1)

**DO NOT use Playwright directly**. n8n Code nodes can't access browser. Instead:

1. Use browser tool to take snapshot OUTSIDE workflow
2. Parse snapshot data in Code node

```javascript
// In n8n Code node - receives snapshot data as input
const items = $input.all();
const snapshotData = items[0].json.snapshot; // Passed from previous step

const jobs = [];

// Parse snapshot accessibility tree or HTML
// Look for job card patterns
const jobElements = snapshotData.children || [];

for (const el of jobElements) {
  try {
    // Extract from element structure
    const job = {
      job_id: extractJobId(el),
      discovered_at: new Date().toISOString(),
      title: el.title || '',
      company: el.company || '',
      url: el.url || '',
      location: el.location || 'Remote'
    };
    
    // Validate required fields
    if (!job.job_id || !job.title || !job.company || !job.url) {
      console.error('Incomplete job data:', job);
      continue;
    }
    
    // Validate URL format
    if (!job.url.startsWith('https://x.com/jobs/')) {
      console.error('Invalid URL format:', job.url);
      continue;
    }
    
    jobs.push(job);
  } catch (error) {
    console.error('Failed to parse job element:', error.message);
  }
}

console.log(`Extracted ${jobs.length} jobs`);

// Validate no duplicates
const uniqueIds = new Set(jobs.map(j => j.job_id));
if (uniqueIds.size !== jobs.length) {
  throw new Error('Duplicate job_ids detected in extraction!');
}

return [{ json: { jobs } }];

// Helper function
function extractJobId(element) {
  // Try multiple strategies
  const fromUrl = element.url?.match(/\/jobs\/(\d+)/)?.[1];
  const fromDataAttr = element.attributes?.['data-job-id'];
  return fromUrl || fromDataAttr || null;
}
```

### Pattern: Filter Against Applied (Step 2.3)

```javascript
const items = $input.all();
const discoveredJobs = items[0].json.jobs || [];

// Load applied jobs from previous node
const appliedData = $node["Read Applied Jobs"].json;
const appliedJobs = appliedData.jobs || [];

// Create Set for fast lookup
const appliedIds = new Set(appliedJobs.map(j => j.job_id));

console.log(`Applied jobs in database: ${appliedIds.size}`);

// Filter out already applied
const newJobs = discoveredJobs.filter(job => {
  const isNew = !appliedIds.has(job.job_id);
  if (!isNew) {
    console.log(`Filtering out already applied: ${job.job_id} - ${job.title}`);
  }
  return isNew;
});

console.log(`Total discovered: ${discoveredJobs.length}`);
console.log(`Already applied: ${discoveredJobs.length - newJobs.length}`);
console.log(`New jobs: ${newJobs.length}`);

// Validate deduplication worked
const uniqueIds = new Set(newJobs.map(j => j.job_id));
if (uniqueIds.size !== newJobs.length) {
  throw new Error('Duplicate job_ids detected in new jobs!');
}

// Return in schema format
return [{
  json: {
    version: "1.0",
    updated_at: new Date().toISOString(),
    jobs: newJobs
  }
}];
```

### Pattern: Save with Backup (Step 2.4)

```javascript
const items = $input.all();
const newData = items[0].json;

// Validate schema
if (!newData.version || !newData.updated_at || !Array.isArray(newData.jobs)) {
  throw new Error('Invalid data schema for pending_jobs.json');
}

// Validate each job
for (const job of newData.jobs) {
  if (!job.job_id || !job.title || !job.company || !job.url) {
    throw new Error(`Invalid job object: ${JSON.stringify(job)}`);
  }
}

// In n8n, you'll need to:
// 1. Use "Read/Write Files" node or HTTP Request to file system
// 2. Or use Execute Command node to run bash

// For now, return formatted data for Write File node
return [{
  json: {
    fileName: 'pending_jobs.json',
    data: JSON.stringify(newData, null, 2)
  }
}];
```

### Pattern: Job Fit Scoring (Step 4.2)

```javascript
const items = $input.all();
const jobExtract = items[0].json;
const resume = items[1].json; // Assuming resume loaded in previous node

let score = 0;
const matches = [];
const gaps = [];

// Check required skills
const requirements = jobExtract.details?.requirements || [];
const mySkills = resume.skills || [];

for (const req of requirements) {
  const reqLower = req.toLowerCase();
  
  // Check if requirement matches any of my skills
  const hasSkill = mySkills.some(skill => 
    reqLower.includes(skill.toLowerCase()) || 
    skill.toLowerCase().includes(reqLower)
  );
  
  if (hasSkill) {
    score += 2;
    matches.push(req);
  } else {
    gaps.push(req);
  }
}

// Check experience level
const title = jobExtract.basic?.title?.toLowerCase() || '';
const myYearsExp = resume.years_experience || 0;

if (title.includes('senior') && myYearsExp >= 5) {
  score += 2;
  matches.push('Experience level matches (Senior)');
} else if (title.includes('mid') && myYearsExp >= 2) {
  score += 2;
  matches.push('Experience level matches (Mid)');
} else if (title.includes('junior') && myYearsExp >= 0) {
  score += 1;
  matches.push('Experience level matches (Junior)');
}

// Location match
if (jobExtract.basic?.location?.toLowerCase().includes('remote')) {
  score += 1;
  matches.push('Remote position (preferred)');
}

// Normalize score to 0-10
const maxScore = (requirements.length * 2) + 3; // +3 for experience and remote
const normalizedScore = Math.min(10, Math.round((score / maxScore) * 10));

console.log(`Score: ${normalizedScore}/10`);
console.log(`Matches: ${matches.length}`);
console.log(`Gaps: ${gaps.length}`);

return [{
  json: {
    job_id: jobExtract.job_id,
    score: normalizedScore,
    matches,
    gaps,
    scored_at: new Date().toISOString()
  }
}];
```

---

## Git Commit Format

**All commits must follow this format:**

```
[Action X.Y] Brief description
```

### Examples:

**Action completion:**
```bash
git commit -m "[Action 1] Session setup complete"
git commit -m "[Action 2] Discovery and filtering implemented"
```

**Step completion:**
```bash
git commit -m "[Action 2.1] Extract job cards from X Jobs page"
git commit -m "[Action 2.3] Add job deduplication logic"
git commit -m "[Action 3.4] Implement full job detail extraction"
```

**Checkpoint commits:**
```bash
git commit -m "[Checkpoint] Before Action 3 - Full job extraction"
git commit -m "[Checkpoint] Before attempting X page navigation changes"
```

**Fix commits:**
```bash
git commit -m "[Action 2.1] Fix selector for job title extraction"
git commit -m "[Action 2.3] Fix duplicate detection bug"
```

**Infrastructure/tooling:**
```bash
git commit -m "[Infra] Add data validation script"
git commit -m "[Infra] Create backup directory structure"
git commit -m "[Docs] Update BUILD-GUIDE with timeout budgets"
```

### Commit Message Guidelines:

1. **Always include the [Action X.Y] prefix** (or [Checkpoint], [Infra], [Docs])
2. **Use present tense** ("Add" not "Added")
3. **Be specific** ("Fix job title selector" not "Fix bug")
4. **Keep under 72 characters** when possible
5. **Reference step numbers** from ACTIONS.md

### When to Commit:

**Required commits:**
- After each action completes (all steps done)
- After each step that modifies code or data files
- Before attempting risky changes (checkpoint)
- When leaving a working state for the day

**Optional commits:**
- After fixing bugs (even mid-step)
- After adding significant documentation
- When trying alternative approaches (branch)

### Bad Examples (Don't Do This):

```bash
# ❌ No action prefix
git commit -m "Fixed the thing"

# ❌ Too vague
git commit -m "[Action 2] Updates"

# ❌ Past tense
git commit -m "[Action 1.1] Navigated to X.com"

# ❌ Too long
git commit -m "[Action 3.4] Implemented the full job detail extraction logic including all required fields, optional fields, and proper error handling for various edge cases"
```

---

## Rollback Strategy

### Before Each Action
```bash
# Agent creates checkpoint
cd /Volumes/VRMini/n8n
git add -A
git commit -m "[Checkpoint] Before Action X Step Y - $(date +%Y%m%d_%H%M%S)"
git tag -a "checkpoint-$(date +%s)" -m "Auto checkpoint before Action X.Y"
```

### If Action Fails
```bash
# Agent reverts to last checkpoint
git reset --hard HEAD~1
git tag -d $(git tag | grep checkpoint | tail -1)

# Or revert to specific tag
git reset --hard checkpoint-[timestamp]
```

### Data File Backups

Before modifying any JSON file:
```bash
# Create backup with timestamp
cp /Volumes/VRMini/n8n/workflows/job-hunter/data/pending_jobs.json \
   /Volumes/VRMini/n8n/workflows/job-hunter/data/.backups/pending_jobs_$(date +%s).json

# Keep only last 5 backups
cd /Volumes/VRMini/n8n/workflows/job-hunter/data/.backups/
ls -t pending_jobs_*.json | tail -n +6 | xargs rm -f
```

---

## Validation Scripts

Create `workflows/job-hunter/scripts/validate-data.sh`:

```bash
#!/bin/bash
set -e

DATA_DIR="/Volumes/VRMini/n8n/workflows/job-hunter/data"

echo "Validating job-hunter data files..."

# Check files exist
for file in pending_jobs.json applied_jobs.json; do
  if [[ ! -f "$DATA_DIR/$file" ]]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Validate JSON syntax
for file in pending_jobs.json applied_jobs.json; do
  if ! jq empty "$DATA_DIR/$file" 2>/dev/null; then
    echo "❌ Invalid JSON: $file"
    exit 1
  fi
  echo "✅ Valid JSON: $file"
done

# Check schema version
for file in pending_jobs.json applied_jobs.json; do
  version=$(jq -r '.version' "$DATA_DIR/$file")
  if [[ "$version" != "1.0" ]]; then
    echo "❌ Invalid version in $file: $version"
    exit 1
  fi
done

# Check for duplicate job_ids across files
pending_ids=$(jq -r '.jobs[].job_id' "$DATA_DIR/pending_jobs.json" | sort)
applied_ids=$(jq -r '.jobs[].job_id' "$DATA_DIR/applied_jobs.json" | sort)

duplicates=$(comm -12 <(echo "$pending_ids") <(echo "$applied_ids"))
if [[ -n "$duplicates" ]]; then
  echo "❌ Duplicate job_ids found in pending and applied:"
  echo "$duplicates"
  exit 1
fi

echo "✅ No duplicate job_ids across files"

# Check file sizes (sanity check)
for file in pending_jobs.json applied_jobs.json; do
  size=$(stat -f%z "$DATA_DIR/$file")
  if (( size > 10485760 )); then  # 10MB
    echo "⚠️  Warning: $file is larger than 10MB ($size bytes)"
  fi
done

echo ""
echo "📊 Statistics:"
echo "  Pending jobs: $(jq '.jobs | length' "$DATA_DIR/pending_jobs.json")"
echo "  Applied jobs: $(jq '.jobs | length' "$DATA_DIR/applied_jobs.json")"
echo "  Total tracked: $(( $(jq '.jobs | length' "$DATA_DIR/pending_jobs.json") + $(jq '.jobs | length' "$DATA_DIR/applied_jobs.json") ))"

echo ""
echo "✅ All validations passed!"
```

Make executable:
```bash
chmod +x /Volumes/VRMini/n8n/workflows/job-hunter/scripts/validate-data.sh
```

---

## Testing Protocol

### Before Each Step
1. Ensure n8n is running: `lsof -i :5678`
2. Navigate browser to n8n: http://localhost:5678
3. Open the workflow being tested
4. Verify environment: Check `.context.json` → `environment` section

### During Each Step
1. Execute the workflow (click "Test Workflow" or manual trigger)
2. **Take browser snapshot** immediately after execution
3. **Check console logs** for errors
4. **Verify file outputs** if applicable
5. **Run validation script** if data files changed
6. Document any issues in PROGRESS.md

### After Each Step
1. Update PROGRESS.md with completion status
2. Update .context.json with learnings
3. If step successful: Commit changes
4. If step failed: Document in PROGRESS.md, attempt fixes
5. Run quality gates checklist

### Debugging Checklist
- [ ] Browser snapshot shows expected page?
- [ ] Console has no JavaScript errors?
- [ ] Network requests succeeded (200/304 status)?
- [ ] Output data matches schema?
- [ ] Files written to correct location?
- [ ] File permissions correct?
- [ ] Validation script passes?
- [ ] Quality gates all green?

---

## File Locations Reference

```
/Volumes/VRMini/n8n/workflows/job-hunter/
├── data/
│   ├── applied_jobs.json           # Jobs already applied to
│   ├── pending_jobs.json           # Jobs awaiting processing
│   ├── .backups/                   # Timestamped backups
│   │   ├── pending_jobs_[ts].json
│   │   └── applied_jobs_[ts].json
│   ├── extracts/                   # Full job details
│   │   └── [job_id].json
│   └── applications/               # Generated materials
│       └── [job_id].md
├── scripts/
│   └── validate-data.sh            # Data validation script
├── debug/                          # Debug outputs
│   ├── snapshot_[timestamp].txt
│   └── error_logs_[timestamp].txt
├── config.example.json             # Search parameters
├── README.md                       # Workflow overview
├── ACTIONS.md                      # Step-by-step breakdown
├── BUILD-GUIDE.md                  # This file
├── PROGRESS.md                     # Build progress tracking
└── .context.json                   # Session context
```

---

## Commands Reference

```bash
# === n8n Management ===
# Check if running
lsof -i :5678

# Start n8n
cd /Volumes/VRMini/n8n && ./scripts/start-n8n.sh

# Stop n8n
cd /Volumes/VRMini/n8n && ./scripts/stop-n8n.sh

# === Data Inspection ===
# View pending jobs count
cat /Volumes/VRMini/n8n/workflows/job-hunter/data/pending_jobs.json | jq '.jobs | length'

# View applied jobs list
cat /Volumes/VRMini/n8n/workflows/job-hunter/data/applied_jobs.json | jq '.jobs[] | {id: .job_id, company: .company, title: .title}'

# List all extracts
ls -lh /Volumes/VRMini/n8n/workflows/job-hunter/data/extracts/

# View specific extract
cat /Volumes/VRMini/n8n/workflows/job-hunter/data/extracts/1234567890.json | jq

# === Validation ===
# Run validation script
/Volumes/VRMini/n8n/workflows/job-hunter/scripts/validate-data.sh

# Validate JSON syntax
jq empty /Volumes/VRMini/n8n/workflows/job-hunter/data/pending_jobs.json

# === Git ===
# Create checkpoint
cd /Volumes/VRMini/n8n
git add -A
git commit -m "Checkpoint: Action X.Y - Description"

# View recent commits
git log --oneline -10

# Revert to checkpoint
git reset --hard [commit-hash]

# === Backup ===
# Manual backup
cp /Volumes/VRMini/n8n/workflows/job-hunter/data/pending_jobs.json \
   /Volumes/VRMini/n8n/workflows/job-hunter/data/.backups/pending_jobs_manual_$(date +%Y%m%d_%H%M%S).json
```

---

## Success Criteria

### Per Action
- [ ] All steps execute without errors
- [ ] Output matches documented schema
- [ ] Files persist correctly
- [ ] Can be triggered independently
- [ ] Quality gates pass
- [ ] Changes committed to git
- [ ] PROGRESS.md updated
- [ ] .context.json updated

### Per Step
- [ ] Completes within estimated time (±50%)
- [ ] Passes all quality gates on first or second attempt
- [ ] Error handling works as expected
- [ ] Logs are clear and helpful
- [ ] Code is readable and maintainable

### Overall Workflow
- [ ] Actions chain together correctly
- [ ] Data flows: discovery → extraction → evaluation
- [ ] Tracking accurately reflects job status
- [ ] User can intervene at assisted steps
- [ ] No manual cleanup required between runs
- [ ] Validation script passes on all data files
- [ ] Works reliably for 10+ consecutive runs

---

## Notes for AI Assistant

1. **One step at a time** - Don't try to build everything at once

2. **Verify with browser tools** - After every change, snapshot the page

3. **Log liberally** - Use `console.log()` in code nodes for debugging

4. **Save state** - Each action saves output to files for next action

5. **Ask before assuming** - If X's page structure is unclear, snapshot first

6. **Commit often** - After each working step, commit to git

7. **Update PROGRESS.md** - After every step, document progress

8. **The browser is shared** - You control via MCP tools, user may watch

9. **Test with real data** - Use actual X Jobs page, not mocked data

10. **Follow the contracts** - Respect data schemas and integration contracts

11. **When blocked** - Follow error recovery playbook, report after 15min

12. **Check in regularly** - Use check-in protocol to keep user informed

13. **Read context on startup** - Always check `.context.json` first

14. **Validate everything** - Run validation script after data changes

15. **Don't break the build** - Use checkpoints, test before committing

---

## Emergency Contacts

If you encounter issues beyond error recovery playbook:

1. **Stop immediately** - Don't make things worse
2. **Take snapshot** - Capture current state
3. **Save logs** - Preserve error messages
4. **Report** - Use blocked report format
5. **Wait for user** - Don't guess at fixes for critical issues

Critical issues requiring immediate stop:
- Data corruption detected
- File system errors
- n8n won't start
- Browser tools disconnected
- Git repository corruption
- Disk space critically low

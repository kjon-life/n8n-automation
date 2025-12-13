# Job Hunter Workflow - Update & Enhancement Guide

## Purpose

This guide defines **reusable processes** for enhancing the job-hunter workflow after initial build. Use this for:
- API discovery and integration
- Data schema enrichment
- Code quality improvements
- Workflow restructuring
- Adding new capabilities

---

## Enhancement Decision Tree

```
Need to improve workflow?
│
├─ NEW capability needed? → Use "Adding New Workflows" process
├─ Existing data insufficient? → Use "Schema Enhancement" process
├─ Performance/quality issue? → Use "Code Quality" process
├─ Don't know what API calls to make? → Use "API Discovery" process
└─ Architecture needs changing? → Use "Workflow Restructuring" process
```

---

## Enhancement Categories

### 1. API Discovery Process

**When to use:**
- Existing browser automation is fragile
- Need real-time data not visible in DOM
- Want to bypass rate limits
- Found API endpoints but don't know schemas

**Process:**

#### Step 1: Reconnaissance
```bash
# Start browser with network logging
# In Cursor, use browser tools MCP with network monitoring
```

**In n8n workflow:**
1. Add HTTP Request node (disabled initially)
2. Navigate to target page with browser tools
3. Capture network traffic:
   ```javascript
   // Use browser tools MCP: getNetworkLogs
   const logs = await getNetworkLogs();
   ```

#### Step 2: Identify API Endpoints
```javascript
// Parse network logs for XHR/Fetch requests
const apiCalls = logs.filter(log => 
  log.type === 'xhr' || 
  log.type === 'fetch'
);

// Look for patterns like:
// - /api/jobs/search
// - /graphql (with query in body)
// - /v2/jobs/list
```

#### Step 3: Capture Request/Response
```javascript
// For each promising endpoint:
{
  url: "https://x.com/i/api/graphql/...",
  method: "POST",
  headers: {
    "authorization": "Bearer ...",
    "x-csrf-token": "...",
    "content-type": "application/json"
  },
  body: {
    // GraphQL query or REST params
  },
  response: {
    // Full response structure
  }
}
```

**Document in:** `workflows/job-hunter/api-discovery/[feature-name].md`

#### Step 4: Replicate in n8n
```javascript
// In HTTP Request node:
{
  "method": "POST",
  "url": "{{ $json.api_url }}",
  "authentication": "headerAuth",
  "headers": {
    "x-csrf-token": "{{ $json.csrf_token }}"
  },
  "body": {
    "operationName": "JobSearchQuery",
    "variables": { ... }
  }
}
```

#### Step 5: Validate Schema
```bash
# Save response to file
cat api-discovery/job-search-response.json | jq

# Compare with current schema
diff <(cat data/pending_jobs.json | jq '.jobs[0]') \
     <(cat api-discovery/job-search-response.json | jq '.data.jobs[0]')
```

#### Step 6: Update Extraction Logic
**Files to modify:**
- `scripts/parse-jobs-from-api.js` (new)
- Workflow nodes: Replace browser extraction with HTTP Request
- `.context.json`: Add API endpoints to known_apis section

**Testing:**
```bash
# Test API script standalone
node scripts/parse-jobs-from-api.js --dry-run

# Compare results with browser extraction
diff data/pending_jobs_browser.json data/pending_jobs_api.json
```

**Rollback plan:**
```bash
# Keep browser-based extraction as fallback
git tag api-migration-checkpoint
git commit -m "[API] Add API-based job extraction (browser fallback intact)"
```

---

### 2. Schema Enhancement Process

**When to use:**
- Need to track additional data (e.g., company history, application phases)
- Found missing fields after using workflow
- Want to enrich existing records with new data

**Process:**

#### Step 1: Define New Schema
```javascript
// Document in: workflows/job-hunter/schema-versions/v1.1.md

// Example: Add company application history
{
  "version": "1.1",  // Increment version
  "updated_at": "...",
  "jobs": [
    {
      // ... existing fields ...
      "company_history": {  // NEW
        "previous_applications": [
          {
            "job_id": "...",
            "applied_at": "...",
            "status": "rejected",
            "feedback": "Position filled internally",
            "interview_rounds": 2
          }
        ],
        "last_interaction": "2024-11-15T00:00:00Z",
        "overall_relationship": "neutral|positive|negative"
      },
      "application_phases": {  // NEW
        "current_phase": "screening|interview|offer|rejected",
        "phases_completed": [
          {
            "phase": "application_submitted",
            "completed_at": "...",
            "notes": "..."
          }
        ],
        "next_action": "Follow up on 2024-12-20",
        "next_action_date": "2024-12-20T00:00:00Z"
      }
    }
  ]
}
```

#### Step 2: Create Migration Script
```bash
# Create: scripts/migrate-to-v1.1.sh

#!/bin/bash
set -e

DATA_DIR="/Volumes/VRMini/n8n/workflows/job-hunter/data"

# Backup current data
cp "$DATA_DIR/pending_jobs.json" "$DATA_DIR/.backups/pending_jobs_pre_v1.1_$(date +%s).json"
cp "$DATA_DIR/applied_jobs.json" "$DATA_DIR/.backups/applied_jobs_pre_v1.1_$(date +%s).json"

# Migrate schema
cat "$DATA_DIR/pending_jobs.json" | jq '
  .version = "1.1" |
  .jobs[] |= . + {
    company_history: {
      previous_applications: [],
      last_interaction: null,
      overall_relationship: "neutral"
    },
    application_phases: {
      current_phase: "pending",
      phases_completed: [],
      next_action: null,
      next_action_date: null
    }
  }
' > "$DATA_DIR/pending_jobs_v1.1.json"

# Validate
jq empty "$DATA_DIR/pending_jobs_v1.1.json" && echo "✅ Valid JSON"

# Replace (manual confirmation required)
echo "Review pending_jobs_v1.1.json and run:"
echo "mv $DATA_DIR/pending_jobs_v1.1.json $DATA_DIR/pending_jobs.json"
```

#### Step 3: Update Validation Script
```bash
# Modify: scripts/validate-data.sh

# Add v1.1 schema checks
if [[ "$version" == "1.1" ]]; then
  # Check new fields exist
  jq -e '.jobs[] | has("company_history")' "$DATA_DIR/$file" > /dev/null || {
    echo "❌ Missing company_history field in $file"
    exit 1
  }
  
  jq -e '.jobs[] | has("application_phases")' "$DATA_DIR/$file" > /dev/null || {
    echo "❌ Missing application_phases field in $file"
    exit 1
  }
fi
```

#### Step 4: Update Workflow Nodes
**Files to modify:**
- All Read File / Write File nodes: Handle v1.0 and v1.1
- Add enrichment step: Check company history before saving
- Add phase tracking: Update current_phase as job progresses

**Example enrichment node:**
```javascript
// New Code node: "Enrich with Company History"
const items = $input.all();
const appliedJobs = $node["Load Applied Jobs"].json.jobs;

items.forEach(item => {
  const companyName = item.json.company;
  
  // Find previous applications to this company
  const previousApps = appliedJobs.filter(j => 
    j.company.toLowerCase() === companyName.toLowerCase()
  );
  
  if (previousApps.length > 0) {
    item.json.company_history = {
      previous_applications: previousApps.map(j => ({
        job_id: j.job_id,
        applied_at: j.applied_at,
        status: j.status,
        interview_rounds: j.interview_rounds || 0
      })),
      last_interaction: previousApps[0].applied_at,
      overall_relationship: calculateRelationship(previousApps)
    };
  }
});

return items;
```

#### Step 5: Update Documentation
**Files to update:**
- `README.md`: Mention v1.1 schema
- `BUILD-GUIDE.md`: Update data schema sections
- `UPDATE-GUIDE.md`: Add v1.1 to schema versions
- `.context.json`: Update schema version

#### Step 6: Test Migration
```bash
# Run migration on test data
cp data/pending_jobs.json /tmp/test_pending.json
./scripts/migrate-to-v1.1.sh

# Validate
./scripts/validate-data.sh

# Test workflow with new schema
# Trigger Action 2, verify company_history populated
```

**Rollback:**
```bash
# Restore from backup
cp data/.backups/pending_jobs_pre_v1.1_*.json data/pending_jobs.json
```

---

### 3. Code Quality & Standards

**When to use:**
- Code has grown messy
- Need to enforce standards
- Want to improve maintainability

**Process:**

#### Step 1: Define Standards
```javascript
// Document in: workflows/job-hunter/STANDARDS.md

## JavaScript Code Node Standards

### Naming Conventions
- Functions: camelCase (e.g., parseJobData)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_JOBS)
- Variables: camelCase (e.g., jobId)

### Error Handling
- Always validate input: if (!items || items.length === 0)
- Use descriptive errors: throw new Error('No jobs found: Check previous node')
- Log context: console.error('Failed to parse job:', { job_id, error })

### Code Structure
- Max 50 lines per function
- Extract helpers: parseJobName(), validateJobSchema()
- One responsibility per node

### Documentation
- Every function has JSDoc comment
- Complex logic has inline comments
- All assumptions documented
```

#### Step 2: Create Linting Script
```bash
# Create: scripts/lint-workflow.sh

#!/bin/bash

# Check for common issues in workflow nodes
echo "Linting workflow code nodes..."

# Example checks:
# - No hardcoded credentials
# - All error cases handled
# - Required fields validated
# - Proper logging

# This would parse exported workflow JSON and check code nodes
# For now, manual review checklist:

echo "Manual review checklist:"
echo "[ ] All Code nodes have error handling"
echo "[ ] All file operations have try/catch"
echo "[ ] All external calls have timeouts"
echo "[ ] All assumptions logged to console"
echo "[ ] No sensitive data in logs"
```

#### Step 3: Refactor Incrementally
**Process:**
1. Identify worst offender (longest, most complex node)
2. Extract into standalone script: `scripts/[task-name].js`
3. Test script standalone: `node scripts/[task-name].js`
4. Update workflow to call script (via Execute Command or inline)
5. Commit: `git commit -m "[Refactor] Extract job parsing to scripts/parse-jobs.js"`
6. Repeat for next node

**Example extraction:**
```javascript
// Before: 150-line Code node

// After: Code node
const { parseJobsFromSnapshot } = require('/Volumes/VRMini/n8n/workflows/job-hunter/scripts/parse-jobs.js');
const items = $input.all();
const snapshot = items[0].json.snapshot;
const jobs = parseJobsFromSnapshot(snapshot);
return [{ json: { jobs } }];

// scripts/parse-jobs.js now contains logic
// Can be tested independently
```

#### Step 4: Add Tests
```bash
# Create: scripts/test-parsers.sh

#!/bin/bash

# Test parse-jobs.js
echo "Testing job parser..."
node -e "
const { parseJobsFromSnapshot } = require('./scripts/parse-jobs.js');
const snapshot = require('./test-data/snapshot-sample.json');
const jobs = parseJobsFromSnapshot(snapshot);
console.assert(jobs.length > 0, 'Should parse jobs');
console.assert(jobs[0].job_id, 'Should have job_id');
console.log('✅ Parser tests passed');
"
```

#### Step 5: Document Improvements
**Update:**
- `PROGRESS.md`: Note refactoring completed
- `BUILD-GUIDE.md`: Reference new scripts
- `.context.json`: Update code_organization notes

---

### 4. Workflow Restructuring

**When to use:**
- Step is too complex (needs splitting)
- Multiple workflows needed (e.g., separate job-hunter-daily vs job-hunter-deep-dive)
- Actions need reordering

**Process:**

#### Step 1: Identify Restructuring Need

**Scenarios:**

**A. Split Complex Step**
```
Current: Action 3.4 (Extract Full Details) - 150 lines
Problem: Extracts job details + validates + enriches + scores

Should be:
- Action 3.4a: Extract raw details (basic extraction)
- Action 3.4b: Validate and clean (data validation)
- Action 3.4c: Enrich with external data (API calls)
```

**B. Create Parallel Workflow**
```
Current: job-hunter (handles discovery + extraction + application)
Problem: Daily discovery interferes with deep job research

Create:
- job-hunter-daily: Quick discovery (Actions 1-2 only)
- job-hunter-research: Deep dive on pending jobs (Actions 3-4)
- job-hunter-apply: Application tracking (Action 5)
```

**C. Reorder Actions**
```
Current: Discover → Extract → Evaluate → Apply
Problem: Evaluation happens too late, extracting details for low-fit jobs

Should be:
- Discover → Quick Score → Extract (only high-scoring) → Deep Evaluate → Apply
```

#### Step 2: Design New Structure
```markdown
# Document in: workflows/job-hunter/architecture/restructure-[date].md

## Current Architecture
[Diagram of current actions and data flow]

## Proposed Architecture
[Diagram of new structure]

## Migration Path
1. Create job-hunter-v2 workflow (don't modify existing)
2. Port Actions 1-2 to v2
3. Test v2 with same data
4. Gradually migrate Actions 3-5
5. Deprecate v1 after parallel run

## Rollback
- Keep v1 workflow active during migration
- Can revert to v1 at any point
```

#### Step 3: Implement in Parallel
```bash
# Create new workflow in n8n UI
# Name: job-hunter-v2

# Or copy existing:
# 1. Export current workflow
./node_modules/.bin/n8n export:workflow --id=<id> --output=./workflows/job-hunter/workflow-v1-backup.json

# 2. Import as new workflow (rename to v2)
# 3. Make modifications
```

#### Step 4: Test Side-by-Side
```bash
# Run both workflows on same data
# Trigger v1: Record outputs
# Trigger v2: Compare outputs

diff <(cat data-v1/pending_jobs.json | jq -S) \
     <(cat data-v2/pending_jobs.json | jq -S)
```

#### Step 5: Cutover
```bash
# After validation:
# 1. Disable v1 workflow (don't delete)
# 2. Rename v2 → job-hunter
# 3. Update documentation
# 4. Archive v1 for 30 days

git tag workflow-v1-archived
git commit -m "[Architecture] Migrate to restructured workflow v2"
```

---

### 5. Adding New Workflows

**When to use:**
- Need entirely new capability (e.g., x-outreach)
- Want to automate adjacent process
- Need to integrate with external system

**Process:**

#### Step 1: Use Template
```bash
cd /Volumes/VRMini/n8n/workflows
cp -r _template my-new-workflow

cd my-new-workflow

# Update files:
# - README.md: Purpose, prerequisites
# - ACTIONS.md: Step-by-step breakdown
# - config.example.json: Configuration
```

#### Step 2: Define Actions
```markdown
# In my-new-workflow/ACTIONS.md

## Action 1: [Name]
**Purpose**: ...
**Type**: Assisted | Full Auto | Manual
**Prerequisites**: ...

### Steps:
1.1 [Step name]
1.2 [Step name]

## Integration Points
- **Reads from**: job-hunter/data/applied_jobs.json
- **Writes to**: my-new-workflow/data/output.json
- **Shares**: .venv, scripts/common-utils.js
```

#### Step 3: Build Incrementally
```bash
# Follow BUILD-GUIDE.md pattern:
# 1. Create BUILD-GUIDE.md for new workflow
# 2. Implement Action 1
# 3. Test, commit
# 4. Repeat for each action

# Use job-hunter learnings:
cp ../job-hunter/scripts/validate-data.sh scripts/
cp ../job-hunter/.context.json .context.json
# Adapt to new workflow
```

#### Step 4: Document Integration
```markdown
# In workflows/INTEGRATION.md (new file)

## Workflow Dependencies

### job-hunter → my-new-workflow
- **Data flow**: applied_jobs.json → input for new workflow
- **Trigger**: Manual | Scheduled | Event-based
- **Frequency**: Daily | Weekly | On-demand

### Shared Resources
- `/workflows/lib/` - Common utilities
- `/workflows/scripts/` - Shared scripts
- `.venv` - Python environment
```

---

## Standard Testing Procedures

### For Any Enhancement

#### Pre-Enhancement Checklist
```bash
# 1. Backup data
cp -r data data_backup_$(date +%Y%m%d_%H%M%S)

# 2. Checkpoint git
git add -A
git commit -m "[Checkpoint] Before [enhancement-name]"
git tag checkpoint-$(date +%s)

# 3. Document plan
# Create: workflows/job-hunter/enhancements/[name]-[date].md

# 4. Verify current state works
./scripts/validate-data.sh
# Trigger workflow, confirm outputs
```

#### Post-Enhancement Checklist
```bash
# 1. Validate data
./scripts/validate-data.sh

# 2. Test enhanced workflow
# Trigger manually, verify outputs

# 3. Compare before/after
diff data_backup_*/pending_jobs.json data/pending_jobs.json

# 4. Update documentation
# - PROGRESS.md: Note enhancement completed
# - .context.json: Add learnings
# - UPDATE-GUIDE.md: Add to enhancement history

# 5. Commit
git add -A
git commit -m "[Enhancement] [Name] - [Brief description]"

# 6. Clean up (after 1 week)
rm -rf data_backup_[old-dates]
```

---

## Enhancement History Log

### Template Entry
```markdown
### Enhancement: [Name]
**Date**: YYYY-MM-DD
**Category**: API Discovery | Schema Enhancement | Code Quality | Architecture | New Workflow
**Motivation**: [Why this was needed]
**Changes**:
- File: [path] - [what changed]
- Schema: v1.0 → v1.1
- Workflow: Added Action 3.5
**Testing**: [How validated]
**Issues**: [Any problems encountered]
**Rollback**: Available at git tag [tag-name]
```

### Actual Enhancements

#### Enhancement: API Discovery for Job Details
**Date**: TBD (Blocker #1)
**Category**: API Discovery
**Motivation**: Browser extraction insufficient for full job details
**Changes**: TBD
**Testing**: TBD
**Status**: Planned

---

## Validation Scripts

### scripts/validate-enhancement.sh
```bash
#!/bin/bash
# Run all validation checks after enhancement

set -e

echo "🔍 Validating enhancement..."

# Data validation
./scripts/validate-data.sh

# Schema version check
version=$(cat data/pending_jobs.json | jq -r '.version')
echo "Schema version: $version"

# Git status
if [[ -n $(git status -s) ]]; then
  echo "⚠️  Uncommitted changes detected"
  git status -s
fi

# File count check
pending_count=$(cat data/pending_jobs.json | jq '.jobs | length')
applied_count=$(cat data/applied_jobs.json | jq '.jobs | length')
echo "Pending jobs: $pending_count"
echo "Applied jobs: $applied_count"

# TODO: Add workflow execution test
# curl -X POST http://localhost:5678/webhook-test/job-hunter

echo "✅ Validation complete"
```

---

## When to Rebuild vs Update

### Rebuild (New BUILD-GUIDE)
- Complete workflow redesign
- Different data sources
- New technology stack
- Learning exercise

### Update (This guide)
- Add/modify features
- Fix bugs
- Improve performance
- Enhance data model
- Refactor code

**Decision criteria:**
- Can reuse >50% of existing code? → Update
- Breaking changes to core architecture? → Rebuild
- Uncertainty about approach? → Prototype, then decide

---

## Known Restrictions / Blockers

### 🚧 Blocker #1: Limited Job Detail Extraction (Action 3.4)

**Status**: Active workaround in place  
**Discovered**: 2025-12-13  
**Affected Actions**: Action 3 (Job Extraction), Action 4 (Evaluation)

**Issue**: 
X Jobs detail pages expose minimal content via browser accessibility API. Currently extracting:
- ✅ Job ID, Title, Company, Location, Salary
- ❌ Full description, requirements, benefits (not in accessibility tree)

**Current Workaround**:
- Accept minimal data in extracts
- Include X Jobs URL for manual review
- Action 4 (Evaluation) will use AI inference with limited context

**Planned Solution**:
Use API Discovery process (Section 1) to find X's internal job details API

**To Revisit When Resolved**:
1. Follow "API Discovery Process" above
2. Update extraction logic: scripts/parse-jobs-from-api.js
3. Migrate schema: Add full details to extracts
4. Update Action 3.4 workflow nodes
5. Retest Action 4 (scoring will improve with full data)

**Related Files**:
- `workflows/job-hunter/PROGRESS.md` - Issue documented
- `data/extracts/1949931048101466191.json` - Example minimal extract

---

## Emergency Rollback

### Complete Rollback
```bash
# Revert to last checkpoint
git log --oneline | head -5
git reset --hard checkpoint-[timestamp]

# Restore data
cp -r data_backup_latest/* data/

# Validate
./scripts/validate-data.sh
```

### Partial Rollback (Keep Data, Revert Code)
```bash
# Revert workflow only
git checkout HEAD~1 -- workflows/job-hunter/[workflow-file].json

# Keep data/ directory changes
git reset HEAD data/
```

---

## Questions / Support

**Before enhancing, ask:**
1. Does this require API discovery? → Section 1
2. Does this change data schema? → Section 2
3. Is code getting messy? → Section 3
4. Does architecture need changing? → Section 4
5. Is this a new capability? → Section 5

**For help:**
- See: `BUILD-GUIDE.md` - Initial build process
- See: `ACTIONS.md` - Action breakdown
- See: `PROGRESS.md` - Current state

**Last Updated**: 2025-12-13

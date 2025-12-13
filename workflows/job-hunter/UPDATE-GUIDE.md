# Job Hunter Workflow - Update Guide

## Purpose

This guide enables granular modifications and tuning of the job-hunter workflow. Use this to revisit specific steps, improve extraction logic, or adjust filtering criteria.

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

**Planned Solution** (TODO):
User has a solution for extracting missing data - will be implemented later.

**To Revisit**:
1. File: `scripts/parse-jobs-from-snapshot.js` - extraction logic
2. File: `data/extracts/{job_id}.json` - schema may expand
3. Action 3.4 steps in workflow nodes

**Related Files**:
- `workflows/job-hunter/PROGRESS.md` - Issue documented in "Issues Encountered"
- `data/extracts/1949931048101466191.json` - Example minimal extract

---

## Workflow Modification Guidelines

### Before Making Changes

1. **Backup current state**:
   ```bash
   cd /Volumes/VRMini/n8n/workflows/job-hunter
   cp -r data data_backup_$(date +%Y%m%d)
   ```

2. **Document changes**:
   - Update this file with new sections
   - Add notes to PROGRESS.md
   - Update .context.json with new learnings

3. **Test incrementally**:
   - Modify scripts in `scripts/` first
   - Test with command line before updating workflow
   - Validate data schemas with validation script

### Modifying Action 1: Session Setup

**When to modify**: X changes login flow, navigation structure, or filter UI

**Files to update**:
- Browser navigation URLs in workflow nodes
- `.context.json` - URL patterns

**Testing**:
```bash
# Verify X Jobs URL still works
curl -I "https://x.com/jobs?q=python&lstr=remote"
```

### Modifying Action 2: Discovery & Filtering

**When to modify**: X changes job card structure, need different filters, or deduplication logic

**Files to update**:
- `scripts/parse-jobs-from-snapshot.js` - parseJobName() function
- `.context.json` - known_selectors

**Testing**:
```bash
# Test parser on new snapshot
node scripts/parse-jobs-from-snapshot.js /path/to/new/snapshot.log

# Test filter logic
node scripts/filter-new-jobs.js
```

**Common Modifications**:

1. **Change search criteria**:
   ```javascript
   // In workflow URL parameters
   const searchUrl = "https://x.com/jobs?q=fastapi&lstr=remote&sr=senior";
   ```

2. **Adjust job card parsing**:
   ```javascript
   // In parse-jobs-from-snapshot.js
   function parseJobName(nameStr) {
     // Modify parsing logic here
   }
   ```

3. **Add fuzzy deduplication**:
   ```javascript
   // Already implemented in scripts/filter-new-jobs.js
   // Enable in workflow if needed
   const deduplicated = fuzzyDeduplicateJobs(newJobs, appliedJobs);
   ```

### Modifying Action 3: Job Extraction

**When to modify**: Extract schema changes, need additional fields, or alternative extraction method

**Files to update**:
- `data/extracts/{job_id}.json` - Schema definition
- Extraction logic in workflow nodes
- TODO: Update when solution for missing data is implemented

**Testing**:
```bash
# Validate extract schema
cat data/extracts/1949931048101466191.json | jq empty && echo "Valid JSON"

# Check all required fields
cat data/extracts/*.json | jq '.job_id, .basic.title, .application.x_jobs_url' | wc -l
```

**Schema Expansion** (for future solution):
```json
{
  "details": {
    "description": "TODO: Full job description here",
    "requirements": ["TODO: Parse requirements list"],
    "nice_to_have": ["TODO: Parse nice-to-have skills"],
    "benefits": ["TODO: Parse benefits"]
  }
}
```

### Modifying Action 4: Evaluation & Prep

**When to modify**: Change scoring algorithm, add new criteria, or improve AI prompts

**Files to update**:
- Scoring logic in workflow nodes
- Resume comparison logic
- AI prompt templates

**Testing**:
```bash
# Test scoring with sample data
# (Implementation pending - Action 4 not yet built)
```

### Modifying Action 5: Apply & Track

**When to modify**: Change tracking schema, add follow-up automation, or integrate calendar

**Files to update**:
- `data/applied_jobs.json` - Schema
- Tracking workflow nodes

---

## Data Schema Updates

### Adding New Fields to pending_jobs.json

```bash
# Use jq to add field to all jobs
cat data/pending_jobs.json | jq '.jobs[] |= . + {new_field: "default_value"}' > /tmp/updated.json
mv /tmp/updated.json data/pending_jobs.json
```

### Migrating Between Schema Versions

```bash
# Example: Version 1.0 -> 1.1
cat data/pending_jobs.json | jq '.version = "1.1" | .jobs[] |= (
  {
    job_id,
    discovered_at,
    title,
    company,
    url,
    location,
    salary_range,
    tags: []  # New field in v1.1
  }
)' > data/pending_jobs_v1.1.json
```

---

## Performance Tuning

### Batch Processing

Currently processes all jobs sequentially. To batch:

```javascript
// In workflow: Split In Batches node
const batchSize = 5;
const jobs = $input.all();
// Process 5 jobs at a time
```

### Rate Limiting

X may rate limit requests. Add delays:

```javascript
// In workflow: Wait node
const delayMs = 2000; // 2 seconds between requests
```

---

## Debugging Workflow Issues

### Common Issues

1. **Jobs not extracting**:
   - Check snapshot file exists and has listitems
   - Verify parser logic with: `node scripts/parse-jobs-from-snapshot.js`
   - Check `.context.json` selectors are current

2. **Duplicate jobs appearing**:
   - Verify applied_jobs.json is loading correctly
   - Check job_id format is consistent
   - Run validation: `scripts/validate-data.sh`

3. **Browser session expired**:
   - Re-run Action 1 (Session Setup)
   - User must manually log in to X

### Debug Commands

```bash
# Check workflow state
cat workflows/job-hunter/.context.json | jq .progress

# View recent job discoveries
cat data/pending_jobs.json | jq '.jobs[-5:] | .[] | {id: .job_id, title: .title}'

# Count jobs by status
echo "Pending: $(cat data/pending_jobs.json | jq '.jobs | length')"
echo "Applied: $(cat data/applied_jobs.json | jq '.jobs | length')"

# Find duplicates
cat data/pending_jobs.json data/applied_jobs.json | jq -s '.[0].jobs + .[1].jobs | group_by(.job_id) | map(select(length > 1))'
```

---

## Rollback Procedures

### Revert to Previous Data State

```bash
# Restore from backup
cd /Volumes/VRMini/n8n/workflows/job-hunter
cp -r data_backup_YYYYMMDD/* data/

# Verify restoration
./scripts/validate-data.sh
```

### Revert Workflow Changes

```bash
# Git rollback
cd /Volumes/VRMini/n8n
git log --oneline workflows/job-hunter/
git revert <commit-hash>
```

---

## TODO List for Future Updates

### High Priority
- [ ] TODO: Implement solution for extracting full job descriptions (Blocker #1)
- [ ] TODO: Add validation script (`scripts/validate-data.sh`)
- [ ] TODO: Create backup automation (daily data backups)

### Medium Priority
- [ ] TODO: Add fuzzy matching for company name variations
- [ ] TODO: Implement batch processing for large job sets (>50 jobs)
- [ ] TODO: Add error recovery workflow (Error Trigger node)

### Low Priority
- [ ] TODO: Add job alerts (Slack/Email when high-score jobs found)
- [ ] TODO: Archive old jobs (move to data/archive/ after 30 days)
- [ ] TODO: Add statistics dashboard (jobs/week, apply rate, response rate)

---

## Contact / Questions

For questions about workflow modifications:
- See: `BUILD-GUIDE.md` - Initial build documentation
- See: `ACTIONS.md` - Step-by-step action breakdown
- See: `PROGRESS.md` - Current build progress and issues

Last Updated: 2025-12-13


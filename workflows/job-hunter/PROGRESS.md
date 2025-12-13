# Job Hunter Build Progress

## Current State
- **Active Action**: 3 (Job Extraction)
- **Active Step**: 3.1 (Load Pending Jobs)
- **Status**: In Progress
- **Last Updated**: 2025-12-13 15:03 CST
- **Blockers**: Job IDs are temporary - need to click through to get real IDs

## Completed Steps
- [x] 1.1 Navigate to X.com (2025-12-13 14:55) - 3min
- [x] 1.2 Verify Login State (2025-12-13 14:56) - 1min
- [x] 1.3 Navigate to Jobs with filters (2025-12-13 14:58) - 2min
- [x] 2.1 Extract job cards from page (2025-12-13 15:00) - 15min (25 jobs found)
- [x] 2.2 Load applied jobs database (2025-12-13 15:01) - 1min (2 applied jobs)
- [x] 2.3 Filter new jobs (2025-12-13 15:02) - 1min (25 new, 0 duplicates)
- [x] 2.4 Save to pending queue (2025-12-13 15:03) - 1min

## Decisions Made

1. **Using accessibility tree snapshots for job extraction**
   - Rationale: Browser tools provide clean accessibility tree data
   - Alternative considered: XPath/CSS selectors (more brittle)
   
2. **Temporary job_ids for initial extraction**
   - Rationale: Clicking through 25+ jobs takes time
   - Next step: Click each job to get real ID from URL
   
3. **Created reusable parser scripts**
   - Location: `scripts/parse-jobs-from-snapshot.js`, `scripts/filter-new-jobs.js`
   - Purpose: Test logic before building n8n workflow nodes

## Issues Encountered
_Track problems and solutions_

Format:
1. **Issue description**
   - Solution: [What fixed it]
   - Impact: [How it affects the workflow]

## Learnings About X's UI

1. **Job cards structure:**
   - Accessibility role: `listitem`
   - Data in `name` attribute: "Title Company @Handle Location Salary"
   - No stable data attributes (no data-testid)
   
2. **Job ID extraction:**
   - Pattern: Must click job card to get URL
   - URL format: `https://x.com/m/jobs/{job_id}`
   - Job IDs are 19-digit numeric strings (Twitter snowflake IDs)
   
3. **Text rendering issues:**
   - Accessibility tree has garbled text ("A ociate" = "Associate")
   - Likely screen reader optimization
   - Parser must handle imperfect text
   
4. **Page loading:**
   - Initial load shows ~10 jobs
   - After 3-5 seconds, loads 25+ jobs
   - Infinite scroll may load more (not tested)
   
5. **Filter persistence:**
   - Filters in URL params: `q=python&lstr=remote&sr=junior,mid_level,senior&ltype=remote`
   - Back button loses filters (returns to base /jobs)

## Next Session Plan
- [ ] Complete Action [N]
- [ ] Begin Action [N+1] if time permits
- Estimated: [X] hours

## Session History

### Session 1: [Date]
- Duration: [X] hours
- Completed: [List]
- Next: [What to do next]

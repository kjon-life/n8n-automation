# Actions: Job Hunter

## Action Overview

| # | Action Name | Steps | Automation | Dependencies |
|---|-------------|-------|------------|--------------|
| 1 | Session Setup | 3 | Assisted | None |
| 2 | Discovery & Filtering | 4 | Full | Action 1 |
| 3 | Job Extraction | 4 | Full | Action 2 |
| 4 | Evaluation & Prep | 4 | Assisted | Action 3 |
| 5 | Apply & Track | 4 | Manual | Action 4 |

---

## Action 1: Session Setup

**Purpose:** Establish authenticated browser session on X Jobs  
**Automation:** Assisted (user logs in, agent verifies)  
**Trigger:** User initiates workflow

### Steps

1. **Open browser with X.com**
   - Input: None
   - Process: Navigate Playwright browser to `https://x.com`
   - Output: X homepage loaded

2. **Verify/Perform login**
   - Input: User credentials (manual entry)
   - Process: User logs in if not already authenticated
   - Output: Authenticated session

3. **Navigate to Jobs with filters**
   - Input: Search parameters from config
   - Process: Navigate to `https://x.com/jobs?q=python&lstr=remote&sr=junior,mid_level,senior&ltype=remote`
   - Output: Jobs listing page loaded

### Success Criteria

- [ ] Browser shows X Jobs page
- [ ] User profile icon visible (logged in)
- [ ] Job listings are displayed

### Error Handling

- **If login required:** Pause, prompt user to authenticate manually
- **If X is down:** Abort, notify user

---

## Action 2: Discovery & Filtering

**Purpose:** Identify new job postings not yet applied to  
**Automation:** Full  
**Trigger:** Completion of Action 1

### Steps

1. **Extract job listings from page**
   - Input: Jobs page DOM
   - Process: Parse job cards, extract metadata (title, company, posted date, job ID, URL)
   - Output: Array of job objects

2. **Load applied jobs database**
   - Input: `data/applied_jobs.json`
   - Process: Read file, parse JSON
   - Output: Set of applied job IDs

3. **Filter out applied/pending jobs**
   - Input: Extracted jobs, applied jobs set
   - Process: Remove jobs where ID exists in applied set
   - Output: Array of NEW jobs only

4. **Save to pending queue**
   - Input: New jobs array
   - Process: Append to `data/pending_jobs.json`
   - Output: Updated pending file

### Success Criteria

- [ ] Job count logged: "Found X new jobs, Y already applied"
- [ ] `pending_jobs.json` updated with new entries

### Error Handling

- **If no jobs found:** Log, check if page loaded correctly
- **If file read fails:** Create empty file, continue

### Data Schema

**Pending Jobs (After Discovery)**:
```json
{
  "job_id": "1949931048101466191",
  "discovered_at": "2025-12-13T15:30:00Z",
  "title": "Python Developer",
  "company": "Aloha Protocol",
  "url": "https://x.com/m/jobs/1949931048101466191",
  "location": "Remote",
  "salary_range": "€60K - €80K per year"
}
```

**Scripts**: `parse-jobs-from-snapshot.js`, `filter-new-jobs.js`

---

## Action 3: Job Extraction

**Purpose:** Capture job details for each pending job  
**Automation:** Full  
**Trigger:** Pending jobs exist in queue

**⚠️ Known Limitation (Blocker #1):** X Jobs detail pages expose minimal content via accessibility API. Full descriptions, requirements, and benefits are not available. See `UPDATE-GUIDE.md` for planned solution.

### Steps

1. **Load pending jobs**
   - Input: `data/pending_jobs.json`
   - Process: Read and parse
   - Output: Array of jobs to process
   - Script: `scripts/parse-jobs-from-snapshot.js`

2. **Navigate to job detail page**
   - Input: Job URL
   - Process: Browser navigates to job posting, click job card
   - Output: Job detail page loaded, real job_id extracted from URL

3. **Extract available job data**
   - Input: Job detail DOM (accessibility tree)
   - Process: Parse basic info (title, company, location, salary, apply URL)
   - Output: Job object with available fields
   - Script: `scripts/batch-extract-job-ids.js`

4. **Save extract to file**
   - Input: Job object with metadata
   - Process: Write to `data/extracts/{job_id}.json`
   - Output: Persisted job extract
   - Note: Extract includes X Jobs URL for manual review

### Success Criteria

- [ ] Extract file created for each job
- [ ] Basic fields captured (job_id, title, company, location, salary, apply_url)
- [ ] X Jobs URL included for user to view full details

### Error Handling

- **If page doesn't load:** Mark job as "error", skip to next
- **If job_id extraction fails:** Use temp ID, mark for manual review
- **If minimal data:** Accept limitation, save what's available + URL

### Data Schema (Extract)

**Current Schema (Minimal Data)**:
```json
{
  "job_id": "1949931048101466191",
  "extracted_at": "2025-12-13T21:24:00Z",
  "basic": {
    "title": "Python Developer",
    "company": "Aloha Protocol",
    "location": "Remote",
    "type": "Full-time",
    "salary_range": "€60K - €80K per year",
    "posted_date": "Unknown"
  },
  "details": {
    "description": "Brief tagline only",
    "requirements": [],
    "nice_to_have": [],
    "benefits": []
  },
  "application": {
    "apply_url": "https://x.com/m/jobs/1949931048101466191",
    "x_jobs_url": "https://x.com/m/jobs/1949931048101466191",
    "deadline": null,
    "company_url": "https://x.com/AlohaProtocol"
  },
  "metadata": {
    "extraction_method": "Browser accessibility tree",
    "extraction_notes": "X Jobs detail page has limited exposed content. Full description requires alternative method.",
    "verified": false
  }
}
```

**Future Schema (With Full Extraction)**:
See `UPDATE-GUIDE.md` Blocker #1 for planned enhancement to extract:
- Full job description
- Detailed requirements list
- Nice-to-have skills
- Benefits and perks

---

## Action 4: Evaluation & Preparation

**Purpose:** Score job fit and prepare application materials  
**Automation:** Assisted (AI generates, human reviews)  
**Trigger:** Job extracts available

### Steps

1. **Load job extract and resume**
   - Input: `data/extracts/{job_id}.json`, user resume
   - Process: Read both documents
   - Output: Job and resume data in memory

2. **Score job fit**
   - Input: Job requirements, resume skills
   - Process: Match requirements to experience, calculate fit score (1-10)
   - Output: Fit score with breakdown

3. **Identify red flags / deal breakers**
   - Input: Job description
   - Process: Check for: low salary, bad reviews, unrealistic requirements
   - Output: List of concerns (if any)

4. **Generate application materials**
   - Input: Job extract (basic info), resume, fit analysis
   - Process: Generate tailored cover letter points and strategy
   - Output: `data/applications/{job_id}.md`
   - Script: `scripts/evaluate-job-fit.js`
   - Note: Works with minimal job data; AI infers from title/company/salary

### Success Criteria

- [ ] Fit score calculated (1-10)
- [ ] Application materials generated
- [ ] User can review and approve/reject

### Error Handling

- **If resume not found:** Prompt user to provide
- **If AI generation fails:** Provide template, let user fill in

### Output Format

```markdown
# Application: Senior Python Developer @ TechCorp

## Fit Score: 8/10

### Matches
- ✅ Python 5+ years (you have 7)
- ✅ FastAPI (2 years experience)
- ✅ PostgreSQL (extensive)

### Gaps
- ⚠️ Kubernetes (you have basic, they want intermediate)

### Red Flags
- None identified

## Cover Letter Points

1. Lead with FastAPI experience on [Project X]
2. Highlight PostgreSQL optimization work
3. Mention remote work track record

## Talking Points for Interview

- ...
```

---

## Action 5: Apply & Track

**Purpose:** Submit application and record in tracking system  
**Automation:** Manual (user submits, system tracks)  
**Trigger:** User approves application materials

### Steps

1. **Navigate to apply URL**
   - Input: `apply_url` from job extract
   - Process: Open application page in browser
   - Output: Application form displayed

2. **Fill application** (Manual)
   - Input: User fills form using prepared materials
   - Process: User submits application
   - Output: Application submitted

3. **Record application**
   - Input: Job ID, application date, notes
   - Process: Move from `pending_jobs.json` to `applied_jobs.json`
   - Output: Tracking updated
   - Script: `scripts/track-application.js record <job_id> [notes]`

4. **Set follow-up reminder**
   - Input: Application date
   - Process: Create reminder for 7 days follow-up (automatic)
   - Output: Reminder scheduled with follow_up_date
   - Check: `scripts/track-application.js follow-ups`

### Success Criteria

- [ ] Application submitted on company site
- [ ] Job moved to applied_jobs.json
- [ ] Follow-up reminder set

### Error Handling

- **If apply URL broken:** Note in tracking, try alternative
- **If application fails:** Keep in pending, note error

### Tracking Schema

```json
{
  "job_id": "1949931048101466191",
  "discovered_at": "2025-12-13T15:30:00Z",
  "applied_at": "2025-12-13T21:17:00Z",
  "title": "Python Developer",
  "company": "Aloha Protocol",
  "url": "https://x.com/m/jobs/1949931048101466191",
  "location": "Remote",
  "salary_range": "€60K - €80K per year",
  "application_method": "X Jobs Form",
  "status": "submitted",
  "follow_up_date": "2025-12-20T00:00:00Z",
  "notes": "Strong fit for Python/AI work. Applied via X Jobs.",
  "response": null
}
```

**Status Values**: `submitted` | `interviewing` | `rejected` | `offer`

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Session expired" | X logged out | Re-run Action 1 |
| "No jobs found" | Page didn't load | Check network, retry |
| "Rate limited" | Too many requests | Wait 15 min, reduce batch size |
| "Apply URL 404" | Job removed | Mark as "closed" in tracking |

### Debug Commands

```bash
# Check pending jobs count
cat workflows/job-hunter/data/pending_jobs.json | jq '.jobs | length'

# Check applied jobs
cat workflows/job-hunter/data/applied_jobs.json | jq '.jobs[].company'

# View specific extract
cat workflows/job-hunter/data/extracts/1949931048101466191.json | jq

# Evaluate job
node workflows/job-hunter/scripts/evaluate-job-fit.js data/extracts/1949931048101466191.json

# Check follow-ups
node workflows/job-hunter/scripts/track-application.js follow-ups

# Record application
node workflows/job-hunter/scripts/track-application.js record 1949931048101466191 "Notes here"
```

### Manual Intervention Points

1. **Action 1, Step 2:** User must log in to X
2. **Action 4, Step 4:** User reviews generated materials
3. **Action 5, Step 2:** User fills and submits application


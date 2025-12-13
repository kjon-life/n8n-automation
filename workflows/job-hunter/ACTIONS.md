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

```json
{
  "job_id": "1949931048101466191",
  "title": "Senior Python Developer",
  "company": "TechCorp",
  "posted_date": "2025-12-13",
  "url": "https://x.com/jobs/1949931048101466191",
  "discovered_at": "2025-12-13T15:30:00Z",
  "status": "pending"
}
```

---

## Action 3: Job Extraction

**Purpose:** Capture full job details for each pending job  
**Automation:** Full  
**Trigger:** Pending jobs exist in queue

### Steps

1. **Load pending jobs**
   - Input: `data/pending_jobs.json`
   - Process: Read and parse
   - Output: Array of jobs to process

2. **Navigate to job detail page**
   - Input: Job URL
   - Process: Browser navigates to job posting
   - Output: Job detail page loaded

3. **Extract full job data**
   - Input: Job detail DOM
   - Process: Parse description, requirements, salary, company info, apply link
   - Output: Complete job object

4. **Save extract to file**
   - Input: Complete job object
   - Process: Write to `data/extracts/{job_id}.json`
   - Output: Persisted job extract

### Success Criteria

- [ ] Extract file created for each job
- [ ] All required fields captured (description, requirements, apply_url)

### Error Handling

- **If page doesn't load:** Mark job as "error", skip to next
- **If required field missing:** Log warning, save partial data

### Data Schema (Extract)

```json
{
  "job_id": "1949931048101466191",
  "title": "Senior Python Developer",
  "company": "TechCorp",
  "location": "Remote (US)",
  "salary_range": "$150k - $180k",
  "description": "Full job description text...",
  "requirements": ["Python 5+ years", "FastAPI", "PostgreSQL"],
  "nice_to_have": ["Kubernetes", "AWS"],
  "benefits": ["Health", "401k", "Unlimited PTO"],
  "apply_url": "https://techcorp.com/careers/12345",
  "posted_date": "2025-12-13",
  "extracted_at": "2025-12-13T15:45:00Z"
}
```

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
   - Input: Job description, resume, fit analysis
   - Process: AI generates tailored cover letter points, talking points
   - Output: `data/applications/{job_id}.md`

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
   - Input: Job ID, application date
   - Process: Move from `pending_jobs.json` to `applied_jobs.json`
   - Output: Tracking updated

4. **Set follow-up reminder**
   - Input: Application date
   - Process: Create reminder for 1 week follow-up
   - Output: Reminder scheduled

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
  "title": "Senior Python Developer",
  "company": "TechCorp",
  "applied_date": "2025-12-13",
  "status": "applied",
  "follow_up_date": "2025-12-20",
  "notes": "Strong fit, mentioned FastAPI project",
  "response": null
}
```

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
cat workflows/job-hunter/data/pending_jobs.json | jq length

# Check applied jobs
cat workflows/job-hunter/data/applied_jobs.json | jq '.[].company'

# View specific extract
cat workflows/job-hunter/data/extracts/1949931048101466191.json | jq
```

### Manual Intervention Points

1. **Action 1, Step 2:** User must log in to X
2. **Action 4, Step 4:** User reviews generated materials
3. **Action 5, Step 2:** User fills and submits application


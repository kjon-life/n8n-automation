# Cover Letter Generation Prompt

## Context Variables

- `{job_title}` - Position title
- `{company}` - Company name
- `{requirements}` - Key requirements from job posting
- `{my_experience}` - Relevant experience points
- `{fit_score}` - Calculated fit score (1-10)
- `{gaps}` - Identified skill gaps

## Prompt Template

You are helping write a cover letter for a {job_title} position at {company}.

### Job Requirements
{requirements}

### Candidate's Relevant Experience
{my_experience}

### Fit Analysis
- Score: {fit_score}/10
- Gaps: {gaps}

### Instructions

Write 3-4 bullet points that:
1. Lead with the strongest match between requirements and experience
2. Quantify achievements where possible (%, $, time saved)
3. Address any gaps proactively with transferable skills
4. Show genuine interest in the company/role

### Output Format

Return as markdown bullet points, ready to paste into an application.

---

## Example Output

- Led migration of legacy Python 2.7 codebase to Python 3.11, reducing technical debt by 40% and improving test coverage from 45% to 89%
- Built and deployed FastAPI microservices handling 50K+ requests/day with 99.9% uptime on AWS ECS
- While my Kubernetes experience is foundational, I've completed the CKA certification path and deployed staging environments using k3s
- Excited about TechCorp's focus on developer tooling - your recent blog post on reducing CI/CD times resonated with my work on build optimization


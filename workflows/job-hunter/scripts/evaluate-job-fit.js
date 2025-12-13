#!/usr/bin/env node
/**
 * Evaluate job fit and generate application preparation materials
 * 
 * PURPOSE: Score how well a job matches candidate profile
 * INPUT: Job extract, candidate resume/profile
 * OUTPUT: Fit score (1-10), match analysis, application prep document
 */

const fs = require('fs');
const path = require('path');

/**
 * Score job fit based on requirements match
 * @param {Object} jobExtract - Job details
 * @param {Object} candidateProfile - Candidate skills/experience
 * @returns {Object} Fit score and analysis
 */
function scoreJobFit(jobExtract, candidateProfile) {
  let score = 0;
  const matches = [];
  const gaps = [];
  const maxScore = 10;
  
  // Extract job requirements (from title and available data)
  const jobTitle = jobExtract.basic.title.toLowerCase();
  const jobCompany = jobExtract.basic.company.toLowerCase();
  const salary = jobExtract.basic.salary_range;
  const location = jobExtract.basic.location;
  
  // Score 1: Title match
  const candidateSkills = (candidateProfile.skills || []).map(s => s.toLowerCase());
  const titleKeywords = ['python', 'developer', 'engineer', 'backend', 'full-stack', 'senior', 'staff'];
  
  for (const keyword of titleKeywords) {
    if (jobTitle.includes(keyword) && candidateSkills.includes(keyword)) {
      score += 1;
      matches.push(`Title keyword match: "${keyword}"`);
    }
  }
  
  // Score 2: Location preference
  if (location && location.toLowerCase().includes('remote')) {
    if (candidateProfile.preferences?.remote) {
      score += 2;
      matches.push('Remote position (matches preference)');
    }
  }
  
  // Score 3: Salary range (if available)
  if (salary) {
    const salaryMatch = checkSalaryMatch(salary, candidateProfile.salary_expectation);
    if (salaryMatch.matches) {
      score += 2;
      matches.push(`Salary: ${salary} (${salaryMatch.reason})`);
    } else if (salaryMatch.below) {
      gaps.push(`Salary: ${salary} (${salaryMatch.reason})`);
    }
  }
  
  // Score 4: Seniority level
  const seniorityMatch = checkSeniorityMatch(jobTitle, candidateProfile.years_experience);
  if (seniorityMatch.matches) {
    score += 2;
    matches.push(seniorityMatch.reason);
  } else {
    gaps.push(seniorityMatch.reason);
  }
  
  // Score 5: Company type/domain
  if (candidateProfile.preferred_domains) {
    const domainMatch = checkDomainMatch(jobCompany, jobExtract.details.description, candidateProfile.preferred_domains);
    if (domainMatch.matches) {
      score += 1;
      matches.push(domainMatch.reason);
    }
  }
  
  // Normalize score to 0-10
  const normalizedScore = Math.min(maxScore, Math.round(score));
  
  return {
    score: normalizedScore,
    matches,
    gaps,
    recommendation: getRecommendation(normalizedScore)
  };
}

/**
 * Check if salary matches expectations
 * @param {string} jobSalary - e.g. "€60K - €80K per year"
 * @param {Object} expectation - {min, max, currency}
 * @returns {Object} Match result
 */
function checkSalaryMatch(jobSalary, expectation) {
  if (!expectation) {
    return { matches: true, reason: 'No expectation set' };
  }
  
  // Extract numbers from salary string
  const numbers = jobSalary.match(/\d+/g);
  if (!numbers || numbers.length < 2) {
    return { matches: true, reason: 'Unable to parse salary' };
  }
  
  const salaryMin = parseInt(numbers[0]) * 1000;
  const salaryMax = parseInt(numbers[1]) * 1000;
  
  if (salaryMax >= expectation.min) {
    return { matches: true, reason: `Meets minimum ${expectation.min/1000}K` };
  } else {
    return { matches: false, below: true, reason: `Below minimum ${expectation.min/1000}K` };
  }
}

/**
 * Check seniority level match
 * @param {string} jobTitle - Job title
 * @param {number} yearsExperience - Candidate years of experience
 * @returns {Object} Match result
 */
function checkSeniorityMatch(jobTitle, yearsExperience) {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('senior') || title.includes('staff') || title.includes('principal')) {
    if (yearsExperience >= 5) {
      return { matches: true, reason: `Senior level (${yearsExperience} years)` };
    } else {
      return { matches: false, reason: `Senior level requires more experience (have ${yearsExperience})` };
    }
  } else if (title.includes('mid') || title.includes('intermediate')) {
    if (yearsExperience >= 2 && yearsExperience < 8) {
      return { matches: true, reason: `Mid level (${yearsExperience} years)` };
    } else {
      return { matches: false, reason: `Mid level mismatch (${yearsExperience} years)` };
    }
  } else if (title.includes('junior') || title.includes('associate')) {
    if (yearsExperience < 3) {
      return { matches: true, reason: `Junior level (${yearsExperience} years)` };
    } else {
      return { matches: false, reason: `Overqualified for junior (${yearsExperience} years)` };
    }
  } else {
    // No specific level mentioned
    return { matches: true, reason: 'Seniority level unspecified' };
  }
}

/**
 * Check domain/industry match
 * @param {string} company - Company name
 * @param {string} description - Job description
 * @param {Array} preferredDomains - e.g. ['AI', 'fintech', 'healthcare']
 * @returns {Object} Match result
 */
function checkDomainMatch(company, description, preferredDomains) {
  const text = `${company} ${description}`.toLowerCase();
  
  for (const domain of preferredDomains) {
    if (text.includes(domain.toLowerCase())) {
      return { matches: true, reason: `Industry match: ${domain}` };
    }
  }
  
  return { matches: false, reason: 'No preferred industry match' };
}

/**
 * Get recommendation based on score
 * @param {number} score - Fit score (0-10)
 * @returns {string} Recommendation
 */
function getRecommendation(score) {
  if (score >= 8) return 'Strong fit - Apply immediately';
  if (score >= 6) return 'Good fit - Review and apply';
  if (score >= 4) return 'Moderate fit - Consider applying';
  return 'Weak fit - Skip unless interested in learning';
}

/**
 * Check for red flags in job posting
 * @param {Object} jobExtract - Job details
 * @returns {Array} List of red flags
 */
function checkRedFlags(jobExtract) {
  const redFlags = [];
  const text = `${jobExtract.basic.title} ${jobExtract.details.description}`.toLowerCase();
  
  // Red flag patterns
  const patterns = [
    { pattern: /unpaid|no salary|volunteer/i, flag: 'Unpaid position' },
    { pattern: /crypto|web3|blockchain/i, flag: 'Crypto/Web3 (high volatility)' },
    { pattern: /10\+ years.*required/i, flag: 'Unrealistic experience requirements' },
    { pattern: /rockstar|ninja|guru/i, flag: 'Unprofessional job title terminology' },
    { pattern: /equity only|stock options only/i, flag: 'No base salary, equity only' },
    { pattern: /work.*family/i, flag: '"Work family" culture (red flag phrase)' }
  ];
  
  for (const { pattern, flag } of patterns) {
    if (pattern.test(text)) {
      redFlags.push(flag);
    }
  }
  
  // Check salary if available
  if (jobExtract.basic.salary_range) {
    const salary = jobExtract.basic.salary_range.toLowerCase();
    if (salary.includes('competitive') || salary.includes('based on experience')) {
      redFlags.push('Vague salary ("competitive" or "based on experience")');
    }
  } else {
    // No red flag for missing salary - common in EU listings
  }
  
  return redFlags;
}

/**
 * Generate application preparation document
 * @param {Object} jobExtract - Job details
 * @param {Object} fitAnalysis - Fit score and analysis
 * @param {Array} redFlags - Red flags found
 * @returns {string} Markdown document
 */
function generateApplicationPrep(jobExtract, fitAnalysis, redFlags) {
  const { basic, application } = jobExtract;
  const { score, matches, gaps, recommendation } = fitAnalysis;
  
  let doc = `# Application Prep: ${basic.company} - ${basic.title}\n\n`;
  
  doc += `## Job Details\n`;
  doc += `- **Company**: ${basic.company}\n`;
  doc += `- **Title**: ${basic.title}\n`;
  doc += `- **Location**: ${basic.location}\n`;
  doc += `- **Salary**: ${basic.salary_range || 'Not specified'}\n`;
  doc += `- **X Jobs URL**: ${application.x_jobs_url}\n\n`;
  
  doc += `## Fit Score: ${score}/10\n\n`;
  doc += `**Recommendation**: ${recommendation}\n\n`;
  
  if (matches.length > 0) {
    doc += `### ✅ Strengths\n`;
    matches.forEach(m => doc += `- ${m}\n`);
    doc += `\n`;
  }
  
  if (gaps.length > 0) {
    doc += `### ⚠️ Gaps\n`;
    gaps.forEach(g => doc += `- ${g}\n`);
    doc += `\n`;
  }
  
  if (redFlags.length > 0) {
    doc += `### 🚩 Red Flags\n`;
    redFlags.forEach(rf => doc += `- ${rf}\n`);
    doc += `\n`;
  } else {
    doc += `### 🚩 Red Flags\nNone detected\n\n`;
  }
  
  doc += `## Cover Letter Points\n\n`;
  doc += `1. **Why them**: [Research company's mission from ${application.company_url || 'company website'}]\n`;
  doc += `2. **Why you**: Highlight matching skills: ${matches.slice(0, 3).join(', ')}\n`;
  doc += `3. **Specific contribution**: How you can solve their problems (infer from job title)\n\n`;
  
  doc += `## Application Strategy\n\n`;
  if (score >= 8) {
    doc += `Priority application - customize cover letter and apply within 24 hours.\n`;
  } else if (score >= 6) {
    doc += `Standard application - use template cover letter with personalization.\n`;
  } else {
    doc += `Low priority - quick apply if time permits, no extensive customization needed.\n`;
  }
  
  doc += `\n---\nGenerated: ${new Date().toISOString()}\n`;
  
  return doc;
}

// Example usage
if (require.main === module) {
  const extractPath = process.argv[2];
  const profilePath = process.argv[3] || path.join(__dirname, '../data/candidate-profile.json');
  
  if (!extractPath) {
    console.log('Usage: node evaluate-job-fit.js <extract-file> [profile-file]');
    process.exit(1);
  }
  
  // Load data
  const jobExtract = JSON.parse(fs.readFileSync(extractPath, 'utf8'));
  const candidateProfile = fs.existsSync(profilePath) 
    ? JSON.parse(fs.readFileSync(profilePath, 'utf8'))
    : {
        skills: ['python', 'fastapi', 'postgresql', 'aws'],
        years_experience: 7,
        salary_expectation: { min: 120000, max: 180000, currency: 'USD' },
        preferences: { remote: true },
        preferred_domains: ['AI', 'fintech', 'developer tools']
      };
  
  // Evaluate
  const fitAnalysis = scoreJobFit(jobExtract, candidateProfile);
  const redFlags = checkRedFlags(jobExtract);
  const prepDoc = generateApplicationPrep(jobExtract, fitAnalysis, redFlags);
  
  // Output
  console.log(prepDoc);
  
  // Save to file
  const outputPath = extractPath.replace('/extracts/', '/applications/').replace('.json', '.md');
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, prepDoc);
  console.log(`\nSaved to: ${outputPath}`);
}

module.exports = {
  scoreJobFit,
  checkRedFlags,
  generateApplicationPrep
};


#!/usr/bin/env node
/**
 * Parse X Jobs from browser snapshot
 * 
 * PURPOSE: Extract job metadata from X Jobs page accessibility snapshot
 * INPUT: Browser snapshot data (accessibility tree)
 * OUTPUT: Array of job objects with metadata
 * 
 * This code is designed to run in an n8n Code node.
 */

/**
 * Parse job data from listitem name attribute
 * 
 * Format: "Title Company @CompanyHandle Location Salary"
 * Example: "Python Developer Aloha Protocol @AlohaProtocol Remote €60K - €80K per year"
 * 
 * @param {string} nameStr - The name attribute from listitem
 * @returns {Object} Parsed job data
 */
function parseJobName(nameStr) {
  // Remove extra spaces and normalize
  const normalized = nameStr.trim().replace(/\s+/g, ' ');
  
  // Pattern: Look for @ symbol to identify company handle
  const atIndex = normalized.indexOf('@');
  const remoteIndex = normalized.toLowerCase().indexOf('remote');
  
  if (atIndex === -1) {
    // No @ symbol, try to parse best effort
    // Usually: Title Company Location [Salary]
    const parts = normalized.split(' ');
    
    return {
      title: parts.slice(0, Math.floor(parts.length / 2)).join(' '),
      company: parts.slice(Math.floor(parts.length / 2)).join(' '),
      location: remoteIndex >= 0 ? 'Remote' : 'Unknown',
      salary_range: extractSalary(normalized)
    };
  }
  
  // Extract company (text before @)
  const beforeAt = normalized.substring(0, atIndex).trim();
  const afterAt = normalized.substring(atIndex).trim();
  
  // Title is everything before company in beforeAt
  // Company is last word(s) before @
  const beforeAtParts = beforeAt.split(' ');
  const companyStart = beforeAtParts.length - 2; // Guess company is last 1-2 words
  
  const title = beforeAtParts.slice(0, companyStart).join(' ');
  const company = beforeAtParts.slice(companyStart).join(' ');
  
  // Extract location and salary from afterAt
  const location = remoteIndex >= 0 ? extractLocation(normalized) : 'Unknown';
  const salary_range = extractSalary(normalized);
  
  return {
    title: title || 'Unknown Title',
    company: company || 'Unknown Company',
    location,
    salary_range
  };
}

/**
 * Extract location from job string
 * @param {string} str - Job string
 * @returns {string} Location
 */
function extractLocation(str) {
  const remoteMatch = str.match(/Remote[^€$¥£]*/i);
  if (remoteMatch) {
    return remoteMatch[0].trim();
  }
  return 'Remote';
}

/**
 * Extract salary range from job string
 * @param {string} str - Job string  
 * @returns {string|null} Salary range or null
 */
function extractSalary(str) {
  // Match currency symbols followed by numbers and ranges
  const salaryMatch = str.match(/[€$¥£]\d+[KkMm]?\s*-\s*[€$¥£]?\d+[KkMm]?(\s+per\s+(year|month|hour))?/);
  if (salaryMatch) {
    return salaryMatch[0].trim();
  }
  return null;
}

/**
 * Extract jobs from accessibility snapshot
 * 
 * @param {Object} snapshotData - Snapshot data from browser tools
 * @returns {Array} Array of job objects
 */
function extractJobsFromSnapshot(snapshotData) {
  const jobs = [];
  
  /**
   * Recursively search for listitem elements
   * @param {Object} node - Current node
   */
  function traverse(node) {
    if (!node) return;
    
    // Check if this is a job listitem
    if (node.role === 'listitem' && node.name) {
      // Parse job data from name
      const parsed = parseJobName(node.name);
      
      // Generate temporary job_id (will be replaced when we click through)
      const tempJobId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const job = {
        job_id: tempJobId,
        discovered_at: new Date().toISOString(),
        title: parsed.title,
        company: parsed.company,
        url: `https://x.com/jobs/${tempJobId}`, // Will be updated later
        location: parsed.location,
        salary_range: parsed.salary_range,
        ref: node.ref // Keep ref for later clicking
      };
      
      jobs.push(job);
    }
    
    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  
  // Start traversal
  if (Array.isArray(snapshotData)) {
    for (const rootNode of snapshotData) {
      traverse(rootNode);
    }
  } else {
    traverse(snapshotData);
  }
  
  return jobs;
}

// Example usage (for testing):
if (require.main === module) {
  const fs = require('fs');
  const yaml = require('js-yaml');
  
  // Read snapshot file
  const snapshotPath = process.argv[2] || '/Users/trust/.cursor/browser-logs/snapshot-2025-12-13T20-59-41-822Z.log';
  const snapshotYaml = fs.readFileSync(snapshotPath, 'utf8');
  const snapshotData = yaml.load(snapshotYaml);
  
  // Extract jobs
  const jobs = extractJobsFromSnapshot(snapshotData);
  
  console.log(`Found ${jobs.length} jobs:`);
  console.log(JSON.stringify(jobs, null, 2));
}

// Export for n8n Code node
module.exports = {
  extractJobsFromSnapshot,
  parseJobName,
  extractLocation,
  extractSalary
};


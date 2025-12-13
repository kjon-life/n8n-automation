#!/usr/bin/env node
/**
 * Filter new jobs against applied jobs database
 * 
 * PURPOSE: Remove jobs that have already been applied to
 * INPUT: Discovered jobs array, applied jobs array
 * OUTPUT: Filtered array of new jobs only
 */

/**
 * Filter discovered jobs against applied jobs
 * 
 * @param {Array} discoveredJobs - Jobs extracted from X
 * @param {Array} appliedJobs - Jobs from applied_jobs.json
 * @returns {Array} New jobs not in applied list
 */
function filterNewJobs(discoveredJobs, appliedJobs) {
  // Create Set of applied job IDs for fast lookup
  const appliedIds = new Set(appliedJobs.map(job => job.job_id));
  
  console.log(`Applied jobs in database: ${appliedIds.size}`);
  
  // Filter out already applied jobs
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
  
  // Validate no duplicates in new jobs
  const uniqueIds = new Set(newJobs.map(j => j.job_id));
  if (uniqueIds.size !== newJobs.length) {
    console.error('WARNING: Duplicate job_ids detected in new jobs!');
  }
  
  return newJobs;
}

/**
 * Additional fuzzy matching by company + title
 * (For cases where job_id might change but it's the same posting)
 * 
 * @param {Array} newJobs - Jobs after ID filtering
 * @param {Array} appliedJobs - Jobs from applied_jobs.json
 * @returns {Array} Jobs after fuzzy deduplication
 */
function fuzzyDeduplicateJobs(newJobs, appliedJobs) {
  // Create set of "company|title" combinations (normalized)
  const appliedSignatures = new Set(
    appliedJobs.map(job => 
      `${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`
    )
  );
  
  const deduplicated = newJobs.filter(job => {
    const signature = `${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`;
    const isDuplicate = appliedSignatures.has(signature);
    
    if (isDuplicate) {
      console.log(`Fuzzy match found (same company+title): ${job.company} - ${job.title}`);
    }
    
    return !isDuplicate;
  });
  
  const filtered = newJobs.length - deduplicated.length;
  if (filtered > 0) {
    console.log(`Fuzzy filtering removed ${filtered} potential duplicates`);
  }
  
  return deduplicated;
}

// Example usage
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  
  // Load data files
  const dataDir = path.join(__dirname, '../data');
  const appliedJobsPath = path.join(dataDir, 'applied_jobs.json');
  
  // Read applied jobs
  const appliedData = JSON.parse(fs.readFileSync(appliedJobsPath, 'utf8'));
  const appliedJobs = appliedData.jobs || [];
  
  // For testing, read discovered jobs from stdin or use dummy data
  const discoveredJobs = JSON.parse(process.argv[2] || '[]');
  
  // Filter
  let newJobs = filterNewJobs(discoveredJobs, appliedJobs);
  
  // Optional: Fuzzy deduplication
  newJobs = fuzzyDeduplicateJobs(newJobs, appliedJobs);
  
  // Output
  console.log('\nNew jobs to process:');
  console.log(JSON.stringify(newJobs, null, 2));
}

module.exports = {
  filterNewJobs,
  fuzzyDeduplicateJobs
};


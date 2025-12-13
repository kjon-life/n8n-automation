#!/usr/bin/env node
/**
 * Batch extract real job IDs by clicking through job listings
 * 
 * PURPOSE: Update pending jobs with real job_ids from X URLs
 * INPUT: pending_jobs.json with temp IDs, browser snapshot with refs
 * OUTPUT: Updated pending_jobs.json with real job_ids
 * 
 * APPROACH:
 * 1. Load pending jobs and snapshot
 * 2. Match jobs to listitem refs by title/company
 * 3. For each job: Click -> Extract job_id from URL -> Update
 * 4. Save updated pending_jobs.json
 * 
 * NOTE: This is a planning script. In n8n workflow:
 * - Use Loop node to iterate through jobs
 * - Use Browser Click node to navigate
 * - Use Code node to extract job_id from URL
 * - Use Set node to update job record
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract job_id from X Jobs URL
 * @param {string} url - X Jobs URL
 * @returns {string|null} Job ID or null
 */
function extractJobIdFromUrl(url) {
  const match = url.match(/\/jobs\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Match pending job to snapshot listitem by title/company
 * @param {Object} job - Pending job
 * @param {Array} listitems - Listitems from snapshot
 * @returns {Object|null} Matching listitem or null
 */
function matchJobToListitem(job, listitems) {
  // Normalize for comparison
  const jobTitle = job.title.toLowerCase().trim();
  const jobCompany = job.company.toLowerCase().trim();
  
  for (const item of listitems) {
    const itemName = item.name.toLowerCase();
    
    // Check if both title and company appear in listitem name
    if (itemName.includes(jobTitle.substring(0, 20)) && 
        itemName.includes(jobCompany.substring(0, 15))) {
      return item;
    }
  }
  
  return null;
}

/**
 * Process batch of jobs to extract real IDs
 * @param {Array} pendingJobs - Jobs with temp IDs
 * @param {Array} listitems - Listitems from snapshot
 * @returns {Array} Jobs with real IDs (where found)
 */
function batchExtractJobIds(pendingJobs, listitems) {
  const updated = [];
  const notFound = [];
  
  for (const job of pendingJobs) {
    // Skip if already has real ID
    if (!job.job_id.startsWith('temp_')) {
      updated.push(job);
      continue;
    }
    
    // Match to listitem
    const match = matchJobToListitem(job, listitems);
    
    if (match) {
      console.log(`Matched: ${job.title} -> ref ${match.ref}`);
      // In actual workflow, would click here and extract from URL
      // For now, mark as matched
      updated.push({
        ...job,
        _matched_ref: match.ref,
        _needs_click_through: true
      });
    } else {
      console.log(`Not found: ${job.title}`);
      notFound.push(job);
      updated.push(job);
    }
  }
  
  console.log(`\nMatched: ${updated.filter(j => j._matched_ref).length}`);
  console.log(`Not found: ${notFound.length}`);
  
  return updated;
}

// Example usage
if (require.main === module) {
  const dataDir = path.join(__dirname, '../data');
  const pendingPath = path.join(dataDir, 'pending_jobs.json');
  
  // Load pending jobs
  const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
  console.log(`Loaded ${pendingData.jobs.length} pending jobs`);
  
  // In actual workflow, would load snapshot here
  // For now, just show the approach
  console.log('\nApproach:');
  console.log('1. Load pending jobs with temp IDs');
  console.log('2. Load browser snapshot with job listitems');
  console.log('3. Match each job to listitem by title/company');
  console.log('4. Click listitem -> Extract job_id from URL');
  console.log('5. Update pending_jobs.json with real IDs');
  console.log('\nThis would be implemented in n8n workflow with Loop + Browser Click nodes');
}

module.exports = {
  extractJobIdFromUrl,
  matchJobToListitem,
  batchExtractJobIds
};


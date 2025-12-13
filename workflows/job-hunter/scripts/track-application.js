#!/usr/bin/env node
/**
 * Track job application status
 * 
 * PURPOSE: Move job from pending to applied, set follow-up reminders
 * INPUT: Job ID, application date, notes
 * OUTPUT: Updated applied_jobs.json, removed from pending_jobs.json
 */

const fs = require('fs');
const path = require('path');

/**
 * Record job application
 * @param {string} jobId - Job ID
 * @param {Object} applicationData - {applied_at, method, status, notes}
 * @returns {Object} Updated job record
 */
function recordApplication(jobId, applicationData) {
  const dataDir = path.join(__dirname, '../data');
  const pendingPath = path.join(dataDir, 'pending_jobs.json');
  const appliedPath = path.join(dataDir, 'applied_jobs.json');
  
  // Load both files
  const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
  const appliedData = JSON.parse(fs.readFileSync(appliedPath, 'utf8'));
  
  // Find job in pending
  const jobIndex = pendingData.jobs.findIndex(j => j.job_id === jobId);
  if (jobIndex === -1) {
    throw new Error(`Job ${jobId} not found in pending_jobs.json`);
  }
  
  const job = pendingData.jobs[jobIndex];
  
  // Create applied job record
  const appliedJob = {
    job_id: job.job_id,
    discovered_at: job.discovered_at,
    applied_at: applicationData.applied_at || new Date().toISOString(),
    title: job.title,
    company: job.company,
    url: job.url,
    location: job.location,
    salary_range: job.salary_range,
    application_method: applicationData.method || 'X Jobs Form',
    status: applicationData.status || 'submitted',
    follow_up_date: calculateFollowUpDate(applicationData.applied_at),
    notes: applicationData.notes || '',
    response: null
  };
  
  // Remove from pending
  pendingData.jobs.splice(jobIndex, 1);
  pendingData.updated_at = new Date().toISOString();
  
  // Add to applied
  appliedData.jobs.push(appliedJob);
  appliedData.updated_at = new Date().toISOString();
  
  // Save both files
  fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
  fs.writeFileSync(appliedPath, JSON.stringify(appliedData, null, 2));
  
  console.log(`✅ Application recorded: ${job.company} - ${job.title}`);
  console.log(`   Follow-up date: ${appliedJob.follow_up_date}`);
  
  return appliedJob;
}

/**
 * Calculate follow-up date (7 days from application)
 * @param {string} appliedAt - ISO date string
 * @returns {string} ISO date string for follow-up
 */
function calculateFollowUpDate(appliedAt) {
  const applied = appliedAt ? new Date(appliedAt) : new Date();
  const followUp = new Date(applied);
  followUp.setDate(followUp.getDate() + 7);
  return followUp.toISOString().split('T')[0] + 'T00:00:00Z';
}

/**
 * Update application status
 * @param {string} jobId - Job ID
 * @param {string} newStatus - e.g. 'interviewing', 'rejected', 'offer'
 * @param {Object} updateData - Additional data to update
 */
function updateApplicationStatus(jobId, newStatus, updateData = {}) {
  const dataDir = path.join(__dirname, '../data');
  const appliedPath = path.join(dataDir, 'applied_jobs.json');
  
  const appliedData = JSON.parse(fs.readFileSync(appliedPath, 'utf8'));
  
  const job = appliedData.jobs.find(j => j.job_id === jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found in applied_jobs.json`);
  }
  
  // Update status
  job.status = newStatus;
  job.updated_at = new Date().toISOString();
  
  // Update additional fields
  if (updateData.response) job.response = updateData.response;
  if (updateData.notes) job.notes = (job.notes ? job.notes + '\n' : '') + updateData.notes;
  if (updateData.interview_date) job.interview_date = updateData.interview_date;
  
  // Update timestamp
  appliedData.updated_at = new Date().toISOString();
  
  // Save
  fs.writeFileSync(appliedPath, JSON.stringify(appliedData, null, 2));
  
  console.log(`✅ Status updated: ${job.company} - ${job.title} -> ${newStatus}`);
  
  return job;
}

/**
 * Get jobs due for follow-up
 * @returns {Array} Jobs with follow_up_date <= today
 */
function getDueFollowUps() {
  const dataDir = path.join(__dirname, '../data');
  const appliedPath = path.join(dataDir, 'applied_jobs.json');
  
  const appliedData = JSON.parse(fs.readFileSync(appliedPath, 'utf8'));
  const today = new Date().toISOString().split('T')[0];
  
  const due = appliedData.jobs.filter(job => {
    if (!job.follow_up_date) return false;
    if (job.status !== 'submitted') return false; // Only follow up on pending applications
    
    const followUpDate = job.follow_up_date.split('T')[0];
    return followUpDate <= today;
  });
  
  return due;
}

/**
 * Generate follow-up report
 * @returns {string} Markdown report
 */
function generateFollowUpReport() {
  const due = getDueFollowUps();
  
  if (due.length === 0) {
    return '# Follow-up Report\n\nNo applications due for follow-up.\n';
  }
  
  let report = `# Follow-up Report\n\n`;
  report += `**${due.length} application(s) due for follow-up:**\n\n`;
  
  for (const job of due) {
    const daysSince = Math.floor(
      (new Date() - new Date(job.applied_at)) / (1000 * 60 * 60 * 24)
    );
    
    report += `## ${job.company} - ${job.title}\n`;
    report += `- **Applied**: ${daysSince} days ago (${job.applied_at.split('T')[0]})\n`;
    report += `- **Follow-up due**: ${job.follow_up_date.split('T')[0]}\n`;
    report += `- **Method**: ${job.application_method}\n`;
    report += `- **URL**: ${job.url}\n`;
    report += `- **Action**: Send polite follow-up email or check application portal\n\n`;
  }
  
  return report;
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'record') {
    const jobId = process.argv[3];
    const notes = process.argv[4] || '';
    
    if (!jobId) {
      console.log('Usage: node track-application.js record <job_id> [notes]');
      process.exit(1);
    }
    
    recordApplication(jobId, {
      applied_at: new Date().toISOString(),
      method: 'X Jobs Form',
      status: 'submitted',
      notes
    });
    
  } else if (command === 'update') {
    const jobId = process.argv[3];
    const status = process.argv[4];
    
    if (!jobId || !status) {
      console.log('Usage: node track-application.js update <job_id> <status>');
      console.log('Status: submitted | interviewing | rejected | offer');
      process.exit(1);
    }
    
    updateApplicationStatus(jobId, status);
    
  } else if (command === 'follow-ups') {
    const report = generateFollowUpReport();
    console.log(report);
    
  } else {
    console.log('Usage:');
    console.log('  node track-application.js record <job_id> [notes]');
    console.log('  node track-application.js update <job_id> <status>');
    console.log('  node track-application.js follow-ups');
  }
}

module.exports = {
  recordApplication,
  updateApplicationStatus,
  getDueFollowUps,
  generateFollowUpReport,
  calculateFollowUpDate
};


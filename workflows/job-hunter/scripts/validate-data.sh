#!/bin/bash
set -e

DATA_DIR="/Volumes/VRMini/n8n/workflows/job-hunter/data"

echo "🔍 Validating job-hunter data files..."
echo ""

# Check files exist
echo "Checking file existence..."
for file in pending_jobs.json applied_jobs.json; do
  if [[ ! -f "$DATA_DIR/$file" ]]; then
    echo "❌ Missing: $file"
    exit 1
  fi
  echo "  ✅ Found: $file"
done
echo ""

# Validate JSON syntax
echo "Validating JSON syntax..."
for file in pending_jobs.json applied_jobs.json; do
  if ! jq empty "$DATA_DIR/$file" 2>/dev/null; then
    echo "❌ Invalid JSON: $file"
    exit 1
  fi
  echo "  ✅ Valid JSON: $file"
done
echo ""

# Check schema version
echo "Checking schema versions..."
for file in pending_jobs.json applied_jobs.json; do
  version=$(jq -r '.version' "$DATA_DIR/$file")
  if [[ "$version" != "1.0" ]]; then
    echo "❌ Invalid version in $file: $version (expected: 1.0)"
    exit 1
  fi
  echo "  ✅ $file: version $version"
done
echo ""

# Check for duplicate job_ids within each file
echo "Checking for duplicates within files..."
for file in pending_jobs.json applied_jobs.json; do
  total=$(jq '.jobs | length' "$DATA_DIR/$file")
  unique=$(jq '.jobs | map(.job_id) | unique | length' "$DATA_DIR/$file")
  
  if [[ "$total" != "$unique" ]]; then
    echo "❌ Duplicate job_ids found in $file (total: $total, unique: $unique)"
    exit 1
  fi
  echo "  ✅ $file: no duplicates ($total jobs)"
done
echo ""

# Check for duplicate job_ids across files
echo "Checking for duplicates across files..."
pending_ids=$(jq -r '.jobs[].job_id' "$DATA_DIR/pending_jobs.json" 2>/dev/null | sort)
applied_ids=$(jq -r '.jobs[].job_id' "$DATA_DIR/applied_jobs.json" 2>/dev/null | sort)

duplicates=$(comm -12 <(echo "$pending_ids") <(echo "$applied_ids"))
if [[ -n "$duplicates" ]]; then
  echo "❌ Duplicate job_ids found in both pending and applied:"
  echo "$duplicates"
  exit 1
fi
echo "  ✅ No duplicates across files"
echo ""

# Validate required fields in each job
echo "Validating job object structures..."
for file in pending_jobs.json applied_jobs.json; do
  # Check that all jobs have required fields
  invalid=$(jq -r '.jobs[] | select(.job_id == null or .title == null or .company == null or .url == null) | .job_id // "unknown"' "$DATA_DIR/$file")
  
  if [[ -n "$invalid" ]]; then
    echo "❌ Jobs with missing required fields in $file:"
    echo "$invalid"
    exit 1
  fi
  echo "  ✅ $file: all jobs have required fields"
done
echo ""

# Validate URLs
echo "Validating URLs..."
for file in pending_jobs.json applied_jobs.json; do
  invalid_urls=$(jq -r '.jobs[] | select(.url | startswith("https://x.com/jobs/") | not) | .url' "$DATA_DIR/$file")
  
  if [[ -n "$invalid_urls" ]]; then
    echo "❌ Invalid URLs found in $file:"
    echo "$invalid_urls"
    exit 1
  fi
  echo "  ✅ $file: all URLs valid"
done
echo ""

# Check file sizes (sanity check)
echo "Checking file sizes..."
for file in pending_jobs.json applied_jobs.json; do
  size=$(stat -f%z "$DATA_DIR/$file" 2>/dev/null || stat -c%s "$DATA_DIR/$file" 2>/dev/null)
  size_mb=$((size / 1024 / 1024))
  
  if (( size > 10485760 )); then  # 10MB
    echo "⚠️  Warning: $file is larger than 10MB (${size_mb}MB)"
  else
    echo "  ✅ $file: ${size_mb}MB (within limits)"
  fi
done
echo ""

# Statistics
echo "📊 Statistics:"
pending_count=$(jq '.jobs | length' "$DATA_DIR/pending_jobs.json")
applied_count=$(jq '.jobs | length' "$DATA_DIR/applied_jobs.json")
total=$((pending_count + applied_count))

echo "  Pending jobs: $pending_count"
echo "  Applied jobs: $applied_count"
echo "  Total tracked: $total"
echo ""

# Check for extracts
if [[ -d "$DATA_DIR/extracts" ]]; then
  extract_count=$(ls -1 "$DATA_DIR/extracts" 2>/dev/null | wc -l | tr -d ' ')
  echo "  Job extracts: $extract_count"
fi

# Check for applications
if [[ -d "$DATA_DIR/applications" ]]; then
  app_count=$(ls -1 "$DATA_DIR/applications" 2>/dev/null | wc -l | tr -d ' ')
  echo "  Applications: $app_count"
fi

echo ""
echo "✅ All validations passed!"
exit 0

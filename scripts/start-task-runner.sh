#!/bin/bash

cd /Volumes/VRMini/n8n

# Activate Python virtual environment
source .venv/bin/activate

# Read the auth token
AUTH_TOKEN_FILE="/Volumes/VRMini/n8n/data/.n8n/runner-auth-token"
if [ ! -f "$AUTH_TOKEN_FILE" ]; then
    echo "Error: Auth token file not found. Start n8n first."
    exit 1
fi
export N8N_RUNNERS_AUTH_TOKEN="$(cat "$AUTH_TOKEN_FILE")"

# Task runner configuration
export N8N_RUNNERS_TASK_BROKER_URI="http://127.0.0.1:5679"

# Start the task runner
echo "Starting n8n task runner..."
exec node ./node_modules/@n8n/task-runner/dist/start.js

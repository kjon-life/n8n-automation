#!/bin/bash

cd /Volumes/VRMini/n8n

# Set the user folder
export N8N_USER_FOLDER="/Volumes/VRMini/n8n/data"

# Enable debug logging to see what's happening with task runners
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=console,file
export N8N_LOG_FILE_LOCATION="/Volumes/VRMini/n8n/data/logs/n8n.log"
export N8N_LOG_SCOPES=task-runner,task-runner-js,task-runner-py,task-broker

# Fix for deprecation warnings
export DB_SQLITE_POOL_SIZE=20
export N8N_RUNNERS_ENABLED=true
export N8N_BLOCK_ENV_ACCESS_IN_NODE=true
export N8N_GIT_NODE_DISABLE_BARE_REPOS=true

# Ensure grant tokens are stored locally in-memory (avoid Redis/auto surprises)
export N8N_CACHE_BACKEND=memory

# Fix for permissions warning (auto-enforce)
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

# Task runner configuration for n8n 2.0 - internal mode
# Internal mode is simpler for npm installations
export N8N_RUNNERS_MODE=internal

# Relax V8 hardening flags in the child runner (does NOT affect auth)
# Useful for debugging; safe to remove later.
export N8N_RUNNERS_INSECURE_MODE=true

# Start n8n
echo "Starting n8n with internal task runners..."
echo "Log file: $N8N_LOG_FILE_LOCATION"
# Use exec to replace the shell process with n8n directly
exec ./node_modules/.bin/n8n start

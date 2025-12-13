# n8n Installation Guide

Fresh installation of n8n 2.0+ on macOS with task runner support.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [mise](https://mise.jdx.dev/) | latest | Node.js and Python version management |
| [uv](https://github.com/astral-sh/uv) | 0.8+ | Fast Python package manager |
| Node.js | 24.x | n8n runtime |
| Python | 3.11.x | Task runner support |

## Installation Steps

### 1. Create Project Directory

```bash
mkdir -p /Volumes/VRMini/n8n
cd /Volumes/VRMini/n8n
```

### 2. Set Node.js Version

```bash
mise use node@24.10.0
```

### 3. Create Python Virtual Environment

```bash
uv venv --python 3.11
```

### 4. Initialize npm Project and Install n8n

```bash
npm init -y
npm install n8n@next --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` handles version conflicts in beta releases.

### 5. Create Task Runner Symlink (Critical)

n8n's Python task runner expects the venv at a hardcoded path. Create a symlink:

```bash
mkdir -p node_modules/@n8n/task-runner-python
ln -s /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv
```

> **⚠️ Important:** This symlink must be recreated after any `npm install` or `npm update` that clears `node_modules`.

### 6. Create Data Directory

```bash
mkdir -p data/logs
```

### 7. Create Start Script

```bash
cat > scripts/start-n8n.sh << 'EOF'
#!/bin/bash

cd /Volumes/VRMini/n8n

# Data location
export N8N_USER_FOLDER="/Volumes/VRMini/n8n/data"

# Logging
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=console,file
export N8N_LOG_FILE_LOCATION="/Volumes/VRMini/n8n/data/logs/n8n.log"
export N8N_LOG_SCOPES=task-runner,task-runner-js,task-runner-py,task-broker

# Suppress deprecation warnings
export DB_SQLITE_POOL_SIZE=20
export N8N_RUNNERS_ENABLED=true
export N8N_BLOCK_ENV_ACCESS_IN_NODE=true
export N8N_GIT_NODE_DISABLE_BARE_REPOS=true

# Security and caching
export N8N_CACHE_BACKEND=memory
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

# Task runner configuration
export N8N_RUNNERS_MODE=internal
export N8N_RUNNERS_INSECURE_MODE=true

echo "Starting n8n with internal task runners..."
echo "Log file: $N8N_LOG_FILE_LOCATION"
exec ./node_modules/.bin/n8n start
EOF

chmod +x scripts/start-n8n.sh
```

### 8. Create Stop Script

```bash
cat > scripts/stop-n8n.sh << 'EOF'
#!/bin/bash
PID=$(lsof -ti :5678)
if [ -n "$PID" ]; then
    kill $PID
    echo "n8n stopped (PID: $PID)"
else
    echo "n8n is not running"
fi
EOF

chmod +x scripts/stop-n8n.sh
```

### 9. Create Update Script

```bash
cat > scripts/update-n8n.sh << 'EOF'
#!/bin/bash
cd /Volumes/VRMini/n8n

# Stop n8n if running
./scripts/stop-n8n.sh

# Update n8n
VERSION=${1:-latest}
if [ "$VERSION" = "next" ] || [ "$VERSION" = "beta" ]; then
    npm install n8n@next --legacy-peer-deps
else
    npm update n8n --legacy-peer-deps
fi

# Recreate symlink (destroyed by npm)
mkdir -p node_modules/@n8n/task-runner-python
ln -sf /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv

echo "Update complete. Restart with: ./scripts/start-n8n.sh"
EOF

chmod +x scripts/update-n8n.sh
```

### 10. Add to Shell Configuration (Optional)

Add to `~/.zshrc` for global access:

```bash
echo 'export N8N_USER_FOLDER=/Volumes/VRMini/n8n/data' >> ~/.zshrc
```

## Verify Installation

```bash
# Start n8n
./scripts/start-n8n.sh

# In another terminal, verify it's running
lsof -i :5678

# Access the UI
open http://localhost:5678
```

## Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| JavaScript Code nodes | ✅ Working | Full support |
| Python Code nodes | ❌ Not available | npm installation limitation |
| Task runners | ✅ Working | Internal mode |

## Post-Installation

After installation, see:
- `01-manage-n8n-cursor.md` - For Cursor IDE users
- `02-manage-n8n-terminal.md` - For terminal/Claude CLI users

## Troubleshooting

### npm install fails with peer dependency errors

```bash
npm install n8n@next --legacy-peer-deps
```

### Task runner not working

Verify the symlink exists:
```bash
ls -la node_modules/@n8n/task-runner-python/.venv
```

Recreate if missing:
```bash
ln -sf /Volumes/VRMini/n8n/.venv node_modules/@n8n/task-runner-python/.venv
```

### Permission errors on config file

```bash
chmod 600 /Volumes/VRMini/n8n/data/.n8n/config
```

---

*Last updated: December 2025 - n8n 2.0.1*


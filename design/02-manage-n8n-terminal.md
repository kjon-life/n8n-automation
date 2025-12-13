# Managing n8n from Terminal (Claude CLI / Non-IDE Agents)

Guide for AI assistants operating from terminal without IDE browser integration.

## Overview

When running `claude` from terminal (not Cursor IDE), you don't have access to Playwright browser tools. Instead, you use:

1. **Chrome with Remote Debugging** - For browser interaction
2. **Browser Tools MCP** - For reading console/network logs
3. **n8n REST API** - For programmatic workflow management

Create a clean Chrome Profile with any settings needed, e.g., install "browserTools MCP" Chrome Extension. You will need to find the folder name for that profile.

## Startup Sequence

Run these steps **in order** to establish a working session.

### Step 1: Start n8n

```bash
cd /Volumes/VRMini/n8n
./scripts/start-n8n.sh
```

**Verify:**
```bash
lsof -i :5678
# Expected: node process listening
```

```bash
curl -s http://localhost:5678/healthz
# Expected: {"status":"ok"}
```

### Step 2: Start Browser Tools Server

```bash
# Check if already running
lsof -i :3025 || lsof -i :3026

# If not running:
cd /Users/trust/Dev/mcps/browser-tools-mcp/browser-tools-server
npm start > /tmp/browser-tools-server.log 2>&1 &

# Wait and verify
sleep 2
curl -s http://localhost:3025/console-logs || curl -s http://localhost:3026/console-logs
# Expected: [] (empty array is fine)
```

### Step 3: Open Chrome with Remote Debugging

**⚠️ Important:** Chrome must be completely closed before this step. The `--remote-debugging-port` flag only works on fresh launch.

```bash
# Close all Chrome instances first
osascript -e 'quit app "Google Chrome"'
sleep 2

# Launch with correct profile and debugging
open -na "Google Chrome" --args "--profile-directory=Profile 2" --remote-debugging-port=9222
```

**Verify:**
```bash
curl -s http://localhost:9222/json | head -5
# Expected: JSON array of open tabs
```

### Step 4: Navigate Chrome to n8n

In Chrome, manually navigate to:
```
http://localhost:5678
```

Or use AppleScript:
```bash
osascript -e 'tell application "Google Chrome" to set URL of active tab of front window to "http://localhost:5678"'
```

### Step 5: Verify Browser Tools Connection

The Chrome extension should connect automatically. Test from terminal:

```bash
curl -s http://localhost:3025/console-logs
# or
curl -s http://localhost:3026/console-logs
```

## Available Capabilities

### What You CAN Do

| Capability | Method |
|------------|--------|
| Read console logs | Browser Tools MCP |
| Read network requests | Browser Tools MCP |
| Take screenshots | Browser Tools MCP |
| Run audits | Browser Tools MCP |
| Export workflows | n8n CLI / API |
| Import workflows | n8n CLI / API |
| Read workflow JSON | n8n API |

### What You CANNOT Do (Without IDE)

| Capability | Workaround |
|------------|------------|
| Click UI elements | Guide user verbally |
| Type in forms | Guide user verbally |
| Direct DOM manipulation | Use n8n API instead |

## Browser Tools MCP Functions

When configured in Claude's MCP settings, these tools are available:

```typescript
// Console debugging
mcp_browser-tools_getConsoleLogs()      // All console output
mcp_browser-tools_getConsoleErrors()    // Errors only

// Network debugging  
mcp_browser-tools_getNetworkLogs()      // All requests
mcp_browser-tools_getNetworkErrors()    // Failed requests

// Visual capture
mcp_browser-tools_takeScreenshot()      // Saves to configured directory

// Audits
mcp_browser-tools_runPerformanceAudit()
mcp_browser-tools_runAccessibilityAudit()
mcp_browser-tools_runSEOAudit()
mcp_browser-tools_runBestPracticesAudit()

// Maintenance
mcp_browser-tools_wipeLogs()            // Clear stored logs
```

## n8n CLI Commands

For programmatic workflow management:

```bash
cd /Volumes/VRMini/n8n

# List workflows
./node_modules/.bin/n8n list:workflow

# Export all workflows
./node_modules/.bin/n8n export:workflow --all --output=./workflows-backup/

# Export specific workflow
./node_modules/.bin/n8n export:workflow --id=<workflow-id> --output=./workflow.json

# Import workflow
./node_modules/.bin/n8n import:workflow --input=./workflow.json

# Check version
./node_modules/.bin/n8n --version
```

## n8n REST API

n8n exposes a REST API at `http://localhost:5678/rest/`:

```bash
# Get all workflows (requires auth in production)
curl http://localhost:5678/rest/workflows

# Get specific workflow
curl http://localhost:5678/rest/workflows/<id>

# Health check
curl http://localhost:5678/healthz
```

## Session Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Start n8n                                               │
│     ./scripts/start-n8n.sh                                  │
│     Verify: curl http://localhost:5678/healthz              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Start Browser Tools Server                              │
│     cd /Users/trust/Dev/mcps/browser-tools-mcp/...          │
│     npm start > /tmp/browser-tools-server.log 2>&1 &        │
│     Verify: curl http://localhost:3025/console-logs         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Launch Chrome with Remote Debugging                     │
│     (Close Chrome first!)                                   │
│     open -na "Google Chrome" --args \                       │
│       "--profile-directory=Profile 2" \                     │
│       --remote-debugging-port=9222                          │
│     Verify: curl http://localhost:9222/json                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Navigate Chrome to http://localhost:5678                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Work: Use Browser Tools to observe, guide user          │
│     - getConsoleLogs() to see errors                        │
│     - getNetworkLogs() to debug API calls                   │
│     - takeScreenshot() to see current state                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Stop: ./scripts/stop-n8n.sh                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Startup Script

Create a one-command startup:

```bash
cat > /Volumes/VRMini/n8n/scripts/start-full-session.sh << 'EOF'
#!/bin/bash
set -e

echo "=== Starting n8n Development Session ==="

# 1. Start n8n
cd /Volumes/VRMini/n8n
./scripts/start-n8n.sh &
N8N_PID=$!
sleep 5

# Verify n8n
if curl -s http://localhost:5678/healthz | grep -q "ok"; then
    echo "✅ n8n running on http://localhost:5678"
else
    echo "❌ n8n failed to start"
    exit 1
fi

# 2. Start browser tools server (if not running)
if ! lsof -i :3025 > /dev/null 2>&1 && ! lsof -i :3026 > /dev/null 2>&1; then
    cd /Users/trust/Dev/mcps/browser-tools-mcp/browser-tools-server
    npm start > /tmp/browser-tools-server.log 2>&1 &
    sleep 2
fi

# Check which port
if curl -s http://localhost:3025/console-logs > /dev/null 2>&1; then
    echo "✅ Browser Tools on http://localhost:3025"
elif curl -s http://localhost:3026/console-logs > /dev/null 2>&1; then
    echo "✅ Browser Tools on http://localhost:3026"
else
    echo "⚠️  Browser Tools server not responding"
fi

# 3. Launch Chrome (user must close Chrome first for debugging to work)
echo ""
echo "=== Chrome Setup ==="
echo "If Chrome is open, close it first, then run:"
echo '  open -na "Google Chrome" --args "--profile-directory=Profile 2" --remote-debugging-port=9222'
echo ""
echo "Then navigate to: http://localhost:5678"
echo ""
echo "=== Session Ready ==="
EOF

chmod +x /Volumes/VRMini/n8n/scripts/start-full-session.sh
```

## Chrome Profile Reference

| Directory Name | UI Display Name | Notes |
|----------------|-----------------|-------|
| `Profile 1` | APIsec | Work profile |
| **`Profile 2`** | **Profile 5** | **Use this for browser tools** |
| `Profile 4` | kjon-life | Personal profile |
| `Profile 5` | Person 1 | Default |

Always use `--profile-directory=Profile 2` (the directory name, not UI name).

## Troubleshooting

### Chrome debugging port not responding

Chrome was already running. Close ALL Chrome windows and relaunch:

```bash
osascript -e 'quit app "Google Chrome"'
sleep 2
open -na "Google Chrome" --args "--profile-directory=Profile 2" --remote-debugging-port=9222
```

### Browser Tools returns empty arrays

This is normal if no activity has occurred. Trigger some action in Chrome (navigate, click), then query again.

### n8n shows only Rudder debug logs

This is normal - Rudder is n8n's analytics. The actual n8n logs go to `data/logs/n8n.log`:

```bash
tail -f /Volumes/VRMini/n8n/data/logs/n8n.log
```

### Extension not connecting

1. Open Chrome DevTools (F12)
2. Check for BrowserTools MCP panel
3. Verify server host/port settings
4. Click "Test Connection"

---

*For Cursor IDE sessions with Playwright, see `01-manage-n8n-cursor.md`*


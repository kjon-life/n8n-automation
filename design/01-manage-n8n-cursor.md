# Managing n8n with Cursor IDE

Guide for AI-assisted n8n development using Cursor IDE's embedded Playwright browser.

## Overview

Cursor IDE provides two browser interaction methods:

| Method | Tool Prefix | Best For |
|--------|-------------|----------|
| **Playwright Browser** | `mcp_cursor-ide-browser_*` | Direct interaction, clicking, typing |
| **Browser Tools MCP** | `mcp_browser-tools_*` | Console logs, network debugging, audits |

**Recommendation:** Use Playwright for building workflows, Browser Tools for debugging.

## Starting a Session

### 1. Start n8n

```bash
cd /Volumes/VRMini/n8n
./scripts/start-n8n.sh
```

Verify it's running:
```bash
lsof -i :5678
```

### 2. Open n8n in Playwright Browser

In Cursor, the assistant navigates directly:

```
mcp_cursor-ide-browser_browser_navigate({ url: "http://localhost:5678" })
```

The Playwright browser window will open automatically.

### 3. (Optional) Browser Tools for Debugging

For console logs and network debugging:

```bash
# Check if browser-tools-server is running (port 3025 or 3026)
lsof -i :3025 || lsof -i :3026

# Start if needed
cd /Users/trust/Dev/mcps/browser-tools-mcp/browser-tools-server
npm start > /tmp/browser-tools-server.log 2>&1 &
```

## Playwright Browser Tools

### Navigation & State

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_snapshot` | Get page accessibility tree (better than screenshot) |
| `browser_navigate_back` | Go back |
| `browser_wait_for` | Wait for text/element |

### Interaction

| Tool | Purpose |
|------|---------|
| `browser_click` | Click element by ref |
| `browser_type` | Type into input field |
| `browser_hover` | Hover over element |
| `browser_select_option` | Select dropdown option |
| `browser_press_key` | Press keyboard key |

### Debugging

| Tool | Purpose |
|------|---------|
| `browser_console_messages` | Get console output |
| `browser_network_requests` | Get network activity |

## Workflow Development Pattern

### 1. Navigate and Snapshot

```typescript
// Go to n8n
browser_navigate({ url: "http://localhost:5678" })

// See what's on screen
browser_snapshot()
```

### 2. Interact with Elements

The snapshot returns element refs. Use them to interact:

```typescript
// Click a button
browser_click({ 
  element: "Create new workflow button", 
  ref: "ref-abc123" 
})

// Type in a field
browser_type({ 
  element: "Workflow name input", 
  ref: "ref-xyz789", 
  text: "My Workflow" 
})
```

### 3. Verify Changes

```typescript
// Re-snapshot to see result
browser_snapshot()
```

## Browser Tools MCP (Debugging)

When you need deeper debugging:

| Tool | Purpose |
|------|---------|
| `getConsoleLogs` | All console output |
| `getConsoleErrors` | Errors only |
| `getNetworkLogs` | All network requests |
| `getNetworkErrors` | Failed requests |
| `takeScreenshot` | Visual capture |
| `runPerformanceAudit` | Performance metrics |

## Session Workflow

```
┌─────────────────────────────────────────────┐
│  1. Start n8n: ./scripts/start-n8n.sh       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. Cursor: Navigate to localhost:5678      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. Snapshot → Interact → Snapshot          │
│     (repeat as needed)                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. If debugging: use Browser Tools MCP     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. Stop n8n: ./scripts/stop-n8n.sh         │
└─────────────────────────────────────────────┘
```

## Quick Commands

| Task | Command |
|------|---------|
| Start n8n | `./scripts/start-n8n.sh` |
| Stop n8n | `./scripts/stop-n8n.sh` |
| Check if running | `lsof -i :5678` |
| View logs | `tail -f data/logs/n8n.log` |
| Health check | `curl http://localhost:5678/healthz` |

## Troubleshooting

### Playwright browser won't open

Cursor manages the Playwright browser automatically. If issues occur:
1. Restart Cursor
2. Check MCP configuration in Cursor settings

### n8n not responding

```bash
# Check process
lsof -i :5678

# Force stop and restart
./scripts/stop-n8n.sh
./scripts/start-n8n.sh
```

### Browser Tools not connecting

```bash
# Check server status
curl http://localhost:3025/console-logs || curl http://localhost:3026/console-logs

# Restart server
pkill -f browser-tools-server
cd /Users/trust/Dev/mcps/browser-tools-mcp/browser-tools-server
npm start > /tmp/browser-tools-server.log 2>&1 &
```

## Best Practices

1. **Use snapshots over screenshots** - Snapshots provide element refs for interaction
2. **Re-snapshot after actions** - Verify the action worked before proceeding
3. **Keep Browser Tools for debugging** - Don't use it for primary interaction
4. **Save workflows frequently** - n8n auto-saves, but verify in UI

---

*For terminal-only sessions (Claude CLI), see `02-manage-n8n-terminal.md`*

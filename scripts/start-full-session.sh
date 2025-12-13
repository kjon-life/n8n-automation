#!/bin/bash
# Start full n8n development session with browser tools
# For use with terminal agents (Claude CLI, etc.)

set -e

echo "=== Starting n8n Development Session ==="
echo ""

cd /Volumes/VRMini/n8n

# 1. Start n8n (if not running)
if lsof -i :5678 > /dev/null 2>&1; then
    echo "✅ n8n already running on http://localhost:5678"
else
    echo "Starting n8n..."
    ./scripts/start-n8n.sh &
    sleep 5
    
    if curl -s http://localhost:5678/healthz | grep -q "ok"; then
        echo "✅ n8n running on http://localhost:5678"
    else
        echo "❌ n8n failed to start"
        exit 1
    fi
fi

# 2. Start browser tools server (if not running)
if lsof -i :3025 > /dev/null 2>&1; then
    echo "✅ Browser Tools already on http://localhost:3025"
elif lsof -i :3026 > /dev/null 2>&1; then
    echo "✅ Browser Tools already on http://localhost:3026"
else
    echo "Starting Browser Tools Server..."
    cd /Users/trust/Dev/mcps/browser-tools-mcp/browser-tools-server
    npm start > /tmp/browser-tools-server.log 2>&1 &
    sleep 3
    cd /Volumes/VRMini/n8n
    
    if curl -s http://localhost:3025/console-logs > /dev/null 2>&1; then
        echo "✅ Browser Tools on http://localhost:3025"
    elif curl -s http://localhost:3026/console-logs > /dev/null 2>&1; then
        echo "✅ Browser Tools on http://localhost:3026"
    else
        echo "⚠️  Browser Tools server may not be responding"
    fi
fi

# 3. Check Chrome debugging port
echo ""
if curl -s http://localhost:9222/json > /dev/null 2>&1; then
    echo "✅ Chrome remote debugging active on port 9222"
else
    echo "⚠️  Chrome remote debugging not available"
    echo ""
    echo "To enable Chrome debugging:"
    echo "  1. Close ALL Chrome windows"
    echo "  2. Run: open -na \"Google Chrome\" --args \"--profile-directory=Profile 2\" --remote-debugging-port=9222"
fi

echo ""
echo "=== Session Status ==="
echo "n8n UI:        http://localhost:5678"
echo "n8n Health:    curl http://localhost:5678/healthz"
echo "Browser Tools: curl http://localhost:3025/console-logs"
echo ""
echo "=== Ready for Development ==="


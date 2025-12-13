#!/bin/bash

echo "Stopping n8n..."
# Find and kill n8n process
pkill -f "n8n"

if [ $? -eq 0 ]; then
    echo "n8n stopped successfully."
else
    echo "n8n was not running or could not be stopped."
fi


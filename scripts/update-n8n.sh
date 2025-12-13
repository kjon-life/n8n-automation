#!/bin/bash

VERSION=${1:-latest}

echo "Updating n8n to $VERSION..."
# Use --legacy-peer-deps to handle beta dependency conflicts
npm install n8n@$VERSION --legacy-peer-deps
echo "Update to $VERSION complete. Please restart n8n."

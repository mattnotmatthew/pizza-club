#!/bin/bash

# clear-docs.sh
# Clear MCP documentation server uploads to prevent project mixing

MCP_UPLOAD_DIR="$HOME/.mcp-documentation-server/uploads"

echo "🧹 Clearing MCP documentation uploads..."
echo "📂 Directory: $MCP_UPLOAD_DIR"

# Check if directory exists
if [ -d "$MCP_UPLOAD_DIR" ]; then
    # Count files before clearing
    FILE_COUNT=$(find "$MCP_UPLOAD_DIR" -type f \( -name "*.md" -o -name "*.txt" \) | wc -l | tr -d ' ')
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "📄 Found $FILE_COUNT documentation files"
        echo "🗑️  Removing all files..."
        rm -rf "$MCP_UPLOAD_DIR"/*
        echo "✅ Cleared all documentation files"
    else
        echo "✅ Upload directory is already empty"
    fi
else
    echo "ℹ️  Upload directory doesn't exist yet"
fi

echo ""
echo "💡 Tip: Run this after you're done using docs to keep projects separate"

#!/bin/bash

# sync-docs.sh
# Sync project documentation to MCP documentation server

# Configuration
DOCS_DIR="${DOCS_DIR:-./docs}"  # Default to ./docs, can be overridden
MCP_UPLOAD_DIR="$HOME/.mcp-documentation-server/uploads"

echo "🔄 Syncing documentation to MCP server..."
echo "📂 Source directory: $DOCS_DIR"

# Check if docs directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo "⚠️  Warning: Documentation directory '$DOCS_DIR' not found."
    echo "   Please create it or set DOCS_DIR environment variable."
    exit 1
fi

# Create the MCP uploads directory if it doesn't exist
mkdir -p "$MCP_UPLOAD_DIR"

# Remove old uploads to ensure clean sync
echo "🧹 Cleaning previous uploads..."
rm -rf "$MCP_UPLOAD_DIR"/*

# Copy all markdown and text files
echo "📋 Copying documentation files..."
FILE_COUNT=0

# Find and copy .md files
find "$DOCS_DIR" -name "*.md" -type f | while read -r file; do
    # Get relative path from docs directory
    relative_path="${file#$DOCS_DIR/}"
    # Replace directory separators with underscores for flat structure
    flat_name="${relative_path//\//_}"
    # Copy file with flattened name
    cp "$file" "$MCP_UPLOAD_DIR/$flat_name"
    echo "  ✓ Copied: $relative_path"
    ((FILE_COUNT++))
done

# Find and copy .txt files
find "$DOCS_DIR" -name "*.txt" -type f | while read -r file; do
    # Get relative path from docs directory
    relative_path="${file#$DOCS_DIR/}"
    # Replace directory separators with underscores for flat structure
    flat_name="${relative_path//\//_}"
    # Copy file with flattened name
    cp "$file" "$MCP_UPLOAD_DIR/$flat_name"
    echo "  ✓ Copied: $relative_path"
    ((FILE_COUNT++))
done

# Count files (recalculate due to subshell)
FILE_COUNT=$(find "$MCP_UPLOAD_DIR" -type f \( -name "*.md" -o -name "*.txt" \) | wc -l | tr -d ' ')

echo ""
echo "✅ Sync complete! Copied $FILE_COUNT documentation files."
echo ""
echo "📝 Next steps:"
echo "  1. In Claude Code, run: 'process the uploaded documentation'"
echo "  2. Then you can: 'search docs for [topic]'"
echo ""

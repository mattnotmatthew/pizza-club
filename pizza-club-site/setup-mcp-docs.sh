#!/bin/bash

# setup-mcp-docs.sh
# Universal MCP Documentation Server Setup Script
# Copy this to any project to set up MCP documentation server

set -e

echo "🚀 MCP Documentation Server Setup"
echo "================================="
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js first."
    exit 1
fi

# Install MCP documentation server globally
echo "📦 Installing MCP documentation server..."
npm install -g @andrea9293/mcp-documentation-server

# Create MCP uploads directory
MCP_UPLOAD_DIR="$HOME/.mcp-documentation-server/uploads"
echo "📁 Creating MCP uploads directory at: $MCP_UPLOAD_DIR"
mkdir -p "$MCP_UPLOAD_DIR"

# Create .mcp.json if it doesn't exist
if [ ! -f ".mcp.json" ]; then
    echo "📝 Creating .mcp.json configuration..."
    cat > .mcp.json << 'EOF'
{
  "mcpServers": {}
}
EOF
else
    echo "✅ .mcp.json already exists"
fi

# Check if sync script already exists
if [ ! -f "./sync-docs.sh" ]; then
    echo "📄 Creating sync-docs.sh script..."
    
    # Create the sync script
    cat > ./sync-docs.sh << 'SYNC_SCRIPT'
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
SYNC_SCRIPT
    
    # Make it executable
    chmod +x ./sync-docs.sh
    echo "✅ Created sync-docs.sh"
else
    echo "✅ sync-docs.sh already exists"
fi

# Create clear-docs script
echo "🧹 Creating clear-docs.sh script..."
cat > ./clear-docs.sh << 'CLEAR_SCRIPT'
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
CLEAR_SCRIPT

chmod +x ./clear-docs.sh
echo "✅ Created clear-docs.sh"

# Update package.json if it exists
if [ -f "package.json" ]; then
    echo "📦 Checking package.json for scripts..."
    
    # Use a temporary file for safe editing
    cp package.json package.json.tmp
    
    # Add both scripts using node
    node << 'EOF'
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json.tmp", "utf8"));
    if (!pkg.scripts) pkg.scripts = {};
    
    // Add sync-docs if it doesn't exist
    if (!pkg.scripts["sync-docs"]) {
        pkg.scripts["sync-docs"] = "./sync-docs.sh";
        console.log("➕ Added sync-docs script");
    }
    
    // Add clear-docs if it doesn't exist
    if (!pkg.scripts["clear-docs"]) {
        pkg.scripts["clear-docs"] = "./clear-docs.sh";
        console.log("➕ Added clear-docs script");
    }
    
    fs.writeFileSync("package.json.tmp", JSON.stringify(pkg, null, 2) + "\n");
EOF
    
    mv package.json.tmp package.json
    echo "✅ Updated package.json with npm scripts"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📚 MCP Documentation Server is ready to use!"
echo ""
echo "🔧 Configuration needed in Claude Desktop:"
echo ""
echo "Add this to your Claude Desktop config:"
echo "(Usually at: ~/Library/Application Support/Claude/claude_desktop_config.json)"
echo ""
echo '  "mcpServers": {'
echo '    "docs": {'
echo '      "command": "npx",'
echo '      "args": ["-y", "@andrea9293/mcp-server-documentation"]'
echo '    }'
echo '  }'
echo ""
echo "📝 Usage:"
echo "  1. Add your documentation to ./docs/ (or set DOCS_DIR)"
echo "  2. Run: npm run sync-docs (or ./sync-docs.sh)"
echo "  3. In Claude Code: 'process uploads' then 'search docs'"
echo "  4. Run: npm run clear-docs when done (keeps projects separate)"
echo ""
echo "💡 Tips:"
echo "  • Customize docs directory: DOCS_DIR=./my-docs ./sync-docs.sh"
echo "  • Clear docs after use to prevent project mixing"
echo ""
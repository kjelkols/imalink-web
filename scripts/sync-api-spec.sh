#!/bin/bash
# Script to sync API specification from backend

set -e

API_URL="https://api.trollfjell.com"
OPENAPI_FILE="docs/openapi.json"
SPEC_FILE="docs/COMPLETE_API_SPECIFICATION.md"

echo "🔄 Syncing API specification from backend..."
echo ""

# 1. Download OpenAPI spec
echo "📥 Downloading OpenAPI spec from $API_URL/openapi.json"
curl -s "$API_URL/openapi.json" > "$OPENAPI_FILE"

if [ ! -s "$OPENAPI_FILE" ]; then
    echo "❌ Failed to download OpenAPI spec"
    exit 1
fi

echo "✅ OpenAPI spec downloaded"
echo ""

# 2. Extract version info
VERSION=$(jq -r '.info.version' "$OPENAPI_FILE")
TITLE=$(jq -r '.info.title' "$OPENAPI_FILE")

echo "📋 API Info:"
echo "   Title: $TITLE"
echo "   Version: $VERSION"
echo ""

# 3. Check if version has changed
LAST_VERSION=$(grep -oP '(?<=API Version: )\d+\.\d+' "$SPEC_FILE" || echo "unknown")
if [ "$VERSION" != "$LAST_VERSION" ]; then
    echo "⚠️  API VERSION CHANGED: $LAST_VERSION → $VERSION"
    echo ""
    echo "🔍 Endpoint changes:"
    echo ""
    
    # List all endpoints
    jq -r '.paths | keys[]' "$OPENAPI_FILE" | sort
    
    echo ""
    echo "⚠️  MANUAL ACTION REQUIRED:"
    echo "   1. Review changes in docs/openapi.json"
    echo "   2. Update docs/COMPLETE_API_SPECIFICATION.md"
    echo "   3. Update lib/types.ts if data models changed"
    echo "   4. Update lib/api-client.ts if endpoints changed"
    echo "   5. Run npm run type-check to verify"
    echo ""
else
    echo "✅ API version unchanged ($VERSION)"
fi

# 4. Generate TypeScript types (optional - requires openapi-typescript)
if command -v openapi-typescript &> /dev/null; then
    echo ""
    echo "🔧 Generating TypeScript types..."
    npx openapi-typescript "$OPENAPI_FILE" --output lib/api-types.generated.ts
    echo "✅ Types generated in lib/api-types.generated.ts"
else
    echo ""
    echo "💡 Tip: Install openapi-typescript to auto-generate types:"
    echo "   npm install -D openapi-typescript"
fi

echo ""
echo "✅ Sync complete!"

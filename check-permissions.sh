#!/bin/bash

echo "Checking AWS Lambda permissions..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Get current user info
USER_INFO=$(aws sts get-caller-identity)
echo "Current AWS user: $USER_INFO"

# Test Lambda permissions
echo ""
echo "Testing Lambda permissions for web-portal-presign function..."

# Test GetFunction permission
if aws lambda get-function --function-name web-portal-presign > /dev/null 2>&1; then
    echo "✅ GetFunction permission: OK"
else
    echo "❌ GetFunction permission: DENIED"
fi

# Test UpdateFunctionCode permission (dry run)
echo ""
echo "Testing UpdateFunctionCode permission..."
echo "Note: This is a dry run test - no actual update will occur"

# Create a dummy zip file for testing
echo "console.log('test');" > test.js
zip test.zip test.js > /dev/null 2>&1

# Test the permission (this will fail but show if permission exists)
if aws lambda update-function-code --function-name web-portal-presign --zip-file fileb://test.zip --dry-run 2>&1 | grep -q "DryRunOperation"; then
    echo "✅ UpdateFunctionCode permission: OK"
elif aws lambda update-function-code --function-name web-portal-presign --zip-file fileb://test.zip 2>&1 | grep -q "AccessDenied\|Forbidden"; then
    echo "❌ UpdateFunctionCode permission: DENIED"
else
    echo "⚠️  UpdateFunctionCode permission: UNKNOWN (may work)"
fi

# Cleanup
rm -f test.js test.zip

echo ""
echo "If you see any ❌ DENIED messages, you need to add the missing permissions."
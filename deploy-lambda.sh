#!/bin/bash

# Deploy Lambda function
echo "Deploying Lambda function..."

# Create deployment package
zip -r lambda-deployment.zip lambda-simple-auth.js lambda-package.json

# Update Lambda function
aws lambda update-function-code \
  --function-name web-portal-presign \
  --zip-file fileb://lambda-deployment.zip

# Update environment variables
aws lambda update-function-configuration \
  --function-name web-portal-presign \
  --environment Variables='{
    "AUTH0_AUDIENCE":"https://replica.api"
  }'

echo "Lambda function deployed successfully!"

# Clean up
rm lambda-deployment.zip
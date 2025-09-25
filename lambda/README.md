# Lambda Function

This directory contains the AWS Lambda function for the Replica Health web portal.

## Files

- `index.js` - Main Lambda function code
- `package.json` - Lambda dependencies
- `lambda-test-*.json` - Test event files for Lambda testing

## Deployment

The Lambda function is automatically deployed via GitHub Actions when changes are pushed to the main branch.

## Environment Variables

Required in AWS Lambda:
- `AUTH0_DOMAIN` - Auth0 domain
- `AUTH0_AUDIENCE` - Auth0 API audience
- `ENABLE_JWT_VERIFICATION` - Set to 'true' for production
- `ALLOWED_ORIGIN` - CORS origin (optional)

## Testing

Use the test event files in AWS Lambda console to test different scenarios.
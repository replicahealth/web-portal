# Deployment Setup Guide

## GitHub Actions CI/CD Setup

This repository now includes automated deployment for the Lambda function when changes are merged to `main`.

### Required GitHub Secrets

You need to add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:

#### AWS Credentials
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

### IAM Permissions Required

Your AWS user needs these permissions for Lambda deployment:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:UpdateFunctionCode",
                "lambda:GetFunction"
            ],
            "Resource": "arn:aws:lambda:us-east-1:*:function:web-portal-presign"
        }
    ]
}
```

### How It Works

1. **Lambda Deployment**: When `web-portal-presign.js` is changed and pushed to `main`, GitHub Actions will:
   - Zip the Lambda function
   - Update the `web-portal-presign` function in AWS
   
2. **Frontend Deployment**: AWS Amplify continues to handle frontend deployments automatically

### Testing the Setup

1. Make a small change to `web-portal-presign.js`
2. Commit and push to `main`
3. Check the **Actions** tab in GitHub to see the deployment progress
4. Verify the Lambda function was updated in AWS Console

### Troubleshooting

- Check GitHub Actions logs if deployment fails
- Ensure AWS credentials have correct permissions
- Verify the Lambda function name matches `web-portal-presign`
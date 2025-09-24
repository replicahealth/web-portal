# Replica Health Research Data Portal

React + Vite portal for dataset access with Auth0 authentication and role-based permissions.

## Features

- **Auth0 Authentication**: Secure login with role-based access control
- **Dataset Management**: Browse and download research datasets
- **Role-based Access**: Public and private dataset permissions
- **Terms of Use**: Modal agreements before downloads
- **Responsive Design**: Modern UI with Replica Health branding

## Getting Started

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Auth0 account
- AWS Lambda function (for production)

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `.env` with your values:

```bash
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier

# Local Development URLs
VITE_REDIRECT_URI=http://localhost:5173
VITE_LOGOUT_URI=http://localhost:5173

# API Configuration
VITE_API_BASE=http://localhost:8787
VITE_TERMS_PUBLIC_VERSION=v1
VITE_TERMS_PRIVATE_VERSION=v1

# Role Configuration
VITE_ROLES_CLAIM=https://replicahealth.com/roles

# Dataset API (choose one)
# For local testing:
VITE_PRESIGN_API_BASE=http://localhost:3001
# For production:
# VITE_PRESIGN_API_BASE=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod

# AWS Configuration
BUCKET_NAME=your-s3-bucket-name
```

### 4. Auth0 Setup

1. Create an Auth0 application (Single Page Application)
2. Configure allowed callback URLs: `http://localhost:5173`
3. Configure allowed logout URLs: `http://localhost:5173`
4. Set up custom claims for roles in Auth0 Actions
5. Configure user roles: `dataset:public_v1` or `dataset:private_v1`

### 5. Development Mode

#### Option A: With Mock Server (Recommended for development)

Start the mock server:
```bash
node mock-server.cjs
```

In another terminal, start the React app:
```bash
npm run dev
```

#### Option B: With Real AWS Lambda

1. Deploy the Lambda function (`lambda-function.js`)
2. Set up API Gateway
3. Update `VITE_PRESIGN_API_BASE` in `.env`
4. Start the app:
```bash
npm run dev
```

### 6. Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── auth/                 # Auth0 configuration and role management
├── components/           # Reusable React components
│   ├── Protected.tsx     # Route protection
│   ├── TermsGate.tsx     # Terms agreement component
│   └── TermsModal.tsx    # Terms of use modal
├── lib/                  # API utilities
│   └── api.ts           # Dataset API functions
├── pages/               # Application pages
│   ├── Home.tsx         # Landing page
│   └── Datasets.tsx     # Dataset browser and download
├── styles/              # CSS styling
│   └── replica.css      # Replica Health theme
└── App.tsx              # Main application component
```

## User Roles

- **`dataset:public_v1`**: Access to public datasets only
- **`dataset:private_v1`**: Access to both public and private datasets

## API Endpoints

The Lambda function supports:

- `GET /presign?op=list&type=public` - List public datasets
- `GET /presign?op=list&type=private` - List private datasets  
- `POST /presign?op=batch` - Batch download selected datasets
- `GET /presign?op=get&key=file-key` - Get presigned URL for specific file

## Mock Server

For development, use the included mock server (`mock-server.cjs`) which simulates:

- Dataset listing with sample data
- Terms of use enforcement
- File downloads with mock CSV data
- Role-based access control

## Deployment

1. Build the application: `npm run build`
2. Deploy `dist/` folder to your hosting service
3. Ensure environment variables are configured in production
4. Update Auth0 callback URLs for production domain

## Troubleshooting

### Common Issues

1. **Auth0 Login Issues**: Check callback URLs and domain configuration
2. **API Connection**: Verify `VITE_PRESIGN_API_BASE` URL is correct
3. **Role Access**: Ensure Auth0 custom claims are properly configured
4. **CORS Errors**: Check API Gateway CORS settings

### Development Tips

- Use browser dev tools to inspect Auth0 tokens and claims
- Check console for API errors
- Verify `.env` file is not committed to git
- Test with different user roles

## License

Private - Replica Health Internal Use
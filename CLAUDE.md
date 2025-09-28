# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + Vite portal for Replica Health's diabetes research dataset access. Features Auth0 authentication with role-based permissions, dataset management, and user activity tracking. The portal provides secure access to both public and private research datasets with terms of use agreements.

## Essential Commands

### Development
- `npm run dev` - Start development server (port 5173)
- `node mock-server.cjs` - Start mock API server for local development (port 3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run type-check` - TypeScript type checking
- `npm run pre-commit` - Run both lint and type-check (used by Husky)

### Testing
- `npm test` - Run frontend tests (Vitest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:lambda` - Run Lambda function tests
- Test files: `*.test.tsx`, `*.test.ts` in `__tests__` folders

## Architecture

### Frontend (React + Vite)
- **Entry**: `src/main.tsx` → wraps App with Auth0 provider
- **Routing**: React Router v7 with two main routes (Home, Datasets)
- **Auth**: Auth0 React SDK with custom `AuthProviderWithNavigate` wrapper
- **Styling**: Custom Replica Health theme in `src/styles/replica.css`
- **API Client**: `src/lib/api.ts` handles dataset operations and presigned URLs

### Key Components
- `src/components/Protected.tsx` - Route protection with Auth0
- `src/components/TermsGate.tsx` - Enforces terms agreement before dataset access
- `src/components/TermsModal.tsx` - Displays terms of use
- `src/components/RequestAccessForm.tsx` - Form for users without dataset roles

### Lambda Function
- `lambda/index.js` - AWS Lambda for S3 presigned URLs and user tracking
- Supports list, get, and batch operations
- JWT validation with Auth0 public keys
- User activity tracking via Auth0 Management API

### Role System
- Claims from `https://replicahealth.com/roles` namespace
- `dataset:public_v1` - Access to public datasets
- `dataset:private_v1` - Access to both public and private datasets
- No role - Can request access via form

## Environment Configuration

Required `.env` variables:
- Auth0: `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
- API: `VITE_PRESIGN_API_BASE` (mock server or Lambda endpoint)
- Roles: `VITE_ROLES_CLAIM` (namespace for Auth0 custom claims)
- Terms versions: `VITE_TERMS_PUBLIC_VERSION`, `VITE_TERMS_PRIVATE_VERSION`

## CI/CD Pipeline

### GitHub Actions Workflows
- `test.yml` - Runs on all pushes/PRs (frontend + Lambda tests)
- `pr-checks.yml` - PR validation (lint, type-check, tests)
- `deploy-lambda.yml` - Auto-deploys Lambda on changes to `lambda/`
- `deploy-amplify.yml` - Triggers AWS Amplify deployment on main

### Branch Protection
- Tests must pass before merge
- No direct pushes to main
- Feature branches → PR → main → auto-deploy

## Development Workflow

1. Feature branches from main
2. Pre-commit hooks run lint and type-check (Husky + lint-staged)
3. Tests run automatically on push
4. PR to main requires passing tests
5. Merge triggers automatic deployment

## Error Tracking

Sentry integration (`src/sentry.ts`) for production error monitoring. DSN configured via environment variable.

## Testing Strategy

- Frontend: Vitest with React Testing Library and jsdom
- Lambda: Node.js built-in test runner
- Mock server (`mock-server.cjs`) simulates AWS Lambda locally
- Test coverage includes component rendering, API integration, JWT validation
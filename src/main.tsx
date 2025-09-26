import React from 'react'
import ReactDOM from 'react-dom/client'
import './sentry.ts' // Initialize Sentry first
import App from './App'
import AuthProviderWithNavigate from './auth/AuthProviderWithNavigate'
import './styles/replica.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProviderWithNavigate>
      <App />
    </AuthProviderWithNavigate>
  </React.StrictMode>
)
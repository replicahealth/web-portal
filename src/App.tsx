import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/Home';
import Datasets from './pages/Datasets';
import About from './pages/About';
import DataDictionary from './pages/DataDictionary';

function Navigation() {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getTabStyle = (path: string, color: { bg: string, border: string, text: string }) => {
    if (isActive(path)) {
      return {
        backgroundColor: color.bg,
        border: `1.5px solid ${color.border}`,
        color: color.text,
        fontWeight: '600'
      };
    }
    return {
      backgroundColor: 'transparent',
      border: '1.5px solid transparent',
      color: '#475569',
      fontWeight: '500'
    };
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src="/logo.svg" alt="Replica Health" style={{ height: '32px' }} />
          <div className="nav-links">
            <Link
              to="/"
              className="nav-link"
              style={getTabStyle('/', {
                bg: '#e0f2fe',
                border: '#0284c7',
                text: '#075985'
              })}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link"
              style={getTabStyle('/about', {
                bg: '#f3e8ff',
                border: '#9333ea',
                text: '#6b21a8'
              })}
            >
              About
            </Link>
            <Link
              to="/data"
              className="nav-link"
              style={getTabStyle('/data', {
                bg: '#dcfce7',
                border: '#16a34a',
                text: '#14532d'
              })}
            >
              Data
            </Link>
          </div>
        </div>
        {isAuthenticated ? (
          <button className="btn btn-secondary" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log out
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/data" element={<Datasets />} />
        <Route path="/data-dictionary" element={<DataDictionary />} />
      </Routes>
    </BrowserRouter>
  );
}
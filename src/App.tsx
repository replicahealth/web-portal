import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/Home';
import Datasets from './pages/Datasets';

function Navigation() {
  const { isAuthenticated, logout } = useAuth0();
  
  if (!isAuthenticated) return null;
  
  return (
    <nav className="nav">
      <div className="nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src="/logo.svg" alt="Replica Health" style={{ height: '32px' }} />
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/datasets" className="nav-link">Datasets</Link>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Log out
        </button>
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
        <Route path="/datasets" element={<Datasets />} />
      </Routes>
    </BrowserRouter>
  );
}
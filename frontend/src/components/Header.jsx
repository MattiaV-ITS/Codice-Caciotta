// components/Header.jsx
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ onMenuToggle }) {  // ← Riceve la funzione per aprire/chiudere il menu
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const handleLogout = () => {
    try {
      console.log('Logout button clicked');
      logout();
      console.log('Logout function called, navigating to login');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback navigation
      window.location.href = '/login';
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          {/* Pulsante hamburger (visibile solo su mobile) */}
          <button 
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <Link to="/" className="logo">
            <div className="logo-icon">🐾</div>
            <span>Il Tuo Veterinario</span>
          </Link>
        </div>

        <nav className="nav-links">
          <span className="badge badge-info" style={{ marginRight: '12px' }}>
            Area Clinica
          </span>

          {isAuthenticated() ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="nav-link">
                  Amministratore
                </Link>
              )}

              <span className="nav-user">Ciao, {user?.username}</span>

              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Disconnetti
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Accedi</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Registrati</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
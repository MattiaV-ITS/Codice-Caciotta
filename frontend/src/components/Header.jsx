import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-container">

        <Link to="/" className="brand">
          Il Tuo Veterinario
        </Link>

        <nav className="nav-links">
          <span className="badge">Area Clinica</span>

          {isAuthenticated() ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="nav-link">
                  Amministratore
                </Link>
              )}

              <span className="nav-user">Ciao, {user?.username}</span>

              <button onClick={handleLogout} className="logout-btn">
                Disconnetti
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Accedi</Link>
              <Link to="/signup" className="nav-link">Registrati</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Il Tuo Veterinario</Link>
      </div>
      <div className="navbar-links">
        {isAuthenticated() ? (
          <>
          {isAdmin && <Link to="/admin" className="navbar-link">Amministratore</Link>}
            <span className="navbar-user">Ciao, {user?.username}</span>
            <button onClick={handleLogout} className="navbar-logout">
              Disconnetti
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Accedi</Link>
            <Link to="/signup" className="navbar-link">Registrati</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

// components/Layout/Layout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          {/* Pulsante hamburger (visibile solo su mobile) */}
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          
          <div className="logo" onClick={() => navigate('/')}>
            <div className="logo-icon">🐾</div>
            <span>VetCare</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-menu" onClick={() => navigate('/profile')}>
            <div className="user-avatar">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span>{user?.username || 'Utente'}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Esci
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* Overlay scuro per chiudere il menu cliccando fuori */}
        <div 
          className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`}
          onClick={closeMenu}
        />

        {/* Sidebar con classe open per mostrare/nascondere */}
        <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
              end
              onClick={closeMenu}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </NavLink>
            <NavLink 
              to="/animali" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🐕</span>
              Animali
            </NavLink>
            <NavLink 
              to="/visite" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🩺</span>
              Visite
            </NavLink>
            <NavLink 
              to="/prenotazioni" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">📅</span>
              Prenotazioni
            </NavLink>

            <div className="nav-divider" />

            <div className="nav-label">Amministrazione</div>
            <NavLink 
              to="/fatture" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">📄</span>
              Fatture
            </NavLink>
            <NavLink 
              to="/ricette" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">💊</span>
              Ricette
            </NavLink>

            {user?.roles?.includes('ROLE_ADMIN') && (
              <>
                <div className="nav-divider" />
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">⚙️</span>
                  Admin
                </NavLink>
              </>
            )}
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
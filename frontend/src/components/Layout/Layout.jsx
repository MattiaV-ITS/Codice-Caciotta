// components/Layout/Layout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Header';  // ← Importa il tuo Header esistente

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

  // Funzione per passare al componente Header
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app-container">
      <Header onMenuToggle={toggleMenu} />  {/* ← Usa il tuo Header */}

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
              Pazienti
            </NavLink>
            <NavLink 
              to="/proprietari" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">👥</span>
              Proprietari
            </NavLink>
            <NavLink 
              to="/vaccinazioni" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">💉</span>
              Vaccinazioni
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
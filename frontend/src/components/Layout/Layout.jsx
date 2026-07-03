// components/Layout/Layout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">🐾</div>
            <span>VetCare</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span>{user?.username || 'Utente'}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => {
            // logout logic
          }}>
            Esci
          </button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <span className="nav-icon">📊</span> Dashboard
            </NavLink>
            <NavLink to="/animali" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🐕</span> Animali
            </NavLink>
            <NavLink to="/proprietari" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">👥</span> Proprietari
            </NavLink>
            <NavLink to="/visite" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🩺</span> Visite
            </NavLink>
            <NavLink to="/prenotazioni" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📅</span> Prenotazioni
            </NavLink>

            <div className="nav-divider" />

            <div className="nav-label">Amministrazione</div>
            <NavLink to="/fatture" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📄</span> Fatture
            </NavLink>
            <NavLink to="/ricette" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">💊</span> Ricette
            </NavLink>

            {user?.roles?.includes('ROLE_ADMIN') && (
              <>
                <div className="nav-divider" />
                <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">⚙️</span> Admin
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

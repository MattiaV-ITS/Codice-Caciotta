import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, closeMenu }) {
  const { user } = useAuth();

  const isStaff = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>

        {/* Dashboard Utente - solo per USER */}
        {user?.roles?.includes('ROLE_USER') && (
          <NavLink
            to="/dashboard/user"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
            onClick={closeMenu}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </NavLink>
        )}

        {/* Dashboard Staff/Admin - per STAFF e ADMIN */}
        {isStaff && (
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
            onClick={closeMenu}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
        )}

        {/* Sezioni Staff/Admin */}
        {isStaff && (
          <>
            <NavLink
              to="/animali"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🐕</span>
              Animali
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
              to="/prenotazioni"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">📅</span>
              Prenotazioni
            </NavLink>

            <NavLink
              to="/prestazioni"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🏥</span>
              Prestazioni
            </NavLink>

            <NavLink
              to="/vaccinazioni"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">💉</span>
              Vaccinazioni
            </NavLink>

            <div className="nav-divider" />

            <div className="nav-label">Amministrazione</div>

            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">⚙️</span>
              Admin
            </NavLink>

            <NavLink
              to="/admin/orari"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🕐</span>
              Orari Studio
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ChartIcon,
  UserIcon,
  PawIcon,
  CalendarIcon,
  SyringeIcon,
  LockIcon,
  ServicesIcon,
  ClockIcon,
  InvoiceIcon
} from '../components/icons';

function Sidebar({ isOpen, closeMenu }) {
  const { user } = useAuth();

  const isStaff = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>

        {/* Dashboard Utente - solo per USER (e non staff/admin) */}
        {user?.roles?.includes('ROLE_USER') && !isStaff && (
          <NavLink
            to="/dashboard/user"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
            onClick={closeMenu}
          >
            <span className="nav-icon">
              <HomeIcon width="20" height="20" strokeWidth="2" />
            </span>
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
            <span className="nav-icon">
              <ChartIcon width="20" height="20" strokeWidth="2" />
            </span>
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
              <span className="nav-icon">
                <PawIcon width="20" height="20" />
              </span>
              Animali
            </NavLink>

            <NavLink
              to="/proprietari"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <UserIcon width="20" height="20" strokeWidth="2" />
              </span>
              Proprietari
            </NavLink>

            <NavLink
              to="/prenotazioni"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <CalendarIcon width="20" height="20" strokeWidth="2" />
              </span>
              Prenotazioni
            </NavLink>

            <NavLink
              to="/prestazioni"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <ServicesIcon width="20" height="20" />
              </span>
              Prestazioni
            </NavLink>

            <NavLink
              to="/vaccinazioni"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <SyringeIcon width="20" height="20" />
              </span>
              Vaccinazioni
            </NavLink>

            <NavLink
              to="/fatture/stats"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <InvoiceIcon width="20" height="20" />
              </span>
              Fatture
            </NavLink>

            <div className="nav-divider" />

            <div className="nav-label">Amministrazione</div>

            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <LockIcon width="20" height="20" strokeWidth="2" />
              </span>
              Admin
            </NavLink>

            <NavLink
              to="/admin/orari"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">
                <ClockIcon width="20" height="20" />
              </span>
              Orari Studio
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
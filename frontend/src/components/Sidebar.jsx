import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, closeMenu }) {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay scuro */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>

          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            end
            onClick={closeMenu}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/animali"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🐕</span>
            Pazienti
          </NavLink>

          <NavLink
            to="/proprietari"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">👥</span>
            Proprietari
          </NavLink>

          <NavLink
            to="/vaccinazioni"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">💉</span>
            Vaccinazioni
          </NavLink>

          <NavLink
            to="/prenotazioni"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📅</span>
            Prenotazioni
          </NavLink>

          <div className="nav-divider" />

          <div className="nav-label">Amministrazione</div>

          {/* <NavLink
            to="/fatture"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📄</span>
            Fatture
          </NavLink>

          <NavLink
            to="/ricette"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">💊</span>
            Ricette
          </NavLink> */}

          {user?.roles?.includes("ROLE_ADMIN") && (
            <>
              <div className="nav-divider" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={closeMenu}
              >
                <span className="nav-icon">⚙️</span>
                Admin
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

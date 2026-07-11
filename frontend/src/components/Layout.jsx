import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

export function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="app-container">
      <Header onMenuToggle={toggleMenu} />

      <div className="main-layout">
        <Sidebar isOpen={isMenuOpen} closeMenu={closeMenu} />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

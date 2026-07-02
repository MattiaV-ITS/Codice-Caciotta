import React from 'react';

function Header() {
  return (
    <header className="main-header">
      <div className="header-container">
        <h1>IL TUO VETERINARIO</h1>
        <nav>
          {/* Qui in futuro potrai aggiungere i link di navigazione */}
          <span className="badge">Area Clinica</span>
        </nav>
      </div>
    </header>
  );
}

export default Header;
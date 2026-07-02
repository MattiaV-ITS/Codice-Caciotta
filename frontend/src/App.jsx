import React from 'react';
import Header from './components/Header';
import AnimaliLista from './components/AnimaliLista';
import './App.css'; // Importiamo il file CSS per gli stili specifici della pagina

function App() {
  return (
    <div className="app-layout">
      {/* Componente Base Fisso */}
      <Header />
      
      {/* Contenuto Dinamico della Pagina */}
      <main className="main-content">
        <AnimaliLista />
      </main>
    </div>
  );
}

export default App;
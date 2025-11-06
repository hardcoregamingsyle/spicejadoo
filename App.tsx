import React from 'react';
import { Game } from './components/Game';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🌶️</span>
          <h1 style={{ fontSize: 22, margin: 0 }}>Spice Jadoo</h1>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        <Game />
      </main>

      <footer style={{ textAlign: 'center', padding: '16px', fontSize: 13, color: 'gray' }}>
        Crafted with ❤️ & spice | Flavor the world
      </footer>
    </div>
  );
}

export default App;

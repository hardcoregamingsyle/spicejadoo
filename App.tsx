import React from 'react';
import { Game } from './components/Game';

function App() {
  return (
    <div className="app-wrap">
      <header className="app-header">
        <div className="app-title">
          <span className="logo">🍛</span>
          <div>
            <div>Spice Jadoo</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Discover flavors by combining spices</div>
          </div>
        </div>

        <div className="app-actions">
          {/* Buttons in header keep their existing behavior defined inside Game component.
              The header here is visual; the Game component duplicates its own header buttons,
              but the visual header keeps an app-level presence. */}
        </div>
      </header>

      <main className="main-grid" style={{ marginTop: 16 }}>
        {/* Left column: Game will render inside the left panel container. */}
        <div className="card play-panel">
          <Game />
        </div>

        {/* Right column: leave placeholder — Game renders its own side panels if it already does. */}
        <aside className="card" style={{ maxHeight: 'min-content' }}>
          {/* If Game renders full layout already (it does), this card will appear empty — it's safe.
              If you prefer the right-side panel to be controlled inside Game, remove this aside. */}
          <div style={{ fontWeight: 700 }}>Ingredients</div>
          <div className="small-muted" style={{ marginTop: 8 }}>Use the in-game interface to add spices.</div>
        </aside>
      </main>
    </div>
  );
}

export default App;

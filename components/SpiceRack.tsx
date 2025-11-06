import React from 'react';
import { SPICES } from '../constants';

interface SpiceRackProps {
  onSpiceSelect: (spiceId: string) => void;
  disabled: boolean;
}

export const SpiceRack: React.FC<SpiceRackProps> = ({ onSpiceSelect, disabled }) => {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Add Spices to your Cauldron</h3>
        <p className="small-muted" style={{ marginTop: 6 }}>Click to discover new flavors.</p>
      </div>

      <div className="ingredients-grid">
        {SPICES.map(spice => (
          <button
            key={spice.id}
            onClick={() => onSpiceSelect(spice.id)}
            disabled={disabled}
            className="ingredient"
            title={disabled ? undefined : spice.description}
          >
            <div className="emoji" aria-hidden>
              <spice.icon className="w-10 h-10" />
            </div>
            <p className="name">{spice.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

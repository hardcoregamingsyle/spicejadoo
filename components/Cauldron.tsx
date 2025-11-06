import React from 'react';
import { SelectedSpice } from '../types';
import { Card } from './ui/Card';

interface CauldronProps {
  selectedSpices: SelectedSpice[];
  onRemoveSpice: (spiceId: string) => void;
}

export const Cauldron: React.FC<CauldronProps> = ({ selectedSpices, onRemoveSpice }) => {
  return (
    <Card>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>Your Ingredients</h3>
      <div style={{ marginTop: 12 }}>
        {selectedSpices.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🫙</div>
            <p>Your cauldron is empty.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedSpices.map(spice => (
              <div key={spice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, background: '#fff', border: '1px solid rgba(229,231,235,0.6)' }}>
                <div style={{ fontWeight: 600 }}>{spice.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: '#f3f4f6' }}>x{spice.quantity}</div>
                  <button onClick={() => onRemoveSpice(spice.id)} className="btn ghost" title="Remove one">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

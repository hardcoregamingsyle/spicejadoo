import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SPICES, EMPTY_PROFILE } from '../constants';
import { Challenge, SelectedSpice, OracleJudgement, FlavorProfile } from '../types';
import { generateGeminiResponse } from '../services/geminiService';

import { SpiceRack } from './SpiceRack';
import { Cauldron } from './Cauldron';
import { FlavorMeters } from './FlavorMeters';
import { OracleResponse } from './OracleResponse';
import { Loader } from './Loader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Celebration } from './Celebration';

interface GameScreenProps {
  challenge: Challenge;
  onNextChallenge: () => void;
  onNewGame: () => void;
}

// ✅ Helper to safely add flavor values
const safeAdd = (profile: FlavorProfile, key: keyof FlavorProfile, value?: number) => {
  profile[key] = (profile[key] || 0) + (value || 0);
};

export const GameScreen: React.FC<GameScreenProps> = ({ challenge, onNextChallenge }) => {
  const [selectedSpices, setSelectedSpices] = useState<SelectedSpice[]>([]);
  const [isConsultingOracle, setIsConsultingOracle] = useState(false);
  const [oracleJudgement, setOracleJudgement] = useState<OracleJudgement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setSelectedSpices([]);
    setOracleJudgement(null);
    setShowCelebration(false);
    setIsConsultingOracle(false);
  }, [challenge]);

  // ✅ Always defined, never breaks
  const currentProfile = useMemo((): FlavorProfile => {
    const newProfile: FlavorProfile = { ...EMPTY_PROFILE };
    selectedSpices.forEach(selected => {
      const spice = SPICES.find(s => s.id === selected.id);
      if (spice && spice.flavorProfile) {
        const fp = spice.flavorProfile;
        safeAdd(newProfile, 'Heat', fp.Heat * selected.quantity);
        safeAdd(newProfile, 'Sweetness', fp.Sweetness * selected.quantity);
        safeAdd(newProfile, 'Sourness', fp.Sourness * selected.quantity);
        safeAdd(newProfile, 'Umami', fp.Umami * selected.quantity);
        safeAdd(newProfile, 'Bitterness', fp.Bitterness * selected.quantity);
        safeAdd(newProfile, 'Aromatic', fp.Aromatic * selected.quantity);
      }
    });
    return newProfile;
  }, [selectedSpices]);

  const handleSpiceSelect = useCallback((spiceId: string) => {
    setSelectedSpices(prev => {
      const existing = prev.find(s => s.id === spiceId);
      const spice = SPICES.find(s => s.id === spiceId);
      if (!spice) return prev;
      if (existing) {
        return prev.map(s => s.id === spiceId ? { ...s, quantity: s.quantity + 1 } : s);
      } else {
        return [...prev, { id: spiceId, name: spice.name, quantity: 1 }];
      }
    });
  }, []);

  const handleRemoveSpice = useCallback((spiceId: string) => {
    setSelectedSpices(prev => {
      const existing = prev.find(s => s.id === spiceId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map(s => s.id === spiceId ? { ...s, quantity: s.quantity - 1 } : s);
      } else {
        return prev.filter(s => s.id !== spiceId);
      }
    });
  }, []);

  const handleClearCauldron = useCallback(() => {
    setSelectedSpices([]);
  }, []);

  const handleSubmitToOracle = async () => {
    if (selectedSpices.length === 0) return;
    setIsConsultingOracle(true);
    try {
      const judgement = await generateGeminiResponse(challenge, selectedSpices);
      setOracleJudgement(judgement);
      if (judgement.score >= 9) setShowCelebration(true);
    } catch (err) {
      console.error('Oracle error:', err);
      alert('Oracle is confused — try again!');
    } finally {
      setIsConsultingOracle(false);
    }
  };

  const handleCloseOracleResponse = () => onNextChallenge();
  const handleCelebrationComplete = () => setShowCelebration(false);

  return (
    <>
      {isConsultingOracle && <Loader />}
      {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
      {oracleJudgement && <OracleResponse judgement={oracleJudgement} onClose={handleCloseOracleResponse} />}

      <div
        className="main-grid"
        style={{
          all: 'unset',
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left side */}
        <div className="flex flex-col gap-5">
          <Card>
            <div
              style={{
                color: 'var(--muted)',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Challenge: {challenge.region}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{challenge.title}</h2>
            <p style={{ marginTop: 8 }}>{challenge.description}</p>
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
              <strong>Base:</strong> {challenge.base}
            </p>
          </Card>

          <SpiceRack
            onSpiceSelect={handleSpiceSelect}
            disabled={isConsultingOracle || !!oracleJudgement}
          />
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-5">
          <Cauldron
            selectedSpices={selectedSpices}
            onRemoveSpice={handleRemoveSpice}
          />
          <FlavorMeters
            currentProfile={currentProfile}
            targetProfile={challenge.targetProfile || EMPTY_PROFILE}
          />

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmitToOracle}
              disabled={selectedSpices.length === 0 || isConsultingOracle || !!oracleJudgement}
            >
              Consult the Oracle
            </Button>
            <Button
              variant="secondary"
              onClick={handleClearCauldron}
              disabled={selectedSpices.length === 0 || isConsultingOracle || !!oracleJudgement}
            >
              Clear Cauldron
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

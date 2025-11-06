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

export const GameScreen: React.FC<GameScreenProps> = ({ challenge, onNextChallenge }) => {
  const [selectedSpices, setSelectedSpices] = useState<SelectedSpice[]>([]);
  const [isConsultingOracle, setIsConsultingOracle] = useState(false);
  const [oracleJudgement, setOracleJudgement] = useState<OracleJudgement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Reset between challenges
  useEffect(() => {
    setSelectedSpices([]);
    setOracleJudgement(null);
    setShowCelebration(false);
    setIsConsultingOracle(false);
  }, [challenge]);

  // Calculate current flavor balance
  const currentProfile = useMemo((): FlavorProfile => {
    const newProfile: FlavorProfile = { ...EMPTY_PROFILE };
    selectedSpices.forEach(selected => {
      const spiceData = SPICES.find(s => s.id === selected.id);
      if (spiceData) {
        Object.keys(newProfile).forEach(flavorKey => {
          newProfile[flavorKey as keyof FlavorProfile] +=
            spiceData.flavorProfile[flavorKey as keyof FlavorProfile] * selected.quantity;
        });
      }
    });
    return newProfile;
  }, [selectedSpices]);

  const handleSpiceSelect = useCallback((spiceId: string) => {
    setSelectedSpices(prevSpices => {
      const existing = prevSpices.find(s => s.id === spiceId);
      const spice = SPICES.find(s => s.id === spiceId);
      if (!spice) return prevSpices;

      if (existing) {
        return prevSpices.map(s =>
          s.id === spiceId ? { ...s, quantity: s.quantity + 1 } : s
        );
      } else {
        return [...prevSpices, { id: spiceId, name: spice.name, quantity: 1 }];
      }
    });
  }, []);

  const handleRemoveSpice = useCallback((spiceId: string) => {
    setSelectedSpices(prevSpices => {
      const existing = prevSpices.find(s => s.id === spiceId);
      if (!existing) return prevSpices;

      if (existing.quantity > 1) {
        return prevSpices.map(s =>
          s.id === spiceId ? { ...s, quantity: s.quantity - 1 } : s
        );
      } else {
        return prevSpices.filter(s => s.id !== spiceId);
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
      const judgement = await generateGeminiResponse(challenge, selectedSpices, {
        short: true, // 👈 ensures shorter AI text
      });
      setOracleJudgement(judgement);

      if (judgement.score >= 9) setShowCelebration(true);
    } finally {
      setIsConsultingOracle(false);
    }
  };

  const handleCloseOracleResponse = () => {
    onNextChallenge();
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <>
      {isConsultingOracle && <Loader />}
      {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
      {oracleJudgement && (
        <OracleResponse
          judgement={oracleJudgement}
          onClose={handleCloseOracleResponse}
        />
      )}

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
        {/* Left Panel */}
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
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {challenge.title}
            </h2>
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

        {/* Right Panel */}
        <div className="flex flex-col gap-5">
          <Cauldron
            selectedSpices={selectedSpices}
            onRemoveSpice={handleRemoveSpice}
          />
          <FlavorMeters
            currentProfile={currentProfile}
            targetProfile={challenge.targetProfile}
          />

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmitToOracle}
              disabled={
                selectedSpices.length === 0 ||
                isConsultingOracle ||
                !!oracleJudgement
              }
            >
              Consult the Oracle
            </Button>
            <Button
              variant="secondary"
              onClick={handleClearCauldron}
              disabled={
                selectedSpices.length === 0 ||
                isConsultingOracle ||
                !!oracleJudgement
              }
            >
              Clear Cauldron
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

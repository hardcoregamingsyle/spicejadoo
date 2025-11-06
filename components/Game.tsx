import React, { useState, useCallback } from 'react';
import { GameScreen } from './GameScreen';
import { RegionSelector } from './RegionSelector';
import { Loader } from './Loader';
import { Challenge } from '../types';
import { generateGeminiResponse } from '../services/geminiService';
import { Button } from './ui/Button';

type GameState = 'selecting_region' | 'generating_challenge' | 'playing' | 'error';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('selecting_region');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);

  const fetchNewChallenge = useCallback(async (region: string) => {
    setGameState('generating_challenge');
    try {
      // Ask Gemini for a **short** challenge with relevant flavor hints
      const challenge = await generateGeminiResponse(region, {
        short: true, // ensures concise descriptions
        includeFlavors: true, // ensures targetProfile is included
      });
      setCurrentChallenge(challenge);
      setGameState('playing');
    } catch (e) {
      console.error(e);
      setGameState('error');
    }
  }, []);

  const handleRegionSelect = useCallback(
    (region: string) => {
      setCurrentRegion(region);
      fetchNewChallenge(region);
    },
    [fetchNewChallenge]
  );

  const handleNextChallenge = useCallback(() => {
    if (currentRegion) fetchNewChallenge(currentRegion);
  }, [currentRegion, fetchNewChallenge]);

  const startNewGame = useCallback(() => {
    if (window.confirm('Start a new game?')) {
      setCurrentChallenge(null);
      setCurrentRegion(null);
      setGameState('selecting_region');
    }
  }, []);

  const renderGameState = () => {
    switch (gameState) {
      case 'selecting_region':
        return <RegionSelector onSelect={handleRegionSelect} />;
      case 'generating_challenge':
        return <Loader message="Cooking up your next challenge..." />;
      case 'playing':
        return currentChallenge ? (
          <GameScreen
            challenge={currentChallenge}
            onNextChallenge={handleNextChallenge}
            onNewGame={startNewGame}
          />
        ) : (
          <div>Error loading challenge.</div>
        );
      case 'error':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-header text-red-600">Oops!</h2>
            <p>Could not generate a challenge. Try again?</p>
            <Button onClick={startNewGame}>Restart</Button>
          </div>
        );
    }
  };

  return (
    <>
      <header className="app-header" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="logo">🍛</span>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Spice Jadoo</h1>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="btn ghost" onClick={startNewGame}>
            New Game
          </button>
          <button className="btn primary" onClick={() => alert('Save feature coming soon')}>
            Save Game
          </button>
        </div>
      </header>

      <main style={{ marginTop: 18 }}>{renderGameState()}</main>
    </>
  );
};

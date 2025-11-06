import React, { useState, useCallback, useEffect } from 'react';
import { GameScreen } from './GameScreen';
import { RegionSelector } from './RegionSelector';
import { Loader } from './Loader';
import { Challenge } from '../types';
import { generateChallenge } from '../services/geminiService';
// Fix: Import the Button component to resolve reference errors.
import { Button } from './ui/Button';

type GameState = 'selecting_region' | 'generating_challenge' | 'playing' | 'error';

export const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('selecting_region');
    const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
    const [currentRegion, setCurrentRegion] = useState<string | null>(null);

    const fetchNewChallenge = useCallback(async (region: string) => {
        setGameState('generating_challenge');
        try {
            const challenge = await generateChallenge(region);
            setCurrentChallenge(challenge);
            setGameState('playing');
        } catch (e) {
            console.error(e);
            setGameState('error');
        }
    }, []);

    const handleRegionSelect = useCallback((region: string) => {
        setCurrentRegion(region);
        fetchNewChallenge(region);
    }, [fetchNewChallenge]);
    
    const handleNextChallenge = useCallback(() => {
        if(currentRegion) {
            fetchNewChallenge(currentRegion);
        }
    }, [currentRegion, fetchNewChallenge]);
    
    const startNewGame = useCallback(() => {
       if (window.confirm("Are you sure you want to start a new game?")) {
            setCurrentChallenge(null);
            setCurrentRegion(null);
            setGameState('selecting_region');
       }
    }, []);

    const renderGameState = () => {
        switch(gameState) {
            case 'selecting_region':
                return <RegionSelector onSelect={handleRegionSelect} />;
            case 'generating_challenge':
                return <Loader message="Generating a new culinary challenge..." />;
            case 'playing':
                if (currentChallenge) {
                    return <GameScreen challenge={currentChallenge} onNextChallenge={handleNextChallenge} onNewGame={startNewGame} />;
                }
                return <div>Error: Challenge not loaded.</div>; // Should not happen
            case 'error':
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-header text-red-600">An Error Occurred</h2>
                        <p>Could not generate a new challenge. Please try again.</p>
                        {/* Fix: Use Button component for UI consistency. */}
                        <Button onClick={startNewGame}>Try Again</Button>
                    </div>
                );
        }
    }

       return (
        <>
            {/* Optional: You can remove this header if you prefer App.tsx's header only */}
            <header className="app-header" style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="logo">🍛</span>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Spice Jadoo</h1>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                    <button className="btn ghost" onClick={startNewGame}>New Game</button>
                    <button className="btn primary" onClick={() => alert('Save coming soon')}>Save Game</button>
                </div>
            </header>

            <main style={{ marginTop: 18 }}>
                {renderGameState()}
            </main>
        </>
    );
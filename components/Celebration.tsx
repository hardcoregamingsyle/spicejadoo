import React, { useEffect, useMemo } from 'react';

const CONFETTI_COUNT = 100;

interface CelebrationProps {
    onComplete: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000); // Animation duration is 4s.

        return () => clearTimeout(timer);
    }, [onComplete]);

    const confetti = useMemo(() => {
        return Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
            const style = {
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                transform: `rotate(${Math.random() * 360}deg)`
            };
            return <div key={i} className="confetti" style={style}></div>;
        });
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confetti}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center animate-celebrate-text">
                    <h2 className="text-7xl font-header text-white" style={{ textShadow: '0 0 15px rgba(0,0,0,0.5), 0 0 25px var(--color-primary-dark)' }}>
                        Perfect Score!
                    </h2>
                    <p className="text-3xl text-white font-semibold mt-2" style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                        10/10
                    </p>
                </div>
            </div>
        </div>
    );
};
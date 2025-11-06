import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Consulting the Oracle...",
    "Simmering the spices...",
    "Perfecting the flavors...",
    "Awaiting a divine verdict...",
    "Plating your creation...",
];

const Spinner: React.FC = () => (
    <div 
      className="w-16 h-16 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"
      style={{ animation: 'spin 1s linear infinite' }}
    ></div>
);

// Fix: Add message prop to allow for static or dynamic loading messages.
interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message: staticMessage }) => {
    const [dynamicMessage, setDynamicMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        if (!staticMessage) {
            const intervalId = setInterval(() => {
                setDynamicMessage(prevMessage => {
                    const currentIndex = loadingMessages.indexOf(prevMessage);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 2000);

            return () => clearInterval(intervalId);
        }
    }, [staticMessage]);

    const message = staticMessage || dynamicMessage;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <Spinner />
        <p className="mt-6 text-[var(--color-text-header)] text-lg font-semibold transition-opacity duration-500">{message}</p>
    </div>
  );
};
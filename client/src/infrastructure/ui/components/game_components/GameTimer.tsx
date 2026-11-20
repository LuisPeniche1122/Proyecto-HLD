import React, { useState, useEffect, useRef } from 'react';

interface GameTimerProps {
    serverTimeLeft: number;
    currentPhase: string;
    className?: string; // Para inyectar estilos de posicionamiento (absolute, flex, etc.)
}

export const GameTimer: React.FC<GameTimerProps> = ({ serverTimeLeft, currentPhase, className = "" }) => {
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);
    const localEndTimeRef = useRef<number | null>(null);
    const phaseRef = useRef<string>(currentPhase);

    useEffect(() => {
        if (currentPhase !== phaseRef.current || !localEndTimeRef.current) {
            phaseRef.current = currentPhase;
            
            // Si el tiempo es infinito, no calculamos una fecha de fin
            if (serverTimeLeft === -1) {
                localEndTimeRef.current = null;
                setTimeLeft(-1);
            } else {
                localEndTimeRef.current = Date.now() + (serverTimeLeft * 1000);
            }
        }

        const updateTimer = () => {
            // Si el juego nos mandó tiempo infinito
            if (serverTimeLeft === -1) {
                setTimeLeft(-1);
                return;
            }

            if (localEndTimeRef.current) {
                const remaining = Math.max(0, Math.floor((localEndTimeRef.current - Date.now()) / 1000));
                setTimeLeft(remaining);
            }
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [currentPhase, serverTimeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className={`pointer-events-none ${className}`}>
            <div className="bg-black/70 border-2 border-[#444] rounded-lg px-4 py-2 flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)] backdrop-blur-sm min-w-[100px]">
                {timeLeft === -1 ? (
                    <>
                        <span className="text-lg md:text-xl">⏱️</span>
                        <span className="text-3xl md:text-4xl text-white font-bold leading-none mb-1">
                            ∞
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-lg md:text-xl">⏱️</span>
                        <span className={`text-xl md:text-2xl font-mono font-bold tracking-wider 
                            ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';

import { useMatchStore, selectPlayerById } from '../../hooks/match_store';
import { getCharacterAssets } from '../../dicts/characters_dict';

const PATH_COORDS = [
    { score: 0, r: 8, c: 0, label: 'START' },
    { score: 1, r: 7, c: 0 }, { score: 2, r: 6, c: 0 }, { score: 3, r: 5, c: 0 },
    { score: 4, r: 5, c: 1 }, { score: 5, r: 6, c: 1 }, { score: 6, r: 7, c: 1 },
    { score: 7, r: 7, c: 2 }, { score: 8, r: 7, c: 3 }, { score: 9, r: 7, c: 4 },
    { score: 10, r: 7, c: 5 }, { score: 11, r: 7, c: 6 }, { score: 12, r: 6, c: 6 },
    { score: 13, r: 6, c: 5 }, { score: 14, r: 6, c: 4 }, { score: 15, r: 6, c: 3 },
    { score: 16, r: 6, c: 2 }, { score: 17, r: 5, c: 2 }, { score: 18, r: 5, c: 3 },
    { score: 19, r: 5, c: 4 }, { score: 20, r: 5, c: 5 }, { score: 21, r: 5, c: 6 },
    { score: 22, r: 4, c: 6 }, { score: 23, r: 4, c: 5 }, { score: 24, r: 4, c: 4 },
    { score: 25, r: 4, c: 3 }, { score: 26, r: 4, c: 2 }, { score: 27, r: 4, c: 1 },
    { score: 28, r: 4, c: 0 }, { score: 29, r: 3, c: 0 }, { score: 30, r: 3, c: 1 },
    { score: 31, r: 3, c: 2 }, { score: 32, r: 3, c: 3 }, { score: 33, r: 3, c: 4 },
    { score: 34, r: 3, c: 5 }, { score: 35, r: 3, c: 6 }, { score: 36, r: 2, c: 6 },
    { score: 37, r: 1, c: 6 }, { score: 38, r: 1, c: 5 }, { score: 39, r: 2, c: 5 },
    { score: 40, r: 2, c: 4 }, { score: 41, r: 2, c: 3 }, { score: 42, r: 2, c: 2 },
    { score: 43, r: 2, c: 1 }, { score: 44, r: 2, c: 0 }, { score: 45, r: 1, c: 0 },
    { score: 46, r: 1, c: 1 }, { score: 47, r: 1, c: 2 }, { score: 48, r: 1, c: 3 },
    { score: 49, r: 1, c: 4 }, { score: 50, r: 0, c: 4, label: 'WIN!' }
];

interface PlayerBoardProps {
    userId: string; // Los datos del jugador se leen del store
}

export const PlayerBoard: React.FC<PlayerBoardProps> = ({ userId }) => {
    const { username, victoryPoints, character } = useMatchStore(
        useShallow((s) => {
            const p = selectPlayerById(userId)(s);
            return {
                username: p?.username ?? '',
                victoryPoints: p?.victory_points ?? 0,
                character: p?.character ?? null,
            };
        })
    );

    // Hidratación de assets (antes venía hecha desde TablePage)
    const assets = useMemo(
        () => (character ? getCharacterAssets(character) : null),
        [character]
    );
    const markerImageUrl = assets?.meeple;
    const avatarUrl = assets?.dinoCircle;
    const playerBoard = assets?.boardBackground;
    
    // EL TRUCO DE LA CAMINATA: Mantenemos un score "visual" que persigue al real
    const targetScore = Math.max(0, Math.min(victoryPoints, 50));
    const [displayedScore, setDisplayedScore] = useState(targetScore);

    useEffect(() => {
        if (displayedScore < targetScore) {
            // Sube rápido (150ms por casilla)
            const timer = setTimeout(() => setDisplayedScore(prev => prev + 1), 150);
            return () => clearTimeout(timer);
        } else if (displayedScore > targetScore) {
            // Retrocede rápido (por si hay penalizaciones)
            const timer = setTimeout(() => setDisplayedScore(prev => prev - 1), 150);
            return () => clearTimeout(timer);
        }
    }, [displayedScore, targetScore]);


    const ROWS = 9;
    const COLS = 7;
    const gridCells = Array.from({ length: ROWS * COLS }, (_, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        return { r, c, cellData: PATH_COORDS.find(p => p.r === r && p.c === c) };
    });

    const getPipeClasses = (victory_points: number) => {
        let classes = "bg-[#d6eaf8] border-[#2a3b4c] border-[3px] rounded-xl ";
        
        const curr = PATH_COORDS.find(p => p.score === victory_points);
        if (!curr) return classes;

        const prev = PATH_COORDS.find(p => p.score === victory_points - 1);
        const next = PATH_COORDS.find(p => p.score === victory_points + 1);

        const isConnectedLeft = (prev && prev.r === curr.r && prev.c < curr.c) || (next && next.r === curr.r && next.c < curr.c);
        const isConnectedRight = (prev && prev.r === curr.r && prev.c > curr.c) || (next && next.r === curr.r && next.c > curr.c);
        const isConnectedTop = (prev && prev.c === curr.c && prev.r < curr.r) || (next && next.c === curr.c && next.r < curr.r);
        const isConnectedBottom = (prev && prev.c === curr.c && prev.r > curr.r) || (next && next.c === curr.c && next.r > curr.r);

        if (isConnectedLeft) classes += "!border-l-0 rounded-tl-none rounded-bl-none ";
        if (isConnectedRight) classes += "!border-r-0 rounded-tr-none rounded-br-none ";
        if (isConnectedTop) classes += "!border-t-0 rounded-tl-none rounded-tr-none ";
        if (isConnectedBottom) classes += "!border-b-0 rounded-bl-none rounded-br-none ";

        return classes.trim();
    };

    return (
        <div 
            className="w-full h-full flex flex-row gap-4 p-2 rounded-lg border-2 border-[#444] bg-cover bg-left bg-no-repeat relative"
            style={{
                // Inyectamos la imagen como fondo de TODO el componente
                backgroundImage: playerBoard ? `url(${playerBoard})` : 'none',
                backgroundColor: '#111827' // Color de respaldo por si tarda en cargar
            }}
        >
            {/* Opcional: Una cortina oscura súper sutil sobre toda la imagen para que no lastime la vista, pero que deje ver al Dino */}

            {/* PANEL IZQUIERDO: LA "VENTANA" */}
            {/* Quitamos los fondos sólidos y los bordes para que sea una ventana transparente hacia el fondo */}
            <div className="flex-[3] flex flex-col justify-center items-center relative z-10">
                {/* El contenedor está vacío porque el dinosaurio ya se ve en el background del padre */}
            </div>

            {/* PANEL DERECHO: LA PISTA (TABLERO) INTACTA */}
            <div className="flex-[6]  rounded-lg p-2 flex items-center justify-center overflow-hidden z-10 relative">
                <div 
                    className="grid w-full h-full gap-0 max-w-full max-h-full aspect-[8/9]"
                    style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}
                >
                    {gridCells.map(({ r, c, cellData }) => {
                        
                        const isPlayerHere = cellData && displayedScore === cellData.score;

                        return (
                            <div key={`${r}-${c}`} className="relative w-full h-full flex items-center justify-center">
                                
                                {cellData && (
                                    <div className={`absolute inset-0 flex items-center justify-center shadow-sm ${getPipeClasses(cellData.score)} p-0.5`}>
                                        <span className={`text-[#2a3b4c] font-black leading-none tracking-tighter w-full text-center select-none 
                                            ${cellData.label 
                                                ? 'text-[5px] sm:text-[6px] md:text-[9px] lg:text-[9px]' // <-- Más pequeño solo para START y WIN modificar el lg a mas pequeño!
                                                : 'text-[7px] sm:text-[9px] md:text-sm lg:text-sm'      // <-- Tu tamaño normal para los números
                                            }`}
                                        >
                                            {cellData.label || cellData.score}
                                        </span>
                                    </div>
                                )}

                                {/* MARCADOR DEL JUGADOR */}
                                {isPlayerHere && (
                                    <motion.div
                                        layoutId="current-player-marker"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className={`absolute z-50 flex items-center justify-center ${
                                            markerImageUrl 
                                                ? 'w-8 h-8 md:w-10 md:h-10' 
                                                : 'w-5 h-5 md:w-7 md:h-7 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-[#111]'
                                        }`}
                                    >
                                        {markerImageUrl ? (
                                            <img src={markerImageUrl} alt="Marker" className="w-full h-full object-contain drop-shadow-md" />
                                        ) : (
                                            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
        </div>
    );
};
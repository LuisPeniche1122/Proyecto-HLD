import React, { useMemo } from 'react';
import { PlayedCardsZone } from './PlayedCardsZone';
import { useMatchStore, selectPlayerById } from '../../hooks/match_store';
import { getCharacterAssets } from '../../dicts/characters_dict';

interface PlayerSeatProps {
    userId: string;
    isLocalPlayer?: boolean;
    position: 'top' | 'bottom' | 'middle';
    cellWidth: number;
    cellHeight: number;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({ 
    userId, isLocalPlayer, position, cellWidth, cellHeight
}) => {
    // ---- Lectura del store ----
    const player = useMatchStore(selectPlayerById(userId));

    // Avatar hidratado desde el diccionario de personajes.
    const avatarUrl = useMemo(
        () => (player ? getCharacterAssets(player.character).dinoCircle : undefined),
        [player?.character]
    );

    if (!player) return null;

    // MATEMÁTICAS INDIVIDUALES
    // Ancho: Ocupamos máximo 1/2.8 del ancho de celda (así la carta del centro + flotantes entran bien)
    const maxW = cellWidth / 2.8; 
    // Alto: Si es local, usa toda la celda. Si es enemigo, resta 55px del avatar.
    const maxH = isLocalPlayer ? cellHeight : cellHeight - 55;

    let cardH = maxH * 0.95; // Pequeño margen
    let cardW = cardH / 1.4;

    if (cardW > maxW) {
        cardW = maxW;
        cardH = cardW * 1.4;
    }

    const UserInfo = () => (
        <div className={`flex flex-col items-center justify-center gap-1 shrink-0 ${isLocalPlayer ? 'scale-100' : 'scale-90'}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 shadow-lg flex items-center justify-center overflow-hidden ${isLocalPlayer ? 'border-green-500' : 'border-blue-400'}`}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt="meeple" className="w-full h-full object-cover bg-gray-800" />
                ) : (
                    <span className="text-sm">🦖</span>
                )}
            </div>
            <div className="bg-black/80 px-1.5 py-0.5 rounded text-white text-[9px] md:text-[10px] font-bold truncate max-w-[150px]">
                {player.username}
            </div>
        </div>
    );

    return (
        <div className={`flex flex-col items-center justify-center gap-1 w-full h-full`}>
            {position === 'top' && !isLocalPlayer && <UserInfo />}
            
            <PlayedCardsZone 
                userId={userId}
                isLocalPlayer={isLocalPlayer}
                cardWidth={cardW}
                cardHeight={cardH}
            />

            {(position === 'bottom' || position === 'middle') && !isLocalPlayer && <UserInfo />}
        </div>
    );
};

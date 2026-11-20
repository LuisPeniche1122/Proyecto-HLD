import React from 'react';
import { PlayedCardsZone } from './PlayedCardsZone';

interface PlayerSeatProps {
    player: any;
    isLocalPlayer?: boolean;
    position: 'top' | 'bottom' | 'middle';
    mainCard: any | null;
    isMainCardRevealed: boolean;
    sacrificedCards: any[];
    instantCards: any[];
    cellWidth: number;
    cellHeight: number;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({ 
    player, isLocalPlayer, position, mainCard, isMainCardRevealed, sacrificedCards, instantCards, cellWidth, cellHeight
}) => {
    
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
                {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt="meeple" className="w-full h-full object-cover bg-gray-800" />
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
                mainCard={mainCard} 
                isMainCardRevealed={isMainCardRevealed} 
                isLocalPlayer={isLocalPlayer}
                sacrificedCards={sacrificedCards} 
                instantCards={instantCards} 
                cardWidth={cardW}
                cardHeight={cardH}
            />

            {(position === 'bottom' || position === 'middle') && !isLocalPlayer && <UserInfo />}
        </div>
    );
};
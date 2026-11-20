import React from 'react';
import { Card } from './Card';
import { usePlayMainCard } from '../../hooks/use_play_main_card'

interface PlayedCardsZoneProps {
    mainCard: any | null;
    isMainCardRevealed: boolean;
    sacrificedCards: any[];
    instantCards: any[];
    isLocalPlayer?: boolean;
    cardWidth: number;
    cardHeight: number;
}

export const PlayedCardsZone: React.FC<PlayedCardsZoneProps> = ({ 
    mainCard, isMainCardRevealed, sacrificedCards, instantCards, cardWidth, cardHeight, isLocalPlayer
}) => {
    // Las cartas laterales son un 20% más pequeñas para darle protagonismo a la central
    const sideCardWidth = Math.floor(cardWidth * 0.8);
    const sideCardHeight = Math.floor(cardHeight * 0.8);

    const { playMainCard } = usePlayMainCard();
    const handlePlayCard = () => {
        playMainCard("");
    };

    return (
        // Contenedor ancla: Mide la carta central + 8px de padding visual. 
        // Jamás empujará el grid principal.
        <div 
            className="relative flex items-center justify-center rounded-lg border border-white/10 bg-black/20"
            style={{ width: cardWidth + 8, height: cardHeight + 8 }}
        >
            
            {/* ZONA IZQUIERDA: Flota hacia la izquierda para cartas descartadas/sacrificadas */}
            <div className="absolute right-[100%] top-1/2 -translate-y-1/2 mr-2 flex gap-1 z-0 pointer-events-none">
                {sacrificedCards.map((card) => (
                    <div key={card.id} style={{ width: sideCardWidth, height: sideCardHeight }}>
                        <Card 
                            id={card.id} 
                            frontImage={card.frontImage} 
                            backImage={card.backImage} 
                            faceUp={true} 
                            layoutId={`zone-${card.id}`}
                            height={sideCardHeight}
                            className="w-full h-full opacity-70 grayscale shadow-md"
                        />
                    </div>
                ))}
            </div>

            {/* ZONA CENTRAL */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
                <div className="absolute inset-1 border border-dashed border-white/20 rounded-lg" />
                
                {mainCard && (
                    <div style={{ width: cardWidth, height: cardHeight }}>
                        <Card 
                            id={mainCard.id} 
                            frontImage={mainCard.frontImage} 
                            backImage={mainCard.backImage} 
                            
                            // 1. EL VOLTEO MÁGICO: Si la fase dice que es oculta, se voltea al dorso.
                            // Esto soluciona que veas el "DINO FRONT" gris de los enemigos.
                            faceUp={isLocalPlayer ? true : isMainCardRevealed} 
                            
                            layoutId={`zone-${mainCard.id}`}
                            height={cardHeight}
                            className="w-full h-full shadow-[0_4px_15px_rgba(0,0,0,0.8)]"
                            
                            // 2. SEGURIDAD: Solo puedes retirarla si eres TÚ y la carta está boca abajo
                            onSelect={(isLocalPlayer && !isMainCardRevealed) ? handlePlayCard : undefined}
                        />
                    </div>
                )}
            </div>

            {/* ZONA DERECHA: Flota hacia la derecha para modificadores e instantáneas */}
            <div className="absolute left-[100%] top-1/2 -translate-y-1/2 ml-2 flex gap-1 z-20">
                {instantCards.map((card) => (
                    <div 
                        key={card.id} 
                        style={{ width: sideCardWidth, height: sideCardHeight }} 
                        className="hover:-translate-y-2 transition-transform cursor-pointer"
                    >
                        <Card 
                            id={card.id} 
                            frontImage={card.frontImage} 
                            backImage={card.backImage} 
                            faceUp={true} 
                            layoutId={`zone-${card.id}`}
                            height={sideCardHeight}
                            className="w-full h-full shadow-lg" 
                        />
                    </div>
                ))}
            </div>

        </div>
    );
};
import React, { useState, useRef, useEffect } from 'react';
import { DeckPile } from './DeckPile';
import { Card } from './Card';
import { motion } from 'framer-motion';
import back_desastres from '../../../../assets/cards/disasters/dorso_desastres.png';
import back_tools from '../../../../assets/cards/tools/dorso_herramientas.png';

interface CenterTableZoneProps {
    toolsCount: number;
    disastersCount: number;
    discardCount: number;
    topDiscardCard?: any;
    activeDisaster?: any;
    cellWidth: number;
    cellHeight: number;
}

// MAGIA DE COLORES: Quitamos los 'transparent' y usamos tonos muy oscuros (#111) 
// para que el desenfoque mezcle los colores intensos sin volverlos grisáceos/pálidos.
const getAuraGradient = (type: string) => {
    switch (type) {
        case 'disaster-predator': // Rojo intenso
            return 'conic-gradient(from 0deg, #111 0%, #ff0000 25%, #111 50%, #ff2222 75%, #111 100%)';
        case 'disaster-emotional': // Azul intenso
            return 'conic-gradient(from 0deg, #111 0%, #00aaff 25%, #111 50%, #0044ff 75%, #111 100%)';
        case 'disaster-natural': // Verde intenso
            return 'conic-gradient(from 0deg, #111 0%, #00ff00 25%, #111 50%, #32cd32 75%, #111 100%)';
        case 'disaster-meteore': // Meteorito (Rojo, Verde, Azul combinados)
            return 'conic-gradient(from 0deg, #ff0000 0%, #111 16%, #00ff00 33%, #111 50%, #00aaff 66%, #111 83%, #ff0000 100%)';
        default:
            return 'none';
    }
};

export const CenterTableZone: React.FC<CenterTableZoneProps> = ({
    toolsCount, disastersCount, discardCount, topDiscardCard, activeDisaster, cellWidth, cellHeight
}) => {
    const [isDisasterHovered, setIsDisasterHovered] = useState(false);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        hoverTimerRef.current = setTimeout(() => {
            setIsDisasterHovered(true);
        }, 1500);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setIsDisasterHovered(false);
    };

    const maxW = (cellWidth - 36) / 4; 
    let cardH = cellHeight * 0.9; 
    let cardW = cardH / 1.4;

    if (cardW > maxW) {
        cardW = maxW;
        cardH = Math.floor(cardW * 1.4);
    }

    const DORSO_DESASTRES = back_desastres
    const DORSO_TOOLS = back_tools

    return (
        <div className="flex flex-row items-center justify-center gap-3 w-full h-full relative">
            <div className="flex items-center justify-center">
                <DeckPile type="DRAW" count={disastersCount} label="Desastres" orientation='vertical' cardHeight={cardH} backImage={DORSO_DESASTRES}/>
            </div>
            
            <div className="flex items-center justify-center">
                <DeckPile type="DRAW" count={toolsCount} label="Herramientas" orientation='vertical' cardHeight={cardH} backImage={DORSO_TOOLS}/>
            </div>
            
            <div style={{ width: cardW, height: cardH }} className="relative flex items-center justify-center">
                {activeDisaster ? (
                    <motion.div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        animate={{ 
                            scale: isDisasterHovered ? 5 : 1,
                            zIndex: isDisasterHovered ? 50 : 1,
                            y: isDisasterHovered? 80 : 0 
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative cursor-zoom-in flex items-center justify-center"
                    >
                        {/* EFECTO DE AURA: Se monta por detrás (-z-10) del Desastre solo al hacer hover */}
                        {isDisasterHovered && activeDisaster.type && (
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full -z-10 pointer-events-none"
                                style={{
                                    width: '160%', // Escala fuera de la carta para que asomen los rayos
                                    aspectRatio: '1/1',
                                    background: getAuraGradient(activeDisaster.uiType),
                                    filter: 'blur(12px)', // Menos blur = colores más vivos
                                }}
                                // El rotate en array [0, 360] evita el "salto de GIF" garantizando keyframes absolutos
                                animate={{ rotate: [0, 360] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            />
                        )}

                        <Card 
                            id={activeDisaster.id} 
                            frontImage={activeDisaster.frontImage} 
                            faceUp={true} 
                            layoutId={`zone-${activeDisaster.id}`} 
                            height={cardH} 
                        />
                    </motion.div>
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-red-500/50 rounded-xl flex items-center justify-center text-red-500/50 font-bold text-center text-[10px] md:text-xs">
                        Sin Desastre
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-center">
                <DeckPile type="DISCARD" count={discardCount} topCard={topDiscardCard} label="Descartes" orientation='vertical'cardHeight={cardH} />
            </div>
        </div>
    );
};
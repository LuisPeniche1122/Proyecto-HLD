import React, { useMemo } from 'react';
import { Card } from './Card';
import {
    useMatchStore,
    selectDisastersCount,
    selectToolsCount,
    selectDiscardCount,
    selectTopDiscardCard,
} from '../../hooks/match_store';
import type { MatchStore } from '../../hooks/match_store';
import { getCardAssets } from '../../dicts/cards_dict';

/** Qué pila del store representa este mazo (reemplaza a `type` + `count` + `topCard`). */
export type DeckPileKind = 'DISASTERS' | 'TOOLS' | 'DISCARD';

// Constante de módulo: misma referencia de selector por pila en cada render.
const COUNT_SELECTORS: Record<DeckPileKind, (s: MatchStore) => number> = {
    DISASTERS: selectDisastersCount,
    TOOLS: selectToolsCount,
    DISCARD: selectDiscardCount,
};

interface DeckPileProps {
    pile: DeckPileKind;
    backImage?: string;
    label: string;
    orientation?: 'vertical' | 'horizontal';
    cardHeight: number;
}

export const DeckPile: React.FC<DeckPileProps> = ({
    pile,
    backImage = 'https://placehold.co/400x560/222/fff?text=DORSO',
    label,
    orientation = 'vertical',
    cardHeight
}) => {
    const isHorizontal = orientation === 'horizontal';

    // ---- Lectura del store ----
    const count = useMatchStore(COUNT_SELECTORS[pile]);
    // Los hooks no pueden ser condicionales: se lee siempre y solo se usa en el descarte.
    const rawTopDiscard = useMatchStore(selectTopDiscardCard);

    const topCard = useMemo(
        () => (pile === 'DISCARD' && rawTopDiscard
            ? { ...rawTopDiscard, ...getCardAssets(rawTopDiscard.id) }
            : null),
        [pile, rawTopDiscard]
    );

    // 1. Derivamos el estilo automáticamente de la pila
    const isDiscard = pile === 'DISCARD';
    const isMessy = isDiscard;
    const cardWidth = Math.floor(cardHeight / 1.4);

    // 2. Validación de vacío SOLO depende del contador
    const isEmpty = count === 0;

    return (
        <div
            className={`relative flex flex-col items-center justify-center group ${!isEmpty ? 'cursor-pointer' : ''}`}
            style={{
                width: isHorizontal ? cardHeight : cardWidth,
                height: isHorizontal ? cardWidth : cardHeight
            }}
        >
            {/* ETIQUETA SUPERIOR */}
            <div className="absolute -top-5 md:-top-6 bg-black/90 px-2 py-0.5 rounded text-[9px] md:text-[11px] font-bold text-white whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                {label}
            </div>

            {/* CONTENEDOR FÍSICO VISUAL */}
            <div
                className={`relative flex items-center justify-center transition-transform duration-200 ${!isEmpty ? 'group-hover:-translate-y-1' : ''} ${isHorizontal ? 'rotate-90' : ''}`}
                style={{ width: cardWidth, height: cardHeight }}
            >
                {isEmpty ? (
                    // ESTADO VACÍO
                    <div className="w-full h-full border-2 border-dashed border-gray-500/50 rounded-xl flex items-center justify-center text-gray-500/50 font-bold text-center text-[10px] md:text-xs bg-black/30">
                        Vacío
                    </div>
                ) : (
                    <>
                        {/* ESTILO MESSY (Solo para DISCARD) */}
                        {isMessy && count > 1 && (
                            <>
                                <div className="absolute inset-0 bg-[#9b8b64] rounded-xl border border-[#555] rotate-[-8deg] translate-x-1 shadow-md" />
                                <div className="absolute inset-0 bg-[#9d8851] rounded-xl border border-[#666] rotate-[5deg] -translate-y-1 translate-x-0.5 shadow-md" />
                            </>
                        )}

                        {/* ESTILO DECK (Solo para mazos de robar) */}
                        {!isMessy && (
                            <div
                                className="absolute inset-0 bg-[#444] rounded-xl border-2 border-[#555]"
                                style={{
                                    boxShadow: count > 10 ? '3px 3px 0px #222, 6px 6px 0px #111' : 'none'
                                }}
                            />
                        )}

                        {/* RENDERIZADO INTELIGENTE DE LA CARTA */}
                        {isDiscard ? (
                            <Card
                                id={topCard?.id || `discard-error`}
                                // Si no hay topCard, mostramos un error de frente, JAMÁS un dorso
                                frontImage={topCard?.frontImage || `https://placehold.co/400x560/8B0000/fff?text=Falta+TopCard`}
                                faceUp={true} // El descarte siempre va boca arriba
                                layoutId={topCard ? `zone-${topCard.id}` : undefined}
                                height={cardHeight}
                                className="shadow-md"
                            />
                        ) : (
                            <Card
                                id={`deck-${label.toLowerCase()}`}
                                backImage={backImage}
                                faceUp={false} // Los mazos de robar siempre van boca abajo
                                height={cardHeight}
                                className="shadow-md"
                            />
                        )}
                    </>
                )}
            </div>

            {/* ETIQUETA INFERIOR */}
            <div className="absolute -bottom-3 bg-black/90 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                {count}
            </div>
        </div>
    );
};

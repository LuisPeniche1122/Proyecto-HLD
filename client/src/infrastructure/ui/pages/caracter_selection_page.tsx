import React from 'react';
import type { Character, GameStateDTO } from '../../../domain/dtos/game_dtos';
import { useSelectCharacter } from '../hooks/use_select_character';
import { getDisasterIcon } from '../dicts/icons_dict';
import { getCharacterAssets } from '../dicts/characters_dict'
import { GameTimer } from '../components/game_components/GameTimer'; // <-- Importamos el Reloj

interface CharacterSelectionPageProps {
    gameState: GameStateDTO;
}

export const CharacterSelectionPage: React.FC<CharacterSelectionPageProps> = ({ gameState }) => {
    const localUserId = sessionStorage.getItem("user_id") || "";

    const { available_characters, selections } = gameState;
    const mySelectedCharacterType = selections[localUserId];

    const { selectCharacter } = useSelectCharacter();
    const handleSelectCharacter = (charType: string) => {
        if (mySelectedCharacterType === charType) {
            selectCharacter("");
        } else {
            selectCharacter(charType);
        }
    };

    const isRandomSelectedByMe = mySelectedCharacterType === "RANDOM";

    return (
        // Añadimos 'relative' al contenedor principal para que el reloj absolute se guíe por este div
        <div className="relative flex flex-col h-screen w-full bg-[#1a1a1a] text-white p-2 md:p-6 box-border font-sans">
            
            {/* EL RELOJ FLOTANTE */}
            <GameTimer 
                serverTimeLeft={gameState.time_left} 
                currentPhase={gameState.game_phase} 
                className="absolute top-4 left-4 z-50 scale-75 md:scale-100 origin-top-left" 
            />

            {/* TÍTULO: flex-none para que ocupe solo lo necesario */}
            <div className="flex-none text-center mb-2 md:mb-4 pt-2">
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold m-0">
                    Selecciona tu Dinosaurio
                </h1>
            </div>
            
            {/* ÁREA DE CONTENIDO: flex-1 min-h-0 para absorber todo el espacio restante sin empujar la pantalla */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-center w-full max-w-7xl mx-auto">
                
                {/* GRID DE DINOSAURIOS: flex-1 y h-full para aprovechar el alto */}
                <div className={`flex-1 min-h-0 w-full h-full grid gap-2 md:gap-4 lg:gap-6 ${
                    available_characters.length > 4 
                        ? 'grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-2 lg:grid-cols-2' // En móvil mantenemos 2 columnas para no aplastar verticalmente
                }`}>
                    {available_characters.map((char: Character) => {
                        const isSelectedByMe = mySelectedCharacterType === char.type;
                        const isTakenByOther = Object.entries(selections).some(
                            ([uid, type]) => uid !== localUserId && type === char.type
                        );
                        
                        const isDisabled = isTakenByOther || isRandomSelectedByMe;

                        return (
                            <div key={char.type} className="flex flex-col items-center justify-center min-h-0 h-full w-full gap-1 md:gap-2">
                                
                                {/* ENVOLTORIO DEL BOTÓN: El secreto para que crezca lo máximo posible sin desbordar */}
                                <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                                    <button
                                        onClick={() => handleSelectCharacter(char.type)}
                                        disabled={isDisabled}
                                        className={`h-full aspect-square max-w-full rounded-[15%] bg-[#333] border-4 transition-all flex justify-center items-center overflow-hidden p-0 shadow-md
                                            ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-[1.03]'}
                                            ${isSelectedByMe ? 'border-[#00ff00] shadow-[0_0_20px_#00ff00]' : 'border-transparent'}
                                        `}
                                    >
                                        <img 
                                            src={getCharacterAssets(char.type).characterCard} 
                                            alt={char.display_name}
                                            className="w-full h-full object-cover bg-[#444]"
                                        />
                                    </button>
                                </div>
                                
                                {/* NOMBRE DEL DINO */}
                                <div className="flex-none font-bold text-xs sm:text-sm md:text-base text-center leading-tight">
                                    {char.display_name}
                                </div>
                                
                                {/* TRAITS (Símbolos) */}
                                <div className="flex-none flex gap-1 sm:gap-2 flex-wrap justify-center">
                                    {char.initial_traits.map((trait) => (
                                        <div 
                                            key={trait.disaster_type} 
                                            className="bg-[#2a2a2a] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 border border-[#444] shadow-sm"
                                        >
                                            <img 
                                                src={getDisasterIcon(trait.disaster_type)} 
                                                alt={trait.disaster_type}
                                                // Iconos que escalan pero con un máximo para no estorbar
                                                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain"
                                            />
                                            <span className="font-bold">
                                                {trait.modifier > 0 ? `+${trait.modifier}` : trait.modifier}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* SECCIÓN AL AZAR: flex-none para que ocupe solo su tamaño y no empuje al grid */}
                <div className="flex-none flex items-center justify-center lg:h-full pb-2 lg:pb-0">
                    <button 
                        onClick={() => handleSelectCharacter('RANDOM')}
                        className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full text-white text-sm lg:text-lg font-bold flex flex-col items-center justify-center transition-all border-[3px] lg:border-4
                            ${isRandomSelectedByMe 
                                ? 'bg-[#555] border-[#00ff00] shadow-[0_0_20px_#00ff00] opacity-100 scale-105' 
                                : 'bg-[#555] border-transparent shadow-md opacity-80 hover:opacity-100 hover:scale-105'
                            }
                        `}
                    >
                        <span className="text-xl lg:text-3xl leading-none mb-1">🎲</span>
                        <span className="leading-none text-[10px] lg:text-sm">Al Azar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
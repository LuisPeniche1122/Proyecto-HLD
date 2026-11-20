// src/utils/characterAssets.ts

// ==========================================
// 1. IMPORTACIÓN DE ASSETS
// ==========================================

// STEGOSAURUS
import stegoCircle from '../../../assets/dinos/stego_circle.png';
import stegoMeeple from '../../../assets/meeples/stego_meeple.svg';
import stegoCard from '../../../assets/dinos/stego_character_card.png'; 
import stegoBg from '../../../assets/dinos/stego_board_background.png';

// TRICERATOPS (Cry)
import cryCircle from '../../../assets/dinos/cry_circle.png';
import cryMeeple from '../../../assets/meeples/cry_meeple.svg';
import cryCard from '../../../assets/dinos/cry_character_card.png';
import cryBg from '../../../assets/dinos/cry_board_background.png';

// BRACHIOSAURUS (Bronto)
import brontoCircle from '../../../assets/dinos/bronto_circle.png';
import brontoMeeple from '../../../assets/meeples/bronto_meeple.svg';
import brontoCard from '../../../assets/dinos/bronto_character_card.png';
import brontoBg from '../../../assets/dinos/bronto_board_background.png';

// TYRANNOSAURUS (T-Rex)
import trexCircle from '../../../assets/dinos/trex_circle.png';
import trexMeeple from '../../../assets/meeples/trex_meeple.svg';
import trexCard from '../../../assets/dinos/trex_character_card.png';
import trexBg from '../../../assets/dinos/trex_board_background.png';

// PTERODACTYL (Pterry)
import pterryCircle from '../../../assets/dinos/pterry_circle.png';
import pterryMeeple from '../../../assets/meeples/pterry_meeple.svg';
import pterryCard from '../../../assets/dinos/pterry_character_card.png';
import pterryBg from '../../../assets/dinos/pterry_board_background.png';

// VELOCIRAPTOR (Raging)
import ragingCircle from '../../../assets/dinos/raging_circle.png';
import ragingMeeple from '../../../assets/meeples/raging_meeple.svg';
import ragingCard from '../../../assets/dinos/raging_character_card.png';
import ragingBg from '../../../assets/dinos/raging_board_background.png';


// ==========================================
// 2. DICCIONARIO DE TIPOS
// ==========================================

export interface CharacterTheme {
    dinoCircle: string;
    meeple: string;
    characterCard: string;
    boardBackground: string;
}

// Las llaves de este diccionario DEBEN coincidir con los `type` 
// que te manda tu backend en el CharacterDTO (ej. "TRICERATOPS")
export const CHARACTER_ASSETS: Record<string, CharacterTheme> = {
    "STEGOSAURUS": {
        dinoCircle: stegoCircle,
        meeple: stegoMeeple,
        characterCard: stegoCard,
        boardBackground: stegoBg
    },
    "TRICERATOPS": {
        dinoCircle: cryCircle,
        meeple: cryMeeple,
        characterCard: cryCard,
        boardBackground: cryBg
    },
    "BRACHIOSAURUS": {
        dinoCircle: brontoCircle,
        meeple: brontoMeeple,
        characterCard: brontoCard,
        boardBackground: brontoBg
    },
    "TYRANNOSAURUS": {
        dinoCircle: trexCircle,
        meeple: trexMeeple,
        characterCard: trexCard,
        boardBackground: trexBg
    },
    "PTERODACTYL": {
        dinoCircle: pterryCircle,
        meeple: pterryMeeple,
        characterCard: pterryCard,
        boardBackground: pterryBg
    },
    "VELOCIRAPTOR": {
        dinoCircle: ragingCircle,
        meeple: ragingMeeple,
        characterCard: ragingCard,
        boardBackground: ragingBg
    },
    // Un default por si el backend manda algo nuevo o el jugador aún no elige
    "DEFAULT": {
        dinoCircle: "https://placehold.co/400x560/333/fff?text=Dino",
        meeple: "https://placehold.co/128x128/333/fff?text=M",
        characterCard: "https://placehold.co/512x512/333/fff?text=Cara",
        boardBackground: "https://placehold.co/800x400/222/111?text=Fondo"
    }
};

// ==========================================
// 3. FUNCIÓN HELPER
// ==========================================

export const getCharacterAssets = (characterType?: string | null): CharacterTheme => {
    if (!characterType || !CHARACTER_ASSETS[characterType]) {
        return CHARACTER_ASSETS["DEFAULT"];
    }
    return CHARACTER_ASSETS[characterType];
};
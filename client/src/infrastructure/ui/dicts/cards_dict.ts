// ==========================================
// 1. IMPORTACIÓN DE ASSETS (Imágenes Reales)
// ==========================================

//back images de las cartas
import DORSO_DESASTRES from '../../../assets/cards/disasters/dorso_desastres.png';
import DORSO_TOOLS from '../../../assets/cards/tools/dorso_herramientas.png';
//cartas del juego base
// --- Cartas de Puntos (Tools) ---
import pet_rock from '../../../assets/cards/tools/base/pet_rock.png';
import dino_grabber from '../../../assets/cards/tools/base/dino_grabber.png';
import cool_stick from '../../../assets/cards/tools/base/cool_stick.png';
import handy_pan from '../../../assets/cards/tools/base/handy_pan.png';
import grappling_snake from '../../../assets/cards/tools/base/grappling_snake.png';
import delicious_smoothie from '../../../assets/cards/tools/base/delicious_smoothie.png';
import grave_maker from '../../../assets/cards/tools/base/grave_maker.png';
import bonehead from '../../../assets/cards/tools/base/bonehead.png';
import fire_spray from '../../../assets/cards/tools/base/fire_spray.png';
import mouth_trap from '../../../assets/cards/tools/base/mouth_trap.png';
import run_home_bat from '../../../assets/cards/tools/base/run_home_bat.png';
import star_fruit from '../../../assets/cards/tools/base/star_fruit.png';
import bow_and_dino from '../../../assets/cards/tools/base/bow_and_dino.png';
import sting_stabber from '../../../assets/cards/tools/base/sting_stabber.png';
import treenoculars from '../../../assets/cards/tools/base/treenoculars.png';
import hungry_plant from '../../../assets/cards/tools/base/hungry_plant.png';
import iced_ptea from '../../../assets/cards/tools/base/iced_ptea.png';
import flaming_chainsaw from '../../../assets/cards/tools/base/flaming_chainsaw.png';
import meteor_cannon from '../../../assets/cards/tools/base/meteor_cannon.png'

// --- Cartas Instantáneas ---
import disaster_insurance from '../../../assets/cards/tools/base/disaster_insurance.png';
import disaster_redirect from '../../../assets/cards/tools/base/disaster_redirect.png';
import score_booster from '../../../assets/cards/tools/base/score_booster.png';
import score_inversion from '../../../assets/cards/tools/base/score_inversion.png';
import score_sapper from '../../../assets/cards/tools/base/score_sapper.png';

// --- Cartas de Desastre ---
import beach from '../../../assets/cards/disasters/base/beach.png';
import armed from '../../../assets/cards/disasters/base/armed.png';
import squirrely from '../../../assets/cards/disasters/base/squirrely.png';
import fired_up from '../../../assets/cards/disasters/base/fired_up.png';
import cannibal from '../../../assets/cards/disasters/base/cannibal.png';
import love_hurts from '../../../assets/cards/disasters/base/love_hurts.png';
import shark from '../../../assets/cards/disasters/base/shark.png';
import stomped from '../../../assets/cards/disasters/base/stomped.png';

// DESASTRES - EMOCIONALES
import ghosted from '../../../assets/cards/disasters/base/ghosted.png';
import emergency from '../../../assets/cards/disasters/base/emergency.png';
import bad_hair from '../../../assets/cards/disasters/base/bad_hair.png';
import left_behind from '../../../assets/cards/disasters/base/left_behind.png';
import ooh_burn from '../../../assets/cards/disasters/base/ooh_burn.png';
import outer_circle from '../../../assets/cards/disasters/base/outer_circle.png';
import future_bleak from '../../../assets/cards/disasters/base/future_bleak.png';
import sad_truth from '../../../assets/cards/disasters/base/sad_truth.png';

import leaf_me from '../../../assets/cards/disasters/base/leaf_me.png';
import spa_day from '../../../assets/cards/disasters/base/spa_day.png';
import bright_idea from '../../../assets/cards/disasters/base/bright_idea.png';
import stroll from '../../../assets/cards/disasters/base/stroll.png';
import downpour from '../../../assets/cards/disasters/base/downpour.png';
import personal from '../../../assets/cards/disasters/base/personal.png';
import trapped from '../../../assets/cards/disasters/base/trapped.png';
import uncommon_cold from '../../../assets/cards/disasters/base/uncommon_cold.png';

// DESASTRES - METEORITOS (Negros)
import meteor from '../../../assets/cards/disasters/base/meteor.png';

// Por ahora usaremos Placeholders (luego solo cambias estas constantes)
const DORSO_GENERAL = "https://placehold.co/400x560/BFBFBF/fff?text=back";
const DORSO_GENERAL_DESASTRES = "https://placehold.co/400x560/A304B5/fff?text=back"
const DORSO_GENERAL_TOOLS = "https://placehold.co/400x560/D6C69F/fff?text=back"

// ==========================================
// 2. INTERFACES Y TIPOS
// ==========================================

export interface CardTheme {
    frontImage: string;
    backImage: string;
    // Esto es crucial para inyectar el tipo correcto para los "Auras" de colores en el desastre
    uiType: 'tool'| 'instant' | 'disaster-predator' | 'disaster-natural' | 'disaster-emotional' | 'disaster-meteore' | 'hidden' | 'unknown';
}

// ==========================================
// 3. DICCIONARIO DE CARTAS (Por card_id del backend)
// ==========================================

export const CARD_ASSETS: Record<string, CardTheme> = {
    "pt_0_pet_rock": { frontImage: pet_rock, backImage: DORSO_TOOLS, uiType: 'tool'},
    "pt_1_dino_grabber": { frontImage: dino_grabber, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_1_cool_stick": { frontImage: cool_stick, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_2_handy_pan": { frontImage: handy_pan, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_2_grappling_snake": { frontImage: grappling_snake, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_3_delicious_smoothie": { frontImage: delicious_smoothie, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_3_grave_maker": { frontImage: grave_maker, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_4_bonehead": { frontImage: bonehead, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_4_fire_spray": { frontImage: fire_spray, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_5_mouth_trap": { frontImage: mouth_trap, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_5_run_home_bat": { frontImage: run_home_bat, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_6_star_fruit": { frontImage: star_fruit, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_6_bow_and_dino": { frontImage: bow_and_dino, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_7_sting_stabber": { frontImage: sting_stabber, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_7_treenoculars": { frontImage: treenoculars, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_8_hungry_plant": { frontImage: hungry_plant, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_8_iced_ptea": { frontImage: iced_ptea, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_9_flaming_chainsaw": { frontImage: flaming_chainsaw, backImage: DORSO_TOOLS, uiType: 'tool' },
    "pt_9_meteor_cannon": { frontImage: meteor_cannon, backImage: DORSO_TOOLS, uiType: 'tool' },

    // ---------------------------------------------------------
    // HERRAMIENTAS - INSTANTÁNEAS
    // ---------------------------------------------------------
    "inst_disaster_insurance": { frontImage: disaster_insurance, backImage: DORSO_TOOLS, uiType: 'instant' },
    "inst_disaster_redirect": { frontImage: disaster_redirect, backImage: DORSO_TOOLS, uiType: 'instant' },
    "inst_score_booster": { frontImage: score_booster, backImage: DORSO_TOOLS, uiType: 'instant' },
    "inst_score_inversion": { frontImage: score_inversion, backImage: DORSO_TOOLS, uiType: 'instant' },
    "inst_score_sapper": { frontImage: score_sapper, backImage: DORSO_TOOLS, uiType: 'instant' },

    // ---------------------------------------------------------
    // DESASTRES - PREDATORS (Rojos)
    // ---------------------------------------------------------
    "dis_pred_beach": { frontImage: beach, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_armed": { frontImage: armed, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_squirrely": { frontImage: squirrely, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_fired_up": { frontImage: fired_up, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_cannibal": { frontImage: cannibal, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_love_hurts": { frontImage: love_hurts, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_shark": { frontImage: shark, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },
    "dis_pred_stomped": { frontImage: stomped, backImage: DORSO_DESASTRES, uiType: 'disaster-predator' },

    // ---------------------------------------------------------
    // DESASTRES - SENTIMENTALES (Azules)
    // ---------------------------------------------------------
    "dis_emo_ghosted": { frontImage: ghosted, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_emergency": { frontImage: emergency, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_bad_hair": { frontImage: bad_hair, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_left_behind": { frontImage: left_behind, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_ooh_burn": { frontImage: ooh_burn, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_outer_circle": { frontImage: outer_circle, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_future_bleak": { frontImage: future_bleak, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },
    "dis_emo_sad_truth": { frontImage: sad_truth, backImage: DORSO_DESASTRES, uiType: 'disaster-emotional' },

    // ---------------------------------------------------------
    // DESASTRES - NATURALES (Verdes)
    // ---------------------------------------------------------
    "dis_nat_leaf_me": { frontImage: leaf_me, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_spa_day": { frontImage: spa_day, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_bright_idea": { frontImage: bright_idea, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_stroll": { frontImage: stroll, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_downpour": { frontImage: downpour, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_personal": { frontImage: personal, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_trapped": { frontImage: trapped, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },
    "dis_nat_uncommon_cold": { frontImage: uncommon_cold, backImage: DORSO_DESASTRES, uiType: 'disaster-natural' },

    // ---------------------------------------------------------
    // DESASTRES - METEORITOS (Negros)
    // ---------------------------------------------------------
    "dis_met_meteor": { frontImage: meteor, backImage: DORSO_DESASTRES, uiType: 'disaster-meteore' },

    // ---------------------------------------------------------
    // DEFAULT (Fallback)
    // ---------------------------------------------------------
    "DEFAULT": {
        frontImage: "https://placehold.co/400x560/555/fff?text=Unknown+Card",
        backImage: DORSO_GENERAL,
        uiType: 'unknown'
    }
};

// ==========================================
// 4. FUNCIÓN HELPER
// ==========================================

export const getCardAssets = (cardId: string): CardTheme => {
    
    if (cardId === "HIDDEN_CARD") {
        return {
            // Le ponemos el dorso también de frente por si se voltea por error, siga luciendo oculta
            frontImage: DORSO_TOOLS, 
            backImage: DORSO_TOOLS,
            uiType: 'hidden'
        };
    }

    // 1. Si la carta exacta está en el diccionario, la devolvemos
    // Ten en cuenta que el backend manda 'pt_4_bonehead_001', así que tenemos que quitar el '_001'
    // Expresión regular para quitar el guión bajo y los números al final (ej: _001, _012)
    const baseId = cardId.replace(/_\d+$/, ''); 

    if (CARD_ASSETS[baseId]) {
        return CARD_ASSETS[baseId];
    }

    // 2. Si no la encontramos pero sabemos qué tipo de desastre es por el prefijo
    if (baseId.startsWith("dis_pred_")) {
        return {
            frontImage: `https://placehold.co/400x560/8B0000/fff?text=PREDATOR\n${baseId.replace('dis_pred_', '')}`,
            backImage: DORSO_GENERAL_DESASTRES,
            uiType: 'disaster-predator'
        };
    }
    
    if (baseId.startsWith("dis_emo_")) {
        return {
            frontImage: `https://placehold.co/400x560/00008B/fff?text=SENTIMENTAL\n${baseId.replace('dis_sent_', '')}`,
            backImage: DORSO_GENERAL_DESASTRES,
            uiType: 'disaster-emotional'
        };
    }
    
    if (baseId.startsWith("dis_nat_")) {
        return {
            frontImage: `https://placehold.co/400x560/006400/fff?text=NATURAL\n${baseId.replace('dis_nat_', '')}`,
            backImage: DORSO_GENERAL_DESASTRES,
            uiType: 'disaster-natural'
        };
    }

    if (baseId.startsWith("pt_")) {
        return {
            frontImage: `https://placehold.co/400x560/006400/fff?text=\n${baseId.replace('pt_', '')}`,
            backImage: DORSO_GENERAL_TOOLS,
            uiType: 'tool'
        };
    }

    if (baseId.startsWith("inst_")) {
        return {
            frontImage: `https://placehold.co/400x560/006400/fff?text=\n${baseId.replace('inst_', '')}`,
            backImage: DORSO_GENERAL_TOOLS,
            uiType: 'instant'
        };
    }

    // 3. Fallback genérico de error
    return {
        frontImage: "https://placehold.co/400x560/ff00ff/000?text=ERROR+404\nCARTA\nPERDIDA",
        backImage: DORSO_GENERAL,
        uiType: 'unknown'
    };
};
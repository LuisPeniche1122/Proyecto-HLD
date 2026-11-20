// 1. IMPORTAMOS LAS IMÁGENES PRIMERO
import meteoriteIcon from '../../../assets/icons/meterorite_disaster.svg';
import naturalIcon from '../../../assets/icons/natural_disaster.svg';
import sentimentalIcon from '../../../assets/icons/sentimental_disaster.svg';
import predatorIcon from '../../../assets/icons/predator_disaster.svg';

// 2. USAMOS LAS VARIABLES IMPORTADAS EN EL DICCIONARIO
export const DISASTER_ICONS: Record<string, string> = {
    "METEORITE": meteoriteIcon,
    "NATURAL": naturalIcon,
    "EMOTIONAL": sentimentalIcon,
    "PREDATOR": predatorIcon
};

// 3. LA FUNCIÓN HELPER SIGUE IGUAL
export const getDisasterIcon = (disasterType?: string): string => {
    if (!disasterType || !DISASTER_ICONS[disasterType]) {
        return "https://placehold.co/16x16/333/fff?text=?"; 
    }
    return DISASTER_ICONS[disasterType];
};
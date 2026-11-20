from typing import List, Dict
from src.domain.interfaces.card_set_store import CardSetStore
from src.domain.value_objects.card_set import CardSet
from src.domain.value_objects.expansion_type import ExpansionType
from src.domain.value_objects.card_type import CardType
from src.domain.value_objects.disaster_type import DisasterType
from src.domain.value_objects.card import PointCard, DisasterCard, InstantCard

class StaticCardSetStore(CardSetStore):
    
    # ==========================================
    # MÉTODOS FÁBRICA (Helpers Privados)
    # ==========================================
    
    def __build_points(self, card_id: str, value: int, qty: int, effect_code: str = None) -> List[PointCard]:
        """Genera 'qty' copias de una carta de Puntos, numerándolas automáticamente."""
        return [
            PointCard(
                card_id=card_id, 
                instance_id=f"{card_id}_{i+1:03d}", # Ej: point_4_001, point_4_002...
                type=CardType.POINT, 
                value=value, 
                effect_code=effect_code
            ) for i in range(qty)
        ]

    def __build_instants(self, card_id: str, effect_code: str, qty: int) -> List[InstantCard]:
        """Genera 'qty' copias de una carta Instantánea."""
        return [
            InstantCard(
                card_id=card_id, 
                instance_id=f"{card_id}_{i+1:03d}", 
                type=CardType.INSTANT, 
                effect_code=effect_code
            ) for i in range(qty)
        ]

    def __build_disasters(self, card_id: str, values: Dict[DisasterType, int], qty: int, effect_code: str = None) -> List[DisasterCard]:
        """Genera 'qty' copias de una carta de Desastre."""
        return [
            DisasterCard(
                card_id=card_id, 
                instance_id=f"{card_id}_{i+1:03d}", 
                type=CardType.DISASTER, 
                disaster_values=values,
                effect_code=effect_code
            ) for i in range(qty)
        ]

    # ==========================================
    # IMPLEMENTACIÓN DE LA INTERFAZ
    # ==========================================

    def get_tools_sets(self) -> List[CardSet]:
        # ---------------------------------------------------------
        # PAQUETE 1: MAZO FUERTE (Apto para todo número de jugadores)
        # Contiene cartas de 0 puntos, 4-9 puntos y todas las instantáneas
        # ---------------------------------------------------------
        base_tools_cards = (
            # 0 Puntos
            self.__build_points("pt_0_pet_rock", value=0, qty=4, effect_code="DODGE") +
            
            # 4 Puntos
            self.__build_points("pt_4_bonehead", value=4, qty=4) +
            self.__build_points("pt_4_fire_spray", value=4, qty=2, effect_code="DISCARD_3") +
            
            # 5 Puntos
            self.__build_points("pt_5_mouth_trap", value=5, qty=2, effect_code="SWITCH_SCORING") +
            self.__build_points("pt_5_run_home_bat", value=5, qty=4) +
            
            # 6 Puntos
            self.__build_points("pt_6_star_fruit", value=6, qty=2, effect_code="DUPLICATE_BOOSTER_SAPPER") +
            self.__build_points("pt_6_bow_and_dino", value=6, qty=4) +
            
            # 7 Puntos
            self.__build_points("pt_7_sting_stabber", value=7, qty=3) +
            self.__build_points("pt_7_treenoculars", value=7, qty=2, effect_code="SEE_2_DRAW_1") +
            
            # 8 Puntos
            self.__build_points("pt_8_hungry_plant", value=8, qty=1, effect_code="SWAP_2_PLAYERS_POINT_CARDS") +
            self.__build_points("pt_8_iced_ptea", value=8, qty=3) +
            
            # 9 Puntos
            self.__build_points("pt_9_flaming_chainsaw", value=9, qty=1, effect_code="IGNORE_EFFECTS") +
            self.__build_points("pt_9_meteor_cannon", value=9, qty=3) +
            
            # INSTANTÁNEAS
            self.__build_instants("inst_disaster_insurance", effect_code="PROTECT_DISASTER", qty=3) +
            self.__build_instants("inst_disaster_redirect", effect_code="REDIRECT_DISASTER", qty=1) +
            self.__build_instants("inst_score_booster", effect_code="ADD_POINTS", qty=5) +
            self.__build_instants("inst_score_inversion", effect_code="SWITCH_SCORING", qty=2) +
            self.__build_instants("inst_score_sapper", effect_code="SUBTRACT_POINTS", qty=5)
        )

        # ---------------------------------------------------------
        # PAQUETE 2: MAZO DÉBIL (Cartas de 1, 2 y 3 puntos)
        # Se desecha automáticamente si juegan solo 2 personas
        # ---------------------------------------------------------
        base_weak_tools_cards = (
            # 1 Punto
            self.__build_points("pt_1_dino_grabber", value=1, qty=2, effect_code="STEAL_CARD") +
            self.__build_points("pt_1_cool_stick", value=1, qty=4) +
            
            # 2 Puntos
            self.__build_points("pt_2_handy_pan", value=2, qty=4) +
            self.__build_points("pt_2_grappling_snake", value=2, qty=2, effect_code="SWAP_POINT_CARDS") +
            
            # 3 Puntos
            self.__build_points("pt_3_delicious_smoothie", value=3, qty=2, effect_code="DODGE") +
            self.__build_points("pt_3_grave_maker", value=3, qty=4)
        )
        
        five_6_tools_cards = []
        peryls_tools_cards = []
        peryls_2_players_tools_cards = []
        daiting_tools_cards = []
        daiting_2_players_tools_cards = []
        
        return [
            CardSet(expansion=ExpansionType.BASE, is_two_player_compatible=True, cards=base_tools_cards),
            CardSet(expansion=ExpansionType.BASE, is_two_player_compatible=False, cards=base_weak_tools_cards)
        ]

    def get_disasters_sets(self) -> List[CardSet]:
        
        # ---------------------------------------------------------
        # PAQUETE DE DESASTRES BASE
        # ---------------------------------------------------------
        base_disasters = (
            # PREDATORS
            self.__build_disasters("dis_pred_beach", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_armed", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_squirrely", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_fired_up", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_cannibal", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_love_hurts", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_shark", {DisasterType.PREDATOR: 1}, qty=1) +
            self.__build_disasters("dis_pred_stomped", {DisasterType.PREDATOR: 1}, qty=1) +

            # SENTIMENTAL
            self.__build_disasters("dis_emo_ghosted", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_emergency", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_bad_hair", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_left_behind", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_ooh_burn", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_outer_circle", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_future_bleak", {DisasterType.EMOTIONAL: 1}, qty=1) +
            self.__build_disasters("dis_emo_sad_truth", {DisasterType.EMOTIONAL: 1}, qty=1) +

            # NATURAL
            self.__build_disasters("dis_nat_leaf_me", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_spa_day", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_bright_idea", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_stroll", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_downpour", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_personal", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_trapped", {DisasterType.NATURAL: 1}, qty=1) +
            self.__build_disasters("dis_nat_uncommon_cold", {DisasterType.NATURAL: 1}, qty=1) +

            # METEORITE
            self.__build_disasters("dis_met_meteor", {DisasterType.METEORITE: 1}, qty=4)
        )

        five_6_disasters_cards = []
        peryls_disasters_cards = []
        daiting_disasters_cards = []
        
        return [
            CardSet(expansion=ExpansionType.BASE, is_two_player_compatible=True, cards=base_disasters)
        ]
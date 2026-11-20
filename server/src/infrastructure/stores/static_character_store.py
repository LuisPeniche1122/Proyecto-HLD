from typing import List
from src.domain.interfaces.character_store import CharacterStore
from src.domain.value_objects.character import Character
from src.domain.value_objects.character_type import CharacterType
from src.domain.value_objects.disaster_type import DisasterType
from src.domain.value_objects.expansion_type import ExpansionType

class StaticCharacterStore(CharacterStore):
    def __init__(self):
        self.__registry = {
            CharacterType.STEGOSAURUS: Character(
                type=CharacterType.STEGOSAURUS, 
                display_name="Stego", 
                initial_traits={
                    DisasterType.METEORITE: 1
                }
            ),
            CharacterType.TRICERATOPS: Character(
                type=CharacterType.TRICERATOPS,
                display_name="Cryceratops", 
                initial_traits={
                    DisasterType.NATURAL: -1,
                    DisasterType.EMOTIONAL: 1
                }
            ),
            CharacterType.BRACHIOSAURUS: Character(
                type=CharacterType.BRACHIOSAURUS, 
                display_name="Bad Luck Bronto", 
                initial_traits={
                    DisasterType.NATURAL: 1,
                    DisasterType.PREDATOR: -1
                }
            ),
            CharacterType.TYRANNOSAURUS: Character(
                type=CharacterType.TYRANNOSAURUS, 
                display_name="Nervous Rex", 
                initial_traits={
                    DisasterType.EMOTIONAL: -1,
                    DisasterType.PREDATOR: 1
                    
                }
            ),
            CharacterType.PTERODACTYL: Character(
                type=CharacterType.PTERODACTYL, 
                display_name="Pterry Dactil", 
                initial_traits={
                    DisasterType.NATURAL: -2,
                    DisasterType.EMOTIONAL: 1,
                    DisasterType.PREDATOR : 1
                },
                expansion = ExpansionType.EXP_5_6
            ),
            CharacterType.VELOCIRAPTOR: Character(
                type=CharacterType.VELOCIRAPTOR, 
                display_name="Raging Raptor", 
                initial_traits={
                    DisasterType.NATURAL: -1,
                    DisasterType.EMOTIONAL: -1,
                    DisasterType.PREDATOR: 2
                },
                expansion = ExpansionType.EXP_5_6
            ),
        }

    def get_character(self, char_type: CharacterType) -> Character:
        return self.__registry[char_type]

    def get_all_characters(self) -> List[Character]:
        return list(self.__registry.values())
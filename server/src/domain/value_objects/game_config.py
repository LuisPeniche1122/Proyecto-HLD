from pydantic import BaseModel, Field, ConfigDict
from typing import Set
from src.domain.value_objects.expansion_type import ExpansionType # <-- Importamos el Enum

class GameConfig(BaseModel):
    model_config = ConfigDict(frozen=True)

    select_card_phase_timer: int = Field(default=30, ge=-1, le=120)
    instant_card_phase_timer: int = Field(default=15, ge=-1, le=60)

    # LOS BOOLEANOS SE QUEDAN (No rompemos el UI ni el endpoint)
    use_dating_disasters: bool = False
    use_perils_of_puberty: bool = False
    use_5_6_expansion: bool = False
        
    @property
    def enabled_expansions(self) -> Set[ExpansionType]:
        """
        EL TRADUCTOR: Convierte los booleanos de la UI en un conjunto
        de expansiones que el dominio de las cartas pueda entender.
        """
        # El juego base siempre está activo
        expansions = {ExpansionType.BASE}
        
        if self.use_5_6_expansion:
            expansions.add(ExpansionType.EXP_5_6)
        if self.use_perils_of_puberty:
            expansions.add(ExpansionType.PERILS)
        if self.use_dating_disasters:
            expansions.add(ExpansionType.DATING)
            
        return expansions

    def with_updates(self, **kwargs) -> 'GameConfig':
        current_data = self.model_dump()
        current_data.update(kwargs)
        return GameConfig(**current_data)
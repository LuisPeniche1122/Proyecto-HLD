import asyncio
from typing import Callable, Dict, Optional, Any
from src.domain.use_cases.timeout_phase_use_case import TimeoutPhaseUseCase

class GameTimersManager:
    """Administra la Máquina de Estados Finitos (FSM) y los cronómetros asíncronos del juego."""

    def __init__(self, timeout_phase_use_case: TimeoutPhaseUseCase):
        self.__timeout_phase_use_case = timeout_phase_use_case
        self.__active_timers: Dict[str, asyncio.Task] = {}
        # NUEVO: El Manager ahora es el único dueño de la verdad sobre las fases de las salas
        self.__room_phases: Dict[str, str] = {} 
        self.__broadcast_callback: Optional[Callable] = None

    def set_broadcast_callback(self, callback: Callable):
        self.__broadcast_callback = callback

    def cancel_timer(self, room_code: str):
        if room_code in self.__active_timers:
            print(f"🛑 Se cancela el temporizador de la sala {room_code}")
            self.__active_timers[room_code].cancel()
            del self.__active_timers[room_code]
            
    def clear_room_state(self, room_code: str):
        """Limpia la memoria cuando una sala se cierra por completo."""
        self.cancel_timer(room_code)
        if room_code in self.__room_phases:
            del self.__room_phases[room_code]

    def handle_phase_transition(self, room_code: str, new_snapshot: Any) -> None:
        """Verifica si hubo cambio de fase evaluando su propia memoria interna."""
        if new_snapshot.__class__.__name__ != "GameStateDTO":
            return
            
        new_phase = getattr(new_snapshot, 'game_phase', None)
        if not new_phase:
            return
            
        # Consultamos la última fase registrada (o inicializamos si es nueva)
        old_phase = self.__room_phases.get(room_code, "INITIALIZING")
        
        # ¡Transición detectada!
        if old_phase != new_phase:
            print(f"🔄 [FSM] Sala {room_code}: {old_phase} -> {new_phase}")
            
            # 1. Actualizamos nuestra fuente de la verdad
            self.__room_phases[room_code] = new_phase
            
            # 2. Matamos el cronómetro viejo
            self.cancel_timer(room_code)
            
            # 3. Si no es el fin del juego, lanzar el nuevo
            if new_phase != "GAME_OVER":
                time_left = getattr(new_snapshot, 'time_left', 0)
                
                if time_left > 0:
                    task = asyncio.create_task(
                        self._phase_timer_task(room_code, time_left, new_phase)
                    )
                    self.__active_timers[room_code] = task
                    
                elif time_left == 0:
                    print(f"⚡ [FSM] Sala {room_code}: Fase {new_phase} tiene time_left=0. Avanzando instantáneamente.")
                    updated_snapshot = self.__timeout_phase_use_case.execute(room_code, new_phase)
                    
                    if updated_snapshot and self.__broadcast_callback:
                        asyncio.create_task(self.__broadcast_callback(room_code, updated_snapshot))
                        # Llamada recursiva usando la nueva firma limpia
                        self.handle_phase_transition(room_code, updated_snapshot)
                else:
                    print(f"⏳ [FSM] Sala {room_code}: Tiempo infinito para la fase {new_phase}. No se lanza timer.")

    async def _phase_timer_task(self, room_code: str, duration: int, expected_phase: str):
        try:
            print(f"⏱️ Inicia temporizador {room_code} | {duration}s | {expected_phase}")
            await asyncio.sleep(duration)
            print(f"⏰ ¡Desperté del sueño! Sala {room_code}")
            
            updated_snapshot = self.__timeout_phase_use_case.execute(room_code, expected_phase)
            
            if updated_snapshot and self.__broadcast_callback:
                await self.__broadcast_callback(room_code, updated_snapshot)
                
                # Llamada recursiva usando la nueva firma limpia
                self.handle_phase_transition(room_code, updated_snapshot)
                
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"⚠️ [Timer Error] Sala {room_code}: {str(e)}")
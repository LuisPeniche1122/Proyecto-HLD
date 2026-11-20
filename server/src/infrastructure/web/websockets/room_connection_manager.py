from fastapi import WebSocket
from typing import Dict, Any

class RoomConnectionManager:
    """Gestiona las conexiones WebSocket activas agrupadas por Sala de Juego y Usuario."""

    def __init__(self):
        # Diccionario: { "ROOM_CODE": { "user_id_1": ws1, "user_id_2": ws2 } }
        self.active_rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_code: str, user_id: str):
        """Agrupa la conexión en la sala correspondiente, ligada a su user_id."""        
        if room_code not in self.active_rooms:
            self.active_rooms[room_code] = {}
            
        self.active_rooms[room_code][user_id] = websocket

    def disconnect(self, websocket: WebSocket, room_code: str, user_id: str):
        """Elimina el socket de la sala y limpia la memoria si la sala queda vacía."""
        if room_code in self.active_rooms and user_id in self.active_rooms[room_code]:
            del self.active_rooms[room_code][user_id]
            
            # Limpieza de RAM: Si no quedan sockets, borramos la sala
            if not self.active_rooms[room_code]:
                del self.active_rooms[room_code]

    async def broadcast_envelope(self, room_code: str, snapshot: Any) -> None:
        """
        Envía el estado de la partida a la sala.
        Si es el GameState, genera una versión censurada para cada jugador.
        """
        if room_code not in self.active_rooms:
            return

        is_game_state = snapshot.__class__.__name__ == "GameStateDTO"
        is_room_state = snapshot.__class__.__name__ == "RoomStateDTO"

        # Iteramos sobre cada usuario conectado en esta sala
        for user_id, connection in self.active_rooms[room_code].items():
            payload = {
                "room": None,
                "game": None
            }
            
            if is_game_state:
                # ¡LA MAGIA OCURRE AQUÍ! Personalizamos la foto para los ojos de este usuario
                payload["game"] = snapshot.personalize_for(viewer_id=user_id)
            elif is_room_state:
                payload["room"] = snapshot.model_dump()
                
            envelope = {
                "event": "sync_state",
                "payload": payload
            }
            
            try:
                await connection.send_json(envelope)
            except Exception:
                pass
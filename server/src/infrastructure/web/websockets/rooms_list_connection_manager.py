from fastapi import WebSocket
from typing import List

class RoomListConnectionManager:
    """Gestiona las conexiones WebSocket activas en la pantalla de lista de salas."""

    def __init__(self):
        # Lista de clientes conectados a la vista global de salas
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_rooms(self, rooms_json: List[dict]):
        """Envía la lista actualizada a todos los jugadores en el Lobby."""
        for connection in self.active_connections:
            try:
                await connection.send_json(rooms_json)
            except Exception:
                # Si un cliente se desconectó abruptamente, lo ignoramos y limpiamos luego
                pass
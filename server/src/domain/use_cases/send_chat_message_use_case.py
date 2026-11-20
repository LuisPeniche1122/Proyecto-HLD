from typing import List
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.exceptions import RoomNotFoundError, UserNotInRoomError
from src.domain.dtos.room_dtos import RoomStateDTO, PlayerSnapshotDTO, ChatMessageDTO

class SendChatMessageUseCase:
    def __init__(self, room_repository: RoomRepository):
        self.__room_repository = room_repository

    def execute(self, room_code: str, user_id: str, payload: dict) -> RoomStateDTO:
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            raise RoomNotFoundError()

        if user_id not in room.players:
            raise UserNotInRoomError()

        text = payload.get("text", "").strip()
        if text:
            username = room.players[user_id]
            room.add_chat_message(username, text)
            self.__room_repository.update(room)

        return RoomStateDTO.from_entity(room)
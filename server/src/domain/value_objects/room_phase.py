from enum import Enum

class RoomPhase(Enum):
    LOBBY = "LOBBY"
    PLAYING = "PLAYING"
    FINISHED = "FINISHED"
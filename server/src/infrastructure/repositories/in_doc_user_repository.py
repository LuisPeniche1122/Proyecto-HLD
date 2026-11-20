"""File-based implementation of the UserRepository."""
import json
import os
import threading
from typing import Optional

from src.domain.entities.user import User
from src.domain.interfaces.user_repository import UserRepository
from src.infrastructure.mappers.in_doc_user_mapper import InDocUserMapper
from src.infrastructure.ports.in_doc_user_port import InDocUserPort

# Candado global exclusivo para este archivo
users_file_lock = threading.Lock()

class InDocUserRepository(UserRepository):
    """Manages User persistence using a local JSON text file."""

    def __init__(self, file_path: str = "users_db.json"):
        self.__file_path = file_path
        self.__ensure_file_exists()

    def __ensure_file_exists(self) -> None:
        """Creates an empty JSON array file if it doesn't exist."""
        with users_file_lock:
            if not os.path.exists(self.__file_path):
                with open(self.__file_path, "w", encoding="utf-8") as f:
                    json.dump([], f)

    def __read_all_records(self) -> list[dict]:
        """Reads all records from the text file. (Asume que el candado ya está puesto)"""
        try:
            with open(self.__file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    def __write_all_records(self, records: list[dict]) -> None:
        """Writes all records back. (Asume que el candado ya está puesto)"""
        with open(self.__file_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=4, ensure_ascii=False)

    def find_by_username(self, username: str) -> Optional[User]:
        with users_file_lock:
            records = self.__read_all_records()
        for record in records:
            if record["username"] == username:
                return InDocUserMapper.to_domain(record)
        return None

    def find_by_email(self, email: str) -> Optional[User]:
        with users_file_lock:
            records = self.__read_all_records()
        for record in records:
            if record["email"] == email:
                return InDocUserMapper.to_domain(record)
        return None
    
    def find_by_id(self, user_id: str) -> Optional[User]:
        with users_file_lock:
            records = self.__read_all_records()
        for record in records:
            if record["id"] == user_id:
                return InDocUserMapper.to_domain(record)
        return None

    def save(self, user: User) -> None:
        # El candado asegura que nadie más lea o escriba mientras estamos trabajando
        with users_file_lock:
            records = self.__read_all_records()
            new_record = InDocUserPort.to_doc(user)
            records.append(new_record)
            self.__write_all_records(records)

    def update(self, user: User) -> None:
        # Bloqueamos el archivo durante toda la transacción
        with users_file_lock:
            records = self.__read_all_records()
            updated_record = InDocUserPort.to_doc(user)
            for idx, record in enumerate(records):
                if record["id"] == updated_record["id"]:
                    records[idx] = updated_record
                    self.__write_all_records(records)
                    return
            
            records.append(updated_record)
            self.__write_all_records(records)
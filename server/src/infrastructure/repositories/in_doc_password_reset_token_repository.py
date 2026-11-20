"""File-based implementation of the PasswordResetTokenRepository."""
import json
import os
import threading
from typing import Optional

from src.domain.entities.password_reset_token import PasswordResetToken
from src.domain.interfaces.password_reset_token_repository import PasswordResetTokenRepository
from src.infrastructure.mappers.in_doc_password_reset_token_mapper import InDocPasswordResetTokenMapper
from src.infrastructure.ports.in_doc_password_reset_token_port import InDocPasswordResetTokenPort

# Candado global exclusivo para el archivo de tokens de reseteo
tokens_file_lock = threading.Lock()

class InDocPasswordResetTokenRepository(PasswordResetTokenRepository):
    """Manages PasswordResetToken persistence using a local JSON text file."""

    def __init__(self, file_path: str = "tokens_db.json"):
        self.__file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Creates an empty JSON array file if it doesn't exist."""
        with tokens_file_lock:
            if not os.path.exists(self.__file_path):
                with open(self.__file_path, "w", encoding="utf-8") as f:
                    json.dump([], f)

    def _read_all_records(self) -> list[dict]:
        """Reads all token records from the text file. (Se llama desde un bloque bloqueado)"""
        try:
            with open(self.__file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    def _write_all_records(self, records: list[dict]) -> None:
        """Writes all token records back to the text file. (Se llama desde un bloque bloqueado)"""
        with open(self.__file_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=4, ensure_ascii=False)

    def find_by_token(self, token: str) -> Optional[PasswordResetToken]:
        # Solo leemos, pero bloqueamos para evitar leer a la mitad de una escritura de otro hilo
        with tokens_file_lock:
            records = self._read_all_records()
            for record in records:
                if record["token"] == token:
                    return InDocPasswordResetTokenMapper.to_domain(record)
        return None

    def save(self, token: PasswordResetToken) -> None:
        # Bloqueamos toda la transacción: Leer -> Validar/Modificar -> Escribir
        with tokens_file_lock:
            records = self._read_all_records()
            token_data = InDocPasswordResetTokenPort.to_doc(token)

            for i, record in enumerate(records):
                if record["token"] == token.token:
                    records[i] = token_data
                    self._write_all_records(records)
                    return

            records.append(token_data)
            self._write_all_records(records)

    def update(self, token: PasswordResetToken) -> None:
        """Updates an existing token's state (e.g., marking it as used)."""
        # Bloqueamos toda la transacción
        with tokens_file_lock:
            records = self._read_all_records()
            token_data = InDocPasswordResetTokenPort.to_doc(token)

            for i, record in enumerate(records):
                if record["token"] == token.token:
                    records[i] = token_data
                    self._write_all_records(records)
                    return
            
            raise ValueError("Token no encontrado para actualizar.")
# Casos de Uso — Happy Little Dinosaurs Online

> Arquitectura: **Clean Architecture (Onion)**  
> Componentes: **Cliente** (web, React/Vue) · **Servidor** (Python/Node, WebSocket + REST) · **Bot** (proceso independiente)  
> Convención de nombres: snake_case para módulos Python (pylint), PascalCase para clases de dominio.

---

## Convenciones generales de arquitectura

Cada componente respeta las siguientes capas:

```
dominio/
  entidades/        ← Clases puras del negocio (Card, Player, Game, Lobby…)
  casos_de_uso/     ← Lógica de aplicación (use cases). Sin dependencias de framework.
  puertos/          ← Interfaces/abstract classes (repositorios, gateways)
  dto/              ← Objetos de transferencia (entrada y salida de cada caso de uso)

infraestructura/
  adaptadores/      ← Implementaciones concretas de los puertos (BD, WS, HTTP)
  repositorios/     ← Acceso a datos
  servicios_ext/    ← Clientes de servicios externos (BotService, AuthService…)
```

El **Cliente** solo tiene capa de presentación (UI) + capa de adaptadores de red (fetch/WebSocket).  
El **Bot** solo tiene dominio reducido + adaptador WebSocket hacia el servidor.

---

## Índice de casos de uso

| # | Caso de uso | Componentes |
|---|-------------|-------------|
| CU-01 | Registrar usuario | Cliente → Servidor |
| CU-02 | Iniciar sesión | Cliente → Servidor |
| CU-03 | Acceder como invitado | Cliente → Servidor |
| CU-04 | Recuperar contraseña | Cliente → Servidor |
| CU-05 | Consultar listado de salas | Cliente → Servidor |
| CU-06 | Crear sala | Cliente → Servidor |
| CU-07 | Unirse a sala (pública o privada) | Cliente → Servidor |
| CU-08 | Gestionar sala de espera (host) | Cliente → Servidor |
| CU-09 | Gestionar sala de espera (invitee) | Cliente → Servidor |
| CU-10 | Iniciar partida | Cliente → Servidor → Bot (opcional) |
| CU-11 | Seleccionar personaje | Cliente → Servidor |
| CU-12 | Jugar carta de puntos | Cliente → Servidor |
| CU-13 | Revelar cartas y calcular puntuación | Servidor (interno) |
| CU-14 | Resolver efectos de cartas | Servidor (interno) |
| CU-15 | Resolver muerte súbita | Servidor (interno) |
| CU-16 | Jugar carta instantánea | Cliente → Servidor |
| CU-17 | Asignar desastre al perdedor | Servidor (interno) |
| CU-18 | Verificar condición de eliminación | Servidor (interno) |
| CU-19 | Verificar condición de victoria | Servidor (interno) |
| CU-20 | Avanzar ronda | Servidor (interno) |
| CU-21 | Abandonar partida | Cliente → Servidor |
| CU-22 | Reconectarse a partida | Cliente → Servidor |
| CU-23 | Tomar decisión (Bot) | Bot → Servidor |
| CU-24 | Mostrar pantalla de resultados | Servidor → Cliente |

---

## CU-01 · Registrar usuario

**Actor:** UnregisteredUser  
**RF cubiertos:** RF1 (acceso futuro), RF3, RF4 (base para recuperación)

### Precondiciones
- El usuario no posee cuenta en el sistema.

### Postcondiciones
- Se crea una cuenta con credenciales válidas y el usuario queda como RegisteredUser.

### Flujo principal

**[CLIENTE]**
1. El usuario navega a la pantalla de registro.
2. El formulario solicita: `username`, `email`, `password`, `confirm_password`.
3. Validación local (presentación):
   - Campos no vacíos.
   - `password` y `confirm_password` coinciden.
   - Formato de email válido (regex).
   - Contraseña ≥ 8 caracteres.
4. Si pasa validación, se construye el DTO de salida:
   ```
   RegisterUserRequestDTO { username, email, password_hash }
   ```
   > La contraseña **nunca** viaja en texto plano; el cliente aplica hash previo (SHA-256 mínimo) o el canal es TLS y el hash lo hace el servidor.
5. Se envía `POST /api/auth/register` con el DTO en el body (JSON).
6. El cliente muestra un indicador de carga.

**[SERVIDOR — infraestructura/adaptadores]**
7. `NetworkService(apiRouter del main)` recibe la petición HTTP y la delega a `AuthService(controller)`.

**[SERVIDOR — dominio/casos_de_uso]**
8. `RegisterUserUseCase.execute(dto: RegisterUserRequestDTO)`:
   a. Valida unicidad de `username` y `email` consultando el repositorio `UserRepository`.
   b. Si existe conflicto → lanza `UserAlreadyExistsError`.
   c. Genera hash seguro de la contraseña (`bcrypt`).
   d. Crea entidad `User(id, username, email, password_hash, created_at)`.
   e. Persiste via `UserRepository.save(user)`.
   f. Retorna `RegisterUserResponseDTO { user_id, username }`.

**[SERVIDOR — infraestructura/adaptadores]**
9. `AuthService` responde `201 Created` con el DTO de respuesta.

**[CLIENTE]**
10. Si `201`: muestra mensaje de éxito y redirige a pantalla de login.
11. Si `409` (conflicto): muestra error específico ("usuario o email ya registrado").
12. Si `400` (validación servidor): muestra errores de campo.
13. Si `5xx`: muestra mensaje genérico de error de servidor.

### Patrones y buenas prácticas
- **DTO** para entrada y salida del caso de uso (nunca exponer entidades de dominio directamente).
- **Repository Pattern** (`UserRepository`) para abstraer el acceso a datos.
- Contraseña hasheada con `bcrypt` (nunca MD5/SHA-1 para passwords).
- Validación en dos capas: presentación (UX) y dominio (seguridad).
- Pylint: todos los métodos documentados con docstrings; sin variables sin usar (`W0612`).

---

## CU-02 · Iniciar sesión

**Actor:** RegisteredUser  
**RF cubiertos:** RF1

### Precondiciones
- El usuario posee una cuenta registrada.

### Postcondiciones
- Se emite un token de sesión (JWT) y el usuario queda como ActiveUser.

### Flujo principal

**[CLIENTE]**
1. El usuario ingresa `username_or_email` y `password`.
2. Validación local: campos no vacíos.
3. Construye `LoginRequestDTO { identifier, password }`.
4. Envía `POST /api/auth/login`.
5. Muestra indicador de carga.

**[SERVIDOR — dominio/casos_de_uso]**
6. `LoginUseCase.execute(dto: LoginRequestDTO)`:
   a. Busca usuario por `username` o `email` en `UserRepository`.
   b. Si no existe → lanza `InvalidCredentialsError` (mismo error que contraseña incorrecta, para no revelar si el usuario existe).
   c. Compara `bcrypt.verify(password, stored_hash)`.
   d. Si falla → lanza `InvalidCredentialsError`.
   e. Genera `JWT { user_id, username, exp }` firmado con clave secreta del servidor.
   f. Retorna `LoginResponseDTO { access_token, expires_in, username }`.

**[SERVIDOR — infraestructura]**
7. Responde `200 OK` con el DTO.

**[CLIENTE]**
8. Almacena el `access_token` en memoria (preferible) o `sessionStorage`.
9. Redirige al menú principal.
10. Errores `401`: "Credenciales inválidas" (sin especificar cuál campo falló).

### Patrones y buenas prácticas
- **JWT** para autenticación sin estado (stateless).
- Mensaje de error genérico para prevenir enumeración de usuarios.
- El token NO se guarda en `localStorage` (riesgo XSS); usar `httpOnly cookie` o memoria de React.
- `AuthService` es un adaptador que puede cambiarse (OAuth, LDAP) sin tocar el caso de uso.

---

## CU-03 · Acceder como invitado

**Actor:** UnregisteredUser  
**RF cubiertos:** RF2

### Flujo principal

**[CLIENTE]**
1. El usuario pulsa "Jugar como invitado".
2. Envía `POST /api/auth/guest`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `CreateGuestSessionUseCase.execute()`:
   a. Genera `guest_id` único (UUID v4).
   b. Genera `username` temporal: `"Dino_" + random_suffix`.
   c. Emite JWT de sesión temporal con flag `is_guest: true` y TTL corto (ej. 24h).
   d. Retorna `GuestSessionDTO { access_token, guest_username, expires_in }`.

**[CLIENTE]**
4. Almacena token igual que en CU-02.
5. Redirige al menú principal mostrando el nombre de invitado.

### Patrones
- Mismo flujo de autenticación que CU-02, distinto caso de uso. Evita duplicar lógica compartida mediante un `TokenFactory` en el dominio.

---

## CU-04 · Recuperar contraseña

**Actor:** RegisteredUser  
**RF cubiertos:** RF3, RF4

### Flujo principal

**[CLIENTE]**
1. El usuario ingresa `username` o `email` en el formulario de recuperación.
2. Construye `RecoverPasswordRequestDTO { identifier }`.
3. Envía `POST /api/auth/recover`.

**[SERVIDOR — dominio/casos_de_uso]**
4. `RecoverPasswordUseCase.execute(dto)`:
   a. Busca usuario por `username` o `email`.
   b. **Independientemente de si existe**, responde con mensaje genérico (anti-enumeración).
   c. Si existe: genera token temporal de reset (UUID, TTL 15 min), lo persiste en `PasswordResetTokenRepository`.
   d. Delega envío de email al puerto `EmailGateway` (implementado por `SmtpEmailAdapter` o similar).

**[SERVIDOR]**
5. Responde `200 OK` con mensaje: "Si el usuario existe, recibirás un email."

**[CLIENTE]**
6. Muestra mensaje de confirmación sin revelar si el usuario existe.

**Subflow — aplicar nuevo password:**
7. Usuario hace clic en el enlace del email → `GET /reset-password?token=<token>`.
8. Cliente muestra formulario de nueva contraseña.
9. `POST /api/auth/reset { token, new_password }`.
10. `ResetPasswordUseCase.execute(dto)`:
    a. Valida token: existe, no expirado, no usado.
    b. Actualiza hash en `UserRepository`.
    c. Invalida el token.

### Patrones
- **Port/Adapter** para el `EmailGateway` (se puede mockear en tests).
- Token de reset en repositorio separado (TTL corto, uso único).

---

## CU-05 · Consultar listado de salas

**Actor:** ActiveUser  
**RF cubiertos:** RF5, RF7, RF8

### Flujo principal

**[CLIENTE]**
1. El usuario accede al menú principal y selecciona "Salas".
2. Envía `GET /api/lobbies` (con JWT en header `Authorization: Bearer <token>`).
3. Muestra indicador de carga; refresca la lista cuando el usuario pulsa "Actualizar" (RF8).

**[SERVIDOR — dominio/casos_de_uso]**
4. `ListLobbiesUseCase.execute()`:
   a. Consulta `LobbyRepository.find_public_active()`.
   b. Mapea a `LobbyListItemDTO { lobby_id, name, host_username, player_count, max_players, is_private }`.
   c. Retorna lista de DTOs.

**[SERVIDOR]**
5. Responde `200 OK` con array de `LobbyListItemDTO`.

**[CLIENTE]**
6. Renderiza la lista. Salas privadas aparecen en la lista pero muestran icono de candado (RF7 implica solo salas públicas visibles desde listado general; las privadas solo se unen por código).

### Patrones
- **Query use case** (solo lectura, sin side effects).
- El DTO de lista es diferente al DTO de detalle de sala (principio de mínima exposición).

---

## CU-06 · Crear sala

**Actor:** ActiveUser (se convierte en Host)  
**RF cubiertos:** RF12, RF13, RF14, RF15, RF16

### Flujo principal

**[CLIENTE]**
1. El usuario pulsa "Crear sala".
2. Configura: nombre de sala, pública/privada, máximo de jugadores (2–4 base, 5–6 con expansión).
3. Construye `CreateLobbyRequestDTO { name, is_private, max_players }`.
4. Envía `POST /api/lobbies`.

**[SERVIDOR — dominio/casos_de_uso]**
5. `CreateLobbyUseCase.execute(dto, host_user_id)`:
   a. Genera `lobby_id` (UUID) y `join_code` único de 6 caracteres alfanuméricos (RF14).
   b. Crea entidad `Lobby { lobby_id, name, host_id, join_code, is_private, max_players, status="preparing", members=[] }` (RF15).
   c. Añade al host como primer miembro.
   d. Persiste en `LobbyRepository` (RF16).
   e. Retorna `CreateLobbyResponseDTO { lobby_id, join_code }`.

**[SERVIDOR]**
6. Responde `201 Created`.
7. Emite evento WebSocket `LOBBY_CREATED` a los usuarios activos (para actualizar listados abiertos).

**[CLIENTE]**
8. Redirige a la sala de espera mostrando el `join_code`.

### Patrones
- **Factory Method** implícito en `Lobby.create(...)` — la entidad se construye siempre en estado válido.
- `join_code` se genera en el dominio, no en la infraestructura, para poder testearse.
- Unicidad del código verificada antes de persistir (retry si colisión).

---

## CU-07 · Unirse a sala (pública o privada)

**Actor:** ActiveUser (se convierte en Invitee)  
**RF cubiertos:** RF9, RF10, RF11

### Variantes
- **A) Unirse desde lista (pública):** el usuario selecciona una sala de la lista (RF9).
- **B) Unirse por código (pública o privada):** el usuario ingresa un código de 6 caracteres (RF10, RF11).

### Flujo principal

**[CLIENTE]**
1. Variante A: el usuario pulsa "Unirse" en la sala seleccionada → `lobby_id` conocido.
2. Variante B: el usuario ingresa el código → se resuelve a `lobby_id`.
3. Construye `JoinLobbyRequestDTO { lobby_id_or_code }`.
4. Envía `POST /api/lobbies/join`.

**[SERVIDOR — dominio/casos_de_uso]**
5. `JoinLobbyUseCase.execute(dto, user_id)`:
   a. Resuelve lobby por `lobby_id` o `join_code` vía `LobbyRepository`.
   b. Valida: sala existe, estado `"preparing"`, no está llena, usuario no está ya dentro.
   c. Si sala privada y acceso por código: código correcto (ya validado en paso anterior).
   d. Agrega al usuario como `Invitee` en la entidad `Lobby`.
   e. Persiste cambio.
   f. Retorna `JoinLobbyResponseDTO { lobby_id, join_code, members, host_username }`.

**[SERVIDOR]**
6. Responde `200 OK`.
7. Emite evento WebSocket `PLAYER_JOINED { username }` a todos los miembros de la sala.

**[CLIENTE]**
8. Redirige a sala de espera y conecta al canal WebSocket de esa sala.

### Flujos alternativos
- Sala llena → `409 Conflict` → "La sala está llena."
- Sala no existe → `404 Not Found`.
- Usuario ya en sala → `409` → idempotente: redirige directamente.

---

## CU-08 · Gestionar sala de espera (Host)

**Actor:** Host  
**RF cubiertos:** RF17, RF18, RF19, RF21, RF23, RF27, RF30, RF32, RF33

Este caso de uso agrupa las acciones que solo el Host puede realizar en la sala de espera. Cada acción es un sub-caso de uso independiente pero comparten el mismo canal WebSocket.

### Canal de comunicación
- Todas las acciones en sala de espera usan **WebSocket** (bidireccional, tiempo real).
- Formato de mensaje: `{ "type": "ACTION_TYPE", "payload": { ... } }`.

### CU-08a · Ceder rol de Host (RF17)

**[CLIENTE]**
1. Host selecciona un Invitee y pulsa "Ceder anfitrión".
2. Envía WS: `{ type: "TRANSFER_HOST", payload: { target_user_id } }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `TransferHostUseCase.execute(lobby_id, current_host_id, target_user_id)`:
   a. Verifica que `current_host_id` es el host actual.
   b. Actualiza `Lobby.host_id = target_user_id`.
   c. Persiste.
4. Emite WS broadcast `HOST_CHANGED { new_host_username }` a toda la sala.

### CU-08b · Asignar nuevo Host por desconexión (RF18)

**[SERVIDOR — infraestructura]**
1. `NetworkService` detecta desconexión del Host (timeout WebSocket).

**[SERVIDOR — dominio/casos_de_uso]**
2. `HandleHostDisconnectUseCase.execute(lobby_id)`:
   a. Si hay Invitees → asigna como Host al primero en unirse (orden de llegada).
   b. Si no hay nadie → elimina la sala (RF33).
3. Emite WS `HOST_CHANGED` o `LOBBY_CLOSED`.

### CU-08c · Agregar bot (RF19)

**[CLIENTE]**
1. Host pulsa "Añadir bot".
2. Envía WS: `{ type: "ADD_BOT", payload: { bot_difficulty } }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `AddBotUseCase.execute(lobby_id, host_id, difficulty)`:
   a. Verifica que hay espacio.
   b. Crea entidad `BotPlayer { bot_id, name="Bot_X", is_bot: true, difficulty }`.
   c. Agrega al lobby como miembro especial.
4. Emite WS `PLAYER_JOINED { username: "Bot_X", is_bot: true }`.

**[BOT — en el momento de la partida]**
- El bot se registra en el servidor cuando la partida inicia (CU-10). Ver CU-23.

### CU-08d · Configurar partida (RF21)

**[CLIENTE]**
1. Host ajusta parámetros: tiempo de selección de carta, reglas de 2 jugadores, etc.
2. Envía WS: `{ type: "UPDATE_SETTINGS", payload: { settings: SettingsDTO } }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `UpdateLobbySettingsUseCase.execute(lobby_id, host_id, settings_dto)`:
   a. Valida rangos permitidos.
   b. Actualiza `Lobby.settings`.
4. Emite WS `SETTINGS_UPDATED { settings }` a toda la sala.

### CU-08e · Expulsar Invitee (RF23)

**[CLIENTE]**
1. Host selecciona un Invitee y pulsa "Expulsar".
2. Envía WS: `{ type: "KICK_PLAYER", payload: { target_user_id } }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `KickPlayerUseCase.execute(lobby_id, host_id, target_user_id)`:
   a. Verifica permisos.
   b. Remueve al Invitee del lobby.
4. Emite WS `PLAYER_KICKED { username }` a la sala.
5. Emite WS `YOU_WERE_KICKED` solo al jugador expulsado.

**[CLIENTE — jugador expulsado]**
6. Redirige al listado de salas con mensaje informativo.

### CU-08f · Iniciar partida (RF30, RF31, RF32)

**[CLIENTE]**
1. Host pulsa "Iniciar partida" (botón habilitado solo si todos los Invitees están listos).
2. Envía WS: `{ type: "START_GAME" }`.

**[SERVIDOR]**
3. Ver CU-10.

### Patrones
- **Command Pattern** sobre WebSocket: cada `type` mapea a un caso de uso específico.
- **Guard clauses** en cada caso de uso para verificar permisos (host_id).
- Todos los casos de uso del dominio son **puros y testeables** independientemente de WebSocket.

---

## CU-09 · Gestionar sala de espera (Invitee)

**Actor:** Invitee  
**RF cubiertos:** RF26, RF27, RF29

### CU-09a · Marcar como listo (RF29)

**[CLIENTE]**
1. Invitee pulsa "Listo" / "No listo" (toggle).
2. Envía WS: `{ type: "SET_READY", payload: { is_ready: bool } }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `SetPlayerReadyUseCase.execute(lobby_id, user_id, is_ready)`:
   a. Actualiza estado del Invitee en el lobby.
4. Emite WS `PLAYER_READY_CHANGED { username, is_ready }` a la sala.
5. Si todos los Invitees están listos → emite `ALL_PLAYERS_READY` al Host (habilita botón de inicio).

### CU-09b · Abandonar sala (RF26)

**[CLIENTE]**
1. Invitee pulsa "Abandonar" o cierra la pestaña.
2. Envía WS: `{ type: "LEAVE_LOBBY" }` (o detectado por desconexión).

**[SERVIDOR — dominio/casos_de_uso]**
3. `LeaveLobbyUseCase.execute(lobby_id, user_id)`:
   a. Remueve al usuario del lobby.
   b. Si lobby queda vacío → lo elimina (RF33).
4. Emite WS `PLAYER_LEFT { username }`.

### CU-09c · Chat de sala (RF27)

**[CLIENTE]**
1. Usuario escribe un mensaje y pulsa Enter.
2. Envía WS: `{ type: "CHAT_MESSAGE", payload: { text } }`.

**[SERVIDOR — infraestructura]**
3. `ChatService.broadcast(lobby_id, sender_username, text)`:
   a. Sanitiza el mensaje (longitud máxima, sin HTML).
   b. Emite WS `CHAT_MESSAGE { sender, text, timestamp }` a todos en la sala.

> El chat no requiere caso de uso de dominio — es infraestructura pura (relay de mensajes).

---

## CU-10 · Iniciar partida

**Actor:** Host (dispara la acción); Sistema (ejecuta la lógica)  
**RF cubiertos:** RF31, RF32, RF36, RF37, RF38, RF39

### Precondiciones
- Sala en estado `"preparing"`, al menos 2 jugadores (humanos + bots), todos los Invitees listos.

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `StartGameUseCase.execute(lobby_id, host_id)`:
   a. Verifica precondiciones.
   b. Carga configuración del lobby (`SettingsService`).
   c. Aplica reglas según número de jugadores:
      - 2 jugadores → reglas especiales (quitar cartas 1/2/3, condición de eliminación modificada).
      - 3–4 → reglas base.
      - 5–6 → reglas de expansión.
   d. Delega a `GameFactory.create_game(players, settings)`:
      - Crea entidad `Game { game_id, players, round=0, status="active" }`.
      - Crea `DeckManager`:
        - Instancia mazo principal (53 cartas de puntos + 16 instantáneas).
        - Instancia mazo de desastres (28 cartas).
        - Aplica filtros según configuración (ej. quitar cartas 1/2/3 en 2 jugadores).
        - Baraja ambos mazos (Fisher-Yates shuffle).
      - Reparte 5 cartas a cada jugador desde el mazo principal (RF39).
      - Inicializa puntuación de cada jugador en 0 (RF36).
   e. Persiste la instancia de `Game` en `GameRepository`.
   f. Actualiza estado del lobby a `"in_game"`.

**[SERVIDOR — infraestructura]**
2. Emite WS `GAME_STARTED { game_id }` a todos los miembros.
3. Emite WS `GAME_STATE { hand: [...], disaster_deck_top: {...} }` individualmente a cada jugador (mano privada).

**[BOT]**
4. Si hay bots, el proceso Bot recibe `GAME_STARTED`, establece su WS con el servidor y queda en espera de eventos (ver CU-23).

**[CLIENTE]**
5. Redirige a la pantalla de juego. Ver CU-11 (selección de personaje).

### Patrones
- **Factory Pattern** (`GameFactory`) para construir el estado inicial del juego.
- **Strategy Pattern** para aplicar distintos rulesets según número de jugadores (implementa interfaz `GameRules`).
- `DeckManager` es un servicio de dominio (no una entidad), responsable único de operaciones sobre mazos.

---

## CU-11 · Seleccionar personaje

**Actor:** Player  
**RF cubiertos:** RF25

### Flujo principal

**[SERVIDOR]**
1. Tras `GAME_STARTED`, el servidor emite a cada cliente `CHOOSE_CHARACTER { available: ["BadLuckBronto", "CryCeratops", "NervousRex", "Stego"] }`.

**[CLIENTE]**
2. Muestra los personajes disponibles con sus rasgos (ventajas/desventajas ante cada tipo de desastre).
3. El usuario selecciona uno.
4. Envía WS: `{ type: "SELECT_CHARACTER", payload: { character_id } }`.

**[SERVIDOR — dominio/casos_de_uso]**
5. `SelectCharacterUseCase.execute(game_id, player_id, character_id)`:
   a. Verifica que el personaje no fue tomado por otro jugador.
   b. Asigna `Player.character = Character(character_id, traits)`.
   c. Persiste.
   d. Emite WS `CHARACTER_SELECTED { player_id, character_id }` a la sala (los demás ven qué tomaron).
6. Cuando todos han seleccionado → emite `ALL_CHARACTERS_SELECTED` e inicia la primera ronda.

### Patrones
- **Value Object** `Character` con sus `traits` inmutables.
- `traits` se modelan como modificadores: `{ disaster_type: DisasterType, modifier: int }`.

---

## CU-12 · Jugar carta de puntos

**Actor:** Player  
**RF cubiertos:** RF43, RF44, RF49

### Precondiciones
- La partida está en fase `SELECTION` de la ronda activa.
- El jugador tiene al menos una carta de puntos en la mano.

### Flujo principal

**[SERVIDOR]**
1. Al iniciar cada ronda, el servidor emite:
   - WS broadcast `ROUND_STARTED { round_number, disaster_card: {...} }`.
   - `PhaseManager` activa fase `SELECTION` y arranca el temporizador (RF46).

**[CLIENTE]**
2. Muestra la carta de desastre activa y la mano del jugador.
3. El jugador selecciona una carta de puntos y la confirma.
4. Envía WS: `{ type: "PLAY_POINT_CARD", payload: { card_id } }`.

**[SERVIDOR — dominio/casos_de_uso]**
5. `PlayPointCardUseCase.execute(game_id, player_id, card_id)`:
   a. Verifica fase `SELECTION` activa (RF49).
   b. Verifica que `card_id` pertenece a la mano del jugador y es carta de puntos.
   c. Mueve la carta al "área de juego" del jugador (boca abajo).
   d. Marca al jugador como "ha jugado".
   e. Si todos los jugadores han jugado → cancela temporizador y activa CU-13.

**[SERVIDOR — RF44]**
6. Si el temporizador expira antes de que un jugador juegue:
   - `AutoSelectCardUseCase.execute(game_id, player_id)`:
     - Selecciona aleatoriamente una carta de puntos de la mano.
     - Ejecuta el mismo flujo del paso 5.

**[SERVIDOR]**
7. Emite WS `PLAYER_PLAYED { player_id }` (sin revelar la carta) a los demás.

### Patrones
- **State Pattern** en `PhaseManager`: solo acepta `PLAY_POINT_CARD` en fase `SELECTION`.
- **Observer** implícito: cuando todos jugaron, se dispara automáticamente la siguiente fase.
- Pylint: validar tipos con `isinstance` y annotations; no usar `type()` para comparación.

---

## CU-13 · Revelar cartas y calcular puntuación

**Actor:** Sistema (automático tras CU-12)  
**RF cubiertos:** RF43, RF51, RF52, RF53, RF54

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `PhaseManager` transiciona a fase `REVEAL`.
2. `RevealCardsUseCase.execute(game_id)`:
   a. Mueve todas las cartas de "área de juego" a "reveladas".
3. Emite WS `CARDS_REVEALED { plays: [{ player_id, card }] }`.

**[SERVIDOR]**
4. `PhaseManager` transiciona a fase `EFFECTS`.
5. Ver CU-14 (resolver efectos de cartas).

**[SERVIDOR — tras resolver efectos]**
6. `CalculateScoresUseCase.execute(game_id)`:
   a. Para cada jugador calcula:
      ```
      score = card.point_value
              + character.trait_modifier(active_disaster.type)
              + sum(effect_modifiers)
              + len(player.disaster_area)  ← bonus por desastres acumulados
      ```
   b. Determina ganadores de ronda (score más alto) — pueden ser varios (RF53).
   c. Determina perdedor(es) de ronda (score más bajo) — puede haber empate (RF54) → CU-15.
   d. Retorna `RoundResultDTO { winners, losers, scores }`.

**[SERVIDOR]**
7. Emite WS `ROUND_SCORES { scores: [{ player_id, score }], winners, losers }`.

### Patrones
- **Chain of Responsibility** para aplicar efectos en orden (ver CU-14).
- Puntuación calculada en el dominio, nunca en el cliente (el cliente es solo visualización).

---

## CU-14 · Resolver efectos de cartas

**Actor:** Sistema (interno, parte de CU-13)  
**RF cubiertos:** RF48, RF51

Este caso de uso es responsabilidad del módulo `EffectEngine`.

### Tipos de efectos y orden de resolución

```
1. Efectos "Durante esta ronda" (se aplican primero, independiente del valor de carta)
   → FLAMING_CHAINSAW: ignora todos los demás efectos de cartas de puntos

2. Efectos estándar (en orden ascendente de valor de carta del jugador)
   → PET_ROCK: descarta carta de mano y añade su valor al score
   → TREENOCULARS: mira top-2 del mazo, elige una
   → FIRE_SPRAY: descarta hasta 3 cartas de la mano
   → RUN_HOME_BAT: intercambia con la carta del jugador a izquierda/derecha
   → HUNGRY_PLANT: intercambia las cartas jugadas de 2 jugadores cualesquiera

3. Efectos "Durante la puntuación" (se aplican al calcular scores)
   → SPECIAL_STAR_FRUIT: duplica efectos de SCORE_BOOSTER y SCORE_SAPPER
   → SCORE_BOOSTER: +2 puntos a cualquier jugador
   → SCORE_SAPPER: -2 puntos a cualquier jugador
   → SCORE_INVERSION (instantánea): intercambia score más alto con más bajo
   → MOUTH_TRAP: intercambia score más alto con más bajo (carta de puntos)

4. Efectos de cartas instantáneas (ventanas específicas, ver CU-16)
```

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `ResolveEffectsUseCase.execute(game_id, played_cards)`:
   a. Filtra cartas con efecto.
   b. Aplica **FLAMING_CHAINSAW** si está en juego → skip resto de efectos estándar.
   c. Ordena por valor ascendente para efectos estándar.
   d. Para cada efecto: llama al handler correspondiente (`EffectHandler` por carta).
   e. Emite WS `EFFECT_APPLIED { card_id, effect_type, targets, result }` por cada efecto.
   f. Abre ventana para cartas instantáneas si aplica (RF48).
2. Retorna estado actualizado del juego.

### Patrones
- **Strategy Pattern**: cada carta con efecto implementa `IEffectHandler.apply(game_state)`.
- **Chain of Responsibility** para el orden de efectos.
- Los handlers son clases pequeñas y testeables individualmente.
- Pylint: cada handler en su propio módulo, imports ordenados (isort).

---

## CU-15 · Resolver muerte súbita

**Actor:** Sistema (disparado cuando hay empate en puntaje mínimo)  
**RF cubiertos:** RF52, RF53, RF54

### Precondiciones
- Dos o más jugadores empatan en el puntaje más bajo al final de CU-13.

### Flujo principal (ver diagrama de flujo adjunto)

**[SERVIDOR]**
1. `PhaseManager` transiciona a fase `SUDDEN_DEATH`.
2. Emite WS `SUDDEN_DEATH_STARTED { tied_players: [...] }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `SuddenDeathUseCase.execute(game_id, tied_player_ids)` — loop hasta resolver:

   **Verificación de cartas disponibles:**
   a. Si **todos** los jugadores en muerte súbita no tienen cartas de puntos:
      - Regresa la carta de desastre al fondo del mazo de desastres.
      - Termina la ronda sin asignar desastre. Fin.
   b. Si **solo 1** jugador no tiene cartas:
      - Ese jugador recibe la carta de desastre.
      - Los demás jugadores que **sí tenían cartas** son eliminados. Fin.
   c. Si **2 o más** no tienen cartas:
      - Los jugadores que **sí tenían cartas** son eliminados.
      - Los que no tenían cartas continúan en muerte súbita → volver a (a).

   **Jugar cartas (todos tienen cartas):**
   d. Cada jugador en muerte súbita juega una carta de puntos (sin efectos, sin traits, solo valor).
   e. Temporizador activo; si expira → auto-selección (RF44).
   f. Se revelan simultáneamente.
   g. Si hay **perdedor único** (puntaje más bajo) → recibe la carta de desastre. Fin.
   h. Si **empate nuevamente** → volver a (a) con los jugadores empatados.
   i. Si **empate con mismo puntaje** (todos iguales) → volver a (a).

**[SERVIDOR]**
4. Emite WS `SUDDEN_DEATH_RESOLVED { loser_player_id }` o `SUDDEN_DEATH_DRAW_RESOLVED`.
5. Continúa con CU-17 (asignar desastre).

### Reglas especiales de muerte súbita
- NO se aplican traits de personaje.
- NO se aplican efectos de cartas de puntos.
- NO se pueden jugar cartas instantáneas.
- Los jugadores NO acumulan puntos de victoria durante muerte súbita.

---

## CU-16 · Jugar carta instantánea

**Actor:** Player  
**RF cubiertos:** RF48, RF49

### Tipos de ventanas (cuándo se puede jugar)

**Ventana A — "Durante la puntuación":**
- Activa después de que todos los efectos estándar de cartas de puntos se resuelven.
- Cartas: `SCORE_BOOSTER`, `SCORE_SAPPER`, `SCORE_INVERSION`, `SCORE_BOOSTER (expansión)`.

**Ventana B — "Si recibirías una carta de desastre esta ronda":**
- Activa cuando el jugador queda como perdedor de la ronda.
- Cartas: `DISASTER_INSURANCE` (devuelve desastre al mazo), `DISASTER_REDIRECT` (envía desastre a otro jugador).

### Flujo principal

**[SERVIDOR]**
1. `PhaseManager` abre la ventana correspondiente y emite WS `INSTANT_CARD_WINDOW_OPEN { window_type, eligible_players }`.

**[CLIENTE]**
2. El jugador elegible ve las cartas instantáneas jugables resaltadas.
3. El jugador decide jugar o no (hay temporizador corto).
4. Si juega: envía WS `{ type: "PLAY_INSTANT_CARD", payload: { card_id, target_player_id? } }`.

**[SERVIDOR — dominio/casos_de_uso]**
5. `PlayInstantCardUseCase.execute(game_id, player_id, card_id, target_id, window_type)`:
   a. Valida que la ventana `window_type` está activa (RF48).
   b. Valida que `card_id` es carta instantánea válida para esa ventana (RF49).
   c. Aplica efecto inmediatamente via `EffectEngine`.
   d. Descarta la carta.
6. Emite WS `INSTANT_CARD_PLAYED { player_id, card_id, effect_result }`.

**[SERVIDOR]**
7. Cierra la ventana cuando expira el tiempo o todos los elegibles respondieron.

---

## CU-17 · Asignar desastre al perdedor

**Actor:** Sistema  
**RF cubiertos:** RF55

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `AssignDisasterUseCase.execute(game_id, loser_player_id, disaster_card)`:
   a. Verifica si el perdedor jugó `DISASTER_INSURANCE` → devuelve al fondo del mazo. Fin.
   b. Verifica si el perdedor jugó `DISASTER_REDIRECT` → redirige a target. Si target jugó `DISASTER_INSURANCE` → devuelve al mazo.
   c. En caso normal: agrega `disaster_card` al `player.disaster_area`.
   d. El jugador puede descartar 1 carta de su mano (regla base).
2. Emite WS `DISASTER_ASSIGNED { player_id, disaster_card, disaster_area_count }`.
3. Dispara CU-18 (verificar eliminación).

---

## CU-18 · Verificar condición de eliminación

**Actor:** Sistema  
**RF cubiertos:** RF57

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `CheckEliminationUseCase.execute(game_id, player_id)`:
   a. Obtiene `disaster_area` del jugador.
   b. **Reglas base (3–4 jugadores):**
      - 3 desastres del mismo tipo → eliminado.
      - 3 desastres de tipos diferentes → eliminado.
      - Meteoro cuenta como cualquier tipo (comodín).
   c. **Reglas 2 jugadores:**
      - 4 del mismo tipo → eliminado.
      - 2 de cada uno de los 3 tipos → eliminado.
   d. Si eliminado: marca al jugador como `status="eliminated"`, descarta su mano.
2. Si eliminado:
   a. Emite WS `PLAYER_ELIMINATED { player_id }`.
   b. Dispara CU-19 (verificar victoria).

### Lógica del meteoro (comodín)
```python
def check_elimination(disaster_area: list[DisasterCard], rules: GameRules) -> bool:
    """
    El meteoro actúa como cualquier tipo.
    Se comprueba si alguna combinación válida de tipos produce eliminación.
    """
    types = [card.disaster_type for card in disaster_area if not card.is_meteor]
    meteor_count = sum(1 for card in disaster_area if card.is_meteor)
    # El meteoro se asigna al tipo que peor le convenga al jugador
    return rules.is_eliminated(types, meteor_count)
```

---

## CU-19 · Verificar condición de victoria

**Actor:** Sistema  
**RF cubiertos:** RF58, RF59, RF60, RF61

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `CheckVictoryUseCase.execute(game_id)`:
   a. **Victoria por puntos (RF58):** si algún jugador alcanzó ≥ 50 puntos de victoria → es ganador.
   b. **Victoria por supervivencia (RF59):** si solo queda 1 jugador activo → es ganador.
   c. **Empate por puntos:** si varios llegaron a 50 en la misma ronda → se compara puntaje de esa ronda; mayor puntaje gana. Si igual → ambos ganan (o se aplica regla de desempate configurada).
   d. Si hay ganador → retorna `VictoryResultDTO { winner_id, reason }`.
   e. Si no hay ganador → retorna `None` → continúa el juego (CU-20).

**[SERVIDOR]**
2. Si hay ganador: emite WS `GAME_OVER { winner_id, reason }` → CU-24.
3. Si no: continúa con CU-20.

---

## CU-20 · Avanzar ronda

**Actor:** Sistema  
**RF cubiertos:** RF40, RF41, RF42, RF45, RF47, RF56

### Flujo principal

**[SERVIDOR — dominio/casos_de_uso]**
1. `AdvanceRoundUseCase.execute(game_id)`:
   a. **Actualizar puntos de victoria (RF56):**
      - Ganadores de ronda: acumulan puntos = su score de ronda.
      - Todos los jugadores: avanzan `len(disaster_area)` casillas adicionales en la ruta de escape.
   b. **Descartar cartas jugadas (RF45):** mueve cartas de puntos e instantáneas reveladas a la pila de descarte.
   c. **Reabastecer mazo si necesario (RF40):** si el mazo principal está vacío → baraja la pila de descarte y la convierte en nuevo mazo.
   d. **Reabastecer manos (RF41):** cada jugador roba cartas hasta tener 5.
   e. **Verificar manos (RF42):** si un jugador tiene 5 instantáneas y 0 cartas de puntos → descarta y roba 5 nuevas (repetir hasta tener al menos 1 carta de puntos).
   f. **Incrementar número de ronda.**
   g. **Actualizar fase (RF47):** `PhaseManager` transiciona a `ROUND_START`.

**[SERVIDOR]**
2. Emite WS `ROUND_ENDED { scores, new_hands_size, round_number }`.
3. Emite `HAND_UPDATED { cards }` individualmente a cada jugador con su nueva mano.
4. Emite `NEW_ROUND_STARTING { round_number }` con la nueva carta de desastre activa.

---

## CU-21 · Abandonar partida

**Actor:** Player  
**RF cubiertos:** RF35

### Flujo principal

**[CLIENTE]**
1. El jugador pulsa "Abandonar" y confirma en un diálogo.
2. Envía WS: `{ type: "LEAVE_GAME" }`.

**[SERVIDOR — dominio/casos_de_uso]**
3. `LeaveGameUseCase.execute(game_id, player_id)`:
   a. Marca al jugador como `status="left"` (equivalente a eliminado para efectos de victoria).
   b. Si era el único humano y quedan bots → los bots siguen pero se termina la partida (no tiene sentido continuar).
   c. Dispara CU-19.
4. Emite WS `PLAYER_LEFT_GAME { player_id }`.

**[CLIENTE]**
5. Redirige al listado de salas.

---

## CU-22 · Reconectarse a partida

**Actor:** ActiveUser  
**RF cubiertos:** RF (implícito en ActiveUser: "Puede reconectarse a una partida no terminada")

### Flujo principal

**[CLIENTE]**
1. El usuario vuelve a abrir la app o recupera conexión.
2. Al autenticarse (CU-02), el servidor detecta que tiene una partida activa.
3. Envía WS: `{ type: "RECONNECT", payload: { game_id } }`.

**[SERVIDOR — dominio/casos_de_uso]**
4. `ReconnectPlayerUseCase.execute(game_id, player_id)`:
   a. Verifica que la partida existe y está activa.
   b. Verifica que el `player_id` pertenece a esa partida.
   c. Marca al jugador como `status="active"` nuevamente.
   d. Recupera el estado completo del jugador.
5. Emite WS `GAME_STATE_SYNC { hand, disaster_area, score, current_phase, disaster_card_active }` solo al jugador reconectado.

---

## CU-23 · Tomar decisión (Bot)

**Actor:** Bot (proceso independiente)  
**RF cubiertos:** RF19, RF44 (bot como variante de jugador automático)

### Descripción
El bot es un proceso separado que se comunica con el servidor exclusivamente via WebSocket, igual que un cliente humano. El servidor no distingue en lógica de negocio entre humano y bot — solo en la capa de presentación.

### Flujo principal

**[BOT — infraestructura/adaptadores]**
1. El bot escucha eventos WS del servidor.
2. Al recibir `ROUND_STARTED`: registra la carta de desastre activa.
3. Al recibir `HAND_UPDATED` o estado inicial: registra su mano actual.

**[BOT — dominio/casos_de_uso]**
4. `BotDecisionUseCase.execute(hand, disaster_card, game_state, difficulty)`:
   a. **Dificultad fácil:** selecciona carta de puntos aleatoria.
   b. **Dificultad media:** selecciona la carta de mayor valor que no sea instantánea.
   c. **Dificultad difícil:** aplica heurística:
      - Considera el tipo de desastre y su propio trait modifier.
      - Considera el score esperado de los rivales (información pública).
      - Pondera si conviene usar carta con efecto o simplemente el valor más alto.
   d. Retorna `card_id` seleccionado.

**[BOT — infraestructura/adaptadores]**
5. Envía WS: `{ type: "PLAY_POINT_CARD", payload: { card_id } }`.
6. Si hay ventana de carta instantánea → aplica lógica similar para decidir si jugar o no.

### Patrones
- **Strategy Pattern** para las distintas dificultades (`EasyBotStrategy`, `MediumBotStrategy`, `HardBotStrategy`).
- El bot implementa la misma interfaz de comunicación que el cliente → intercambiable.
- Delay artificial opcional (configurable) para que el bot no responda instantáneamente (UX).

---

## CU-24 · Mostrar pantalla de resultados

**Actor:** Sistema → Players  
**RF cubiertos:** RF61, RF62, RF63

### Flujo principal

**[SERVIDOR]**
1. Tras determinar ganador (CU-19), emite WS `GAME_OVER { winner_id, winner_username, final_scores: [{ player_id, username, score, character }] }` a todos los jugadores (RF61).

**[CLIENTE]**
2. Transiciona a pantalla de resultados mostrando:
   - Ganador destacado.
   - Tabla de posiciones con puntajes finales y personajes.
   - Botones: "Volver a sala" (RF62) y "Ver salas" (RF63).

**Botón "Volver a sala":**
3. Envía `POST /api/lobbies/{lobby_id}/return`.
4. Si la sala sigue existiendo → redirige a sala de espera (los jugadores pueden reiniciar).
5. Si la sala fue cerrada → informa y redirige al listado.

**Botón "Ver salas":**
6. Redirige directamente al listado de salas (CU-05).

---

## Resumen de patrones aplicados por componente

### Servidor (dominio)
| Patrón | Aplicado en |
|--------|-------------|
| Repository | `UserRepository`, `LobbyRepository`, `GameRepository` |
| Factory | `GameFactory`, `DeckManager` |
| Strategy | `GameRules` (2J/3-4J/5-6J), `BotDecision` (dificultades) |
| Command | Mensajes WebSocket → casos de uso |
| State | `PhaseManager` (fases de ronda) |
| Chain of Responsibility | `EffectEngine` (orden de efectos) |
| Observer | Listeners de eventos de ronda (todos_jugaron → revelar) |
| Value Object | `Character`, `DisasterCard`, `PointCard` |
| Port/Adapter | `EmailGateway`, `WebSocketAdapter`, `BotServiceAdapter` |

### Cliente
| Patrón | Aplicado en |
|--------|-------------|
| Adapter | `ApiClient` (HTTP), `GameSocketClient` (WS) |
| Store/State | Estado de partida centralizado (Redux, Zustand, Pinia…) |
| Presentational/Container | Separar lógica de display de lógica de negocio |

### Bot
| Patrón | Aplicado en |
|--------|-------------|
| Strategy | Dificultades de decisión |
| Adapter | `BotSocketClient` (WS hacia servidor) |

---

## Notas de buenas prácticas (pylint / código limpio)

- **Nombres descriptivos:** `calculate_round_scores` no `calc_sc`. Variables con contexto claro.
- **Funciones pequeñas:** cada función hace una sola cosa. Máx. ~20 líneas por método de caso de uso.
- **Docstrings obligatorios** en todas las clases y métodos públicos (pylint `C0114`, `C0115`, `C0116`).
- **Sin imports circulares:** dominio no importa infraestructura. La dependencia fluye hacia afuera.
- **Type hints** en todos los métodos (pylint + mypy compatible).
- **Constantes en lugar de magic numbers:** `MAX_HAND_SIZE = 5`, `WIN_SCORE = 50`, `LOBBY_CODE_LENGTH = 6`.
- **Excepciones de dominio propias:** `UserAlreadyExistsError`, `InvalidCredentialsError`, `InvalidPhaseError`, etc. No usar excepciones genéricas de Python para lógica de negocio.
- **Tests unitarios** por cada caso de uso del dominio, mockeando los repositorios (los puertos).

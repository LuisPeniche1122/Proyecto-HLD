"""
Capa 4 (Frameworks y Web): Entrypoint de la aplicación.
Aquí se inicializa FastAPI y se conectan todos los controladores (Capa 3).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos nuestro controlador (Capa 3)
from src.infrastructure.routers.room_router import wsrouter as wsroom_router
from src.infrastructure.routers.room_router import apirouter as apiroom_router
from src.infrastructure.routers.register_router import router as register_router
from src.infrastructure.routers.auth_router import router as auth_router

# Esta instancia de app es pura Capa 4
app = FastAPI(
    title="Happy Little Dinosaurs API",
    description="Backend para el juego de cartas multijugador.",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://172.20.176.1",
    "http://192.168.3.69:5173",
    "https://3qkzw5qd-5173.usw3.devtunnels.ms"
    
]

# Configuración de seguridad web (Capa 4)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # En producción aquí va la URL de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# "Enchufamos" la Capa 3 a la Capa 4
app.include_router(register_router)
app.include_router(auth_router)
app.include_router(wsroom_router)
app.include_router(apiroom_router)

@app.get("/")
def read_root():
    """Healthcheck endpoint."""
    return {"mensaje": "¡El servidor de Happy Little Dinosaurs está vivo!"}
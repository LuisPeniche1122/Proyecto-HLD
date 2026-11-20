# Usamos la versión ligera oficial de Python 3.12
FROM python:3.12-slim

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo de librerías del servidor
COPY server/requirements.txt /app/requirements.txt

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos la carpeta compartida y el código del servidor
COPY common /app/common
COPY server/src /app/src

# Configuramos la ruta para que Python encuentre los DTOs de 'common'
ENV PYTHONPATH=/app

# Comando para arrancar el servidor con recarga automática para desarrollo
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
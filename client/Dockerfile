# Usamos la versión ligera oficial de Node 20
FROM node:20-slim

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar la caché de Docker
COPY client/package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del cliente
COPY client/ ./

# Exponemos el puerto por defecto de Vite
EXPOSE 5173

# Arrancamos Vite en modo desarrollo forzando a que escuche en todas las IPs del contenedor
CMD ["npm", "run", "dev", "--", "--host"]
# Usa una imagen base de Node.js
FROM node:18

# Crea directorio de trabajo
WORKDIR /app

# Copia archivos
COPY package*.json ./
RUN npm install

COPY . .

# Expone el puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]

FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

# Iniciar servidor
CMD ["node", "server.js"]

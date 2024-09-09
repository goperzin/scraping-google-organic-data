# Use a imagem oficial do Node.js com a versão LTS (inclui o sistema Debian slim)
FROM node:20-slim

# Instalar dependências necessárias para o Puppeteer
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    --no-install-recommends

# Instalar o Google Chrome estável necessário para o Puppeteer
RUN apt-get install -y chromium

# Limpar o cache do apt para economizar espaço
RUN rm -rf /var/lib/apt/lists/*

# Definir variável de ambiente necessária para o Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Definir o diretório de trabalho
WORKDIR /src

# Copiar apenas arquivos de configuração e dependências
COPY package*.json ./

# Instalar dependências do Node.js
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

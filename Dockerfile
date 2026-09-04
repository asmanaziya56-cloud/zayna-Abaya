FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source
COPY . .

# Build apps
RUN cd backend && npm run build
RUN cd frontend && npm run build

EXPOSE 3000 5000

ENV NODE_ENV=production

CMD ["node", "backend/dist/server.js"]

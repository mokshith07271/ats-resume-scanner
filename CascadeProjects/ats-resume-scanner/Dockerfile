# Multi-stage Dockerfile for ATS Resume Scanner

# Stage 1: Build Backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 2: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 3: Production Backend
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./
COPY prisma/ ./prisma/
EXPOSE 5000
CMD ["npm", "run", "start:prod"]

# Stage 4: Production Frontend
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY --from=frontend-build /app/frontend/public ./public
COPY --from=frontend-build /app/frontend/.next ./.next
COPY --from=frontend-build /app/frontend/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]

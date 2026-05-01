#build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

#prod
FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY src/db/schema.sql ./src/db/schema.sql

ENV NODE_ENV=prod

EXPOSE 3000

CMD ["node", "dist/index.js"]

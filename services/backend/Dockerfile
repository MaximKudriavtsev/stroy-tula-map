FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY data-source.ts ./

RUN npm ci

COPY . .

RUN npm run build   

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY data-source.ts ./
COPY tsconfig.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/src/main.js"]
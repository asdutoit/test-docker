# Stage 1: Build the application
FROM arm64v8/node:18.18.2-slim as builder

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules
RUN rm -f yarn.lock *-lock.json && npm cache clean --force

RUN npm install --production

# Stage 2: Create the production image
FROM arm64v8/node:18.18.2-slim

# ENV ADDRESS=0.0.0.0 PORT=3000 REDIS_URL=172.17.0.2
# RUN apt-get update && \
#     apt-get install -y curl iputils-ping && \
#     rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules

COPY . .

CMD ["node", "server.js"]

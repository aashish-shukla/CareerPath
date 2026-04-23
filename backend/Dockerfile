FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --only=production || npm install

COPY src ./src

EXPOSE 8000

CMD ["node", "src/server.js"]


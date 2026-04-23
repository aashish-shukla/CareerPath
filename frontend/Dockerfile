FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite dev server, bound to 0.0.0.0 for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


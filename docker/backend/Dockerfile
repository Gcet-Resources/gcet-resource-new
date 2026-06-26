FROM node:20-slim AS deps
WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]

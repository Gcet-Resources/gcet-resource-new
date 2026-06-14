FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV CHOKIDAR_USEPOLLING=true
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host"]

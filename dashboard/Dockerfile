FROM node:18-alpine #use small node.js image optimized for production builds
WORKDIR /app #setting /app as working directory for the container
COPY package*.json ./ #copy only package files first to leverage docker cache 
RUN npm ci #
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
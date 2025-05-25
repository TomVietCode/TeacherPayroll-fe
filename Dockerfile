FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package-lock*.json ./
RUN npm install

# Build the application
COPY . .
RUN npm run build

# Produiction stage using nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/cond.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
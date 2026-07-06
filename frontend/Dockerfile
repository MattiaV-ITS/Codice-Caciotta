# Stage 1: Costriusci l'applicazione React
FROM node:24-alpine as build

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Servi con nginx
FROM nginx:stable-alpine

COPY --from=build /frontend/dist /usr/share/nginx/html

# Copia la configurazione personalizzata di nginx se necessario, altrimenti il default serve index.html
# Copia nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

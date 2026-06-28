# Stage 1: Build React app
FROM node:24-alpine as build

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:stable-alpine

COPY --from=build /frontend/dist /usr/share/nginx/html

# Copy custom nginx config if needed, else default serves index.html
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

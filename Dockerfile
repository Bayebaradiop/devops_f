# --- Etape 1 : build ---
FROM node:22-alpine AS build
WORKDIR /app

# Les dependances sont mises en cache tant que les fichiers de lock ne changent pas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etape 2 : nginx sert les fichiers statiques ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

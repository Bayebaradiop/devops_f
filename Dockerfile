# --- Etape 1 : build ---
FROM node:22-alpine AS build
WORKDIR /build

# Les dependances sont mises en cache tant que les fichiers de lock ne changent pas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite fige les variables VITE_* AU MOMENT DU BUILD (elles finissent dans le bundle).
# L'URL de l'API doit donc etre fournie ici, et non au demarrage du conteneur.
ARG VITE_API_URL=http://localhost:8090
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Etape 2 : nginx sert les fichiers statiques ---
FROM nginx:alpine

COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]

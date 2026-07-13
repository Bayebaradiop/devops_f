# --- Etape 1 : build ---
FROM node:22-alpine AS build
WORKDIR /build

# Les dependances sont mises en cache tant que les fichiers de lock ne changent pas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite fige les variables VITE_* AU MOMENT DU BUILD (elles finissent dans le bundle).
#
# Valeur par defaut VIDE, et c'est voulu : le front appelle alors l'API en URL
# RELATIVE (/api/tasks). Les requetes partent donc vers la meme origine que la
# page, c'est-a-dire le Nginx de la VM Front, qui les relaie vers le Back.
#
# Consequence : la meme image fonctionne derriere une IP comme derriere un nom
# de domaine, en HTTP comme en HTTPS, sans jamais etre reconstruite. Aucune URL
# d'infrastructure n'est figee dans le bundle.
ARG VITE_API_URL=""
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

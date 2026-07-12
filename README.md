# MediShop — Front

Interface React du catalogue MediShop. Consomme l'API du backend Spring Boot
(depot [devops_b](https://github.com/Bayebaradiop/devops_b)).

- React 19 + Vite
- Le front tourne sur **http://localhost:5173**
- Il appelle l'API sur **http://localhost:8090** (le backend doit tourner)

## Demarrer

```bash
npm install
npm run dev
```

Les appels vers `/api/*` sont relayes vers `http://localhost:8090` par le proxy Vite
(voir [vite.config.js](vite.config.js)) — pas de probleme de CORS en developpement.

Si le backend tourne ailleurs :

```bash
VITE_API_URL=http://mon-backend:8090 npm run dev
```

## Lancer avec Docker

Le `docker-compose.yml` orchestre les trois services (db + backend + front) et vit
**a la racine `medishop/`**, a cote de ce depot et de celui du backend :

```
medishop/
├── docker-compose.yml
├── backend/   <- depot devops_b
└── front/     <- ce depot (devops_f)
```

```bash
cd ..            # racine medishop/
docker compose up --build
```

Le front est alors servi par nginx sur http://localhost:5173. En production nginx joue
le meme role que le proxy Vite en dev : il relaie `/api` vers le backend
(voir [nginx.conf](nginx.conf)).

## Fonctionnalites

- Liste des medicaments
- Recherche par nom
- Ajout d'un medicament
- Suppression d'un medicament

## Autres commandes

```bash
npm run build     # build de production dans dist/
npm run preview   # sert le build de production
npm run lint      # oxlint
```

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) : lint + build a chaque push et PR sur `main`.

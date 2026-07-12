# todoapp-frontend

Interface React de la Todo App MediShop. Consomme l'API du depot
[devops_b](https://github.com/Bayebaradiop/devops_b).

## Stack

- React 18 + Vite
- axios pour les appels API
- Tailwind CSS
- Docker (build Vite puis nginx:alpine)

## Demarrage en local

Le backend doit tourner (voir son README : `docker compose up --build`).

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:8090
npm install
npm run dev
```

Le front est sur http://localhost:5173.

## Docker

```bash
docker build -t todoapp-frontend --build-arg VITE_API_URL=http://localhost:8090 .
docker run -p 5173:80 todoapp-frontend
```

**Attention** : Vite fige les variables `VITE_*` **au moment du build**, pas au
demarrage du conteneur. L'URL de l'API se passe donc en `--build-arg`, et changer
d'URL impose de reconstruire l'image.

Le backend doit autoriser l'origine du front via sa variable `CORS_ALLOWED_ORIGINS`.

## Fonctionnalites

- Creer une tache (titre, description, statut) avec validation du titre cote client
- Lister les taches avec leur statut
- Modifier une tache (modal)
- Supprimer une tache (avec confirmation)
- Etats de chargement et erreurs API affiches a l'utilisateur

## Workflow Git

`main` est protegee et ne recoit rien directement.

```
main (protegee)
  └── deploy (branche d'integration)
        ├── feature/front-task-create
        ├── feature/front-task-read
        ├── feature/front-task-update
        └── feature/front-task-delete
```

Chaque feature part de `deploy` et y retourne **via Pull Request**. `main` n'est
alimentee que par une PR depuis `deploy`, une fois celle-ci validee.

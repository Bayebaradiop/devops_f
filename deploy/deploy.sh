#!/usr/bin/env bash
#
# Deploie le front MediShop sur la VM Front. Execute SUR LA VM, par Jenkins via SSH.
#
# Usage : deploy.sh <image> <tag>
#
# Le conteneur sert les fichiers statiques de React sur le port 3000.
# C'est le Nginx de la VM (installe par Ansible) qui l'expose au monde, et qui
# relaie /api vers le Back : ce conteneur ne parle jamais directement a l'API.
#
# Gere le premier deploiement (aucun conteneur) et le rollback (retour a la
# version precedente si la nouvelle ne repond pas).

set -euo pipefail

IMAGE="${1:?image manquante}"
TAG="${2:?tag manquant}"

CONTENEUR="medishop-front"
PORT=3000

echo "==> Deploiement de $IMAGE:$TAG"

# ---------------------------------------------------------------
# 1. Memoriser l'image en service (pour le rollback).
#    "|| echo none" : au PREMIER deploiement, le conteneur n'existe pas.
# ---------------------------------------------------------------
IMAGE_PRECEDENTE=$(docker inspect -f '{{.Config.Image}}' "$CONTENEUR" 2>/dev/null || echo "none")
echo "==> Image actuellement en service : $IMAGE_PRECEDENTE"

echo "==> docker pull $IMAGE:$TAG"
docker pull "$IMAGE:$TAG"

# ---------------------------------------------------------------
# 2. Lancer le conteneur
# ---------------------------------------------------------------
demarrer() {
    local image_a_lancer="$1"

    # "|| true" : ne pas echouer si le conteneur n'existe pas encore
    docker rm -f "$CONTENEUR" >/dev/null 2>&1 || true

    # On publie sur 127.0.0.1 uniquement : le conteneur n'est PAS joignable
    # depuis l'exterieur. Seul le Nginx de la VM peut l'atteindre.
    docker run -d \
        --name "$CONTENEUR" \
        --restart unless-stopped \
        -p "127.0.0.1:${PORT}:80" \
        "$image_a_lancer" >/dev/null
}

# ---------------------------------------------------------------
# 3. Verifier que le site repond REELLEMENT (a travers Nginx)
# ---------------------------------------------------------------
est_en_bonne_sante() {
    for i in $(seq 1 20); do
        # On interroge Nginx (port 80), pas seulement le conteneur : c'est la
        # chaine complete que voit le visiteur qui doit fonctionner.
        if curl -sf -m 3 http://localhost/ 2>/dev/null | grep -qi "<div id=\"root\">"; then
            echo "==> Site en ligne (apres ${i}x3s)"
            return 0
        fi
        sleep 3
    done
    return 1
}

echo "==> Demarrage de la nouvelle version"
demarrer "$IMAGE:$TAG"

if est_en_bonne_sante; then
    echo "==> DEPLOIEMENT REUSSI : $IMAGE:$TAG"
    docker image prune -f >/dev/null 2>&1 || true
    exit 0
fi

# ---------------------------------------------------------------
# 4. ROLLBACK
# ---------------------------------------------------------------
echo "==> ECHEC : le site ne repond pas. Logs du conteneur :"
docker logs --tail 30 "$CONTENEUR" 2>&1 | sed 's/^/    /' || true

if [ "$IMAGE_PRECEDENTE" = "none" ]; then
    echo "==> Aucune version precedente : rollback impossible (premier deploiement)."
    docker rm -f "$CONTENEUR" >/dev/null 2>&1 || true
    exit 1
fi

echo "==> ROLLBACK vers $IMAGE_PRECEDENTE"
demarrer "$IMAGE_PRECEDENTE"

if est_en_bonne_sante; then
    echo "==> Rollback reussi : le site tourne a nouveau en $IMAGE_PRECEDENTE"
    exit 1
fi

echo "==> CRITIQUE : le rollback a echoue lui aussi. Le site est HORS LIGNE."
exit 2

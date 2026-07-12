const BASE = '/api/medicaments'

async function lire(reponse) {
  if (!reponse.ok) {
    const erreur = await reponse.json().catch(() => ({}))
    throw new Error(erreur.message || `Erreur ${reponse.status}`)
  }
  return reponse.status === 204 ? null : reponse.json()
}

export function listerMedicaments(nom = '') {
  const url = nom ? `${BASE}?nom=${encodeURIComponent(nom)}` : BASE
  return fetch(url).then(lire)
}

export function creerMedicament(medicament) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicament),
  }).then(lire)
}

export function supprimerMedicament(id) {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(lire)
}

import axios from 'axios'

// L'URL de l'API n'est jamais en dur : elle vient de VITE_API_URL (voir .env.example).
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/tasks`,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Transforme une erreur axios en message lisible par l'utilisateur.
 * Le backend renvoie un ApiError { message, details[] } : on l'exploite quand il est la.
 */
export function messageErreur(erreur, parDefaut = 'Une erreur est survenue') {
  const donnees = erreur.response?.data
  if (donnees?.details?.length) {
    return donnees.details.join(', ')
  }
  if (donnees?.message) {
    return donnees.message
  }
  if (erreur.code === 'ERR_NETWORK') {
    return "Impossible de joindre l'API. Le backend est-il demarre ?"
  }
  return parDefaut
}

export async function getTasks() {
  const { data } = await api.get('')
  return data
}

export async function getTask(id) {
  const { data } = await api.get(`/${id}`)
  return data
}

export async function createTask(task) {
  const { data } = await api.post('', task)
  return data
}

export async function updateTask(id, task) {
  const { data } = await api.put(`/${id}`, task)
  return data
}

export async function deleteTask(id) {
  await api.delete(`/${id}`)
}

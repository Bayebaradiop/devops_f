import { useCallback, useEffect, useState } from 'react'
import {
  createTask as apiCreate,
  getTasks as apiGetAll,
  messageErreur,
} from '../services/taskService'

/**
 * Centralise l'etat des taches et la logique CRUD.
 * Les composants n'appellent jamais axios directement.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await apiGetAll())
    } catch (e) {
      setError(messageErreur(e, 'Impossible de charger les taches'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (task) => {
    setError(null)
    try {
      const creee = await apiCreate(task)
      setTasks((precedentes) => [creee, ...precedentes])
      return true
    } catch (e) {
      setError(messageErreur(e, 'Impossible de creer la tache'))
      return false
    }
  }, [])

  return { tasks, loading, error, setError, refresh, create }
}

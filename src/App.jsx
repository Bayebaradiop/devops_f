import TaskForm from './components/TaskForm'
import { useTasks } from './hooks/useTasks'

export default function App() {
  const { tasks, loading, error, create } = useTasks()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">Todo App</h1>
          <p className="text-slate-500">MediShop — suivi des taches</p>
        </header>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-800">{error}</p>
        )}

        <TaskForm onCreate={create} />

        <div className="mt-6">
          {loading ? (
            <p className="py-8 text-center text-slate-500">Chargement...</p>
          ) : (
            <p className="text-sm text-slate-500">
              {tasks.length} tache{tasks.length > 1 ? 's' : ''} enregistree
              {tasks.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import TaskEditModal from './components/TaskEditModal'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import { useTasks } from './hooks/useTasks'

export default function App() {
  const { tasks, loading, error, create, update, remove } = useTasks()
  const [tacheEnEdition, setTacheEnEdition] = useState(null)

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

        <div className="mt-8">
          <TaskList
            tasks={tasks}
            loading={loading}
            onEdit={setTacheEnEdition}
            onDelete={remove}
          />
        </div>
      </div>

      <TaskEditModal
        task={tacheEnEdition}
        onSave={update}
        onClose={() => setTacheEnEdition(null)}
      />
    </div>
  )
}

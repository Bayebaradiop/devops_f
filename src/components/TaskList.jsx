import TaskItem from './TaskItem'

export default function TaskList({ tasks, loading }) {
  if (loading) {
    return <p className="py-10 text-center text-slate-500">Chargement des taches...</p>
  }

  if (tasks.length === 0) {
    return (
      <p className="py-10 text-center text-slate-500">
        Aucune tache pour le moment. Ajoutez-en une ci-dessus.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

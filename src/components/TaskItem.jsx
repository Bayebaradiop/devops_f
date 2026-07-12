const STATUTS = {
  TODO: { libelle: 'A faire', classe: 'bg-slate-200 text-slate-700' },
  IN_PROGRESS: { libelle: 'En cours', classe: 'bg-amber-100 text-amber-800' },
  DONE: { libelle: 'Terminee', classe: 'bg-emerald-100 text-emerald-800' },
}

function formaterDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TaskItem({ task, onEdit }) {
  const statut = STATUTS[task.status] ?? STATUTS.TODO

  return (
    <li className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-semibold text-slate-800 break-words ${
                task.status === 'DONE' ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statut.classe}`}>
              {statut.libelle}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-slate-600 break-words">{task.description}</p>
          )}

          <p className="mt-2 text-xs text-slate-400">Creee le {formaterDate(task.createdAt)}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Modifier
          </button>
        </div>
      </div>
    </li>
  )
}

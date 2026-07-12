import { useEffect, useState } from 'react'

export default function TaskEditModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'TODO' })
  const [erreurTitre, setErreurTitre] = useState(null)
  const [enregistrement, setEnregistrement] = useState(false)

  // Reinitialise le formulaire a chaque tache ouverte
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title ?? '',
        description: task.description ?? '',
        status: task.status ?? 'TODO',
      })
      setErreurTitre(null)
    }
  }, [task])

  // Fermeture au clavier
  useEffect(() => {
    function surEchap(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', surEchap)
    return () => document.removeEventListener('keydown', surEchap)
  }, [onClose])

  if (!task) return null

  function modifier(event) {
    const { name, value } = event.target
    setForm((f) => ({ ...f, [name]: value }))
    if (name === 'title' && value.trim()) setErreurTitre(null)
  }

  async function soumettre(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setErreurTitre('Le titre est obligatoire')
      return
    }

    setEnregistrement(true)
    const ok = await onSave(task.id, {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
    })
    setEnregistrement(false)

    if (ok) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Modifier la tache</h2>

        <form onSubmit={soumettre} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Titre</label>
            <input
              name="title"
              value={form.title}
              onChange={modifier}
              maxLength={100}
              autoFocus
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                erreurTitre
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-teal-200 focus:border-teal-500'
              }`}
            />
            {erreurTitre && <p className="mt-1 text-sm text-red-600">{erreurTitre}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={modifier}
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Statut</label>
            <select
              name="status"
              value={form.status}
              onChange={modifier}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
            >
              <option value="TODO">A faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminee</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={enregistrement}
              className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

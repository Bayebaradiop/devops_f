import { useState } from 'react'

const VIDE = { title: '', description: '', status: 'TODO' }

export default function TaskForm({ onCreate }) {
  const [form, setForm] = useState(VIDE)
  const [erreurTitre, setErreurTitre] = useState(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  function modifier(event) {
    const { name, value } = event.target
    setForm((f) => ({ ...f, [name]: value }))
    if (name === 'title' && value.trim()) {
      setErreurTitre(null)
    }
  }

  async function soumettre(event) {
    event.preventDefault()

    // Validation cote client : on n'appelle pas l'API pour rien
    if (!form.title.trim()) {
      setErreurTitre('Le titre est obligatoire')
      return
    }

    setEnvoiEnCours(true)
    const ok = await onCreate({
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
    })
    setEnvoiEnCours(false)

    if (ok) {
      setForm(VIDE)
    }
  }

  return (
    <form
      onSubmit={soumettre}
      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3"
    >
      <h2 className="font-semibold text-slate-800">Nouvelle tache</h2>

      <div>
        <input
          name="title"
          value={form.title}
          onChange={modifier}
          placeholder="Titre de la tache"
          maxLength={100}
          className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
            erreurTitre
              ? 'border-red-400 focus:ring-red-200'
              : 'border-slate-300 focus:ring-teal-200 focus:border-teal-500'
          }`}
        />
        {erreurTitre && <p className="mt-1 text-sm text-red-600">{erreurTitre}</p>}
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={modifier}
        placeholder="Description (optionnelle)"
        maxLength={500}
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <select
          name="status"
          value={form.status}
          onChange={modifier}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
        >
          <option value="TODO">A faire</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="DONE">Terminee</option>
        </select>

        <button
          type="submit"
          disabled={envoiEnCours}
          className="sm:ml-auto rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {envoiEnCours ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

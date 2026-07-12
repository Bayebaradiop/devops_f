import { useCallback, useEffect, useState } from 'react'
import { creerMedicament, listerMedicaments, supprimerMedicament } from './api'
import './App.css'

const FORMULAIRE_VIDE = {
  nom: '',
  description: '',
  prix: '',
  stock: '',
  surOrdonnance: false,
}

function App() {
  const [medicaments, setMedicaments] = useState([])
  const [recherche, setRecherche] = useState('')
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const charger = useCallback(async (nom) => {
    setChargement(true)
    setErreur(null)
    try {
      setMedicaments(await listerMedicaments(nom))
    } catch (e) {
      setErreur(e.message)
    } finally {
      setChargement(false)
    }
  }, [])

  // Petit delai pour ne pas appeler l'API a chaque frappe
  useEffect(() => {
    const timer = setTimeout(() => charger(recherche), 300)
    return () => clearTimeout(timer)
  }, [recherche, charger])

  async function ajouter(event) {
    event.preventDefault()
    setErreur(null)
    try {
      await creerMedicament({
        ...formulaire,
        prix: Number(formulaire.prix),
        stock: Number(formulaire.stock),
      })
      setFormulaire(FORMULAIRE_VIDE)
      await charger(recherche)
    } catch (e) {
      setErreur(e.message)
    }
  }

  async function supprimer(id) {
    setErreur(null)
    try {
      await supprimerMedicament(id)
      await charger(recherche)
    } catch (e) {
      setErreur(e.message)
    }
  }

  function modifierChamp(event) {
    const { name, value, type, checked } = event.target
    setFormulaire((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <div className="app">
      <header className="entete">
        <h1>MediShop</h1>
        <p>Catalogue de la pharmacie</p>
      </header>

      <input
        className="recherche"
        type="search"
        placeholder="Rechercher un medicament..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {erreur && <p className="erreur">{erreur}</p>}

      <form className="formulaire" onSubmit={ajouter}>
        <input name="nom" placeholder="Nom" value={formulaire.nom} onChange={modifierChamp} required />
        <input
          name="description"
          placeholder="Description"
          value={formulaire.description}
          onChange={modifierChamp}
        />
        <input
          name="prix"
          type="number"
          min="0"
          step="0.01"
          placeholder="Prix (FCFA)"
          value={formulaire.prix}
          onChange={modifierChamp}
          required
        />
        <input
          name="stock"
          type="number"
          min="0"
          placeholder="Stock"
          value={formulaire.stock}
          onChange={modifierChamp}
          required
        />
        <label className="case">
          <input
            name="surOrdonnance"
            type="checkbox"
            checked={formulaire.surOrdonnance}
            onChange={modifierChamp}
          />
          Sur ordonnance
        </label>
        <button type="submit">Ajouter</button>
      </form>

      {chargement ? (
        <p className="info">Chargement...</p>
      ) : medicaments.length === 0 ? (
        <p className="info">Aucun medicament trouve.</p>
      ) : (
        <ul className="liste">
          {medicaments.map((m) => (
            <li key={m.id}>
              <div className="gauche">
                <strong>{m.nom}</strong>
                {m.surOrdonnance && <span className="badge">ordonnance</span>}
                <p>{m.description}</p>
              </div>
              <div className="droite">
                <span className="prix">{m.prix} FCFA</span>
                <span className={m.stock > 0 ? 'stock' : 'stock rupture'}>
                  {m.stock > 0 ? `${m.stock} en stock` : 'rupture'}
                </span>
                <button className="supprimer" onClick={() => supprimer(m.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App

// ============================================================
// CONTEXTE PANIER
// Correction : suppression de l'initializer function SSR
// qui causait des crashes côté serveur (Next.js)
// Hydratation depuis localStorage via useEffect uniquement
// ============================================================

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const ContextePanier = createContext();

const etatInitial = {
  articles:         [],
  codeReduction:    null,
  montantReduction: 0,
};

function reduceurPanier(etat, action) {
  switch (action.type) {

    case 'AJOUTER_ARTICLE': {
      const existant = etat.articles.find(
        (a) => a._id === action.article._id && a.taille === action.article.taille
      );
      if (existant) {
        return {
          ...etat,
          articles: etat.articles.map((a) =>
            a._id === action.article._id && a.taille === action.article.taille
              ? { ...a, quantite: a.quantite + 1 }
              : a
          ),
        };
      }
      return {
        ...etat,
        articles: [...etat.articles, { ...action.article, quantite: 1 }],
      };
    }

    case 'RETIRER_ARTICLE':
      return {
        ...etat,
        articles: etat.articles.filter(
          (a) => !(a._id === action.id && a.taille === action.taille)
        ),
      };

    case 'MODIFIER_QUANTITE':
      return {
        ...etat,
        articles: etat.articles.map((a) =>
          a._id === action.id && a.taille === action.taille
            ? { ...a, quantite: Math.max(1, action.quantite) }
            : a
        ),
      };

    case 'APPLIQUER_REDUCTION':
      return {
        ...etat,
        codeReduction:    action.code,
        montantReduction: action.montant,
      };

    // Restauration complète depuis localStorage
    case 'RESTAURER':
      return action.etat;

    case 'VIDER_PANIER':
      return etatInitial;

    default:
      return etat;
  }
}

export function FournisseurPanier({ children }) {
  const [etat, dispatch] = useReducer(reduceurPanier, etatInitial);
  const [hydrate, setHydrate] = useState(false);

  // Hydratation depuis localStorage — côté client uniquement
  // useEffect ne s'exécute jamais côté serveur → pas de crash SSR
  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem('fc_panier');
      if (sauvegarde) {
        const parsed = JSON.parse(sauvegarde);
        // Restaurer l'état complet d'un coup
        dispatch({ type: 'RESTAURER', etat: parsed });
      }
    } catch {
      // Si localStorage est corrompu, on repart de zéro silencieusement
      localStorage.removeItem('fc_panier');
    }
    setHydrate(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  // Seulement après l'hydratation initiale pour ne pas écraser avec l'état vide
  useEffect(() => {
    if (hydrate) {
      localStorage.setItem('fc_panier', JSON.stringify(etat));
    }
  }, [etat, hydrate]);

  // Calculs dérivés
  const sousTotal = etat.articles.reduce(
    (acc, a) => acc + (a.precioOferta ?? a.precio) * a.quantite,
    0
  );
  const nombreArticles = etat.articles.reduce(
    (acc, a) => acc + a.quantite,
    0
  );

  return (
    <ContextePanier.Provider
      value={{
        ...etat,
        dispatch,
        sousTotal,
        nombreArticles,
      }}
    >
      {children}
    </ContextePanier.Provider>
  );
}

export const usePanier = () => useContext(ContextePanier);
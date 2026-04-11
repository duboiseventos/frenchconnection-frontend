// ============================================================
// CONTEXTE PANIER
// Gère l'état global du panier avec persistance localStorage
// ============================================================

import { createContext, useContext, useReducer, useEffect } from 'react';

const ContextePanier = createContext();

const etatInitial = {
  articles:       [],   // Liste des articles ajoutés
  codeReduction:  null, // Code de réduction appliqué
  montantReduction: 0,  // Montant déduit
};

// ── Reducer : toutes les actions possibles sur le panier ──────
function reduceurPanier(etat, action) {
  switch (action.type) {

    case 'AJOUTER_ARTICLE': {
      // Chercher si l'article existe déjà (même produit + même taille)
      const existant = etat.articles.find(
        (a) => a._id === action.article._id && a.taille === action.article.taille
      );

      if (existant) {
        // Incrémenter la quantité
        return {
          ...etat,
          articles: etat.articles.map((a) =>
            a._id === action.article._id && a.taille === action.article.taille
              ? { ...a, quantite: a.quantite + 1 }
              : a
          ),
        };
      }
      // Ajouter le nouvel article
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

    case 'VIDER_PANIER':
      return etatInitial;

    default:
      return etat;
  }
}

export function FournisseurPanier({ children }) {
  const [etat, dispatch] = useReducer(
    reduceurPanier,
    etatInitial,
    // Initialisation depuis localStorage
    (etatDefaut) => {
      if (typeof window !== 'undefined') {
        const sauvegarde = localStorage.getItem('fc_panier');
        return sauvegarde ? JSON.parse(sauvegarde) : etatDefaut;
      }
      return etatDefaut;
    }
  );

  // Synchroniser avec localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('fc_panier', JSON.stringify(etat));
  }, [etat]);

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

// Hook personnalisé pour utiliser le panier
export const usePanier = () => useContext(ContextePanier);
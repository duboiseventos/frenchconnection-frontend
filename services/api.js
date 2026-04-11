// ============================================================
// SERVICE API
// Toutes les requêtes vers le backend centralisées ici
// ============================================================

import axios from 'axios';

// Instance Axios configurée
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Injecter le token JWT dans chaque requête si l'utilisateur est connecté
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Authentification ─────────────────────────────────────────
export const apiInscription = (donnees) => api.post('/auth/inscription', donnees);
export const apiConnexion   = (donnees) => api.post('/auth/connexion', donnees);
export const apiMonProfil   = ()        => api.get('/auth/profil');
export const apiToggleFavoris = (id)    => api.post(`/auth/favoris/${id}`);

// ── Produits ─────────────────────────────────────────────────
export const apiListeProduits   = (params) => api.get('/produits', { params });
export const apiDetailProduit   = (slug)   => api.get(`/produits/${slug}`);
export const apiProduitsVedette = ()       => api.get('/produits/vedette');
export const apiRecherche       = (q)      => api.get('/produits/rechercher', { params: { q } });

// ── Commandes ─────────────────────────────────────────────────
export const apiCreerCommande = (donnees) => api.post('/commandes', donnees);
export const apiMesCommandes  = ()        => api.get('/commandes/mes-pedidos');
export const apiDetailCommande = (id)     => api.get(`/commandes/${id}`);
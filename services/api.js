// ============================================================
// SERVICE API
// Instance Axios centralisée + injection automatique du token JWT
// Version prête pour la production
// ============================================================

import axios from 'axios';

// 🔴 Vérification critique : s'assurer que la variable d'environnement existe
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error('❌ NEXT_PUBLIC_API_URL non défini');
}

// Instance Axios configurée avec l'URL du backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Injection automatique du token JWT si présent
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── AUTHENTICATION ───────────────────────────────────────────
// Fonctions liées à l'authentification utilisateur

export const registerUser   = (data) => api.post('/auth/inscription', data);
export const loginUser      = (data) => api.post('/auth/connexion', data);
export const getMyProfile   = ()     => api.get('/auth/profil');
export const toggleFavorite = (id)   => api.post(`/auth/favoris/${id}`);

// ── PRODUCTS ─────────────────────────────────────────────────
// Gestion des produits

export const getProducts = async (params) => {
  const res = await api.get('/produits', { params });
  return res.data.produits;
};

export const getProductBySlug = async (slug) => {
  const res = await api.get(`/produits/${slug}`);
  return res.data;
};

export const getFeaturedProducts = async () => {
  const res = await api.get('/produits/vedette');
  return res.data;
};

export const searchProducts = async (query) => {
  const res = await api.get('/produits/rechercher', { params: { q: query } });
  return res.data;
};

// ── ORDERS ───────────────────────────────────────────────────
// Gestion des commandes

export const createOrder = (data) => api.post('/commandes', data);
export const getMyOrders = ()     => api.get('/commandes/mes-pedidos');
export const getOrderById = (id)  => api.get(`/commandes/${id}`);

// Export de l'instance pour usage direct si nécessaire
export default api;
// ============================================================
// PAGE CATÉGORIE
// Version corrigée :
// - Suppression de la récupération inutile de categorieId
// - Utilisation directe du slug dans l'API
// - Correction de l'appel getProducts
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getProducts } from '../../services/api';
import CarteProduit from '../../components/CarteProduito';

const NOMS_CATEGORIES = {
  'camisetas-importadas': {
    nom: 'Camisetas Importadas',
    desc: 'Autenticidad garantizada en todos los productos ✓',
    premium: true
  },
  'ropa-original': {
    nom: 'Ropa Original',
    desc: 'Colección completa nacional e internacional',
    premium: false
  },
  'ofertas': {
    nom: 'Ofertas',
    desc: 'Hasta 40% de descuento en productos seleccionados',
    premium: false
  },
};

// Données fallback si API échoue
const PRODUITS_DEMO = [
  { _id:'1', nombre:'Camiseta Tommy Hilfiger', precio:18900, slug:'tommy-1', imagenes:[], talles:[{taille:'M',stock:3}] },
  { _id:'2', nombre:'Polo Ralph Lauren', precio:24500, slug:'ralph-1', imagenes:[], talles:[{taille:'S',stock:2}] },
];

export default function PageCategorie() {
  const router = useRouter();
  const { slug } = router.query;

  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ordre, setOrdre] = useState('destacado');
  const [tailleFiltree, setTailleFiltree] = useState('');

  // 🔥 Chargement des produits basé sur le slug
  useEffect(() => {
    if (!slug) return;

    async function load() {
      setChargement(true);

      try {
        const data = await getProducts({
          categoria: slug,
          orden: ordre,
          talle: tailleFiltree || undefined,
        });

        setProduits(data || []);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        setProduits(PRODUITS_DEMO);
      } finally {
        setChargement(false);
      }
    }

    load();
  }, [slug, ordre, tailleFiltree]);

  const infoCat = NOMS_CATEGORIES[slug] || { nom: slug, desc: '', premium: false };

  return (
    <>
      <Head>
        <title>{infoCat.nom} — FrenchConnection</title>
        <meta name="description" content={infoCat.desc} />
      </Head>

      <div className="min-h-screen bg-white">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <Link href="/">
            <div>
              <p className="font-serif text-xl font-bold">FrenchConnection</p>
              <p className="text-xs text-gray-400 uppercase -mt-1">Buenos Aires</p>
            </div>
          </Link>

          <div className="hidden md:flex gap-6 text-sm text-gray-500">
            <Link href="/categoria/camisetas-importadas">Camisetas</Link>
            <Link href="/categoria/ropa-original">Ropa Original</Link>
            <Link href="/categoria/ofertas">Ofertas</Link>
          </div>

          <Link href="/carrito" className="text-sm border px-4 py-2 rounded-lg">
            Carrito
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-sm text-gray-400">
              ← Inicio
            </Link>

            <h1 className="font-serif text-4xl mt-2">{infoCat.nom}</h1>

            {infoCat.desc && (
              <p className={`text-sm mt-1 ${infoCat.premium ? 'text-amber-700' : 'text-gray-500'}`}>
                {infoCat.desc}
              </p>
            )}
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <select value={ordre} onChange={(e) => setOrdre(e.target.value)}>
              <option value="destacado">Relevancia</option>
              <option value="precio_asc">Precio ↑</option>
              <option value="precio_desc">Precio ↓</option>
            </select>

            <select value={tailleFiltree} onChange={(e) => setTailleFiltree(e.target.value)}>
              <option value="">Todos los talles</option>
              {['S','M','L'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Produits */}
          {chargement ? (
            <p>Chargement...</p>
          ) : produits.length === 0 ? (
            <p>Aucun produit</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {produits.map((p) => (
                <CarteProduit key={p._id} produit={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
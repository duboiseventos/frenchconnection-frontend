// ============================================================
// PAGE CATÉGORIE
// Corrections :
// 1. Suppression du double import useState
// 2. Récupération de l'ID catégorie via son slug avant de filtrer
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';
import { getProducts }    from '../../services/api';
import CarteProduit            from '../../components/CarteProduito';
import api                     from '../../services/api';

const NOMS_CATEGORIES = {
  'camisetas-importadas': { nom: 'Camisetas Importadas', desc: 'Autenticidad garantizada en todos los productos ✓', premium: true  },
  'ropa-original':        { nom: 'Ropa Original',        desc: 'Colección completa nacional e internacional',      premium: false },
  'ofertas':              { nom: 'Ofertas',               desc: 'Hasta 40% de descuento en productos seleccionados', premium: false },
};

// Données de démo — affichées si le backend n'est pas connecté
const PRODUITS_DEMO = [
  { _id:'1', nombre:'Camiseta Tommy Hilfiger', marca:'Tommy Hilfiger', precio:18900, precioOferta:null,  slug:'tommy-1',   esImportado:true,  imagenes:[], talles:[{taille:'M',stock:3},{taille:'L',stock:5}] },
  { _id:'2', nombre:'Polo Ralph Lauren',       marca:'Ralph Lauren',   precio:24500, precioOferta:null,  slug:'ralph-1',   esImportado:true,  imagenes:[], talles:[{taille:'S',stock:2},{taille:'M',stock:4}] },
  { _id:'3', nombre:'Camiseta Lacoste',         marca:'Lacoste',        precio:21000, precioOferta:16800, slug:'lacoste-1', esImportado:true,  imagenes:[], talles:[{taille:'M',stock:1},{taille:'L',stock:2}] },
  { _id:'4', nombre:'Buzo Calvin Klein',        marca:'Calvin Klein',   precio:15900, precioOferta:null,  slug:'ck-1',      esImportado:false, imagenes:[], talles:[{taille:'L',stock:8}] },
];

export default function PageCategorie() {
  const router   = useRouter();
  const { slug } = router.query;

  const [produits, setProduits]         = useState([]);
  const [chargement, setChargement]     = useState(true);
  const [ordre, setOrdre]               = useState('destacado');
  const [tailleFiltree, setTailleFiltree] = useState('');
  const [categorieId, setCategorieId]   = useState(null);

  // Étape 1 : récupérer l'ID de la catégorie depuis son slug
  useEffect(() => {
    if (!slug) return;

    const recupererCategorie = async () => {
      try {
        const { data } = await api.get(`/produits/categories/${slug}`);
        setCategorieId(data._id);
      } catch {
        // Catégorie non trouvée → afficher démo
        setProduits(PRODUITS_DEMO);
        setChargement(false);
      }
    };

    recupererCategorie();
  }, [slug]);

  // Étape 2 : charger les produits une fois qu'on a l'ID catégorie
  useEffect(() => {
    if (!categorieId) return;
    chargerProduits();
  }, [categorieId, ordre, tailleFiltree]);

  const chargerProduits = async () => {
    setChargement(true);
    try {
      const { data } = await getProducts({
        categoria: categorieId,
        orden:     ordre,
        talle:     tailleFiltree || undefined,
      });
      setProduits(data.produits || []);
    } catch {
      setProduits(PRODUITS_DEMO);
    } finally {
      setChargement(false);
    }
  };

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
              <p className="text-xs text-gray-400 tracking-widest uppercase -mt-1">Buenos Aires</p>
            </div>
          </Link>
          <div className="hidden md:flex gap-6 text-sm text-gray-500">
            <Link href="/categoria/camisetas-importadas" className="hover:text-gray-900">Camisetas</Link>
            <Link href="/categoria/ropa-original"        className="hover:text-gray-900">Ropa Original</Link>
            <Link href="/categoria/ofertas"              className="hover:text-gray-900">Ofertas</Link>
          </div>
          <Link href="/carrito" className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
            Carrito
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-8 py-10">

          {/* En-tête */}
          <div className="mb-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Inicio
            </Link>
            <h1 className="font-serif text-4xl mt-2">{infoCat.nom}</h1>
            {infoCat.desc && (
              <p className={`text-sm mt-1 font-medium ${infoCat.premium ? 'text-amber-700' : 'text-gray-500'}`}>
                {infoCat.desc}
              </p>
            )}
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <select
              value={ordre}
              onChange={(e) => setOrdre(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
            >
              <option value="destacado">Relevancia</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="populares">Más vendidos</option>
              <option value="nuevos">Más nuevos</option>
            </select>

            <select
              value={tailleFiltree}
              onChange={(e) => setTailleFiltree(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
            >
              <option value="">Todos los talles</option>
              {['XS','S','M','L','XL','XXL'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Grille produits */}
          {chargement ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : produits.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p>No hay productos en esta categoría todavía.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
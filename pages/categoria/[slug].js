// Page catégorie dynamique — /categoria/camisetas-importadas
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';
import { apiListeProduits }    from '../../services/api';
import CarteProduit            from '../../components/CarteProduito';
import { useState as useSt }   from 'react';

// Noms lisibles pour chaque slug
const NOMS_CATEGORIES = {
  'camisetas-importadas': 'Camisetas Importadas',
  'ropa-original':        'Ropa Original',
  'ofertas':              'Ofertas',
};

export default function PageCategorie() {
  const router              = useRouter();
  const { slug }            = router.query;
  const [produits, setProduits]   = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ordre, setOrdre]   = useState('destacado');
  const [taille, setTaille] = useState('');

  useEffect(() => {
    if (!slug) return;
    chargerProduits();
  }, [slug, ordre, taille]);

  const chargerProduits = async () => {
    setChargement(true);
    try {
      const { data } = await apiListeProduits({
        categoria: slug,
        orden: ordre,
        talle: taille || undefined,
      });
      setProduits(data.produits || []);
    } catch (err) {
      console.error(err);
      // Données de démo si le backend n'est pas encore connecté
      setProduits(PRODUITS_DEMO);
    } finally {
      setChargement(false);
    }
  };

  const nom = NOMS_CATEGORIES[slug] || slug;

  return (
    <>
      <Head>
        <title>{nom} — FrenchConnection</title>
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
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/categoria/camisetas-importadas" className="hover:text-gray-900">Camisetas</Link>
            <Link href="/categoria/ropa-original" className="hover:text-gray-900">Ropa Original</Link>
            <Link href="/categoria/ofertas" className="hover:text-gray-900">Ofertas</Link>
          </div>
          <Link href="/carrito" className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
            Carrito
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-8 py-10">

          {/* Encabezado */}
          <div className="mb-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Inicio</Link>
            <h1 className="font-serif text-4xl mt-2">{nom}</h1>
            {slug === 'camisetas-importadas' && (
              <p className="text-amber-700 text-sm mt-1 font-medium">✓ Autenticidad garantizada en todos los productos</p>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <select
              value={ordre}
              onChange={(e) => setOrdre(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="destacado">Relevancia</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="populares">Más vendidos</option>
              <option value="nuevos">Más nuevos</option>
            </select>

            <select
              value={taille}
              onChange={(e) => setTaille(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
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

// Données de démo affichées si le backend n'est pas encore connecté
const PRODUITS_DEMO = [
  { _id:'1', nombre:'Camiseta Tommy Hilfiger', marca:'Tommy Hilfiger', precio:18900, precioOferta:null, slug:'tommy-1', esImportado:true, imagenes:[], talles:[{taille:'M',stock:3},{taille:'L',stock:5}] },
  { _id:'2', nombre:'Polo Ralph Lauren',       marca:'Ralph Lauren',   precio:24500, precioOferta:null, slug:'ralph-1', esImportado:true, imagenes:[], talles:[{taille:'S',stock:2},{taille:'M',stock:4}] },
  { _id:'3', nombre:'Camiseta Lacoste',         marca:'Lacoste',        precio:21000, precioOferta:16800, slug:'lacoste-1', esImportado:true, imagenes:[], talles:[{taille:'M',stock:1},{taille:'L',stock:2}] },
  { _id:'4', nombre:'Buzo Calvin Klein',        marca:'Calvin Klein',   precio:15900, precioOferta:null, slug:'ck-1',     esImportado:false, imagenes:[], talles:[{taille:'L',stock:8}] },
];
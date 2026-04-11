// Page détail produit — /producto/camiseta-tommy-hilfiger
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';
import { apiDetailProduit }    from '../../services/api';
import { usePanier }           from '../../context/CartContext';
import CarteProduit            from '../../components/CarteProduito';

export default function PageProduit() {
  const router = useRouter();
  const { slug } = router.query;
  const { dispatch } = usePanier();

  const [produit, setProduit]       = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [tailleChoisie, setTailleChoisie] = useState('');
  const [imageActive, setImageActive]     = useState(0);
  const [msgAjout, setMsgAjout]           = useState('');

  useEffect(() => {
    if (!slug) return;
    chargerProduit();
  }, [slug]);

  const chargerProduit = async () => {
    try {
      const { data } = await apiDetailProduit(slug);
      setProduit(data.produit);
      setRelacionados(data.relacionados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const ajouterAuPanier = () => {
    if (!tailleChoisie) {
      setMsgAjout('¡Elegí un talle primero!');
      setTimeout(() => setMsgAjout(''), 2000);
      return;
    }
    dispatch({
      type: 'AJOUTER_ARTICLE',
      article: {
        _id:         produit._id,
        nombre:      produit.nombre,
        precio:      produit.precio,
        precioOferta: produit.precioOferta,
        imagen:      produit.imagenes?.[0] || '',
        taille:      tailleChoisie,
      },
    });
    setMsgAjout('¡Agregado al carrito! ✓');
    setTimeout(() => setMsgAjout(''), 3000);
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-500 mb-4">Producto no encontrado</p>
          <Link href="/" className="text-gray-900 underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const prixFinal  = produit.precioOferta ?? produit.precio;
  const aUnePromo  = produit.precioOferta && produit.precioOferta < produit.precio;
  const remise     = aUnePromo ? Math.round((1 - produit.precioOferta / produit.precio) * 100) : 0;
  const stockTotal = produit.talles?.reduce((a, t) => a + t.stock, 0) ?? 0;

  return (
    <>
      <Head>
        <title>{produit.nombre} — FrenchConnection</title>
        <meta name="description" content={produit.descripcion} />
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
          <Link href="/carrito" className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
            Carrito
          </Link>
        </nav>

        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* Breadcrumb */}
          <div className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600">Inicio</Link>
            <span className="mx-2">›</span>
            <Link href={`/categoria/${produit.categoria?.slug}`} className="hover:text-gray-600">
              {produit.categoria?.nombre}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700">{produit.nombre}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Galerie images */}
            <div>
              <div className="bg-gray-50 rounded-3xl h-96 flex items-center justify-center overflow-hidden mb-3 relative">
                {produit.imagenes?.length > 0 ? (
                  <img
                    src={produit.imagenes[imageActive]}
                    alt={produit.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">👕</span>
                )}
                {produit.esImportado && (
                  <span className="absolute top-4 left-4 bg-amber-700 text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide">
                    IMPORTADO
                  </span>
                )}
                {aUnePromo && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                    -{remise}%
                  </span>
                )}
              </div>
              {/* Miniatures */}
              {produit.imagenes?.length > 1 && (
                <div className="flex gap-2">
                  {produit.imagenes.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageActive(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                        imageActive === i ? 'border-gray-900' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations produit */}
            <div>
              <p className="text-sm text-gray-400 mb-1">{produit.marca}</p>
              <h1 className="font-serif text-3xl mb-4">{produit.nombre}</h1>

              {/* Prix */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold">
                  ${prixFinal.toLocaleString('es-AR')}
                </span>
                {aUnePromo && (
                  <span className="text-lg text-gray-400 line-through">
                    ${produit.precio.toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              {/* Stock faible */}
              {stockTotal > 0 && stockTotal <= 5 && (
                <p className="text-orange-600 text-sm mb-4">⚠ ¡Solo quedan {stockTotal} unidades!</p>
              )}

              {/* Sélecteur de taille */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">
                  Talle
                  {tailleChoisie && <span className="text-gray-400 ml-2 font-normal">— {tailleChoisie}</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {produit.talles?.map((t) => (
                    <button
                      key={t.taille}
                      disabled={t.stock === 0}
                      onClick={() => setTailleChoisie(t.taille)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                        t.stock === 0
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : tailleChoisie === t.taille
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {t.taille}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouton ajouter */}
              {stockTotal === 0 ? (
                <div className="bg-gray-100 text-gray-400 text-center py-4 rounded-xl mb-4">
                  Sin stock disponible
                </div>
              ) : (
                <button
                  onClick={ajouterAuPanier}
                  className={`w-full py-4 rounded-xl font-medium transition-all mb-3 ${
                    msgAjout.includes('✓')
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
                >
                  {msgAjout || 'Agregar al carrito'}
                </button>
              )}

              <Link href="/checkout"
                className="block w-full text-center border border-gray-200 py-4 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Comprar ahora
              </Link>

              {/* Description */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-medium mb-2">Descripción</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{produit.descripcion}</p>
              </div>

              {/* Garanties */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-lg">🔒</p>
                  <p className="text-xs text-gray-500 mt-1">Pago seguro</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-lg">📦</p>
                  <p className="text-xs text-gray-500 mt-1">Envío a todo el país</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-lg">✅</p>
                  <p className="text-xs text-gray-500 mt-1">Original garantizado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Produits liés */}
          {relacionados.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-2xl mb-6">También te puede gustar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relacionados.map((p) => (
                  <CarteProduit key={p._id} produit={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
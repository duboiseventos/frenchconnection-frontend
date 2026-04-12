// ============================================================
// COMPOSANT CARTE PRODUIT
// Correction : condition stockTotal > 0 (était !stockTotal === 0)
// ============================================================

import Link      from 'next/link';
import { usePanier } from '../context/CartContext';
import { useState }  from 'react';

export default function CarteProduit({ produit }) {
  const { dispatch } = usePanier();
  const [taille, setTaille] = useState('');
  const [msg, setMsg]       = useState('');

  const prixFinal  = produit.precioOferta ?? produit.precio;
  const aUnePromo  = produit.precioOferta && produit.precioOferta < produit.precio;
  const remise     = aUnePromo
    ? Math.round((1 - produit.precioOferta / produit.precio) * 100)
    : 0;
  const stockTotal = produit.talles?.reduce((acc, t) => acc + t.stock, 0) ?? 0;

  const ajouterAuPanier = (e) => {
    e.preventDefault();
    if (!taille) {
      setMsg('¡Elegí un talle!');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    dispatch({
      type: 'AJOUTER_ARTICLE',
      article: {
        _id:          produit._id,
        nombre:       produit.nombre,
        precio:       produit.precio,
        precioOferta: produit.precioOferta ?? null,
        imagen:       produit.imagenes?.[0] || '',
        taille,
      },
    });
    setMsg('¡Agregado! ✓');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <Link href={`/producto/${produit.slug}`} className="group block">
      <div className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-200 bg-white">

        {/* Image */}
        <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
          {produit.imagenes?.[0] ? (
            <img
              src={produit.imagenes[0]}
              alt={produit.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl">👕</span>
          )}

          {produit.esImportado && (
            <span className="absolute top-2 left-2 bg-amber-700 text-white text-xs px-2 py-1 rounded-full font-medium tracking-wide">
              IMPORTADO
            </span>
          )}
          {aUnePromo && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{remise}%
            </span>
          )}
          {stockTotal > 0 && stockTotal <= 3 && (
            <span className="absolute bottom-2 left-2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              ⚠ Últimas {stockTotal} uds.
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{produit.marca}</p>
          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-3 line-clamp-2">
            {produit.nombre}
          </h3>

          {/* Sélecteur de taille — correction : stockTotal > 0 */}
          {stockTotal > 0 && (
            <div
              className="flex gap-1 flex-wrap mb-3"
              onClick={(e) => e.preventDefault()}
            >
              {produit.talles?.filter(t => t.stock > 0).map((t) => (
                <button
                  key={t.taille}
                  onClick={(e) => { e.preventDefault(); setTaille(t.taille); }}
                  className={`text-xs px-2 py-1 border rounded transition-colors ${
                    taille === t.taille
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {t.taille}
                </button>
              ))}
            </div>
          )}

          {/* Prix + bouton */}
          <div className="flex items-center justify-between">
            <div>
              {aUnePromo && (
                <span className="text-xs text-gray-400 line-through mr-1">
                  ${produit.precio.toLocaleString('es-AR')}
                </span>
              )}
              <span className="text-base font-semibold">
                ${prixFinal.toLocaleString('es-AR')}
              </span>
            </div>

            {stockTotal === 0 ? (
              <span className="text-xs text-gray-400">Sin stock</span>
            ) : (
              <button
                onClick={ajouterAuPanier}
                className={`text-xs px-3 py-2 rounded-lg transition-all ${
                  msg.includes('✓')
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {msg || 'Agregar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
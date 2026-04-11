// ============================================================
// TIROIR PANIER (slide-in depuis la droite)
// ============================================================

import { usePanier } from '../context/CartContext';
import Link          from 'next/link';

export default function TiroirPanier({ estOuvert, onFermer }) {
  const { articles, sousTotal, dispatch, montantReduction } = usePanier();

  const modifierQuantite = (id, taille, nouvelleQte) => {
    if (nouvelleQte < 1) {
      dispatch({ type: 'RETIRER_ARTICLE', id, taille });
    } else {
      dispatch({ type: 'MODIFIER_QUANTITE', id, taille, quantite: nouvelleQte });
    }
  };

  return (
    <>
      {/* Fond semi-transparent */}
      {estOuvert && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={onFermer}
        />
      )}

      {/* Panneau du panier */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl
          transform transition-transform duration-300 flex flex-col
          ${estOuvert ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-serif text-xl">Tu carrito</h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">🛍️</p>
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={`${article._id}-${article.taille}`} className="flex gap-4 py-4 border-b last:border-0">

                {/* Miniature */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {article.imagen ? (
                    <img src={article.imagen} alt={article.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👕</span>
                  )}
                </div>

                {/* Détails */}
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{article.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Talle: {article.taille}</p>
                  <p className="text-sm font-semibold mt-1">
                    ${((article.precioOferta ?? article.precio) * article.quantite).toLocaleString('es-AR')}
                  </p>

                  {/* Contrôle quantité */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => modifierQuantite(article._id, article.taille, article.quantite - 1)}
                      className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-sm hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="text-sm w-6 text-center">{article.quantite}</span>
                    <button
                      onClick={() => modifierQuantite(article._id, article.taille, article.quantite + 1)}
                      className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-sm hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Pied de page avec total et bouton checkout */}
        {articles.length > 0 && (
          <div className="px-6 py-5 border-t bg-gray-50">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Subtotal</span>
              <span>${sousTotal.toLocaleString('es-AR')}</span>
            </div>
            {montantReduction > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Descuento</span>
                <span>-${montantReduction.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base mt-2 mb-4">
              <span>Total</span>
              <span>${(sousTotal - montantReduction).toLocaleString('es-AR')}</span>
            </div>

            <Link
              href="/checkout"
              onClick={onFermer}
              className="block w-full bg-gray-900 text-white text-center py-3.5 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Ir al checkout
            </Link>
            <p className="text-xs text-gray-400 text-center mt-2">
              🔒 Pago seguro con MercadoPago
            </p>
          </div>
        )}
      </div>
    </>
  );
}
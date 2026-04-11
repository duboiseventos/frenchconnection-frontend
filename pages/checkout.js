// ============================================================
// PAGE CHECKOUT
// Formulaire de livraison + résumé + paiement MercadoPago
// ============================================================

import { useState }       from 'react';
import { usePanier }      from '../context/CartContext';
import { apiCreerCommande } from '../services/api';
import Head               from 'next/head';

export default function PageCheckout() {
  const { articles, sousTotal, montantReduction, dispatch } = usePanier();

  // État du formulaire
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', ciudad: '', provincia: '', codigoPostal: '',
    metodo: 'correo',
  });

  const [codeReduction, setCodeReduction] = useState('');
  const [chargement, setChargement]       = useState(false);
  const [erreur, setErreur]               = useState('');

  const total = sousTotal - montantReduction; // Le coût d'envoi sera calculé côté backend

  // Mettre à jour un champ du formulaire
  const handleChamp = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Soumettre la commande
  const handleSoumettre = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const donnees = {
        // Transformer les articles pour le backend
        articulos: articles.map((a) => ({
          produitId: a._id,
          talle:     a.taille,
          cantidad:  a.quantite,
        })),
        envio:          form,
        codigoDescuento: codeReduction || null,
      };

      const { data } = await apiCreerCommande(donnees);

      // Vider le panier localement
      dispatch({ type: 'VIDER_PANIER' });

      // Rediriger vers MercadoPago
      // En test : utiliser urlSandbox
      // En production : utiliser urlPaiement
      const urlRedirection = process.env.NODE_ENV === 'production'
        ? data.urlPaiement
        : data.urlSandbox;

      window.location.href = urlRedirection;

    } catch (err) {
      setErreur(err.response?.data?.mensaje || 'Hubo un error al procesar tu pedido. Intentá de nuevo.');
      setChargement(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
          <a href="/" className="text-gray-900 underline">Volver a la tienda</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout — FrenchConnection</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl mb-8">Finalizar compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Formulaire de livraison ── */}
          <form onSubmit={handleSoumettre} className="space-y-4">
            <h2 className="font-semibold text-lg mb-4">Datos de envío</h2>

            <input
              name="nombre" value={form.nombre} onChange={handleChamp}
              placeholder="Nombre completo" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            />
            <input
              name="email" type="email" value={form.email} onChange={handleChamp}
              placeholder="Email" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            />
            <input
              name="telefono" value={form.telefono} onChange={handleChamp}
              placeholder="Teléfono (ej: 1140001234)" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            />
            <input
              name="calle" value={form.calle} onChange={handleChamp}
              placeholder="Dirección (calle y número)" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="ciudad" value={form.ciudad} onChange={handleChamp}
                placeholder="Ciudad" required
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
              <input
                name="provincia" value={form.provincia} onChange={handleChamp}
                placeholder="Provincia" required
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <input
              name="codigoPostal" value={form.codigoPostal} onChange={handleChamp}
              placeholder="Código postal" required maxLength={10}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            />

            {/* Code de réduction */}
            <div className="flex gap-2">
              <input
                value={codeReduction}
                onChange={(e) => setCodeReduction(e.target.value.toUpperCase())}
                placeholder="Código de descuento"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm hover:bg-gray-50"
              >
                Aplicar
              </button>
            </div>

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {erreur}
              </div>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 mt-2"
            >
              {chargement ? 'Procesando...' : '💳 Pagar con MercadoPago'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Al confirmar aceptás los términos y condiciones.
              Serás redirigido a MercadoPago para completar el pago de forma segura.
            </p>
          </form>

          {/* ── Résumé de la commande ── */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Resumen del pedido</h2>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              {articles.map((article) => (
                <div
                  key={`${article._id}-${article.taille}`}
                  className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{article.nombre}</p>
                    <p className="text-xs text-gray-400">
                      Talle {article.taille} × {article.quantite}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${((article.precioOferta ?? article.precio) * article.quantite).toLocaleString('es-AR')}
                  </p>
                </div>
              ))}

              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${sousTotal.toLocaleString('es-AR')}</span>
                </div>
                {montantReduction > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento aplicado</span>
                    <span>-${montantReduction.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span className="text-xs">Se calcula al confirmar</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200">
                  <span>Total estimado</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Badges de confiance */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-lg">🔒</p>
                <p className="text-xs text-gray-500 mt-1">Pago seguro</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-lg">📦</p>
                <p className="text-xs text-gray-500 mt-1">Envío a todo el país</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-lg">✅</p>
                <p className="text-xs text-gray-500 mt-1">Originales garantizados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
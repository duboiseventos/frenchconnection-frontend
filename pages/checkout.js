// ============================================================
// PAGE CHECKOUT
// Correction : montantReduction ajouté au destructuring usePanier
// ============================================================

import { useState }         from 'react';
import Head                 from 'next/head';
import Link                 from 'next/link';
import { usePanier }        from '../context/CartContext';
import { apiCreerCommande } from '../services/api';

export default function PageCheckout() {
  // Correction : montantReduction était manquant dans le destructuring
  const { articles, sousTotal, montantReduction, dispatch } = usePanier();

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', ciudad: '', provincia: '', codigoPostal: '',
    metodo: 'correo',
  });
  const [codeReduction, setCodeReduction] = useState('');
  const [chargement, setChargement]       = useState(false);
  const [erreur, setErreur]               = useState('');

  const handleChamp = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSoumettre = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const { data } = await apiCreerCommande({
        articulos: articles.map((a) => ({
          produitId: a._id,
          talle:     a.taille,
          cantidad:  a.quantite,
        })),
        envio:           form,
        codigoDescuento: codeReduction || null,
      });

      // Vider le panier
      dispatch({ type: 'VIDER_PANIER' });

      // Rediriger vers MercadoPago
      // En développement → sandbox, en production → init_point réel
      const urlRedirection = process.env.NODE_ENV === 'production'
        ? data.urlPaiement
        : data.urlSandbox || data.urlPaiement;

      window.location.href = urlRedirection;

    } catch (err) {
      setErreur(
        err.response?.data?.mensaje || 'Hubo un error. Por favor intentá de nuevo.'
      );
      setChargement(false);
    }
  };

  // Panier vide → rediriger vers l'accueil
  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
          <Link href="/" className="text-gray-900 underline">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const totalEstimado = sousTotal - montantReduction;

  return (
    <>
      <Head>
        <title>Checkout — FrenchConnection</title>
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
          <Link href="/carrito" className="text-sm text-gray-500 hover:text-gray-900">
            ← Volver al carrito
          </Link>
        </nav>

        <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Formulaire */}
          <div>
            <h2 className="font-serif text-2xl mb-6">Datos de envío</h2>
            <form onSubmit={handleSoumettre} className="space-y-4">

              {[
                { name: 'nombre',       placeholder: 'Nombre completo',           type: 'text'  },
                { name: 'email',        placeholder: 'Email',                     type: 'email' },
                { name: 'telefono',     placeholder: 'Teléfono (ej: 1140001234)', type: 'tel'   },
                { name: 'calle',        placeholder: 'Dirección (calle y número)',type: 'text'  },
                { name: 'ciudad',       placeholder: 'Ciudad',                    type: 'text'  },
                { name: 'provincia',    placeholder: 'Provincia',                 type: 'text'  },
                { name: 'codigoPostal', placeholder: 'Código postal',             type: 'text'  },
              ].map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChamp}
                  placeholder={field.placeholder}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                />
              ))}

              {/* Code de réduction */}
              <div className="flex gap-2">
                <input
                  value={codeReduction}
                  onChange={(e) => setCodeReduction(e.target.value.toUpperCase())}
                  placeholder="Código de descuento"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              {erreur && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {erreur}
                </div>
              )}

              <button
                type="submit"
                disabled={chargement}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                {chargement ? 'Procesando...' : '💳 Pagar con MercadoPago'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Serás redirigido a MercadoPago para completar el pago de forma segura.
              </p>
            </form>
          </div>

          {/* Résumé */}
          <div>
            <h2 className="font-serif text-2xl mb-6">Resumen del pedido</h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">

              {articles.map((article) => (
                <div
                  key={`${article._id}-${article.taille}`}
                  className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{article.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Talle {article.taille} × {article.quantite}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${((article.precioOferta ?? article.precio) * article.quantite)
                      .toLocaleString('es-AR')}
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
                    <span>Descuento ({codeReduction})</span>
                    <span>-${montantReduction.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span className="text-xs text-gray-400">Se calcula al confirmar</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200">
                  <span>Total estimado</span>
                  <span>${totalEstimado.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Badges de confiance */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {[
                { icon: '🔒', label: 'Pago seguro'          },
                { icon: '📦', label: 'Envío a todo el país' },
                { icon: '✅', label: 'Original garantizado' },
              ].map((b) => (
                <div key={b.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-lg">{b.icon}</p>
                  <p className="text-xs text-gray-500 mt-1">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
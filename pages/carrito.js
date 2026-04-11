import Link        from 'next/link';
import Head        from 'next/head';
import { usePanier } from '../context/CartContext';

export default function PageCarrito() {
  const { articles, sousTotal, montantReduction, dispatch } = usePanier();

  const modifierQte = (id, taille, qte) => {
    if (qte < 1) dispatch({ type: 'RETIRER_ARTICLE', id, taille });
    else dispatch({ type: 'MODIFIER_QUANTITE', id, taille, quantite: qte });
  };

  return (
    <>
      <Head><title>Carrito — FrenchConnection</title></Head>
      <div className="min-h-screen bg-white">

        <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <Link href="/"><p className="font-serif text-xl font-bold">FrenchConnection</p></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Seguir comprando</Link>
        </nav>

        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="font-serif text-3xl mb-8">Tu carrito</h1>

          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🛍️</p>
              <p className="text-gray-400 mb-6">Tu carrito está vacío</p>
              <Link href="/" className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors">
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              {/* Lista artículos */}
              <div className="md:col-span-2 space-y-4">
                {articles.map((a) => (
                  <div key={`${a._id}-${a.taille}`} className="flex gap-4 p-4 border border-gray-100 rounded-2xl">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl overflow-hidden">
                      {a.imagen ? <img src={a.imagen} alt={a.nombre} className="w-full h-full object-cover" /> : '👕'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{a.nombre}</p>
                      <p className="text-sm text-gray-400">Talle: {a.taille}</p>
                      <p className="font-semibold mt-1">${((a.precioOferta ?? a.precio) * a.quantite).toLocaleString('es-AR')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => modifierQte(a._id, a.taille, a.quantite - 1)}
                          className="w-7 h-7 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">−</button>
                        <span className="w-6 text-center text-sm">{a.quantite}</span>
                        <button onClick={() => modifierQte(a._id, a.taille, a.quantite + 1)}
                          className="w-7 h-7 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">+</button>
                        <button onClick={() => dispatch({ type: 'RETIRER_ARTICLE', id: a._id, taille: a.taille })}
                          className="ml-auto text-xs text-gray-400 hover:text-red-500">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-2xl p-6 h-fit">
                <h2 className="font-semibold text-lg mb-4">Resumen</h2>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${sousTotal.toLocaleString('es-AR')}</span></div>
                  {montantReduction > 0 && (
                    <div className="flex justify-between text-green-600"><span>Descuento</span><span>-${montantReduction.toLocaleString('es-AR')}</span></div>
                  )}
                  <div className="flex justify-between text-gray-500"><span>Envío</span><span className="text-xs">Se calcula en checkout</span></div>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200 mb-5">
                  <span>Total estimado</span>
                  <span>${(sousTotal - montantReduction).toLocaleString('es-AR')}</span>
                </div>
                <Link href="/checkout"
                  className="block w-full bg-gray-900 text-white text-center py-3.5 rounded-xl hover:bg-gray-700 transition-colors font-medium">
                  Finalizar compra
                </Link>
                <p className="text-xs text-gray-400 text-center mt-2">🔒 Pago seguro con MercadoPago</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
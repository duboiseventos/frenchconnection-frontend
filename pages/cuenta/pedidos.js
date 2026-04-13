// ============================================================
// PAGE PEDIDOS (Historial utilisateur)
// Corrections :
// - Fix getMyOrders (res.data)
// - Sécurisation localStorage (SSR)
// - Protection contre undefined
// ============================================================

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getMyOrders } from '../../services/api';

// États des commandes
const ESTADOS = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  confirmado:  { label: 'Confirmado',  color: 'bg-blue-100 text-blue-700' },
  despachado:  { label: 'Despachado',  color: 'bg-purple-100 text-purple-700' },
  entregado:   { label: 'Entregado',   color: 'bg-green-100 text-green-700' },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
};

export default function PagePedidos() {
  const router = useRouter();

  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // 🔴 Sécurisation SSR
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('fc_token');
    const user  = localStorage.getItem('fc_usuario');

    if (!token) {
      router.push('/cuenta/login?redirect=/cuenta/pedidos');
      return;
    }

    setUsuario(JSON.parse(user || '{}'));
    chargerCommandes();
  }, []);

  const chargerCommandes = async () => {
    try {
      const res = await getMyOrders();
      setCommandes(res.data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    } finally {
      setChargement(false);
    }
  };

  const deconnecter = () => {
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_usuario');
    router.push('/');
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  return (
    <>
      <Head>
        <title>Mis pedidos — FrenchConnection</title>
      </Head>

      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <nav className="bg-white flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <Link href="/">
            <p className="font-serif text-xl font-bold cursor-pointer">
              FrenchConnection
            </p>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{usuario?.nom}</span>
            <button
              onClick={deconnecter}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-8 py-10">
          <h1 className="font-serif text-3xl mb-8">Mis pedidos</h1>

          {chargement ? (
            // Skeleton loading
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
              ))}
            </div>

          ) : commandes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-gray-400 mb-6">
                Todavía no realizaste ningún pedido
              </p>
              <Link
                href="/"
                className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors inline-block"
              >
                Explorar productos
              </Link>
            </div>

          ) : (
            <div className="space-y-4">
              {commandes.map((commande) => {
                const estado = ESTADOS[commande.estado] || ESTADOS.pendiente;

                return (
                  <div
                    key={commande._id}
                    className="bg-white rounded-2xl border border-gray-100 p-6"
                  >

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Pedido #{commande._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatearFecha(commande.createdAt)}
                        </p>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>

                    {/* Articles */}
                    <div className="space-y-2 mb-4">
                      {commande.articulos?.map((art, i) => (
                        <div key={i} className="flex items-center gap-3">

                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg overflow-hidden">
                            {art.produit?.imagenes?.[0] ? (
                              <img
                                src={art.produit.imagenes[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : '👕'}
                          </div>

                          <div className="flex-1 text-sm">
                            <span className="font-medium">{art.nombre}</span>
                            <span className="text-gray-400 ml-2">
                              × {art.cantidad} — Talle {art.talle}
                            </span>
                          </div>

                          <span className="text-sm font-medium">
                            ${(art.precio * art.cantidad).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        {commande.envio?.metodo === 'correo'
                          ? `📦 Envío a ${commande.envio.ciudad}`
                          : '🏪 Retiro en tienda'}
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-semibold">
                          ${commande.total.toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
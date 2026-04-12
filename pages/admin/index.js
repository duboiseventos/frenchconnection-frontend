// Panel admin — créer et gérer les produits
// Accès réservé aux utilisateurs avec role = 'admin'
import { useState, useEffect } from 'react';
import Head                    from 'next/head';
import Link                    from 'next/link';
import { useRouter }           from 'next/router';
import axios                   from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export default function PageAdmin() {
  const router = useRouter();
  const [onglet, setOnglet]         = useState('productos');
  const [produits, setProduits]     = useState([]);
  const [commandes, setCommandes]   = useState([]);
  const [chargement, setChargement] = useState(true);
  const [formProduit, setFormProduit] = useState({
    nombre: '', descripcion: '', marca: '', precio: '',
    precioOferta: '', slug: '', esImportado: false, esDestacado: false,
    talles: [{ taille: 'S', stock: 0 }, { taille: 'M', stock: 0 },
             { taille: 'L', stock: 0 }, { taille: 'XL', stock: 0 }],
  });
  const [msgForm, setMsgForm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fc_token');
    const user  = JSON.parse(localStorage.getItem('fc_usuario') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/');
      return;
    }
    api.defaults.headers.Authorization = `Bearer ${token}`;
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [resProd, resCmd] = await Promise.all([
        api.get('/produits'),
        api.get('/admin/commandes'),
      ]);
      setProduits(resProd.data.produits || []);
      setCommandes(resCmd.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  // Générer le slug automatiquement depuis le nom
  const genererSlug = (nom) =>
    nom.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlever accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

  const handleNom = (e) => {
    const nom = e.target.value;
    setFormProduit(prev => ({
      ...prev,
      nombre: nom,
      slug: genererSlug(nom),
    }));
  };

  const handleStock = (taille, valor) => {
    setFormProduit(prev => ({
      ...prev,
      talles: prev.talles.map(t =>
        t.taille === taille ? { ...t, stock: Number(valor) } : t
      ),
    }));
  };

  const creerProduit = async (e) => {
    e.preventDefault();
    setMsgForm('');
    try {
      await api.post('/admin/produits', {
        ...formProduit,
        precio:       Number(formProduit.precio),
        precioOferta: formProduit.precioOferta ? Number(formProduit.precioOferta) : null,
        imagenes:     [],
        categoria:    '000000000000000000000001', // Remplacer par vrai ID catégorie
      });
      setMsgForm('✓ Producto creado correctamente');
      chargerDonnees();
      // Reset formulaire
      setFormProduit(prev => ({ ...prev, nombre: '', descripcion: '', precio: '', precioOferta: '', slug: '' }));
    } catch (err) {
      setMsgForm('Error: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const changerEstadoCommande = async (id, estado) => {
    try {
      await api.put(`/admin/commandes/${id}/estado`, { estado });
      chargerDonnees();
    } catch (err) {
      console.error(err);
    }
  };

  const ESTADOS_COMMANDE = ['pendiente', 'confirmado', 'despachado', 'entregado', 'cancelado'];

  return (
    <>
      <Head><title>Panel Admin — FrenchConnection</title></Head>

      <div className="min-h-screen bg-gray-50">

        {/* Navbar admin */}
        <nav className="bg-gray-900 text-white flex items-center justify-between px-8 py-4">
          <div>
            <p className="font-serif text-lg">FrenchConnection</p>
            <p className="text-xs text-gray-400">Panel de administración</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            Ver tienda →
          </Link>
        </nav>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-8">
          <div className="flex gap-0">
            {[
              { id: 'productos', label: '📦 Productos' },
              { id: 'pedidos',   label: '🛍️ Pedidos'   },
              { id: 'nuevo',     label: '➕ Nuevo producto' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOnglet(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  onglet === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* ── Onglet Productos ── */}
          {onglet === 'productos' && (
            <div>
              <h2 className="font-serif text-2xl mb-6">Productos ({produits.length})</h2>
              {chargement ? (
                <div className="text-gray-400">Cargando...</div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Producto</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Precio</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Stock</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {produits.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                {p.imagenes?.[0]
                                  ? <img src={p.imagenes[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                                  : '👕'
                                }
                              </div>
                              <div>
                                <p className="font-medium">{p.nombre}</p>
                                <p className="text-gray-400 text-xs">{p.marca}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p>${p.precio.toLocaleString('es-AR')}</p>
                            {p.precioOferta && (
                              <p className="text-green-600 text-xs">Oferta: ${p.precioOferta.toLocaleString('es-AR')}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              p.stockTotal === 0
                                ? 'bg-red-100 text-red-600'
                                : p.stockTotal <= 5
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {p.stockTotal} uds.
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {p.esImportado && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Importado</span>}
                              {p.esDestacado && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Destacado</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Pedidos ── */}
          {onglet === 'pedidos' && (
            <div>
              <h2 className="font-serif text-2xl mb-6">Pedidos ({commandes.length})</h2>
              <div className="space-y-3">
                {commandes.map(cmd => (
                  <div key={cmd._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">#{cmd._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cmd.envio?.nombre} · {cmd.envio?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(cmd.createdAt).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${cmd.total.toLocaleString('es-AR')}</p>
                        <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                          cmd.pago.estado === 'aprobado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          Pago: {cmd.pago.estado}
                        </p>
                      </div>
                    </div>
                    {/* Selector estado */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-500">Estado del pedido:</span>
                      <select
                        value={cmd.estado}
                        onChange={(e) => changerEstadoCommande(cmd._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      >
                        {ESTADOS_COMMANDE.map(est => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Onglet Nuevo producto ── */}
          {onglet === 'nuevo' && (
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl mb-6">Crear nuevo producto</h2>

              <form onSubmit={creerProduit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">

                <input
                  value={formProduit.nombre}
                  onChange={handleNom}
                  placeholder="Nombre del producto"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                />

                <input
                  value={formProduit.slug}
                  onChange={e => setFormProduit(p => ({ ...p, slug: e.target.value }))}
                  placeholder="slug-url (auto-generado)"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 font-mono"
                />

                <textarea
                  value={formProduit.descripcion}
                  onChange={e => setFormProduit(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Descripción del producto"
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
                />

                <input
                  value={formProduit.marca}
                  onChange={e => setFormProduit(p => ({ ...p, marca: e.target.value }))}
                  placeholder="Marca (ej: Tommy Hilfiger)"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={formProduit.precio}
                    onChange={e => setFormProduit(p => ({ ...p, precio: e.target.value }))}
                    placeholder="Precio (ARS)"
                    required min="0"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                  />
                  <input
                    type="number"
                    value={formProduit.precioOferta}
                    onChange={e => setFormProduit(p => ({ ...p, precioOferta: e.target.value }))}
                    placeholder="Precio oferta (opcional)"
                    min="0"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>

                {/* Stock par taille */}
                <div>
                  <p className="text-sm font-medium mb-2">Stock por talle</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formProduit.talles.map(t => (
                      <div key={t.taille}>
                        <p className="text-xs text-gray-500 mb-1 text-center">{t.taille}</p>
                        <input
                          type="number"
                          value={t.stock}
                          onChange={e => handleStock(t.taille, e.target.value)}
                          min="0"
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProduit.esImportado}
                      onChange={e => setFormProduit(p => ({ ...p, esImportado: e.target.checked }))}
                      className="rounded"
                    />
                    Producto importado
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProduit.esDestacado}
                      onChange={e => setFormProduit(p => ({ ...p, esDestacado: e.target.checked }))}
                      className="rounded"
                    />
                    Destacado (home)
                  </label>
                </div>

                {msgForm && (
                  <div className={`px-4 py-3 rounded-xl text-sm ${
                    msgForm.startsWith('✓')
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {msgForm}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Crear producto
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
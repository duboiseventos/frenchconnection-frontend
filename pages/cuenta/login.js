// Page connexion / inscription
import { useState }     from 'react';
import Head             from 'next/head';
import Link             from 'next/link';
import { useRouter }    from 'next/router';
import { apiConnexion, apiInscription } from '../../services/api';

export default function PageLogin() {
  const router = useRouter();
  const [mode, setMode]         = useState('login'); // 'login' ou 'registro'
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur]     = useState('');

  const [form, setForm] = useState({
    nom: '', email: '', motDePasse: ''
  });

  const handleChamp = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSoumettre = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      let data;
      if (mode === 'login') {
        const res = await apiConnexion({ email: form.email, motDePasse: form.motDePasse });
        data = res.data;
      } else {
        const res = await apiInscription({ nom: form.nom, email: form.email, motDePasse: form.motDePasse });
        data = res.data;
      }
      // Sauvegarder le token
      localStorage.setItem('fc_token', data.token);
      localStorage.setItem('fc_usuario', JSON.stringify({ nom: data.nom, email: data.email, role: data.role }));
      // Rediriger
      router.push(router.query.redirect || '/cuenta/pedidos');
    } catch (err) {
      setErreur(err.response?.data?.mensaje || 'Error al iniciar sesión.');
      setChargement(false);
    }
  };

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} — FrenchConnection</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">

        {/* Navbar simple */}
        <nav className="bg-white border-b border-gray-100 px-8 py-4">
          <Link href="/">
            <p className="font-serif text-xl font-bold">FrenchConnection</p>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md">

            {/* Toggle login / registro */}
            <div className="flex border border-gray-200 rounded-xl p-1 mb-8">
              <button
                onClick={() => { setMode('login'); setErreur(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'login' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setMode('registro'); setErreur(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'registro' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={handleSoumettre} className="space-y-4">

              {/* Nom — seulement pour inscription */}
              {mode === 'registro' && (
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChamp}
                  placeholder="Nombre completo"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                />
              )}

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChamp}
                placeholder="Email"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />

              <input
                name="motDePasse"
                type="password"
                value={form.motDePasse}
                onChange={handleChamp}
                placeholder="Contraseña"
                required
                minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />

              {erreur && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {erreur}
                </div>
              )}

              <button
                type="submit"
                disabled={chargement}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                {chargement
                  ? 'Cargando...'
                  : mode === 'login' ? 'Ingresar' : 'Crear mi cuenta'
                }
              </button>
            </form>

            {/* Lien vers le checkout sans compte */}
            <p className="text-center text-xs text-gray-400 mt-6">
              ¿Preferís comprar sin cuenta?{' '}
              <Link href="/checkout" className="text-gray-700 underline">
                Continuar como invitado
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
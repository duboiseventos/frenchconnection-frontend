// Page login — Email/mot de passe + Google OAuth
import { useState, useEffect } from 'react';
import { signIn, useSession }  from 'next-auth/react';
import Head                    from 'next/head';
import Link                    from 'next/link';
import { useRouter }           from 'next/router';

export default function PageLogin() {
  const router            = useRouter();
  const { data: session } = useSession();
  const [mode, setMode]   = useState('login');
  const [chargement, setChargement]             = useState(false);
  const [chargementGoogle, setChargementGoogle] = useState(false);
  const [erreur, setErreur] = useState('');
  const [form, setForm]     = useState({ nom: '', email: '', motDePasse: '' });

  // Déjà connecté → rediriger directement
  useEffect(() => {
    if (session) {
      router.push(router.query.redirect?.toString() || '/cuenta/pedidos');
    }
  }, [session]);

  const handleChamp = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Connexion Google
  const connexionGoogle = async () => {
    setChargementGoogle(true);
    setErreur('');
    await signIn('google', {
      callbackUrl: router.query.redirect?.toString() || '/cuenta/pedidos',
    });
    // Note : la page se recharge automatiquement, pas besoin de setChargementGoogle(false)
  };

  // Connexion ou inscription email
  const handleSoumettre = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    if (mode === 'login') {
      const result = await signIn('credentials', {
        email:      form.email,
        motDePasse: form.motDePasse,
        redirect:   false,
      });
      if (result?.error) {
        setErreur('Email o contraseña incorrectos.');
        setChargement(false);
      } else {
        router.push(router.query.redirect?.toString() || '/cuenta/pedidos');
      }

    } else {
      // Inscription → créer le compte puis connexion auto
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/inscription`,
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              nom:        form.nom,
              email:      form.email,
              motDePasse: form.motDePasse,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje);

        // Connexion automatique après inscription réussie
        await signIn('credentials', {
          email:      form.email,
          motDePasse: form.motDePasse,
          callbackUrl: '/cuenta/pedidos',
        });
      } catch (err) {
        setErreur(err.message || 'Error al crear la cuenta.');
        setChargement(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} — FrenchConnection
        </title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">

        <nav className="bg-white border-b border-gray-100 px-8 py-4">
          <Link href="/">
            <div>
              <p className="font-serif text-xl font-bold">FrenchConnection</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase -mt-1">Buenos Aires</p>
            </div>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md shadow-sm">

            <h1 className="font-serif text-2xl text-center mb-6">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear una cuenta'}
            </h1>

            {/* Bouton Google */}
            <button
              onClick={connexionGoogle}
              disabled={chargementGoogle}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors mb-6 disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {chargementGoogle ? 'Conectando...' : 'Continuar con Google'}
              </span>
            </button>

            {/* Séparateur */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o con email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Toggle login / registro */}
            <div className="flex border border-gray-200 rounded-xl p-1 mb-5">
              {['login', 'registro'].map((m) => (
                <button key={m}
                  onClick={() => { setMode(m); setErreur(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              ))}
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSoumettre} className="space-y-3">
              {mode === 'registro' && (
                <input name="nom" value={form.nom} onChange={handleChamp}
                  placeholder="Nombre completo" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
              )}
              <input name="email" type="email" value={form.email} onChange={handleChamp}
                placeholder="Email" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
              <input name="motDePasse" type="password" value={form.motDePasse} onChange={handleChamp}
                placeholder="Contraseña (mínimo 6 caracteres)" required minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />

              {erreur && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {erreur}
                </div>
              )}

              <button type="submit" disabled={chargement}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-60">
                {chargement ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear mi cuenta'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              ¿Preferís comprar sin cuenta?{' '}
              <Link href="/checkout" className="text-gray-700 underline">Continuar como invitado</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
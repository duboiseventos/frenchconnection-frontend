// Page d'accueil FrenchConnection
import Head from 'next/head';
import Link from 'next/link';

export default function Accueil() {
  return (
    <>
      <Head>
        <title>FrenchConnection — Ropa Importada en Argentina</title>
        <meta name="description" content="Camisetas importadas originales y ropa seleccionada. Envíos a todo el país." />
      </Head>

      <main className="min-h-screen bg-white">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <div>
            <p className="font-serif text-xl font-bold tracking-wide">FrenchConnection</p>
            <p className="text-xs text-gray-400 tracking-widest uppercase -mt-1">Buenos Aires</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/categoria/camisetas-importadas" className="hover:text-gray-900">Camisetas</Link>
            <Link href="/categoria/ropa-original" className="hover:text-gray-900">Ropa Original</Link>
            <Link href="/categoria/ofertas" className="hover:text-gray-900">Ofertas</Link>
          </div>
          <Link href="/carrito" className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
            Carrito
          </Link>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase text-amber-700 mb-3">Nueva colección 2024</p>
            <h1 className="font-serif text-5xl leading-tight mb-6">
              Moda que <em className="italic text-amber-700">viaja</em><br/>hasta vos
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Camisetas importadas originales de Europa y USA. Autenticidad garantizada, envíos a todo el país.
            </p>
            <div className="flex gap-4">
              <Link href="/categoria/camisetas-importadas"
                className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors">
                Ver Importados
              </Link>
              <Link href="/categoria/ofertas"
                className="border border-gray-200 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
                Ofertas del día
              </Link>
            </div>
          </div>
          <div className="bg-gray-50 rounded-3xl h-80 flex items-center justify-center text-8xl">
            👕
          </div>
        </section>

        {/* Banner promo */}
        <section className="max-w-5xl mx-auto px-8 mb-16">
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">15% OFF en tu primera compra</p>
              <p className="text-gray-500 text-sm mt-1">Ingresá el código al momento de pagar</p>
            </div>
            <span className="font-mono bg-gray-900 text-white px-6 py-3 rounded-xl tracking-widest text-sm">
              FRENCH15
            </span>
          </div>
        </section>

        {/* Categorías */}
        <section className="max-w-5xl mx-auto px-8 pb-20">
          <h2 className="font-serif text-3xl mb-8">Categorías</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { nombre: 'Camisetas Importadas', emoji: '👕', slug: 'camisetas-importadas', desc: 'Premium · 42 productos', color: 'bg-amber-50' },
              { nombre: 'Ropa Original',        emoji: '🧥', slug: 'ropa-original',        desc: '87 productos',         color: 'bg-gray-50' },
              { nombre: 'Ofertas',              emoji: '🏷️', slug: 'ofertas',              desc: 'Hasta 40% OFF',        color: 'bg-red-50'  },
            ].map((cat) => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                className={`${cat.color} rounded-2xl p-8 hover:scale-105 transition-transform cursor-pointer block`}>
                <p className="text-4xl mb-4">{cat.emoji}</p>
                <p className="font-semibold text-lg">{cat.nombre}</p>
                <p className="text-gray-500 text-sm mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
import Link from 'next/link';
import Head from 'next/head';

export default function PagoPendiente() {
  return (
    <>
      <Head><title>Pago pendiente — FrenchConnection</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">⏳</div>
          <h1 className="font-serif text-3xl mb-3">Pago en proceso</h1>
          <p className="text-gray-500 mb-2">Tu pago está siendo procesado.</p>
          <p className="text-gray-500 mb-8">Te avisaremos por email cuando se confirme.</p>
          <Link href="/cuenta/pedidos"
            className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors inline-block">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </>
  );
}
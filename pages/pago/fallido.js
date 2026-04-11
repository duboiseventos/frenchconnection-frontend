import Link from 'next/link';
import Head from 'next/head';

export default function PagoFallido() {
  return (
    <>
      <Head><title>Pago fallido — FrenchConnection</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">😕</div>
          <h1 className="font-serif text-3xl mb-3">El pago no se completó</h1>
          <p className="text-gray-500 mb-8">Podés intentarlo de nuevo o contactarnos por WhatsApp.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout" className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors">
              Reintentar
            </Link>
            <Link href="/" className="border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
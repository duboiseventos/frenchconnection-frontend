import Link from 'next/link';
import Head from 'next/head';

export default function PagoExitoso() {
  return (
    <>
      <Head><title>¡Pago exitoso! — FrenchConnection</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="font-serif text-3xl mb-3">¡Pedido confirmado!</h1>
          <p className="text-gray-500 mb-2">Tu pago fue procesado correctamente.</p>
          <p className="text-gray-500 mb-8">Te enviamos un email con los detalles de tu compra.</p>
          <Link href="/" className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors inline-block">
            Seguir comprando
          </Link>
        </div>
      </div>
    </>
  );
}
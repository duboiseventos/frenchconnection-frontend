// Point d'entrée — SessionProvider + Panier + WhatsApp sur toutes les pages
import { SessionProvider }   from 'next-auth/react';
import { FournisseurPanier } from '../context/CartContext';
import BoutonWhatsApp        from '../components/BoutonWhatsApp';
import '../styles/globals.css';

export default function Application({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <FournisseurPanier>
        <Component {...pageProps} />
        <BoutonWhatsApp />
      </FournisseurPanier>
    </SessionProvider>
  );
}
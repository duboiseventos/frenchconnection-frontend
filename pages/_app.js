// ============================================================
// RACINE DE L'APPLICATION NEXT.JS
// Enveloppe toutes les pages avec les contextes globaux
// ============================================================

import { FournisseurPanier }  from '../context/CartContext';
import BoutonWhatsApp         from '../components/BoutonWhatsApp';
import '../styles/globals.css';

export default function Application({ Component, pageProps }) {
  return (
    <FournisseurPanier>
      {/* Le composant de la page en cours */}
      <Component {...pageProps} />

      {/* Bouton WhatsApp visible sur toutes les pages */}
      <BoutonWhatsApp />
    </FournisseurPanier>
  );
}





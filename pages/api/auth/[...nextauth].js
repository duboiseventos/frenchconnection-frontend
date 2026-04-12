// Configuration NextAuth — Google + Email/Mot de passe
import NextAuth            from 'next-auth';
import GoogleProvider      from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [

    // Google OAuth
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Email + mot de passe via notre backend
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email:      { label: 'Email',      type: 'email'    },
        motDePasse: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/connexion`,
            {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                email:      credentials.email,
                motDePasse: credentials.motDePasse,
              }),
            }
          );
          const data = await res.json();
          if (!res.ok) return null;
          return {
            id:       data._id,
            name:     data.nom,
            email:    data.email,
            role:     data.role,
            apiToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Enrichir le token avec nos données custom
    async jwt({ token, user, account }) {
      if (user) {
        token.id       = user.id;
        token.role     = user.role     || 'usuario';
        token.apiToken = user.apiToken || null;
      }
      // Connexion Google → synchroniser avec notre backend
      if (account?.provider === 'google' && user) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                nom:    user.name,
                email:  user.email,
                imagen: user.image,
              }),
            }
          );
          const data = await res.json();
          if (res.ok) {
            token.id       = data._id;
            token.role     = data.role;
            token.apiToken = data.token;
          }
        } catch (err) {
          console.error('Erreur sync Google backend:', err.message);
        }
      }
      return token;
    },

    // Exposer les données dans la session côté client
    async session({ session, token }) {
      session.user.id       = token.id;
      session.user.role     = token.role;
      session.user.apiToken = token.apiToken;
      return session;
    },
  },

  pages: {
    signIn: '/cuenta/login',
    error:  '/cuenta/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 jours
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
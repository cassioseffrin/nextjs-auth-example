import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

async function refreshAccessToken(tokenObject) {
  console.log(" vai atualizar o token em xx seconds");
  try {
    const headers = {
      _usuario: 'MTs3NUFMOA==',
      Authorization: 'Basic Y29udHJvbC11c2VyOkBycGFVc2VyI0NvbnRyb2wjMTM1'
    };
    const tokenResponse = await axios.post(`http://192.168.50.40:3000/auth/oauth/token?grant_type=refresh_token&refresh_token=${tokenObject.refreshToken}`, {}, { headers: headers });
    console.log(tokenResponse?.data?.refresh_token ?? 'erro ao renovar token');
    return {
      ...tokenObject,
      accessToken: tokenResponse.data.access_token,
      expiresIn: tokenResponse.data.expires_in,
      refreshToken: tokenResponse.data.refresh_token
    }
  } catch (error) {
    console.log(error);
    return {
      ...tokenObject,
      error: "RefreshAccessTokenError",
    }
  }
}
const providers = [
  CredentialsProvider({
    id: 'credentials',
    name: 'registro-front-adm',
    credentials: {
      email: {
        label: 'email',
        type: 'email',
        placeholder: 'email',
      },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials, req) {
      const res = await fetch(`http://192.168.50.40:3000/auth/oauth/token?Authorization=&grant_type=password&username=${credentials.email}&password=${credentials.password}`, {
        method: 'POST',
        body: "[]",
        headers: {
          'Content-Type': 'application/json',
          _usuario: 'MTs3NUFMOA==',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Basic Y29udHJvbC11c2VyOkBycGFVc2VyI0NvbnRyb2wjMTM1'
        },
      });
      const user = await res.json();
      if (!res.ok) {
        throw new Error(user.exception);
      }
      if (res.ok && user) {
        return user;
      }
      return null;
    },
  }),
  // ...caso houverem mais providers colocar aqui
];
const pages = {
  signIn: '/login',
};
const callbacks = {
  async jwt({ token, user, account }) {
    const now = Date.now()
    const prev = token.now ?? now
    token.now = now
    const diff = token.now - prev
    console.log(diff / 1000, "********* FAZER REFRESH DO TOKEN 10 segundos")
    if (account && user) {
      return {
        ...token,
        accessToken: user.access_token,
        refreshToken: user.refresh_token,
        expiresIn: user.expires_in,
      };
    }
    const shouldRefreshTime = Math.round((token.expiresIn - 29 * 60));
    // const shouldRefreshTime = Math.round((token.expiresIn - 5 * 60 ) );
    if (shouldRefreshTime > 0) {
      return token;
    }
    token = refreshAccessToken(token);
    return token;
  },
  async session({ session, token }) {
    session.user.accessToken = token.accessToken;
    session.user.refreshToken = token.refreshToken;
    session.user.accessTokenExpires = token.expiresIn;
    return session;
  },
};
const theme = {
  colorScheme: 'auto', 
  brandColor: '',
  logo: 'https://www.arpasistemas.net.br/assets/site/img/logo.png',
};
export const options = {
  providers,
  callbacks,
  pages: pages,
  secret: process.env.SECRET_COOKIE_PASSWORD,
  theme
}
const Auth = (req, res) => NextAuth(req, res, options)
export default Auth;
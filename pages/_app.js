import 'tailwindcss/tailwind.css';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session} refetchInterval={15} refetchOnWindowFocus={false}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;

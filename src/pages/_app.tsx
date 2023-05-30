/* eslint-disable react/prop-types */
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "server/communication/api";
import "styles/globals.css";
import Head from "next/head";
import Navbar from "components/navbar";
import Script from "next/script";
import { Provider } from "react-wrap-balancer";
import { Toaster } from "react-hot-toast";
import { MainWrapper } from "./_mainWrapper";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Provider>
        <Head>
          <title>N Market</title>
          <meta
            name="description"
            content="We're not just an online store, we're your new addiction. The best online market in the planet!"
          />
          <link rel="icon" href="/favicon.svg" />
        </Head>
        <MainWrapper>
          <main className="flex h-screen flex-col">
            <Toaster position="bottom-right" reverseOrder={false} />
            <div className="shadow-middle relative z-10">
              <Navbar />
            </div>
            <Component {...pageProps} />
          </main>
        </MainWrapper>
        <Script src="/preline/preline.js"></Script>
      </Provider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-gray-400 text-center py-2">

      </footer>
    </>
  );
}

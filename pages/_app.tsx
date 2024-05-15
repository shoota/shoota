import React from 'react'
import { AppProps } from 'next/app'
import '../public/index.css'

/*
  supress SSR warning
  Warning:
    useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format.
    This will lead to a mismatch between the initial, non-hydrated UI and the intended UI.
    To avoid this, useLayoutEffect should only be used in components that render exclusively on the client.
 */
React.useLayoutEffect = React.useEffect

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

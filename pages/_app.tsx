import React from 'react'
import { AppProps } from 'next/app'
import { ArwesThemeProvider, StylesBaseline } from '@arwes/core'
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
  return (
    <ArwesThemeProvider>
      <StylesBaseline
        styles={{
          'h1,h2,h3,h4,h5,h6': {
            fontWeight: 'bold',
            color: '#00f8f8',
            letterSpacing: '0.5px',
            textShadow: '0 0 2px #00f8f8',
            textTransform: 'none',
          },
        }}
      />
      <Component {...pageProps} />
    </ArwesThemeProvider>
  )
}

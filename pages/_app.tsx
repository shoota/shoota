import React from 'react'
import { AppProps } from 'next/app'
// import { ThemeProvider } from 'emotion-theming'

import { ArwesThemeProvider, StylesBaseline } from '@arwes/core'

// import { theme } from '../theme'
// import '../styles/index.css'

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

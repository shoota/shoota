import React from 'react'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'emotion-theming'

import { ArwesThemeProvider, StylesBaseline } from '@arwes/core'

import { theme } from '../theme'
// import '../styles/index.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ArwesThemeProvider>
      <StylesBaseline />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </ArwesThemeProvider>
  )
}

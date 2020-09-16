import React from 'react'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'emotion-theming'

import { theme } from '../theme'
// import '../styles/index.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

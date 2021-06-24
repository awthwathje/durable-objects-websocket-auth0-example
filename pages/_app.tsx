import * as React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import getConfig from 'next/config'
import { Provider } from 'react-redux'
import { makeStore } from 'store/store'
import './global.css'

const {
  publicRuntimeConfig: {
    auth0: { issuerBaseUrl, clientId, redirectUri }
  }
} = getConfig()

interface Props {
  readonly Component: React.ComponentType
  readonly pageProps: Record<string, unknown>
}

function App({ Component, pageProps }: Props): JSX.Element {
  return (
    <Provider store={makeStore()}>
      <Auth0Provider
        domain={issuerBaseUrl}
        clientId={clientId}
        redirectUri={redirectUri}
        useRefreshTokens
      >
        <Component {...pageProps} />
      </Auth0Provider>
    </Provider>
  )
}

export default App

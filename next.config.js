module.exports = {
  publicRuntimeConfig: {
    auth0: {
      issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL,
      clientId: process.env.AUTH0_CLIENT_ID,
      redirectUri: process.env.AUTH0_REDIRECT_URI
    },
    webSocketUrl: process.env.WEB_SOCKET_URL
  }
}

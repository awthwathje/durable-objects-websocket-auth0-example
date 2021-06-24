import { handleRedirect, authorize, logout } from './auth'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const List = require('./list.js')
exports.List = List

const customEnvs = ({
  AUTH0_ISSUER_BASE_URL,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_CALLBACK_URL,
  SALT
}) => ({
  domain: `https://${AUTH0_ISSUER_BASE_URL}`,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
  callbackUrl: AUTH0_CALLBACK_URL,
  salt: SALT
})

exports.handlers = {
  async fetch(request, env) {
    try {
      const [authorized, { authorization, redirectUrl }] = await authorize(
        request,
        customEnvs(env),
        env.AUTH_STORE
      )

      const url = new URL(request.url)
      const path = url.pathname

      switch (path) {
        case '/api/auth/status': {
          if (authorized && authorization.accessToken) {
            return new Response('Authorized', { status: 200 })
          } else {
            return new Response('Not authorized', { status: 401 })
          }
        }

        case '/api/auth/login': {
          return Response.redirect(redirectUrl)
        }

        case '/api/auth/logout': {
          const { headers } = logout(request.headers.get('Cookie'))

          if (headers) {
            const response = new Response(null)
            return new Response(response.body, {
              ...response,
              headers: Object.assign({}, response.headers, headers)
            })
          } else {
            return Response.redirect(url.origin)
          }
        }

        case '/api/auth/callback': {
          const authorizedResponse = await handleRedirect(
            request,
            customEnvs(env),
            env.AUTH_STORE
          )

          if (!authorizedResponse) {
            return new Response('Unauthorized', { status: 401 })
          }

          const response = new Response(null)
          return new Response(response.body, {
            response,
            ...authorizedResponse
          })
        }

        case '/api/websocket': {
          if (authorized && authorization.accessToken) {
            if (request.headers.get('Upgrade') === 'websocket') {
              return await handleWebSocketRequest(request, env)
            } else {
              return new Response('WebSocket expected', { status: 400 })
            }
          }
          // falls through
        }

        default:
          return new Response('Not found', { status: 404 })
      }
    } catch (error) {
      return new Response(error.message)
    }
  }
}

async function handleWebSocketRequest(request, env) {
  // list identifier goes here; hardcoded for now so we only have a single Durable Object (list) for everyone
  let id = env.LIST.idFromName('SOME_UNIQUE_LIST_ID')
  let durableObject = env.LIST.get(id)

  let response = await durableObject.fetch(request)

  return response
}

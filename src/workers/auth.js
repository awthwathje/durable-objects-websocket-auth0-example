import cookie from 'cookie'

const cookieKey = 'AUTH0-AUTH'

const redirectUrl = (state, { domain, clientId, callbackUrl }) => {
  return `${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}&scope=openid%20profile%20email&state=${encodeURIComponent(
    state
  )}`
}

const generateStateParam = async (AUTH_STORE) => {
  const resp = await fetch('https://csprng.xyz/v1/api')
  const { Data: state } = await resp.json()
  await AUTH_STORE.put(`state-${state}`, true, { expirationTtl: 60 })
  return state
}

const verify = async (request, AUTH_STORE) => {
  const cookieHeader = request.headers.get('Cookie')

  if (cookieHeader && cookieHeader.includes(cookieKey)) {
    const cookies = cookie.parse(cookieHeader)
    if (!cookies[cookieKey]) return {}
    const sub = cookies[cookieKey]

    const kvData = await AUTH_STORE.get(sub)
    if (!kvData) {
      throw new Error('Unable to find authorization data')
    }

    let kvStored
    try {
      kvStored = JSON.parse(kvData)
    } catch (err) {
      throw new Error('Unable to parse auth information from Workers KV')
    }

    const { access_token: accessToken, id_token: idToken } = kvStored
    const userInfo = JSON.parse(decodeJWT(idToken))
    return { accessToken, idToken, userInfo }
  }
  return {}
}

// Returns an array with the format
//   [authorized, context]
export const authorize = async (request, env, AUTH_STORE) => {
  const authorization = await verify(request, AUTH_STORE)

  if (authorization.accessToken) {
    return [true, { authorization }]
  } else {
    const state = await generateStateParam(AUTH_STORE)
    return [false, { redirectUrl: redirectUrl(state, env) }]
  }
}

const decodeJWT = function (token) {
  var output = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  switch (output.length % 4) {
    case 0:
      break
    case 2:
      output += '=='
      break
    case 3:
      output += '='
      break
    default:
      throw 'Illegal base64url string!'
  }

  const result = atob(output)

  try {
    return decodeURIComponent(escape(result))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    return result
  }
}

const validateToken = (token, { domain, clientId }) => {
  try {
    const dateInSecs = (d) => Math.ceil(Number(d) / 1000)
    const date = new Date()

    let iss = token.iss

    // ISS can include a trailing slash but should otherwise be identical to
    // the AUTH0_ISSUER_BASE_URL, so we should remove the trailing slash if it exists
    iss = iss.endsWith('/') ? iss.slice(0, -1) : iss

    if (iss !== domain) {
      throw new Error(
        `Token iss value (${iss}) doesn’t match AUTH0_ISSUER_BASE_URL (${domain})`
      )
    }

    if (token.aud !== clientId) {
      throw new Error(
        `Token aud value (${token.aud}) doesn’t match AUTH0_CLIENT_ID (${clientId})`
      )
    }

    if (token.exp < dateInSecs(date)) {
      throw new Error(`Token exp value is before current time`)
    }

    // Token should have been issued within the last day
    date.setDate(date.getDate() - 1)
    if (token.iat < dateInSecs(date)) {
      throw new Error('Token was issued before one day ago and is now invalid')
    }

    return true
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message)
    return false
  }
}

const persistAuth = async (exchange, env, AUTH_STORE) => {
  const body = await exchange.json()

  if (body.error) {
    throw new Error(body.error)
  }

  const decoded = JSON.parse(decodeJWT(body.id_token))

  const validToken = validateToken(decoded, env)
  if (!validToken) {
    return { status: 401 }
  }

  const text = new TextEncoder().encode(`${env.salt}-${decoded.sub}`)
  const digest = await crypto.subtle.digest({ name: 'SHA-256' }, text)
  const digestArray = new Uint8Array(digest)
  const id = btoa(String.fromCharCode.apply(null, digestArray))

  await AUTH_STORE.put(id, JSON.stringify(body))

  const date = new Date()
  date.setDate(date.getDate() + 1)

  const headers = {
    Location: '/',
    'Set-cookie': `${cookieKey}=${id}; Secure; HttpOnly; Path=/api; SameSite=Lax; Expires=${date.toUTCString()}`
  }

  return { headers, status: 302 }
}

const exchangeCode = async (code, env, AUTH_STORE) => {
  const body = JSON.stringify({
    grant_type: 'authorization_code',
    client_id: env.clientId,
    client_secret: env.clientSecret,
    code,
    redirect_uri: env.callbackUrl
  })

  return persistAuth(
    await fetch(env.domain + '/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body
    }),
    env,
    AUTH_STORE
  )
}

export const handleRedirect = async (request, env, AUTH_STORE) => {
  const url = new URL(request.url)

  const state = url.searchParams.get('state')
  if (!state) {
    return null
  }

  const storedState = await AUTH_STORE.get(`state-${state}`)
  if (!storedState) {
    return null
  }

  const code = url.searchParams.get('code')
  if (code) {
    return exchangeCode(code, env, AUTH_STORE)
  }

  return null
}

export const logout = (cookieHeader) => {
  if (cookieHeader && cookieHeader.includes(cookieKey)) {
    return {
      headers: {
        'Set-cookie': `${cookieKey}=""; Secure; HttpOnly; Path=/api; SameSite=Lax`
      }
    }
  }
  return {}
}

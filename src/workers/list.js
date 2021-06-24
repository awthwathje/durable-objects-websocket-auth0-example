module.exports = class List {
  constructor(state) {
    this.state = state
    this.sessions = []
  }

  async initialize() {
    // nothing here. yet
  }

  static async uniqueId() {
    // this is Cloudflare's own service to generate unique strings of text. it is very fast
    const { Data: id } = await (await fetch('https://csprng.xyz/v1/api')).json()
    return id
  }

  clearSession(session, webSocket) {
    this.sessions = this.sessions.filter((_session) => _session !== session)
    webSocket.close(1011, 'WebSocket closed.')
  }

  broadcast(message) {
    this.sessions.forEach((session) => {
      session.webSocket.send(JSON.stringify(message))
    })
  }

  async items() {
    return (await this.state.storage.get('ITEMS')) || []
  }

  async handleSession(webSocket) {
    webSocket.accept()

    let session = { webSocket }
    this.sessions.push(session)

    webSocket.addEventListener('message', async ({ data }) => {
      try {
        const { action, payload } = JSON.parse(data)
        let response

        switch (action) {
          case 'LIST': {
            const list = await this.items()

            response = {
              action: 'LIST',
              payload: list
            }

            break
          }

          case 'ADD': {
            const { caption, isChecked } = payload

            const items = await this.items()
            const id = await List.uniqueId()

            const item = { id, caption, isChecked }

            items.push(item)

            await this.state.storage.put('ITEMS', items)

            response = {
              action: 'ADD',
              payload: items
            }

            break
          }

          case 'CHECK': {
            const items = await this.items()

            const item = items.find(({ id }) => id === payload.id)

            item.isChecked = true

            await this.state.storage.put('ITEMS', items)

            response = {
              action: 'CHECK',
              payload: items
            }

            break
          }

          case 'UNCHECK': {
            const items = await this.items()

            const item = items.find(({ id }) => id === payload.id)
            item.isChecked = false

            await this.state.storage.put('ITEMS', items)

            response = {
              action: 'UNCHECK',
              payload: items
            }

            break
          }

          case 'CLEAR': {
            await this.state.storage.deleteAll()

            response = {
              action: 'CLEAR',
              payload: []
            }

            break
          }

          default: {
            response = {
              message: 'Action was not recognized by the API.'
            }
          }
        }

        this.broadcast(response)
      } catch (err) {
        webSocket.send(JSON.stringify({ error: err.stack }))
      }
    })

    webSocket.addEventListener('close', () => {
      this.clearSession(session, webSocket)
    })

    webSocket.addEventListener('error', () => {
      this.clearSession(session, webSocket)
    })
  }

  async fetch(request) {
    if (!this.initializePromise) {
      this.initializePromise = this.initialize().catch((err) => {
        this.initializePromise = undefined
        throw err
      })
    }
    await this.initializePromise

    let url = new URL(request.url)

    switch (url.pathname) {
      case '/api/websocket': {
        // eslint-disable-next-line no-undef
        const [client, server] = Object.values(new WebSocketPair())

        await this.handleSession(server)

        return new Response(null, { status: 101, webSocket: client })
      }

      default:
        return new Response('Not found', { status: 404 })
    }
  }
}

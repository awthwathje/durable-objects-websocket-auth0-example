import axios from 'axios'
import Router from 'next/router'
import getConfig from 'next/config'
import { eventChannel } from 'redux-saga'
import { call, put, StrictEffect, take } from 'redux-saga/effects'
import {
  processIncomingMessage,
  storeWebSocket,
  storeWebSocketStatus
} from 'store/actions'

const {
  publicRuntimeConfig: { webSocketUrl }
} = getConfig()

const webSocketChannel = (ws: WebSocket) =>
  eventChannel((emitter) => {
    ws.addEventListener('message', (event: MessageEvent) => {
      return emitter(processIncomingMessage(JSON.parse(event.data)))
    })

    ws.addEventListener('open', () => {
      return emitter(storeWebSocketStatus('OPEN'))
    })

    ws.addEventListener('close', () => {
      return emitter(storeWebSocketStatus('CLOSED'))
    })

    ws.addEventListener('error', () => {
      return emitter(storeWebSocketStatus('ERROR'))
    })

    return () => {
      // eslint-disable-next-line no-console
      console.info('WebSocket unsubscribing')
    }
  })

export default function* openWebSocketSaga(): Generator<
  StrictEffect,
  void,
  any
> {
  try {
    yield call(axios.get, '/api/auth/status')

    const webSocket = new WebSocket(webSocketUrl)

    yield put(storeWebSocket(webSocket))

    const channel = yield call(webSocketChannel, webSocket)

    while (true) {
      const action = yield take(channel)
      yield put(action)
    }
  } catch (error) {
    // legitimate status code from the edge, user needs to be authenticated there
    if (error?.response?.status === 401) {
      yield call(Router.push, '/api/auth/login')
    }
  }
}

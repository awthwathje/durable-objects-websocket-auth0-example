import { select } from '@redux-saga/core/effects'
import { StrictEffect } from 'redux-saga/effects'
import { StoreWebSocketStatus } from 'store/actions'
import { selectWebSocket } from 'store/selectors'

export default function* storeWebSocketStatusSaga({
  payload: webSocketStatus
}: StoreWebSocketStatus): Generator<StrictEffect, void, any> {
  if (webSocketStatus === 'OPEN') {
    const webSocket = yield select(selectWebSocket)
    webSocket.send(JSON.stringify({ action: 'LIST' }))
  }
}

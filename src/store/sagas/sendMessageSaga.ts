import { select } from '@redux-saga/core/effects'
import { StrictEffect } from 'redux-saga/effects'
import { SendMessage } from 'store/actions'
import { selectWebSocket } from 'store/selectors'

export default function* sendMessageSaga({
  payload
}: SendMessage): Generator<StrictEffect, void, any> {
  const webSocket = yield select(selectWebSocket)

  try {
    webSocket.send(JSON.stringify(payload))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send a message', error)
  }
}

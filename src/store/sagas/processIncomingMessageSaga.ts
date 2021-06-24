import { put } from '@redux-saga/core/effects'
import { StrictEffect } from 'redux-saga/effects'
import {
  ProcessIncomingMessage,
  storeAppStatus,
  storeList
} from 'store/actions'

export default function* processIncomingMessageSaga({
  payload: { action, payload }
}: ProcessIncomingMessage): Generator<StrictEffect, void, any> {
  if (['LIST', 'CHECK', 'UNCHECK', 'ADD', 'CLEAR'].includes(action)) {
    yield put(storeList(payload))
  }

  if (action === 'LIST') {
    yield put(storeAppStatus('HYDRATED'))
  }
}

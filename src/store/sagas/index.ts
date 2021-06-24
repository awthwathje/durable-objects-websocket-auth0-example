import { all, takeLatest } from 'redux-saga/effects'
import { ActionType } from '../actions'
import openWebSocketSaga from './openWebSocketSaga'
import processIncomingMessageSaga from './processIncomingMessageSaga'
import sendMessageSaga from './sendMessageSaga'
import storeWebSocketStatusSaga from './storeWebSocketStatusSaga'
import logout from './logout'

function* rootSaga(): Generator {
  yield all([takeLatest(ActionType.OPEN_WEB_SOCKET, openWebSocketSaga)])
  yield all([takeLatest(ActionType.SEND_MESSAGE, sendMessageSaga)])
  yield all([
    takeLatest(ActionType.PROCESS_INCOMING_MESSAGE, processIncomingMessageSaga)
  ])
  yield all([
    takeLatest(ActionType.STORE_WEBSOCKET_STATUS, storeWebSocketStatusSaga)
  ])
  yield all([takeLatest(ActionType.LOGOUT, logout)])
}

export default rootSaga

import { createAction } from '@reduxjs/toolkit'

export enum ActionType {
  OPEN_WEB_SOCKET = 'OPEN_WEB_SOCKET',
  PROCESS_INCOMING_MESSAGE = 'PROCESS_INCOMING_MESSAGE',
  STORE_WEB_SOCKET = 'STORE_WEB_SOCKET',
  SEND_MESSAGE = 'SEND_MESSAGE',
  STORE_LIST = 'STORE_LIST',
  STORE_WEBSOCKET_STATUS = 'STORE_WEBSOCKET_STATUS',
  LOGOUT = 'LOGOUT',
  STORE_APP_STATUS = 'STORE_APP_STATUS'
}

interface Action {
  readonly type: ActionType
}

export interface Item {
  id: string
  caption: string
  isChecked: boolean
}

export interface ProcessIncomingMessage extends Action {
  readonly payload: {
    action: 'LIST' | 'CHECK' | 'UNCHECK' | 'ADD' | 'CLEAR'
    payload: Item[]
  }
}

export interface StoreWebSocket extends Action {
  readonly payload: WebSocket
}

export interface SendMessage extends Action {
  readonly payload: Record<string, unknown>
}

export interface StoreList extends Action {
  readonly payload: Item[]
}

export type WebSocketStatus = 'CLOSED' | 'OPEN' | 'ERROR'

export type AppStatus = 'INIT' | 'HYDRATED'

export interface StoreWebSocketStatus extends Action {
  readonly payload: WebSocketStatus
}

export interface StoreAppStatus extends Action {
  readonly payload: AppStatus
}

export interface Logout extends Action {
  readonly payload: () => void
}

export const openWebSocket = createAction(ActionType.OPEN_WEB_SOCKET)

export const processIncomingMessage = createAction<
  ProcessIncomingMessage['payload']
>(ActionType.PROCESS_INCOMING_MESSAGE)

export const storeWebSocket = createAction<StoreWebSocket['payload']>(
  ActionType.STORE_WEB_SOCKET
)

export const sendMessage = createAction<SendMessage['payload']>(
  ActionType.SEND_MESSAGE
)

export const storeList = createAction<StoreList['payload']>(
  ActionType.STORE_LIST
)

export const storeWebSocketStatus = createAction<
  StoreWebSocketStatus['payload']
>(ActionType.STORE_WEBSOCKET_STATUS)

export const storeAppStatus = createAction<StoreAppStatus['payload']>(
  ActionType.STORE_APP_STATUS
)

export const logout = createAction<Logout['payload']>(ActionType.LOGOUT)

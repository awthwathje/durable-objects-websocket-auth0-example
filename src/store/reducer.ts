import { AnyAction } from '@reduxjs/toolkit'
import { State } from 'store/store'
import { ActionType } from './actions'
import initialState from './initialState'

const rootReducer = (
  state: State | undefined,
  { type, payload }: AnyAction
): State => {
  if (!state) {
    return initialState
  }

  switch (type) {
    case ActionType.STORE_WEB_SOCKET:
      return {
        ...state,
        global: {
          ...state.global,
          webSocket: payload
        }
      }

    case ActionType.STORE_WEBSOCKET_STATUS:
      return {
        ...state,
        global: {
          ...state.global,
          webSocketStatus: payload
        }
      }

    case ActionType.STORE_APP_STATUS:
      return {
        ...state,
        global: {
          ...state.global,
          appStatus: payload
        }
      }

    case ActionType.STORE_LIST:
      return {
        ...state,
        list: payload
      }

    default:
      return state
  }
}

export default rootReducer

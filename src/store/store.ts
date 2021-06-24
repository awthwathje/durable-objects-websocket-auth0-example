import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import { Middleware, Store } from '@reduxjs/toolkit'
import rootReducer from './reducer'
import rootSaga from './sagas'
import initialState from './initialState'
import { AppStatus, Item, WebSocketStatus } from './actions'

declare module '@reduxjs/toolkit' {
  interface Store {
    sagaTask: unknown
    close: unknown
  }
}

export interface State {
  readonly global: {
    webSocket: WebSocket | null
    webSocketStatus: WebSocketStatus
    appStatus: AppStatus
  }
  readonly list: Item[]
}

const bindMiddleware = (middleware: Middleware<unknown, unknown>[]) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { composeWithDevTools } = require('redux-devtools-extension')
  return composeWithDevTools(applyMiddleware(...middleware))
}

export const makeStore = (): Store => {
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    rootReducer,
    initialState,
    bindMiddleware([sagaMiddleware])
  )

  store.sagaTask = sagaMiddleware.run(rootSaga)
  store.close = () => store.dispatch(END)

  return store
}

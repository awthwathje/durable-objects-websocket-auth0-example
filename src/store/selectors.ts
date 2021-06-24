import { createSelector } from '@reduxjs/toolkit'
import { State } from './store'

export const selectWebSocket = createSelector(
  (state: State) => state.global,
  (global) => global.webSocket
)

export const selectList = createSelector(
  (state: State) => state.list,
  (list) => list
)

export const selectWebSocketStatus = createSelector(
  (state: State) => state.global,
  (global) => global.webSocketStatus
)

export const selectAppStatus = createSelector(
  (state: State) => state.global,
  (global) => global.appStatus
)

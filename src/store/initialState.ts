import { State } from 'store/store'

const initialState: State = {
  global: {
    webSocket: null,
    webSocketStatus: 'CLOSED',
    appStatus: 'INIT'
  },
  list: []
}

export default initialState

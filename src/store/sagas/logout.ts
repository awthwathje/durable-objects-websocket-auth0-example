import { call, StrictEffect } from 'redux-saga/effects'
import axios from 'axios'
import { Logout } from 'store/actions'

export default function* logoutSaga({
  payload: logoutFn
}: Logout): Generator<StrictEffect, void, any> {
  // logout from the edge
  yield call(axios.get, '/api/auth/logout')

  // logout the client
  yield call(logoutFn)
}

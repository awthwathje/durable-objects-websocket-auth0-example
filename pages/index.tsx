import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth0 } from '@auth0/auth0-react'
import { connect } from 'react-redux'
import style from './index.module.scss'
import {
  openWebSocket as _openWebSocket,
  sendMessage as _sendMessage,
  logout as _logout,
  SendMessage,
  Logout,
  AppStatus
} from 'store/actions'
import { State } from 'store/store'
import { selectList, selectAppStatus } from 'store/selectors'

interface Props {
  readonly list: State['list']
  readonly appStatus: AppStatus
}

interface PropsWithDispatchers extends Props {
  openWebSocket(): unknown
  sendMessage(payload: SendMessage['payload']): unknown
  logout(payload: Logout['payload']): unknown
}

const Home = ({
  list,
  appStatus,
  openWebSocket,
  sendMessage,
  logout
}: PropsWithDispatchers): JSX.Element => {
  const router = useRouter()

  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout: logoutFn
  } = useAuth0()

  useEffect(() => {
    if (isAuthenticated) {
      openWebSocket()
    }
  }, [router, openWebSocket, isAuthenticated])

  const [newItem, setNewItem]: [string, Dispatch<SetStateAction<string>>] =
    useState('')

  const addNewItem = (caption: string, isChecked: boolean) => {
    sendMessage({
      action: 'ADD',
      payload: {
        caption,
        isChecked
      }
    })
    setNewItem('')
  }

  if (isLoading) {
    return <div className={style.loading} />
  }

  if (!isAuthenticated) {
    return (
      <button className={style.login} onClick={loginWithRedirect}>
        Login
      </button>
    )
  }

  return (
    <div className={style.container}>
      <Head>
        <title>Cloud List</title>
      </Head>

      <header className={style.header}>
        <span>{user?.given_name}</span>

        <button
          onClick={() => {
            logout(logoutFn)
          }}
        >
          logout
        </button>
      </header>

      {appStatus === 'HYDRATED' && (
        <>
          <main className={style.main}>
            {list.length > 0 ? (
              <ul className={style.list}>
                {list.map(({ id, caption, isChecked }) => (
                  <li key={id}>
                    <input
                      {...{ id }}
                      type="checkbox"
                      checked={isChecked}
                      onChange={({ target: { checked } }) => {
                        sendMessage({
                          action: checked ? 'CHECK' : 'UNCHECK',
                          payload: {
                            id,
                            isChecked: checked
                          }
                        })
                      }}
                    />
                    <label htmlFor={id}>{caption}</label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={style.empty}>
                List is empty.
                <br />
                Let&apos;s add something?
              </div>
            )}

            <section className={style.new}>
              <input
                type="text"
                value={newItem}
                onChange={({ target: { value } }) => {
                  setNewItem(value)
                }}
                onKeyPress={({ key }) => {
                  if (key === 'Enter') {
                    addNewItem(newItem, false)
                  }
                }}
              ></input>

              <button
                onClick={() => {
                  addNewItem(newItem, false)
                }}
                disabled={!newItem}
              >
                {`Add ${newItem}`}
              </button>
            </section>
          </main>

          <footer className={style.footer}>
            <button
              onClick={() => {
                sendMessage({
                  action: 'CLEAR'
                })
              }}
              disabled={list.length === 0}
            >
              remove everything
            </button>
          </footer>
        </>
      )}
    </div>
  )
}

export default connect(
  (state: State) => ({
    list: selectList(state),
    appStatus: selectAppStatus(state)
  }),
  {
    openWebSocket: _openWebSocket,
    sendMessage: _sendMessage,
    logout: _logout
  }
)(Home)

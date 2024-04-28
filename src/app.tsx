import axios, { AxiosError } from 'axios'
import Router from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import IAM from 'iam-mtaylor-io-js'

import { CreateGroup } from './create/group'
import { CreatePolicy } from './create/policy'
import { CreateUser } from './create/user'
import { Login } from './login'
import { HeaderMenu, SideMenu } from './menu'
import { ShowUser } from './show/user'
import { ShowGroups } from './show/groups'
import { ShowPolicy } from './show/policy'
import { ShowPolicies } from './show/policies'
import { ShowUsers } from './show/users'
import { ShowGroup } from './show/group'
import './app.css'


const client = new IAM()


export function App() {
  const [id, setId] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const login = async () => {
    await client.login(id, secretKey)

    if (client.sessionId === null || client.sessionToken === null) {
      return
    }

    localStorage.setItem('MTAYLOR_IO_ID', id)
    localStorage.setItem('MTAYLOR_IO_SECRET_KEY', secretKey)
    localStorage.setItem('MTAYLOR_IO_SESSION_ID', client.sessionId)
    localStorage.setItem('MTAYLOR_IO_SESSION_TOKEN', client.sessionToken)

    setSessionId(client.sessionId)
    setId('')
    setSecretKey('')
  }

  const logout = async () => {
    await client.logout()

    localStorage.removeItem('MTAYLOR_IO_ID')
    localStorage.removeItem('MTAYLOR_IO_SECRET_KEY')
    localStorage.removeItem('MTAYLOR_IO_SESSION_ID')
    localStorage.removeItem('MTAYLOR_IO_SESSION_TOKEN')

    setSessionId(null)
  }

  useEffect(() => {
    const tryReloadSession = async () => {
      const id = localStorage.getItem('MTAYLOR_IO_ID')
      const secretKey = localStorage.getItem('MTAYLOR_IO_SECRET_KEY')
      const sessionId = localStorage.getItem('MTAYLOR_IO_SESSION_ID')
      const sessionToken = localStorage.getItem('MTAYLOR_IO_SESSION_TOKEN')
      if (id && secretKey && sessionId && sessionToken) {
        try {
          await client.refresh(id, secretKey, sessionId, sessionToken)
          setSessionId(client.sessionId)
        } catch (e) {
          const err = e as Error | AxiosError
          if (!axios.isAxiosError(err)) {
            throw e
          }
          if (err.response?.status === 401) {
            console.log('Session expired')
            localStorage.removeItem('MTAYLOR_IO_ID')
            localStorage.removeItem('MTAYLOR_IO_SECRET_KEY')
            localStorage.removeItem('MTAYLOR_IO_SESSION_ID')
            localStorage.removeItem('MTAYLOR_IO_SESSION_TOKEN')
            client.logout()
          }
        }
      }
    }

    tryReloadSession()
  }, [])

  if (sessionId === null) {
    return (
      <>
        <Login login={login} id={id} secretKey={secretKey}
          setId={setId} setSecretKey={setSecretKey}/>
      </>
    )
  } else {
    return (
      <>
        <HeaderMenu client={client} logout={logout} />
        <div class="wrapper">
          <div class="container">
            <SideMenu />
            <main class="content">
              <Router>
                <ShowUsers path="/" client={client}/>
                <CreateGroup path="/create/group" client={client}/>
                <CreatePolicy path="/create/policy" client={client}/>
                <CreateUser path="/create/user" client={client}/>
                <ShowUsers path="/users" client={client}/>
                <ShowUser path="/users/:id" client={client} />
                <ShowGroups path="/groups" client={client} />
                <ShowGroup path="/groups/:id" client={client} />
                <ShowPolicies path="/policies" client={client} />
                <ShowPolicy path="/policies/:id" client={client} />
              </Router>
            </main>
          </div>
        </div>
      </>
    )
  }
}

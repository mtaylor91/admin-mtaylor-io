import axios, { AxiosError } from 'axios'
import Router from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import IAM from 'iam-mtaylor-io-js'
import Events from 'events-mtaylor-io-js'

import { NotFound } from './error/404'
import { CreateChat } from './create/chat'
import { CreateGroup } from './create/group'
import { CreatePolicy } from './create/policy'
import { CreateUser } from './create/user'
import { CreateTopic } from './create/topic'
import { EditUserName, EditUserEmail } from './edit/user'
import { Login } from './login'
import { HeaderMenu, SideMenu } from './menu'
import { ShowChats } from './show/chats'
import { ShowUser } from './show/user'
import { ShowGroups } from './show/groups'
import { ShowPolicy } from './show/policy'
import { ShowPolicies } from './show/policies'
import { ShowUsers } from './show/users'
import { ShowGroup } from './show/group'
import { ShowSessions } from './show/sessions'
import { ShowSession } from './show/session'
import { ShowPageViews } from './show/pageviews'
import { ShowTopics } from './show/topics'
import './app.css'


const iam = new IAM()
const events = new Events(iam)


export function App() {
  const [id, setId] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const login = async () => {
    await iam.login(id, secretKey)

    if (iam.sessionId === null || iam.sessionToken === null) {
      return
    }

    localStorage.setItem('MTAYLOR_IO_ID', id)
    localStorage.setItem('MTAYLOR_IO_SECRET_KEY', secretKey)
    localStorage.setItem('MTAYLOR_IO_SESSION_ID', iam.sessionId)
    localStorage.setItem('MTAYLOR_IO_SESSION_TOKEN', iam.sessionToken)

    setSessionId(iam.sessionId)
    setId('')
    setSecretKey('')
  }

  const logout = async () => {
    localStorage.removeItem('MTAYLOR_IO_ID')
    localStorage.removeItem('MTAYLOR_IO_SECRET_KEY')
    localStorage.removeItem('MTAYLOR_IO_SESSION_ID')
    localStorage.removeItem('MTAYLOR_IO_SESSION_TOKEN')
    setSessionId(null)
    await iam.logout()
  }

  useEffect(() => {
    const tryReloadSession = async () => {
      const id = localStorage.getItem('MTAYLOR_IO_ID')
      const secretKey = localStorage.getItem('MTAYLOR_IO_SECRET_KEY')
      const sessionId = localStorage.getItem('MTAYLOR_IO_SESSION_ID')
      const sessionToken = localStorage.getItem('MTAYLOR_IO_SESSION_TOKEN')
      if (id && secretKey && sessionId && sessionToken) {
        try {
          await iam.refresh(id, secretKey, sessionId, sessionToken)
          setSessionId(iam.sessionId)
        } catch (e) {
          const err = e as Error | AxiosError
          if (!axios.isAxiosError(err)) {
            throw e
          }
          if (err.response?.status === 401) {
            console.log('Session expired')
            logout()
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
        <HeaderMenu iam={iam} logout={logout} />
        <div class="wrapper">
          <div class="container">
            <SideMenu />
            <main class="content">
              <Router>
                <NotFound default />
                <ShowUsers path="/" iam={iam}/>
                <ShowChats path="/chats" iam={iam} events={events} />
                <CreateChat path="/create/chat" iam={iam} events={events} />
                <CreateGroup path="/create/group" iam={iam}/>
                <CreatePolicy path="/create/policy" iam={iam}/>
                <CreateUser path="/create/user" iam={iam}/>
                <CreateTopic path="/create/topic" events={events} />
                <EditUserName path="/edit/user/:id/name" iam={iam}/>
                <EditUserEmail path="/edit/user/:id/email" iam={iam}/>
                <ShowUsers path="/users" iam={iam}/>
                <ShowUser path="/users/:id" iam={iam} />
                <ShowGroups path="/groups" iam={iam} />
                <ShowGroup path="/groups/:id" iam={iam} />
                <ShowPolicies path="/policies" iam={iam} />
                <ShowPolicy path="/policies/:id" iam={iam} />
                <ShowSessions path="/sessions" iam={iam} events={events} />
                <ShowSession path="/sessions/:id" iam={iam} events={events} />
                <ShowPageViews path="/pageviews" events={events} />
                <ShowTopics path="/topics" iam={iam} events={events} />
              </Router>
            </main>
          </div>
        </div>
      </>
    )
  }
}

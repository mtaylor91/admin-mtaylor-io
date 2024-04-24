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


export function App() {
  const [email, setEmail] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')
  const [client, setClient] = useState<IAM | null>(null)

  const login = async () => {
    const iam = new IAM()
    await iam.login(email, secretKey)

    if (iam.sessionId === null || iam.sessionToken === null) {
      throw new Error('Failed to login')
    }

    localStorage.setItem('MTAYLOR_IO_EMAIL', email)
    localStorage.setItem('MTAYLOR_IO_SECRET_KEY', secretKey)
    localStorage.setItem('MTAYLOR_IO_SESSION_ID', iam.sessionId)
    localStorage.setItem('MTAYLOR_IO_SESSION_TOKEN', iam.sessionToken)
    setClient(iam)
  }

  const logout = async () => {
    if (client === null) {
      return
    }

    await client.logout()
    localStorage.removeItem('MTAYLOR_IO_EMAIL')
    localStorage.removeItem('MTAYLOR_IO_SECRET_KEY')
    localStorage.removeItem('MTAYLOR_IO_SESSION_ID')
    localStorage.removeItem('MTAYLOR_IO_SESSION_TOKEN')
    setClient(null)
  }

  useEffect(() => {
    const tryReloadSession = async () => {
      const email = localStorage.getItem('MTAYLOR_IO_EMAIL')
      const secretKey = localStorage.getItem('MTAYLOR_IO_SECRET_KEY')
      const sessionId = localStorage.getItem('MTAYLOR_IO_SESSION_ID')
      const sessionToken = localStorage.getItem('MTAYLOR_IO_SESSION_TOKEN')
      if (email && secretKey && sessionId && sessionToken) {
        const iam = new IAM()
        await iam.refresh(email, secretKey, sessionId, sessionToken)
        setClient(iam)
      }
    }

    tryReloadSession()
  }, [])

  if (client === null) {
    return (
      <>
        <Login login={login} email={email} secretKey={secretKey}
          setEmail={setEmail} setSecretKey={setSecretKey}/>
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

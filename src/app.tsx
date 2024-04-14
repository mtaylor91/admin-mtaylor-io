import Router from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM from 'iam-mtaylor-io-js'
import { Login } from './login'
import { Menu } from './menu'
import { UserView } from './user'
import { UsersView } from './users'
import { GroupView } from './group'
import { GroupsView } from './groups'
import { PolicyView } from './policy'
import { PoliciesView } from './policies'
import './app.css'


export function App() {
  const [client, setClient] = useState<IAM | null>(null)
  const [email, setEmail] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')

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
      <div class="container">
        <Login login={login} email={email} secretKey={secretKey}
          setEmail={setEmail} setSecretKey={setSecretKey}/>
      </div>
    )
  } else {
    return (
      <div class="container">
        <Menu client={client} logout={logout} />
        <Router>
          <UsersView path="/" client={client}/>
          <UsersView path="/users" client={client}/>
          <UserView path="/users/:id" client={client} />
          <GroupsView path="/groups" client={client} />
          <GroupView path="/groups/:id" client={client} />
          <PoliciesView path="/policies" client={client} />
          <PolicyView path="/policies/:id" client={client} />
        </Router>
      </div>
    )
  }
}

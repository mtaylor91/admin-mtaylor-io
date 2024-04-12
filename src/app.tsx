import { useState } from 'preact/hooks'
import IAM, { UserClient } from 'iam-mtaylor-io-js'
import './app.css'


export function Login({ setClient }) {
  const [email, setEmail] = useState('')
  const [secretKey, setSecretKey] = useState('')


  const login = async () => {
    const client = await IAM.client(email, secretKey)
    const user = await client.user.getUser()
    setClient(client)
  }

  return (
    <form onSubmit={e => { e.preventDefault(); login() }}>
      <h1>Login</h1>
      <input id="email" type="text" placeholder="Email" value={email}
        onInput={(e) => setEmail(e.target.value)} />
      <input id="password" type="password" placeholder="Secret Key" value={secretKey}
        onInput={(e) => setSecretKey(e.target.value)} />
      <button type="submit" value="Login">Login</button>
    </form>
  )
}


export function Dashboard({ client, setClient }) {
  const logout = () => {
    setClient(null)
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}


export function App() {
  const [client, setClient] = useState(null)

  if (client === null) {
    return <Login setClient={setClient} />
  } else {
    return <Dashboard client={client} setClient={setClient} />
  }
}

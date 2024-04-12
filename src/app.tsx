import Router from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { UserClient } from 'iam-mtaylor-io-js'
import './app.css'


function resolveGroupIdentifier(group) {
  if (typeof group === 'string') {
    return group
  } else {
    return group.name || group.id
  }
}


function resolveUserIdentifier(user) {
  if (typeof user === 'string') {
    return user
  } else {
    return user.email || user.id
  }
}


export function Login({ login, email, secretKey, setEmail, setSecretKey}) {
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


export function Users({ client }) {
  const [users, setUsers] = useState([])

  useEffect(async () => {
    const users = await client.users.listUsers()
    setUsers(users)
  }, [])

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => {
          const userId = resolveUserIdentifier(user)
          return (<li><a href={`/users/${userId}`}>{userId}</a></li>)
        })}
      </ul>
    </div>
  )
}


export function Groups({ client }) {
  const [groups, setGroups] = useState([])

  useEffect(async () => {
    const groups = await client.groups.listGroups()
    setGroups(groups)
  }, [])

  return (
    <div>
      <h1>Groups</h1>
      <ul>
        {groups.map(group => {
          const groupId = resolveGroupIdentifier(group)
          return (<li><a href={`/groups/${groupId}`}>{groupId}</a></li>)
        })}
      </ul>
    </div>
  )
}


export function Policies({ client }) {
  const [policies, setPolicies] = useState([])

  useEffect(async () => {
    const policies = await client.policies.listPolicies()
    setPolicies(policies)
  }, [])

  return (
    <div>
      <h1>Policies</h1>
      <ul>
        {policies.map(policy => {
          return (<li><a href={`/policies/${policy}`}>{policy}</a></li>)
        })}
      </ul>
    </div>
  )
}


export function User({ client, id }) {
  const [user, setUser] = useState(null)

  useEffect(async () => {
    const user = await client.users.getUser(id)
    setUser(user)
  }, [])

  if (user === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>User</h1>
      <p>{user.email || user.id}</p>
      <h3>Groups</h3>
      <ul>
        {user.groups.map(group => {
          const groupId = resolveGroupIdentifier(group)
          return (<li><a href={`/groups/${groupId}`}>{groupId}</a></li>)
        })}
      </ul>
      <h3>Policies</h3>
      <ul>
        {user.policies.map(policy => <li>{policy}</li>)}
      </ul>
    </div>
  )
}


export function Group({ client, id }) {  
  const [group, setGroup] = useState(null)

  useEffect(async () => {
    const group = await client.groups.getGroup(id)
    setGroup(group)
  }, [])

  if (group === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Group</h1>
      <p>{group.name || group.id}</p>
      <h3>Users</h3>
      <ul>
        {group.users.map(user => {
          const userId = resolveUserIdentifier(user)
          return (
            <li><a href={`/users/${userId}`}>{userId}</a></li>
          )
        })}
      </ul>
      <h3>Policies</h3>
      <ul>
        {group.policies.map(policyId => (
        <li><a href={`/policies/${policyId}`}>{policyId}</a></li>
        ))}
      </ul>
    </div>
  )
}


export function Policy({ client, id }) {
  const [policy, setPolicy] = useState(null)

  useEffect(async () => {
    const policy = await client.policies.getPolicy(id)
    console.log(policy)
    setPolicy(policy)
  }, [])

  if (policy === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Policy</h1>
      <p>{policy.id}</p>
      <h3>Statements</h3>
      <PolicyStatements statements={policy.statements} />
    </div>
  )
}


export function PolicyStatements({ statements }) {
  return statements.map(statement => {
    return (
      <div class="policy-statement">
        <h3>{statement.effect}</h3>
        <h3>{statement.action}</h3>
        <h3>{statement.resource}</h3>
      </div>
    )
  })
}


export function App() {
  const [client, setClient] = useState(null)
  const [email, setEmail] = useState('')
  const [secretKey, setSecretKey] = useState('')

  const login = async () => {
    const iam = new IAM()
    await iam.login(email, secretKey)
    localStorage.setItem('MTAYLOR_IO_EMAIL', email)
    localStorage.setItem('MTAYLOR_IO_SECRET_KEY', secretKey)
    localStorage.setItem('MTAYLOR_IO_SESSION_ID', iam.sessionId)
    localStorage.setItem('MTAYLOR_IO_SESSION_TOKEN', iam.sessionToken)
    setClient(iam)
  }

  const logout = async () => {
    await client.logout()
    localStorage.removeItem('MTAYLOR_IO_EMAIL')
    localStorage.removeItem('MTAYLOR_IO_SECRET_KEY')
    localStorage.removeItem('MTAYLOR_IO_SESSION_ID')
    localStorage.removeItem('MTAYLOR_IO_SESSION_TOKEN')
    setClient(null)
  }

  useEffect(async () => {
    const email = localStorage.getItem('MTAYLOR_IO_EMAIL')
    const secretKey = localStorage.getItem('MTAYLOR_IO_SECRET_KEY')
    const sessionId = localStorage.getItem('MTAYLOR_IO_SESSION_ID')
    const sessionToken = localStorage.getItem('MTAYLOR_IO_SESSION_TOKEN')
    if (email && secretKey && sessionId && sessionToken) {
      const iam = new IAM()
      await iam.refresh(email, secretKey, sessionId, sessionToken)
      setClient(iam)
    }
  }, [])

  if (client === null) {
    return (
      <Login login={login} email={email} secretKey={secretKey}
        setEmail={setEmail} setSecretKey={setSecretKey}/>
    )
  } else {
    return (
      <div class="container">
        <header class="menubar">
          Logged in as {client.userId}
          <button onClick={logout}>Logout</button>
        </header>
        <Router>
          <Users path="/" client={client} />
          <Users path="/users" client={client} />
          <User path="/users/:id" client={client} />
          <Groups path="/groups" client={client} />
          <Group path="/groups/:id" client={client} />
          <Policies path="/policies" client={client} />
          <Policy path="/policies/:id" client={client} />
        </Router>
      </div>
    )
  }
}

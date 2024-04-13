import Router from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM from 'iam-mtaylor-io-js'
import { User, Group, Policy } from 'iam-mtaylor-io-js'
import { UserIdentity, GroupIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import './app.css'


function resolveUserIdentifier(user: User | UserIdentity) {
  if (typeof user === 'string') {
    return user
  } else {
    return user.email || user.id
  }
}


function resolveGroupIdentifier(group: Group | GroupIdentity) {
  if (typeof group === 'string') {
    return group
  } else {
    return group.name || group.id
  }
}


function resolvePolicyIdentifier(policy: Policy | PolicyIdentity) {
  if (typeof policy === 'string') {
    return policy
  } else {
    return policy.name || policy.id
  }
}


interface LoginProps {
  login: () => void
  email: string
  secretKey: string
  setEmail: (email: string) => void
  setSecretKey: (secretKey: string) => void
}


export function Login({login, email, secretKey, setEmail, setSecretKey}: LoginProps) {
  const onInputEmail = (e: Event) => {
    setEmail((e.target as HTMLInputElement).value)
  }

  const onInputSecretKey = (e: Event) => {
    setSecretKey((e.target as HTMLInputElement).value)
  }

  return (
    <form onSubmit={e => { e.preventDefault(); login() }}>
      <h1>Login</h1>
      <input id="email" type="text" placeholder="Email"
        value={email} onInput={onInputEmail} />
      <input id="password" type="password" placeholder="Secret Key"
        value={secretKey} onInput={onInputSecretKey} />
      <button type="submit" value="Login">Login</button>
    </form>
  )
}


interface MenuProps {
  client: IAM
  logout: () => void
}


export function Menu({ client, logout }: MenuProps) {
  return (
    <header class="menubar">
      <span>Logged in as {client.userId}</span>
      <a href="/">Users</a>
      <a href="/groups">Groups</a>
      <a href="/policies">Policies</a>
      <button onClick={logout}>Logout</button>
    </header>
  )
}


interface UsersViewProps {
  client: IAM,
  path?: string
}


export function UsersView({ client }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const getUsers = async () => {
      const users = await client.users.listUsers()
      setUsers(users)
    }

    getUsers()
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


interface GroupsViewProps {
  client: IAM
  path?: string
}


export function GroupsView({ client }: GroupsViewProps) {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    const getGroups = async () => {
      const groups = await client.groups.listGroups()
      setGroups(groups)
    }

    getGroups()
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


interface PoliciesViewProps {
  client: IAM
  path?: string
}


export function PoliciesView({ client }: PoliciesViewProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  useEffect(() => {
    const getPolicies = async () => {
      const policies = await client.policies.listPolicies()
      setPolicies(policies)
    }

    getPolicies()
  }, [])

  return (
    <div>
      <h1>Policies</h1>
      <ul>
        {policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          return (<li><a href={`/policies/${policyId}`}>{policyId}</a></li>)
        })}
      </ul>
    </div>
  )
}


interface UserViewProps {
  client: IAM
  id?: string
  path?: string
}


export function UserView({ client, id }: UserViewProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getUser = async () => {
      const user = await client.users.getUser(id)
      setUser(user)
    }

    getUser()
  }, [id])

  if (user === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>User</h1>
      <p>{user.id}</p>
      {user.email && (
      <>
        <h3>Email</h3>
        <p>{user.email}</p>
      </>
      )}
      <h3>Groups</h3>
      <ul>
        {user.groups.map(group => {
          const groupId = resolveGroupIdentifier(group)
          return (<li><a href={`/groups/${groupId}`}>{groupId}</a></li>)
        })}
      </ul>
      <h3>Policies</h3>
      <ul>
        {user.policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          return (<li><a href={`/policies/${policyId}`}>{policyId}</a></li>)
        })}
      </ul>
    </div>
  )
}


interface GroupViewProps {
  client: IAM
  id?: string
  path?: string
}


export function GroupView({ client, id }: GroupViewProps) {
  const [group, setGroup] = useState<Group | null>(null)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getGroup = async () => {
      const group = await client.groups.getGroup(id)
      setGroup(group)
    }

    getGroup()
  }, [id])

  if (group === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Group</h1>
      <p>{group.id}</p>
      {group.name && (
      <>
        <h3>Name</h3>
        <p>{group.name}</p>
      </>
      )}
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
        {group.policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          return (<li><a href={`/policies/${policyId}`}>{policyId}</a></li>)
        })}
      </ul>
    </div>
  )
}


interface PolicyViewProps {
  client: IAM
  id?: string
  path?: string
}


export function PolicyView({ client, id }: PolicyViewProps) {
  const [policy, setPolicy] = useState<Policy | null>(null)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getPolicy = async () => {
      const policy = await client.policies.getPolicy(id)
      setPolicy(policy)
    }

    getPolicy()
  }, [])

  if (policy === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Policy</h1>
      <p>{policy.id}</p>
      {policy.name && (
      <>
        <h3>Name</h3>
        <p>{policy.name}</p>
      </>
      )}
      <h3>Hostname</h3>
      <p>{policy.hostname}</p>
      <h3>Statements</h3>
      <PolicyStatements policy={policy} />
    </div>
  )
}


interface PolicyStatementsProps {
  policy: Policy
}


export function PolicyStatements({ policy }: PolicyStatementsProps) {
  return (
    <div class="policy-statements">
    {policy.statements.map((statement, index) => {
      return (
        <div class="policy-statement" key={index}>
          <h3>{statement.effect}</h3>
          <h3>{statement.action}</h3>
          <h3>{statement.resource}</h3>
        </div>
      )
    })}
    </div>
  )
}


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
      <Login login={login} email={email} secretKey={secretKey}
        setEmail={setEmail} setSecretKey={setSecretKey}/>
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

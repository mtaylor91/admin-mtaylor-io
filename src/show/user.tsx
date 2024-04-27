import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM from 'iam-mtaylor-io-js'
import { LoginResponse, User, Session } from 'iam-mtaylor-io-js'
import { GroupIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolveGroupIdentifier } from '../util'
import { resolvePolicyIdentifier } from '../util'


interface UserViewProps {
  client: IAM
  id?: string
  path?: string
}


function UserName({ user }: { user: User }) {
  if (user.name) {
    return (
      <div class="section">
        <h3>Name</h3>
        <p class="background-dark border-radius">{user.name}</p>
      </div>
    )
  }

  return null
}


function UserEmail({ user }: { user: User }) {
  if (user.email) {
    return (
      <div class="section">
        <h3>Email</h3>
        <p class="background-dark border-radius">{user.email}</p>
      </div>
    )
  }

  return null
}


function UserGroups({ client, user }: { client: IAM, user: User }) {
  const thead = (
    <thead>
      <tr>
        <th>Name</th>
        <th>UUID</th>
        <th></th>
      </tr>
    </thead>
  )

  const tbody = (
    <tbody>
      {user.groups.map(group => {
        const onClickDelete = async () => {
          await client.groups.removeMember(group.id, user.id)
        }
        return (
          <tr>
            <td>
              {group.name && <a href={`/groups/${group.name}`}>{group.name}</a>}
            </td>
            <td>
              <a href={`/groups/${group.id}`}>{group.id}</a>
            </td>
            <td><button onClick={onClickDelete}>Remove</button></td>
          </tr>
        )
      })}
    </tbody>
  )

  return (
    <>
      <h3>Groups</h3>
      <table class="background-dark border-radius-top">
        {user.groups.length > 0 && thead}
        {tbody}
      </table>
    </>
  )
}


function UserPolicies({ client, user }: { client: IAM, user: User }) {
  const thead = (
    <thead>
      <tr>
        <th>Name</th>
        <th>UUID</th>
        <th></th>
      </tr>
    </thead>
  )

  const tbody = (
    <tbody>
      {user.policies.map(policy => {
        const onClickDelete = async () => {
          await client.users.detachPolicy(user.id, policy.id)
        }
        return (
          <tr>
            <td>
              {policy.name && <a href={`/policies/${policy.name}`}>{policy.name}</a>}
            </td>
            <td>
              <a href={`/policies/${policy.id}`}>{policy.id}</a>
            </td>
            <td><button onClick={onClickDelete}>Remove</button></td>
          </tr>
        )
      })}
    </tbody>
  )

  return (
    <>
      <h3>Policies</h3>
      <table class="background-dark border-radius-top">
        {user.policies.length > 0 && thead}
        {tbody}
      </table>
    </>
  )
}


function UserPublicKeys({ user }: { user: User }) {
  return (
    <>
      <h3>Public Keys</h3>
      <table class="background-dark border-radius">
        <thead>
          <tr>
            <th>Key</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {user.publicKeys.map(key => {
            return (
              <tr>
                <td>{key.key}</td>
                <td>{key.description}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


interface UserLoginsProps {
  client: IAM
  user: User
  logins: LoginResponse[]
}


function UserLogins({ client, user, logins }: UserLoginsProps) {
  const onClickDeny = async (event: Event, login: LoginResponse) => {
    event.preventDefault()
    await client.logins.denyLogin(login.id, user.id)
  }

  const onClickGrant = async (event: Event, login: LoginResponse) => {
    event.preventDefault()
    await client.logins.grantLogin(login.id, user.id)
  }

  const onClickDelete = async (event: Event, login: LoginResponse) => {
    event.preventDefault()
    await client.logins.deleteLogin(login.id, user.id)
  }

  return (
    <>
      <h3>Logins</h3>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>UUID</th>
            <th>Session</th>
            <th>Status</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logins.map(login => {
            return (
              <tr>
                <td>
                  <span>{login.ip}</span>
                </td>
                <td>
                  <span>{login.id}</span>
                </td>
                <td>
                  <span>{login.session}</span>
                </td>
                <td>
                  <span>{login.status}</span>
                </td>
                <td>
                  <button onClick={(event) => onClickGrant(event, login)}>
                    Grant
                  </button>
                </td>
                <td>
                  <button onClick={(event) => onClickDeny(event, login)}>
                    Deny
                  </button>
                </td>
                <td>
                  <button onClick={(event) => onClickDelete(event, login)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


interface UserSessionsProps {
  client: IAM
  user: User
  sessions: Session[]
}


function UserSessions({ client, user, sessions }: UserSessionsProps) {
  const onClickDelete = async (event: Event, session: Session) => {
    event.preventDefault()
    await client.sessions.deleteSession(session.id, user.id)
  }

  return (
    <>
      <h3>Sessions</h3>
      <table class="background-dark border-radius">
        <thead>
          <tr>
            <th>Session</th>
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            const idClass = session.id === client.sessionId ? 'active' : ''
            const addressClass = session.address === client.sessionAddress ? 'active' : ''
            return (
              <tr>
                <td>
                  <span class={idClass}>{session.id}</span>
                </td>
                <td>
                  <span class={addressClass}>{session.address}</span>
                </td>
                <td>
                  <button onClick={(event) => onClickDelete(event, session)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


interface AddGroupProps {
  client: IAM
  user: User
  setShowAddGroup: (showAddGroup: boolean) => void
}


function AddGroup({ client, user, setShowAddGroup }: AddGroupProps) {
  const [groups, setGroups] = useState<GroupIdentity[]>([])

  useEffect(() => {
    const getGroups = async () => {
      const response = await client.groups.listGroups()
      const groups = response.items
      setGroups(groups.filter(group =>
        !user.groups.some(userGroup =>
          resolveGroupIdentifier(userGroup) === resolveGroupIdentifier(group))))
    }

    getGroups()
  }, [])

  const onClickCancel = (event: Event) => {
    event.preventDefault()
    setShowAddGroup(false)
  }

  return (
    <div>
      <h1>Add Group</h1>
      <h3>Groups</h3>
      <ul>
        {groups.map(group => {
          const groupId = resolveGroupIdentifier(group)
          const onClickAddGroup = async (event: Event) => {
            event.preventDefault()
            await client.groups.addMember(groupId, user.id)
            setShowAddGroup(false)
          }
          return (
            <li>
              <button onClick={onClickAddGroup}>{groupId}</button>
            </li>
          )
        })}
      </ul>
      <button onClick={onClickCancel}>Cancel</button>
    </div>
  )
}


interface AddPolicyProps {
  client: IAM
  user: User
  setShowAddPolicy: (showAddPolicy: boolean) => void
}


function AddPolicy({ client, user, setShowAddPolicy }: AddPolicyProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  useEffect(() => {
    const getPolicies = async () => {
      const response = await client.policies.listPolicies()
      const policies = response.items
      setPolicies(policies.filter(policy =>
        !user.policies.some(userPolicy =>
          resolvePolicyIdentifier(userPolicy) === resolvePolicyIdentifier(policy))))
    }

    getPolicies()
  }, [])

  const onClickCancel = (event: Event) => {
    event.preventDefault()
    setShowAddPolicy(false)
  }

  return (
    <div>
      <h1>Add Policy</h1>
      <h3>Policies</h3>
      <ul>
        {policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          const onClickAddPolicy = async (event: Event) => {
            event.preventDefault()
            await client.users.attachPolicy(user.id, policyId)
            setShowAddPolicy(false)
          }
          return (
            <li>
              <button onClick={onClickAddPolicy}>{policyId}</button>
            </li>
          )
        })}
      </ul>
      <button onClick={onClickCancel}>Cancel</button>
    </div>
  )
}


export function ShowUser({ client, id }: UserViewProps) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logins, setLogins] = useState<LoginResponse[]>([])
  const [loginsError, setLoginsError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getUser = async () => {
      try {
        const user = await client.users.getUser(id)
        setUser(user)
        setError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    const getLogins = async () => {
      try {
        const response = await client.logins.listLogins(id)
        setLogins(response.items)
        setLoginsError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setLoginsError(error.response?.data?.error || error.message)
        throw error
      }
    }

    const getSessions = async () => {
      try {
        const response = await client.sessions.listSessions(id)
        setSessions(response.items)
        setSessionsError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setSessionsError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getUser()
    getLogins()
    getSessions()
  }, [id, showAddGroup, showAddPolicy])

  if (user === null) {
    return error ? <p class="error">{error}</p> : <p>Loading...</p>
  } else if (showAddGroup) {
    return <AddGroup client={client} user={user} setShowAddGroup={setShowAddGroup} />
  } else if (showAddPolicy) {
    return <AddPolicy client={client} user={user} setShowAddPolicy={setShowAddPolicy} />
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    try {
      await client.users.deleteUser(user.id)
      route('/users')
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.response?.data?.error || error.message)
      throw error
    }
  }

  return (
    <div class="section">
      <div class="section">
        <h1>User</h1>
        {error && <p class="error">{error}</p>}
        <p>{user.id}</p>
      </div>
      <UserName user={user} />
      <UserEmail user={user} />
      <div class="section">
        <UserGroups client={client} user={user} />
        <button class="background-dark border-radius-bottom"
          onClick={() => setShowAddGroup(true)}>
          Add Group
        </button>
      </div>
      <div class="section">
        <UserPolicies client={client} user={user} />
        <button class="background-dark border-radius-bottom"
          onClick={() => setShowAddPolicy(true)}>
          Add Policy
        </button>
      </div>
      {user.publicKeys.length > 0 &&
      <div class="section">
        <UserPublicKeys user={user} />
      </div>
      }
      {logins.length > 0 &&
      <div class="section">
        <UserLogins client={client} user={user} logins={logins} />
        {loginsError && <p class="error">{loginsError}</p>}
      </div>
      }
      {sessions.length > 0 &&
      <div class="section">
        <UserSessions client={client} user={user} sessions={sessions} />
        {sessionsError && <p class="error">{sessionsError}</p>}
      </div>
      }
      <button onClick={onClickDelete}>Delete</button>
    </div>
  )
}

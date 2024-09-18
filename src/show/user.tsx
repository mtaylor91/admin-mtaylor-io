import axios, { AxiosError } from 'axios'
import { Link } from 'preact-router/match'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM from 'iam-mtaylor-io-js'
import { LoginResponse, User, Session } from 'iam-mtaylor-io-js'
import { GroupIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolveGroupIdentifier } from '../util'
import { resolvePolicyIdentifier } from '../util'


interface UserViewProps {
  iam: IAM
  id?: string
  path?: string
}


function UserName({ user }: { user: User }) {
  if (user.name) {
    return (
      <div class="section">
        <h3>Name</h3>
        <p class="background-dark border-radius">{user.name}</p>
        <Link href={`/edit/user/${user.id}/name`}>Edit</Link>
      </div>
    )
  } else {
    return (
      <div class="section">
        <Link href={`/edit/user/${user.id}/name`}>Add Name</Link>
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
        <Link href={`/edit/user/${user.id}/email`}>Edit</Link>
      </div>
    )
  } else {
    return (
      <div class="section">
        <Link href={`/edit/user/${user.id}/email`}>Add Email</Link>
      </div>
    )
  }

  return null
}


interface UserGroupsProps {
  iam: IAM
  user: User
  refresh: () => void
}


function UserGroups({ iam, user, refresh }: UserGroupsProps) {
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
          await iam.groups.removeMember(group.id, user.id)
          refresh()
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


interface UserPoliciesProps {
  iam: IAM
  user: User
  refresh: () => void
}


function UserPolicies({ iam, user, refresh }: UserPoliciesProps) {
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
          await iam.users.detachPolicy(user.id, policy.id)
          refresh()
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


interface UserPublicKeysProps {
  iam: IAM
  user: User
  refresh: () => void
}


function UserPublicKeys({ iam, user, refresh }: UserPublicKeysProps) {
  return (
    <>
      <h3>Public Keys</h3>
      <table class="background-dark border-radius">
        <thead>
          <tr>
            <th>Key</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {user.publicKeys.map(key => {
            const onClickDelete = async () => {
              await iam.publicKeys.deletePublicKey(key.key, user.id)
              refresh()
            }

            return (
              <tr>
                <td><span>{key.key}</span></td>
                <td><span>{key.description}</span></td>
                <td>
                  <button onClick={onClickDelete}>Delete</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


interface UserLoginsProps {
  iam: IAM
  user: User
  logins: LoginResponse[]
  refresh: () => void
}


function UserLogins({ iam, user, logins, refresh }: UserLoginsProps) {
  const onClickDeny = async (event: Event, login: LoginResponse) => {
    event.preventDefault()
    await iam.logins.denyLogin(login.id, user.id)
    refresh()
  }

  const onClickGrant = async (event: Event, login: LoginResponse) => {
    event.preventDefault()
    await iam.logins.grantLogin(login.id, user.id)
    refresh()
  }

  const onClickDelete = async (event: Event, login: LoginResponse) => {
    event.preventDefault()
    await iam.logins.deleteLogin(login.id, user.id)
    refresh()
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
  iam: IAM
  user: User
  sessions: Session[]
  refresh: () => void
}


function UserSessions({ iam, user, sessions, refresh }: UserSessionsProps) {
  const onClickDelete = async (event: Event, session: Session) => {
    event.preventDefault()
    await iam.userSessions.deleteSession(session.id, user.id)
    refresh()
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
            const idClass = session.id === iam.sessionId ? 'active' : ''
            const addressClass = session.address === iam.sessionAddress ? 'active' : ''
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
  iam: IAM
  user: User
  setShowAddGroup: (showAddGroup: boolean) => void
}


function AddGroup({ iam, user, setShowAddGroup }: AddGroupProps) {
  const [groups, setGroups] = useState<GroupIdentity[]>([])

  useEffect(() => {
    const getGroups = async () => {
      const response = await iam.groups.listGroups()
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
            await iam.groups.addMember(groupId, user.id)
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
  iam: IAM
  user: User
  setShowAddPolicy: (showAddPolicy: boolean) => void
}


function AddPolicy({ iam, user, setShowAddPolicy }: AddPolicyProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  useEffect(() => {
    const getPolicies = async () => {
      const response = await iam.policies.listPolicies()
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
            await iam.users.attachPolicy(user.id, policyId)
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


export function ShowUser({ iam, id }: UserViewProps) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logins, setLogins] = useState<LoginResponse[]>([])
  const [loginsError, setLoginsError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  const refresh = () => {
    setRefreshCount(refreshCount + 1)
  }

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getUser = async () => {
      try {
        const user = await iam.users.getUser(id)
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
        const response = await iam.logins.listLogins(id)
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
        const response = await iam.sessions.listSessions(id)
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
  }, [id, showAddGroup, showAddPolicy, refreshCount])

  if (user === null) {
    return error ? <p class="error">{error}</p> : <p>Loading...</p>
  } else if (showAddGroup) {
    return <AddGroup iam={iam} user={user} setShowAddGroup={setShowAddGroup} />
  } else if (showAddPolicy) {
    return <AddPolicy iam={iam} user={user} setShowAddPolicy={setShowAddPolicy} />
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    try {
      await iam.users.deleteUser(user.id)
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
      <UserName user={user}/>
      <UserEmail user={user}/>
      <div class="section">
        <UserGroups iam={iam} user={user} refresh={refresh}/>
        <button class="background-dark border-radius-bottom"
          onClick={() => setShowAddGroup(true)}>
          Add Group
        </button>
      </div>
      <div class="section">
        <UserPolicies iam={iam} user={user} refresh={refresh}/>
        <button class="background-dark border-radius-bottom"
          onClick={() => setShowAddPolicy(true)}>
          Add Policy
        </button>
      </div>
      {user.publicKeys.length > 0 &&
      <div class="section">
        <UserPublicKeys iam={iam} user={user} refresh={refresh}/>
      </div>
      }
      {logins.length > 0 &&
      <div class="section">
        <UserLogins iam={iam} user={user} logins={logins} refresh={refresh}/>
        {loginsError && <p class="error">{loginsError}</p>}
      </div>
      }
      {sessions.length > 0 &&
      <div class="section">
        <UserSessions iam={iam} user={user} sessions={sessions} refresh={refresh}/>
        {sessionsError && <p class="error">{sessionsError}</p>}
      </div>
      }
      <button onClick={onClickDelete}>Delete</button>
    </div>
  )
}

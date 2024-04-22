import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { Group, UserIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolveUserId, resolveUserIdentifier } from './util'
import { resolvePolicyId, resolvePolicyIdentifier } from './util'


interface GroupViewProps {
  client: IAM
  id?: string
  path?: string
}


function GroupName({ group }: { group: Group }) {
  if (group.name) {
    return (
      <div class="section">
        <h3>Name</h3>
        <p class="background-dark border-radius">{group.name}</p>
      </div>
    )
  }

  return null
}


function GroupUsers({ client, group }: { client: IAM, group: Group }) {
  return (
    <>
      <h3>Users</h3>
      <table class="background-dark border-radius-top">
        <tbody>
          {group.users.map(user => {
            const userId = resolveUserId(user)
            const userIdentifier = resolveUserIdentifier(user)
            const onClickDelete = async () => {
              await client.groups.removeMember(group.id, userId)
            }
            return (
              <tr>
                <td><a href={`/users/${userId}`}>{userIdentifier}</a></td>
                <td><button onClick={onClickDelete}>Remove</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


function GroupPolicies({ client, group }: { client: IAM, group: Group }) {
  return (
    <>
      <h3>Policies</h3>
      <table class="background-dark border-radius-top">
        <tbody>
          {group.policies.map(policy => {
            const policyId = resolvePolicyId(policy)
            const policyIdentifier = resolvePolicyIdentifier(policy)
            const onClickDelete = async () => {
              await client.groups.detachPolicy(group.id, policyId)
            }
            return (
              <tr>
                <td><a href={`/policies/${policyId}`}>{policyIdentifier}</a></td>
                <td><button onClick={onClickDelete}>Remove</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


interface AddUserProps {
  client: IAM
  group: Group
  setShowAddUser: (show: boolean) => void
}


function AddUser({ client, group, setShowAddUser }: AddUserProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])

  const onClickCancel = (event: Event) => {
    event.preventDefault()
    setShowAddUser(false)
  }

  useEffect(() => {
    const getUsers = async () => {
      const response = await client.users.listUsers()
      const users = response.items
      setUsers(users.filter(user =>
        !group.users.some(groupUser =>
        resolveUserIdentifier(user) === resolveUserIdentifier(groupUser))))
    }

    getUsers()
  }, [])

  return (
    <div>
      <h1>Add User</h1>
      <h3>Users</h3>
      <ul>
        {users.map(user => {
          const userId = resolveUserIdentifier(user)
          const addUser = async () => {
            await client.groups.addMember(group.id, userId)
            setShowAddUser(false)
          }
          return (
            <li><button onClick={addUser}>{userId}</button></li>
          )
        })}
      </ul>
      <button onClick={onClickCancel}>Cancel</button>
    </div>
  )
}


interface AddPolicyProps {
  client: IAM
  group: Group
  setShowAddPolicy: (show: boolean) => void
}


function AddPolicy({ client, group, setShowAddPolicy }: AddPolicyProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  const onClickCancel = (event: Event) => {
    event.preventDefault()
    setShowAddPolicy(false)
  }

  useEffect(() => {
    const getPolicies = async () => {
      const response = await client.policies.listPolicies()
      const policies = response.items
      setPolicies(policies.filter(policy =>
        !group.policies.some(groupPolicy =>
        resolvePolicyIdentifier(policy) === resolvePolicyIdentifier(groupPolicy))))
    }

    getPolicies()
  }, [])

  return (
    <div>
      <h1>Add Policy</h1>
      <h3>Policies</h3>
      <ul>
        {policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          const addPolicy = async () => {
            await client.groups.attachPolicy(group.id, policyId)
            setShowAddPolicy(false)
          }
          return (
            <li><button onClick={addPolicy}>{policyId}</button></li>
          )
        })}
      </ul>
      <button onClick={onClickCancel}>Cancel</button>
    </div>
  )
}


export function GroupView({ client, id }: GroupViewProps) {
  const [error, setError] = useState<string | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getGroup = async () => {
      try {
        const group = await client.groups.getGroup(id)
        setGroup(group)
        setError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getGroup()
  }, [id, showAddUser, showAddPolicy])

  if (group === null) {
    return error ? <p class="error">{error}</p> : <p>Loading...</p>
  } else if (showAddUser) {
    return <AddUser client={client} group={group} setShowAddUser={setShowAddUser} />
  } else if (showAddPolicy) {
    return <AddPolicy client={client} group={group} setShowAddPolicy={setShowAddPolicy} />
  }

  const onClickAddUser = (event: Event) => {
    event.preventDefault()
    console.log('Add User')
    setShowAddUser(true)
  }

  const onClickAddPolicy = (event: Event) => {
    event.preventDefault()
    console.log('Add Policy')
    setShowAddPolicy(true)
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    await client.groups.deleteGroup(group.id)
    route('/groups')
  }

  return (
    <>
      <div class="section">
        <h1>Group</h1>
        <p>{group.id}</p>
      </div>
      <GroupName group={group} />
      <div class="section">
        <GroupUsers client={client} group={group} />
        <button class="background-dark border-radius-bottom"
          onClick={onClickAddUser}>Add User</button>
      </div>
      <div class="section">
        <GroupPolicies client={client} group={group} />
        <button class="background-dark border-radius-bottom"
          onClick={onClickAddPolicy}>Add Policy</button>
      </div>
      <button onClick={onClickDelete}>Delete</button>
    </>
  )
}

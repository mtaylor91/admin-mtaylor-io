import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { Group, UserIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolveUserIdentifier } from '../util'
import { resolvePolicyIdentifier } from '../util'


interface ShowGroupProps {
  iam: IAM
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


function GroupUsers({ iam, group }: { iam: IAM, group: Group }) {
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
      {group.users.map(user => {
        const onClickDelete = async () => {
          await iam.groups.removeMember(group.id, user.id)
        }

        return (
          <tr>
            <td>
              {user.email &&
              <a href={`/users/${user.email}`}>
                {user.email}
              </a>
              }
            </td>
            <td><a href={`/users/${user.id}`}>{user.id}</a></td>
            <td><button onClick={onClickDelete}>Remove</button></td>
          </tr>
        )
      })}
    </tbody>
  )

  return (
    <>
      <h3>Users</h3>
      <table class="background-dark border-radius-top">
        {group.users.length > 0 && thead}
        {tbody}
      </table>
    </>
  )
}


function GroupPolicies({ iam, group }: { iam: IAM, group: Group }) {

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
      {group.policies.map(policy => {
        const onClickDelete = async () => {
          await iam.groups.detachPolicy(group.id, policy.id)
        }

        return (
          <tr>
            <td>
              {policy.name &&
              <a href={`/policies/${policy.name}`}>
                {policy.name}
              </a>
              }
            </td>
            <td><a href={`/policies/${policy.id}`}>{policy.id}</a></td>
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
        {group.policies.length > 0 && thead}
        {tbody}
      </table>
    </>
  )
}


interface AddUserProps {
  iam: IAM
  group: Group
  setShowAddUser: (show: boolean) => void
}


function AddUser({ iam, group, setShowAddUser }: AddUserProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])

  const onClickCancel = (event: Event) => {
    event.preventDefault()
    setShowAddUser(false)
  }

  useEffect(() => {
    const getUsers = async () => {
      const response = await iam.users.listUsers()
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
            await iam.groups.addMember(group.id, userId)
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
  iam: IAM
  group: Group
  setShowAddPolicy: (show: boolean) => void
}


function AddPolicy({ iam, group, setShowAddPolicy }: AddPolicyProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  const onClickCancel = (event: Event) => {
    event.preventDefault()
    setShowAddPolicy(false)
  }

  useEffect(() => {
    const getPolicies = async () => {
      const response = await iam.policies.listPolicies()
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
            await iam.groups.attachPolicy(group.id, policyId)
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


export function ShowGroup({ iam, id }: ShowGroupProps) {
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
        const group = await iam.groups.getGroup(id)
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
    return <AddUser iam={iam} group={group} setShowAddUser={setShowAddUser} />
  } else if (showAddPolicy) {
    return <AddPolicy iam={iam} group={group} setShowAddPolicy={setShowAddPolicy} />
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
    await iam.groups.deleteGroup(group.id)
    route('/groups')
  }

  return (
    <div class="section">
      <div class="section">
        <h1>Group</h1>
        <p>{group.id}</p>
      </div>
      <GroupName group={group} />
      <div class="section">
        <GroupUsers iam={iam} group={group} />
        <button class="background-dark border-radius-bottom"
          onClick={onClickAddUser}>Add User</button>
      </div>
      <div class="section">
        <GroupPolicies iam={iam} group={group} />
        <button class="background-dark border-radius-bottom"
          onClick={onClickAddPolicy}>Add Policy</button>
      </div>
      <button onClick={onClickDelete}>Delete</button>
    </div>
  )
}

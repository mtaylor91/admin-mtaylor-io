import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { Group, UserIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolveUserIdentifier, resolvePolicyIdentifier } from './util'


interface GroupViewProps {
  client: IAM
  id?: string
  path?: string
}


function GroupName({ group }: { group: Group }) {
  if (group.name) {
    return (
      <>
        <h3>Name</h3>
        <p>{group.name}</p>
      </>
    )
  }

  return null
}


function GroupUsers({ client, group }: { client: IAM, group: Group }) {
  return (
    <>
      <h3>Users</h3>
      <table>
        <tbody>
          {group.users.map(user => {
            const userId = resolveUserIdentifier(user)
            const onClickDelete = async () => {
              await client.groups.removeMember(group.id, userId)
            }
            return (
              <tr>
                <td><a href={`/users/${userId}`}>{userId}</a></td>
                <td><button onClick={onClickDelete}>Delete</button></td>
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
      <table>
        <tbody>
          {group.policies.map(policy => {
            const policyId = resolvePolicyIdentifier(policy)
            const onClickDelete = async () => {
              await client.groups.detachPolicy(group.id, policyId)
            }
            return (
              <tr>
                <td><a href={`/policies/${policyId}`}>{policyId}</a></td>
                <td><button onClick={onClickDelete}>Delete</button></td>
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
      const users = await client.users.listUsers()
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
      const policies = await client.policies.listPolicies()
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
  const [group, setGroup] = useState<Group | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)

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
      <h1>Group</h1>
      <p>{group.id}</p>
      <button onClick={onClickDelete}>Delete</button>
      <GroupName group={group} />
      <GroupUsers client={client} group={group} />
      <button onClick={onClickAddUser}>Add User</button>
      <GroupPolicies client={client} group={group} />
      <button onClick={onClickAddPolicy}>Add Policy</button>
    </>
  )
}

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


function GroupUsers({ group }: { group: Group }) {
  return (
    <>
      <h3>Users</h3>
      <ul>
        {group.users.map(user => {
          const userId = resolveUserIdentifier(user)
          return (
            <li><a href={`/users/${userId}`}><h5>{userId}</h5></a></li>
          )
        })}
      </ul>
    </>
  )
}


function GroupPolicies({ group }: { group: Group }) {
  return (
    <>
      <h3>Policies</h3>
      <ul>
        {group.policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          return (
            <li><a href={`/policies/${policyId}`}><h5>{policyId}</h5></a></li>
          )
        })}
      </ul>
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

  return (
    <div>
      <h1>Group</h1>
      <p>{group.id}</p>
      <GroupName group={group} />
      <h3>Users</h3>
      <GroupUsers group={group} />
      <button onClick={onClickAddUser}>Add User</button>
      <GroupPolicies group={group} />
      <button onClick={onClickAddPolicy}>Add Policy</button>
    </div>
  )
}

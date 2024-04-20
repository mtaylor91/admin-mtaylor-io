import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { User, GroupIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolveGroupId, resolveGroupIdentifier } from './util'
import { resolvePolicyId, resolvePolicyIdentifier } from './util'


interface UserViewProps {
  client: IAM
  id?: string
  path?: string
}


function UserEmail({ user }: { user: User }) {
  if (user.email) {
    return (
      <>
        <h3>Email</h3>
        <p>{user.email}</p>
      </>
    )
  }

  return null
}


function UserGroups({ client, user }: { client: IAM, user: User }) {
  return (
    <>
      <h3>Groups</h3>
      <table>
        <tbody>
          {user.groups.map(group => {
            const groupId = resolveGroupId(group)
            const groupIdentifier = resolveGroupIdentifier(group)
            const onClickDelete = async () => {
              await client.groups.removeMember(groupId, user.id)
            }
            return (
              <tr>
                <td><a href={`/groups/${groupId}`}>{groupIdentifier}</a></td>
                <td><button onClick={onClickDelete}>Remove</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


function UserPolicies({ client, user }: { client: IAM, user: User }) {
  return (
    <>
      <h3>Policies</h3>
      <table>
        <tbody>
          {user.policies.map(policy => {
            const policyId = resolvePolicyId(policy)
            const policyIdentifier = resolvePolicyIdentifier(policy)
            const onClickDelete = async () => {
              await client.users.detachPolicy(user.id, policyId)
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


interface AddGroupProps {
  client: IAM
  user: User
  setShowAddGroup: (showAddGroup: boolean) => void
}


function AddGroup({ client, user, setShowAddGroup }: AddGroupProps) {
  const [groups, setGroups] = useState<GroupIdentity[]>([])

  useEffect(() => {
    const getGroups = async () => {
      const groups = await client.groups.listGroups()
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
      const policies = await client.policies.listPolicies()
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


export function UserView({ client, id }: UserViewProps) {
  const [user, setUser] = useState<User | null>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getUser = async () => {
      const user = await client.users.getUser(id)
      setUser(user)
    }

    getUser()
  }, [id, showAddGroup, showAddPolicy])

  if (user === null) {
    return <div>Loading...</div>
  } else if (showAddGroup) {
    return <AddGroup client={client} user={user} setShowAddGroup={setShowAddGroup} />
  } else if (showAddPolicy) {
    return <AddPolicy client={client} user={user} setShowAddPolicy={setShowAddPolicy} />
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    await client.users.deleteUser(user.id)
    route('/users')
  }

  return (
    <>
      <h1>User</h1>
      <p>{user.id}</p>
      <UserEmail user={user} />
      <UserGroups client={client} user={user} />
      <button onClick={() => setShowAddGroup(true)}>Add Group</button>
      <UserPolicies client={client} user={user} />
      <button onClick={() => setShowAddPolicy(true)}>Add Policy</button>
      <button onClick={onClickDelete}>Delete</button>
    </>
  )
}

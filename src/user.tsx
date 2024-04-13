import { useEffect, useState } from 'preact/hooks'
import IAM, { User } from 'iam-mtaylor-io-js'
import { resolveGroupIdentifier, resolvePolicyIdentifier } from './util'


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
      {user.groups.length > 0 && (
      <>
        <h3>Groups</h3>
        <ul>
          {user.groups.map(group => {
            const groupId = resolveGroupIdentifier(group)
            return (<li><a href={`/groups/${groupId}`}>{groupId}</a></li>)
          })}
        </ul>
      </>
      )}
      {user.policies.length > 0 && (
      <>
        <h3>Policies</h3>
        <ul>
          {user.policies.map(policy => {
            const policyId = resolvePolicyIdentifier(policy)
            return (<li><a href={`/policies/${policyId}`}>{policyId}</a></li>)
          })}
        </ul>
      </>
      )}
    </div>
  )
}

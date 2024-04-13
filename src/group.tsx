import { useState, useEffect } from 'preact/hooks'
import IAM, { Group } from 'iam-mtaylor-io-js'
import { resolveUserIdentifier, resolvePolicyIdentifier } from './util'


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

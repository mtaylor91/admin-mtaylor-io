import { useState, useEffect } from 'preact/hooks'
import IAM, { UserIdentity } from 'iam-mtaylor-io-js'
import { resolveUserIdentifier } from './util'


interface UsersViewProps {
  client: IAM,
  path?: string
}


export function UsersView({ client }: UsersViewProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])

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

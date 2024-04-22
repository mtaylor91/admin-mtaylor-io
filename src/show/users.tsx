import axios, { AxiosError } from 'axios'
import { Link } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { UserIdentity } from 'iam-mtaylor-io-js'
import { resolveUserId, resolveUserIdentifier } from '../util'


interface UsersTableProps {
  users: UserIdentity[]
}


function UsersTable({ users }: UsersTableProps) {
  return (
    <table class="background-dark border-radius">
      <thead>
        <tr>
          <th><span>Email</span></th>
          <th><span>UUID</span></th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => {
          return (
            <tr>
              <td>
                {user.email &&
                <a href={`/users/${resolveUserIdentifier(user)}`}>
                  {user.email}
                </a>
                }
              </td>
              <td>
                <a href={`/users/${resolveUserId(user)}`}>
                  {resolveUserId(user)}
                </a>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}


interface UsersViewProps {
  client: IAM,
  path?: string
}


export function ShowUsers({ client }: UsersViewProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await client.users.listUsers()
        const users = response.items
        setError(null)
        setUsers(users)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getUsers()
  }, [])

  return (
    <>
      <div class="menubar">
        <Link href="/create/user">Create User</Link>
        {error && <p class="error">{error}</p>}
      </div>
      <UsersTable users={users} />
      <div class="menubar">
      </div>
    </>
  )
}

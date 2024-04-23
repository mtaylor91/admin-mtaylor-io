import axios, { AxiosError } from 'axios'
import { Link } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { UserIdentity } from 'iam-mtaylor-io-js'
import { resolveUserId, resolveUserIdentifier } from '../util'


interface PaginationProps {
  offset: number,
  limit: number,
  total: number
}


function Pagination({ offset, limit, total }: PaginationProps) {
  const page = Math.floor(offset / limit) + 1
  const pages = Math.ceil(total / limit)
  const prevOffset = offset - limit
  const nextOffset = offset + limit

  return (
    <div class="pagination">
      <span>
        {offset > 0 &&
          <Link href={`/users?offset=${prevOffset}&limit=${limit}`}>Previous</Link>
        }
      </span>
      <span>Page {page} of {pages}</span>
      <span>
        {page < pages &&
        <Link href={`/users?offset=${nextOffset}&limit=${limit}`}>Next</Link>
        }
      </span>
    </div>
  )
}


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
  path?: string,
  offset?: number,
  limit?: number
}


export function ShowUsers(props: UsersViewProps) {
  const { client } = props
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [emailPrefix, setEmailPrefix] = useState<string | null>(null)

  const offset = Number(props.offset) || 0
  const limit = Number(props.limit) || 10

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await client.users.listUsers(emailPrefix, offset, limit)
        const users = response.items
        setTotal(response.total)
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
  }, [offset, limit, emailPrefix])

  return (
    <div class="section">
      <div class="menubar">
        <Link href="/create/user">Create User</Link>
        <input
          type="text"
          placeholder="Filter by email prefix"
          onInput={e => setEmailPrefix((e.target as HTMLInputElement).value)}
        />
      </div>
      <UsersTable users={users} />
      <Pagination offset={offset} limit={limit} total={total} />
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
    </div>
  )
}

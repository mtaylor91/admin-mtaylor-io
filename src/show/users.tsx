import axios, { AxiosError } from 'axios'
import { Link, route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

import IAM, { UserIdentity, SortUsersBy, SortOrder } from 'iam-mtaylor-io-js'

import { Pagination } from '../components/pagination'


interface UsersTableProps {
  users: UserIdentity[]
}


function UsersTable({ users }: UsersTableProps) {
  return (
    <table class="background-dark border-radius">
      <thead>
        <tr>
          <th><span>Email</span></th>
          <th><span>Username</span></th>
          <th><span>UUID</span></th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => {
          return (
            <tr>
              <td>
                {user.email &&
                <a href={`/users/${user.email}`}>
                  {user.email}
                </a>
                }
              </td>
              <td>
                {user.name &&
                <a href={`/users/${user.name}`}>
                  {user.name}
                </a>
                }
              </td>
              <td>
                <a href={`/users/${user.id}`}>
                  {user.id}
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
  limit?: number,
  search?: string
}


export function ShowUsers({ client, offset, limit, search }: UsersViewProps) {
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [error, setError] = useState<string | null>(null)

  const sort = "name" as SortUsersBy
  const order = "asc" as SortOrder

  offset = Number(offset) || 0
  limit = Number(limit) || 50

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await client.users.listUsers(search, sort, order, offset, limit)
        const users = response.items
        setTotal(response.total)
        setError(null)
        setUsers(users)
        if (users.length === 0 && offset > 0) {
          const newOffset = Math.max(offset - limit, 0)
          if (search)
            route(`/users?offset=${newOffset}&limit=${limit}&search=${search}`)
          else
            route(`/users?offset=${newOffset}&limit=${limit}`)
        }
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getUsers()
  }, [offset, limit, search])

  const onInputSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    route(`/users?offset=0&limit=${limit}&search=${target.value}`)
  }

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/user">Create User</Link>
        {error && <p class="error">{error}</p>}
        <input class="border-radius" type="text" value={search}
          placeholder="Search" onInput={onInputSearch} />
      </div>
      <UsersTable users={users} />
      <Pagination offset={offset} limit={limit} total={total} />
    </div>
  )
}

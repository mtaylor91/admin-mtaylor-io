import axios, { AxiosError } from 'axios'
import { Link, route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

import IAM, { UserIdentity, SortUsersBy, SortOrder } from 'iam-mtaylor-io-js'

import { Pagination } from '../components/pagination'


interface ShowUsersProps {
  iam: IAM,
  path?: string,
  offset?: number,
  limit?: number,
  search?: string,
  sort?: string,
  order?: string,
}


export function ShowUsers({
  iam, offset, limit, search, sort, order
}: ShowUsersProps) {
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [error, setError] = useState<string | null>(null)

  sort = sort || "name"
  order = order || "asc"
  offset = Number(offset) || 0
  limit = Number(limit) || 50

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await iam.users.listUsers(
          search, sort as SortUsersBy, order as SortOrder, offset, limit)
        const users = response.items
        setTotal(response.total)
        setError(null)
        setUsers(users)
        if (users.length === 0 && offset > 0) {
          const newOffset = Math.max(offset - limit, 0)
          const params = new URLSearchParams()
          params.append('offset', newOffset.toString())
          params.append('limit', limit.toString())
          params.append('sort', sort)
          params.append('order', order)
          if (search) params.append('search', search)
          route(`/users?${params.toString()}`)
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
  }, [offset, limit, search, sort, order])

  const onInputSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', sort)
    params.append('order', order)
    params.append('search', target.value)
    route(`/users?${params.toString()}`)
  }

  const onClickSortByEmail = () => {
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', 'email')
    if (sort === 'email' && order === 'asc') {
      params.append('order', "desc")
    } else {
      params.append('order', "asc")
    }
    if (search) params.append('search', search)
    route(`/users?${params.toString()}`)
  }

  const onClickSortByUsername = () => {
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', 'name')
    if (sort === 'name' && order === 'asc') {
      params.append('order', "desc")
    } else {
      params.append('order', "asc")
    }
    if (search) params.append('search', search)
    route(`/users?${params.toString()}`)
  }

  const onClickSortByUUID = () => {
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', 'id')
    if (sort === 'id' && order === 'asc') {
      params.append('order', "desc")
    } else {
      params.append('order', "asc")
    }
    if (search) params.append('search', search)
    route(`/users?${params.toString()}`)
  }

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/user">Create User</Link>
        {error && <p class="error">{error}</p>}
        <input class="search" type="text" value={search}
          placeholder="Search" onInput={onInputSearch} />
      </div>
      <table class="background-dark border-radius">
        <thead>
          <tr>
            <th><span onClick={onClickSortByEmail}>Email</span></th>
            <th><span onClick={onClickSortByUsername}>Username</span></th>
            <th><span onClick={onClickSortByUUID}>UUID</span></th>
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
      <Pagination offset={offset} limit={limit} total={total} />
    </div>
  )
}

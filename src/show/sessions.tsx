import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'
import { Link, route } from 'preact-router'

import IAM, { SortSessionsBy, SortOrder } from 'iam-mtaylor-io-js'
import type { Session } from 'iam-mtaylor-io-js'

import { Pagination } from '../components/pagination'


interface ShowSessionsProps {
  iam: IAM,
  path?: string
  offset?: number
  limit?: number
  search?: string
  sort?: string
  order?: string
}


export function ShowSessions({
  iam, search, sort, order, offset, limit
}: ShowSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  offset = Number(offset) || 0
  limit = Number(limit) || 50
  sort = sort || "user"
  order = order || "asc"

  useEffect(() => {
    const getSessions = async () => {
      try {
        const response = await iam.sessions.listSessions(
          search, sort as SortSessionsBy, order as SortOrder, offset, limit)
        setSessions(response.items)
        setTotal(response.total)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getSessions()
  }, [offset, limit, search, sort, order])

  const onInputSearch = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const params = new URLSearchParams()
    params.append('offset', offset.toString())
    params.append('limit', limit.toString())
    params.append('sort', sort)
    params.append('order', order)
    params.append('search', target.value)
    route(`/sessions?${params.toString()}`)
  }

  return (
    <div class="list-view">
      <div class="menubar">
        {error && <p class="error">{error}</p>}
        <input type="text" placeholder="Search" onInput={onInputSearch} />
      </div>
      <table>
        <thead>
          <tr>
            <th>Session</th>
            <th>Address</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            return (
              <tr key={session.id}>
                <td>
                  {error && <p class="error">{error}</p> || (
                  <Link href={`/sessions/${session.id}`}>
                    {session.id}
                  </Link>
                  )}
                </td>
                <td>
                  {session.address}
                </td>
                <td>
                  <Link href={`/users/${session.user}`}>
                    {session.user}
                  </Link>
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

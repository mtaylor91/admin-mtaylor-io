import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'
import { Link } from 'preact-router/match'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'
import type { Session, User } from 'iam-mtaylor-io-js'


interface ShowSessionUserProps {
  iam: IAM
  userId?: string
}


function ShowSessionUser({ iam, userId }: ShowSessionUserProps) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    const getUser = async () => {
      try {
        const user = await iam.users.getUser(userId)
        setUser(user)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getUser()
  }, [iam, userId])

  return (
    <td>
      {error && <p class="error">{error}</p>}
      <Link href={`/users/${userId}`}>
        {user?.name || user?.email || user?.id || 'Unknown'}
      </Link>
    </td>
  )
}


interface ShowSessionsProps {
  iam: IAM,
  events: Events,
  path?: string
}


export function ShowSessions({ iam }: ShowSessionsProps) {
  const [search, setSearch] = useState<string>('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSessions = async () => {
      try {
        const response = await iam.sessions.listSessions(search)
        setSessions(response.items)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getSessions()
  }, [iam, search, setError, setSessions])

  const onInputSearch = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setSearch(target.value)
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
                <ShowSessionUser iam={iam} userId={session.user} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

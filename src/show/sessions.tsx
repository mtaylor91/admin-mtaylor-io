import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'
import { Link } from 'preact-router/match'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'
import type { User } from 'iam-mtaylor-io-js'


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


interface ShowSessionProps {
  iam: IAM
  events: Events
  sessionId: string
}


function ShowSession({ iam, events, sessionId }: ShowSessionProps) {
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any | null>(null)

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await iam.sessions.getSession(sessionId)
        setSession(session)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getSession()
  }, [events, sessionId])

  return (
    <tr>
      <td>
        {error && <p class="error">{error}</p> || (
        <Link href={`/sessions/${sessionId}`}>
          {sessionId}
        </Link>
        )}
      </td>
      <td>
        {session?.address}
      </td>
      <ShowSessionUser iam={iam} userId={session?.user} />
    </tr>
  )
}


interface ShowSessionsProps {
  iam: IAM,
  events: Events,
  path?: string
}


export function ShowSessions({ iam, events }: ShowSessionsProps) {
  const [search, setSearch] = useState<string>('')
  const [sessions, setSessions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSessions = async () => {
      try {
        const response = await events.request('GET', '/sessions')
        setSessions(response.data.sessions)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getSessions()
  }, [events, setError, setSessions])

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
          {sessions.filter(s => s.includes(search)).map(session => {
            return (
              <ShowSession key={session} iam={iam} events={events} sessionId={session} />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

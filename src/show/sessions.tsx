import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'


interface ShowSessionsProps {
  events: Events,
  path?: string
}


export function ShowSessions({ events }: ShowSessionsProps) {
  const [search, setSearch] = useState<string>('')
  const [sessions, setSessions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSessions = async () => {
      try {
        const response = await events.request('GET', '/sessions')
        console.log(response)
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
            <th>UUID</th>
          </tr>
        </thead>
        <tbody>
          {sessions.filter(s => s.includes(search)).map(session => {
            return (
              <tr>
                <td>
                  {session}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

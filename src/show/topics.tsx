import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'
import { Link } from 'preact-router'

import IAM from 'iam-mtaylor-io-js'
import Events from 'events-mtaylor-io-js'


interface Topic {
  id: string
  broadcast: boolean
  logEvents: boolean
  createdAt: string
}


interface ShowTopicsProps {
  iam: IAM
  events: Events
  path?: string
}


export function ShowTopics({ events }: ShowTopicsProps) {
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await events.request('GET', '/topics')
        console.log(response)
        setTopics(response.data.topics as Topic[])
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    fetchTopics()
  }, [events])

  const onClickDelete = (id: string) => async (e: Event) => {
    e.preventDefault()
    try {
      await events.request('DELETE', `/topics/${id}`)
      setTopics(topics.filter(topic => topic.id !== id))
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.response?.data?.error || error.message)
      throw error
    }
  }

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/topic">Create Topic</Link>
        {error && <p class="error">{error}</p>}
      </div>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Broadcast</th>
            <th>Log Events</th>
            <th>Created At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {topics.map(topic => (
            <tr>
              <td>
                <Link href={`/topics/${topic.id}`}>{topic.id}</Link>
              </td>
              <td>{topic.broadcast ? 'Yes' : 'No'}</td>
              <td>{topic.logEvents ? 'Yes' : 'No'}</td>
              <td>{topic.createdAt}</td>
              <td>
                <button onClick={onClickDelete(topic.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'

import { Pagination } from '../components/pagination'


interface Event {
  id: string
  topic: string
  created: string
  [key: string]: any
}


interface Topic {
  id: string
  broadcast: boolean
  logEvents: boolean
  createdAt: string
}


interface ShowTopicProps {
  iam: IAM
  events: Events
  path?: string
  id?: string
  offset?: number
  limit?: number
}


export function ShowTopic(props: ShowTopicProps) {
  const [loadingTopic, setLoadingTopic] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [total, setTotal] = useState(0)

  const offset = Number(props.offset) || 0
  const limit = Number(props.limit) || 10

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await props.events.request('GET', `/topics/${props.id}`)
        setTopic(response.data as Topic)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      } finally {
        setLoadingTopic(false)
      }
    }

    fetchTopic()
  }, [props.events, props.id])

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true)
        const query = new URLSearchParams()
        query.append('offset', offset.toString())
        query.append('limit', limit.toString())
        const response = await props.events.request(
          'GET', `/topics/${props.id}/events`, query.toString())
        setEvents(response.data.items as Event[])
        setTotal(response.data.total)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      } finally {
        setLoadingEvents(false)
      }
    }

    loadEvents()
  }, [props.events, props.id, offset, limit])

  if (loadingTopic) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1>Topic</h1>
      {error && <p class="error">{error}</p>}
      <p>ID: {props.id}</p>
      <p>Broadcast: {topic?.broadcast ? 'true' : 'false'}</p>
      <p>Log Events: {topic?.logEvents ? 'true' : 'false'}</p>
      <p>Created At: {topic?.createdAt}</p>
      <h2>Events</h2>
      {loadingEvents && <p>Loading...</p>}
      {loadingEvents || <table>
        <tr>
          <th>ID</th>
          <th>Created</th>
        </tr>
        {events.map(event => (
          <tr>
            <td>{event.id}</td>
            <td>{event.created}</td>
          </tr>
        ))}
      </table>}
      <Pagination total={total} offset={offset} limit={limit} />
    </div>
  )
}

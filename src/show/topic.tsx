import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'


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
}


export function ShowTopic(props: ShowTopicProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)

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
        setLoading(false)
      }
    }

    fetchTopic()
  }, [props.events, props.id])

  if (loading) {
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
    </div>
  )
}

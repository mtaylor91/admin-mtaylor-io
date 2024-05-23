import axios, { AxiosError } from 'axios'
import { useState } from 'preact/hooks'
import { v4 as uuidv4 } from 'uuid'

import Events from 'events-mtaylor-io-js'


interface CreateTopicProps {
  events: Events
  path?: string
}


export function CreateTopic({ events }: CreateTopicProps) {
  const [error, setError] = useState<string | null>(null)
  const [broadcast, setBroadcast] = useState<boolean>(false)
  const [logEvents, setLogEvents] = useState<boolean>(false)
  const [topicId, setTopicId] = useState<string | null>(null)

  const createTopic = async () => {
    try {
      const response = await events.request('POST', '/topics', null, {
        id: uuidv4(),
        broadcast,
        logEvents
      })
      console.log(response)
      setTopicId(response.data.topic.id)
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.response?.data?.error || error.message)
      throw error
    }
  }

  const onCheckboxChange = (setter: (value: boolean) => void) => (e: Event) => {
    setter((e.target as HTMLInputElement).checked)
  }

  const onInputChange = (setter: (value: string) => void) => (e: Event) => {
    setter((e.target as HTMLInputElement).value)
  }

  return (
    <div class="form-view">
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
      <form onSubmit={e => {
        e.preventDefault()
        createTopic()
      }}>
        <label>
          Topic ID:
          <input type="text" value={topicId || ''}
            onChange={onInputChange(setTopicId)} />
        </label>
        <label>
          Broadcast:
          <input type="checkbox" checked={broadcast}
            onChange={onCheckboxChange(setBroadcast)} />
        </label>
        <label>
          Log Events:
          <input type="checkbox" checked={logEvents}
            onChange={onCheckboxChange(setLogEvents)} />
        </label>
        <button type="submit">Create Topic</button>
      </form>
      {topicId && <p>Topic created with id: {topicId}</p>}
    </div>
  )
}

import axios, { AxiosError } from 'axios'
import { useState } from 'preact/hooks'
import { Link } from 'preact-router'
import { v4 as uuidv4 } from 'uuid'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'


const CHATS_TOPIC: string = "491dc4c5-9734-4156-8ee4-b0cd855d23cc"


export interface CreateChatProps {
  events: Events
  iam: IAM
  path?: string
}


export function CreateChat({ events }: CreateChatProps) {
  const [name, setName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const createChat = async () => {
    const id = uuidv4()
    const chatTopicBroadcastUrl = `/topics/${CHATS_TOPIC}/broadcast`
    const chatTopicLogEventsUrl = `/topics/${CHATS_TOPIC}/log-events`
    try {
      await events.request('POST', chatTopicBroadcastUrl)
      await events.request('POST', chatTopicLogEventsUrl)
      events.socket.publish(CHATS_TOPIC, { id, name })
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.message)
      throw error
    }
  }

  const onInputNewChatName = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setName(target.value)
  }

  return (
    <div class="form-view">
      <div class="menubar">
        <Link href="/chat">Back</Link>
        {error && <p class="error">{error}</p>}
      </div>
      <form onSubmit={createChat}>
        <label for="name">Name</label>
        <input type="text" id="name" value={name} onInput={onInputNewChatName} />
        <button type="submit">Create Chat</button>
      </form>
    </div>
  )
}

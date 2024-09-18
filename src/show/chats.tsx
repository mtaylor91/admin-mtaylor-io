import { Link } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import IAM from 'iam-mtaylor-io-js'
import Events from 'events-mtaylor-io-js'


const CHATS_TOPIC: string = "491dc4c5-9734-4156-8ee4-b0cd855d23cc"


interface ChatEvent {
  type: 'publish'
  topic: '491dc4c5-9734-4156-8ee4-b0cd855d23cc'
  id: string
  prev?: string
  data: ChatData
  created: string
}


interface ChatData {
  name?: string
}


export interface ShowChatsProps {
  iam: IAM
  events: Events
  path?: string
}


export function ShowChats({ events }: ShowChatsProps) {
  const [chatEvents, setChatEvents] = useState<ChatEvent[]>([])

  const deleteChat = async (id: string) => {
    await events.request('DELETE', `/topics/${CHATS_TOPIC}/events/${id}`)
    setChatEvents(evts => evts.filter(e => e.id !== id))
  }

  useEffect(() => {
    const onMessage = (evt: ChatEvent) => {
      console.log('onMessage', evt)
      setChatEvents(evts => [...evts, evt])
    }

    const subscribe = async () => {
      if (!events.socket.connected) await events.connect()
      events.socket.subscribe(CHATS_TOPIC, e => onMessage(e))
      events.socket.replay(CHATS_TOPIC)
    }

    subscribe()
  }, [events])

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/chat">Create Chat</Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>UUID</th>
          </tr>
        </thead>
        <tbody>
          {chatEvents.map(evt => {
            return (
              <tr>
                <td>
                  {evt.data.name &&
                  <a href={`/chats/${evt.data.name}`}>
                    {evt.data.name}
                  </a>
                  }
                </td>
                <td>
                  <a href={`/chats/${evt.id}`}>
                    {evt.id}
                  </a>
                </td>
                <td>
                  <button onClick={() => deleteChat(evt.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

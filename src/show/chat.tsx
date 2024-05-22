import { Link } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import IAM from 'iam-mtaylor-io-js'
import Events from 'events-mtaylor-io-js'


const CHATS_TOPIC: string = "491dc4c5-9734-4156-8ee4-b0cd855d23cc"


interface Chat {
  id: string
  name?: string
}


export interface ShowChatProps {
  iam: IAM
  events: Events
  path?: string
}


export function ShowChat({ events }: ShowChatProps) {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    const onMessage = (chat: Chat) => {
      setChats(chats => [...chats, chat])
    }

    const subscribe = async () => {
      if (!events.socket.connected) await events.connect()
      events.socket.subscribe(CHATS_TOPIC, e => onMessage(e.data))
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
          {chats.map(chat => {
            return (
              <tr>
                <td>
                  {chat.name &&
                  <a href={`/chats/${chat.name}`}>
                    {chat.name}
                  </a>
                  }
                </td>
                <td>
                  <a href={`/chats/${chat.id}`}>
                    {chat.id}
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

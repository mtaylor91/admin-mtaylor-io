import axios, { AxiosError } from 'axios'
import { useState, useEffect } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'
import type { Session } from 'iam-mtaylor-io-js'


interface ChatProps {
  id: string
  iam: IAM
  events: Events
  messages: string[]
  setMessages: (messages: string[]) => void
}


function Chat({ id, iam, events, messages, setMessages }: ChatProps) {
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    events.socket.send({
      type: 'message', message,
      sender: {
        session: iam.sessionId
      },
      recipient: {
        session: id
      }
    })

    setMessage('');
    setMessages([...messages, message]);
  }

  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input type="text" value={message}
        onInput={(e) => setMessage((e.target as HTMLInputElement).value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}


interface ShowSessionProps {
  iam: IAM
  events: Events
  id?: string
  path?: string
}


export function ShowSession({ iam, events, id }: ShowSessionProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return <p>No session ID provided</p>;
  }

  useEffect(() => {

    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      setMessages((messages) => [...messages, message]);
    }

    const connect = async () => {
      if (events.socket.connected) return;
      try {
        await events.connect();
        events.socket.onSessionMessage(onMessage);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        throw error;
      }
    }

    const getSession = async () => {
      try {
        const response = await events.request('GET', `/session/${id}`);
        const userId = response.data.user;
        const session = await iam.sessions.getSession(id, userId);
        setSession(session);
      } catch (err) {
        const error = err as Error | AxiosError;
        if (!axios.isAxiosError(error))
          throw error;
        setError(error.response?.data?.error || error.message);
        throw error;
      }
    };

    connect();
    getSession();
  }, [events, id]);

  return (
    <div class="section">
      <h2>Session</h2>
      {error && <p class="error">{error}</p>}
      <p>{id}</p>
      <p>{session?.address}</p>
      <Chat id={id} iam={iam} events={events}
        messages={messages} setMessages={setMessages} />
    </div>
  );
}

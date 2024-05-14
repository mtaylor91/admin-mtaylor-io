import axios, { AxiosError } from 'axios'
import { useState, useEffect } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'


const ANALYTICS_TOPIC: string = "95e990d4-e445-4649-a28b-bfa3834c1408"


interface PageViewEvent {
  event: 'pageview'
  path: string
  referrer: string
  address?: string
  session?: string
}


interface ShowPageViewsProps {
  events: Events
  path?: string
}


export function ShowPageViews({ events }: ShowPageViewsProps) {
  const [messages, setMessages] = useState<PageViewEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const onMessage = (event: PageViewEvent) => {
      setMessages((messages) => [...messages, event]);
    }

    const connect = async () => {
      try {
        const url = `/topics/${ANALYTICS_TOPIC}/send-receive`
        await events.request('POST', url);
        if (!events.socket.connected) await events.connect();
        events.socket.onMessage(e => onMessage(e.data));
        events.socket.subscribe(ANALYTICS_TOPIC);
        events.socket.replay(ANALYTICS_TOPIC);
      } catch (err) {
        const error = err as Error | AxiosError;
        if (!axios.isAxiosError(error))
          throw error;
        setError(error.response?.data?.error || error.message);
        throw error;
      }
    }

    connect();
  }, [events]);

  return (
    <div class="list-view">
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
      <table>
        <thead>
          <tr>
            <th>Session</th>
            <th>Address</th>
            <th>Path</th>
            <th>Referrer</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message, index) => (
            <tr key={index}>
              <td>{message.session}</td>
              <td>{message.address}</td>
              <td>{message.path}</td>
              <td>{message.referrer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

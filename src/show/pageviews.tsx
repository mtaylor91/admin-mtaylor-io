import axios, { AxiosError } from 'axios'
import { useState, useEffect } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'

import { Pagination } from '../components/pagination'


const ANALYTICS_TOPIC: string = "95e990d4-e445-4649-a28b-bfa3834c1408"


interface PageViewEvent {
  created: string
  data: PageViewEventData
  id: string
  topic: string
  type: 'publish'
}


interface PageViewEventData {
  event: 'pageview'
  path: string
  referrer: string
  address?: string
  session?: string
}


interface ShowPageViewsProps {
  events: Events
  path?: string
  offset?: number
  limit?: number
}


export function ShowPageViews(props: ShowPageViewsProps) {
  const [messages, setMessages] = useState<PageViewEventData[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const events = props.events;
  const offset = Number(props.offset) || 0;
  const limit = Number(props.limit) || 10;

  useEffect(() => {
    const connect = async () => {
      try {
        const query = new URLSearchParams();
        query.append('offset', offset.toString());
        query.append('limit', limit.toString());
        const response = await events.request(
          'GET', `/topics/${ANALYTICS_TOPIC}/events`, query.toString())
        const items = response.data.items as PageViewEvent[]
        const messages = items.map(event => event.data)
        setTotal(response.data.total);
        setMessages(messages);
      } catch (err) {
        const error = err as Error | AxiosError;
        if (!axios.isAxiosError(error))
          throw error;
        setError(error.response?.data?.error || error.message);
        throw error;
      }
    }

    connect();
  }, [events, offset, limit]);

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
      <Pagination offset={offset} limit={limit} total={total} />
    </div>
  );
}

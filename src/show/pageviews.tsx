import axios, { AxiosError } from 'axios'
import { useState, useEffect } from 'preact/hooks'
import { Link } from 'preact-router/match'

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
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<PageViewEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const events = props.events;
  const offset = Number(props.offset) || 0;
  const limit = Number(props.limit) || 10;

  useEffect(() => {
    const loadPageViewEvents = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        query.append('offset', offset.toString());
        query.append('limit', limit.toString());
        const response = await events.request(
          'GET', `/topics/${ANALYTICS_TOPIC}/events`, query.toString())
        const messages = response.data.items as PageViewEvent[]
        setTotal(response.data.total);
        setMessages(messages);
        setLoading(false);
      } catch (err) {
        const error = err as Error | AxiosError;
        if (!axios.isAxiosError(error))
          throw error;
        setError(error.response?.data?.error || error.message);
        throw error;
      }
    }

    loadPageViewEvents();
  }, [events, offset, limit]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div class="list-view">
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Session</th>
            <th>Address</th>
            <th>Path</th>
            <th>Referrer</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message, index) => (
            <tr key={index}>
              <td>{message.created}</td>
              <td>
                <Link href={`/sessions/${message.data.session}`}>
                  {message.data.session}
                </Link>
              </td>
              <td>{message.data.address}</td>
              <td>{message.data.path}</td>
              <td>{message.data.referrer}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination offset={offset} limit={limit} total={total} />
    </div>
  );
}

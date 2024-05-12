import axios, { AxiosError } from 'axios'
import { useState, useEffect } from 'preact/hooks'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'
import type { Session } from 'iam-mtaylor-io-js'


interface ShowSessionProps {
  iam: IAM
  events: Events
  id?: string
  path?: string
}


export function ShowSession({ iam, events, id }: ShowSessionProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return <p>No session ID provided</p>;
  }

  useEffect(() => {
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

    getSession();
  }, [events, id]);

  return (
    <div class="section">
      <h2>Session</h2>
      {error && <p class="error">{error}</p>}
      <p>{id}</p>
      <p>{session?.address}</p>
    </div>
  );
}

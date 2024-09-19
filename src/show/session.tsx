import axios, { AxiosError } from 'axios'
import { useState, useEffect } from 'preact/hooks'
import { Link } from 'preact-router'

import Events from 'events-mtaylor-io-js'
import IAM from 'iam-mtaylor-io-js'
import type { Session, User } from 'iam-mtaylor-io-js'


interface ShowUserProps {
  iam: IAM
  id?: string
  path?: string
}


export function ShowUser({ iam, id }: ShowUserProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return <p>No user ID provided</p>;
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await iam.users.getUser(id);
        setUser(user);
      } catch (err) {
        const error = err as Error | AxiosError;
        if (!axios.isAxiosError(error))
          throw error;
        setError(error.response?.data?.error || error.message);
        throw error;
      }
    };

    getUser();
  }, [iam, id]);

  return (
    <div class="section">
      <h2>User</h2>
      {error && <p class="error">{error}</p>}
      {user?.name && <Link href={`/users/${user?.name}`}><p>{user?.name}</p></Link>}
      {user?.email && <Link href={`/users/${user?.email}`}><p>{user?.email}</p></Link>}
      <Link href={`/users/${id}`}><p>{id}</p></Link>
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
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return <p>No session ID provided</p>;
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await iam.sessions.getSession(id);
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
      <h1>Session</h1>
      {error && <p class="error">{error}</p>}
      <p>{id}</p>
      <p>{session?.address}</p>
      <ShowUser iam={iam} id={session?.user} />
    </div>
  );
}

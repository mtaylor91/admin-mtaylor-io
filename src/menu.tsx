import { Link } from 'preact-router/match'
import IAM from 'iam-mtaylor-io-js'


interface MenuProps {
  client: IAM
  logout: () => void
}


export function Menu({ client, logout }: MenuProps) {
  return (
    <header class="menubar">
      <span class="menubar-user">
        Logged in as {client.userId}
      </span>
      <Link activeClassName="active" href="/users">Users</Link>
      <Link activeClassName="active" href="/groups">Groups</Link>
      <Link activeClassName="active" href="/policies">Policies</Link>
      <button onClick={logout}>Logout</button>
    </header>
  )
}

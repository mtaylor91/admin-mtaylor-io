import { Link } from 'preact-router/match'
import IAM from 'iam-mtaylor-io-js'


interface HeaderMenuProps {
  client: IAM
  logout: () => void
}


export function HeaderMenu({ client, logout }: HeaderMenuProps) {
  return (
    <header class="menubar">
      <span class="menubar-user">
        Logged in as {client.userId}
      </span>
      <button onClick={logout}>Logout</button>
    </header>
  )
}


interface SideMenuProps {
}


export function SideMenu({}: SideMenuProps) {
  return (
    <nav class="side-menu">
      <Link activeClassName="active" href="/users">Users</Link>
      <Link activeClassName="active" href="/groups">Groups</Link>
      <Link activeClassName="active" href="/policies">Policies</Link>
    </nav>
  )
}

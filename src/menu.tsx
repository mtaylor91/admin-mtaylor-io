import { Link } from 'preact-router/match'
import IAM from 'iam-mtaylor-io-js'


interface HeaderMenuProps {
  iam: IAM
  logout: () => void
}


export function HeaderMenu({ iam, logout }: HeaderMenuProps) {
  return (
    <header class="menubar">
      <span class="menubar-user">
        Logged in as {iam.userId}
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
      <Link activeClassName="active" href="/chat">Chat</Link>
      <Link activeClassName="active" href="/users">Users</Link>
      <Link activeClassName="active" href="/groups">Groups</Link>
      <Link activeClassName="active" href="/policies">Policies</Link>
      <Link activeClassName="active" href="/sessions">Sessions</Link>
      <Link activeClassName="active" href="/topics">Topics</Link>
      <Link activeClassName="active" href="/pageviews">Page Views</Link>
    </nav>
  )
}

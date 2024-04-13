import IAM from 'iam-mtaylor-io-js'


interface MenuProps {
  client: IAM
  logout: () => void
}


export function Menu({ client, logout }: MenuProps) {
  return (
    <header class="menubar">
      <span>Logged in as {client.userId}</span>
      <a href="/">Users</a>
      <a href="/groups">Groups</a>
      <a href="/policies">Policies</a>
      <button onClick={logout}>Logout</button>
    </header>
  )
}

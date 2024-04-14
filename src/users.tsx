import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { UserIdentity } from 'iam-mtaylor-io-js'
import { resolveUserIdentifier } from './util'


interface UsersViewProps {
  client: IAM,
  path?: string
}


export function UsersView({ client }: UsersViewProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [createUserEmail, setCreateUserEmail] = useState('')

  useEffect(() => {
    const getUsers = async () => {
      const users = await client.users.listUsers()
      setUsers(users)
    }

    getUsers()
  }, [])

  const onClickCreateUser = async (event: Event) => {
    event.preventDefault()
    setShowCreateUserForm(true)
  }

  const onSubmitCreateUser = async (event: Event) => {
    event.preventDefault()
    if (createUserEmail === '') {
      const principal = await client.users.createUser()
      route(`/users/${resolveUserIdentifier(principal.user)}`)
    } else {
      const principal = await client.users.createUser(createUserEmail)
      route(`/users/${resolveUserIdentifier(principal.user)}`)
    }
    setShowCreateUserForm(false)
  }

  const onCancelCreateUser = async (event: Event) => {
    event.preventDefault()
    setShowCreateUserForm(false)
  }

  const onInputCreateUserEmail = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setCreateUserEmail(target.value)
  }

  if (showCreateUserForm) {
    return (
      <>
        <h1>Create User</h1>
        <form onSubmit={onSubmitCreateUser}>
          <label>
            Email
            <input type="email" value={createUserEmail}
              onInput={onInputCreateUserEmail} />
          </label>
          <button type="submit">Create</button>
          <button onClick={onCancelCreateUser}>Cancel</button>
        </form>
      </>
    )
  } else {
    return (
      <>
        <h1>Users</h1>
        <button onClick={onClickCreateUser}>Create User</button>
        <ul>
          {users.map(user => {
            const userId = resolveUserIdentifier(user)
            return (<li><a href={`/users/${userId}`}>{userId}</a></li>)
          })}
        </ul>
      </>
    )
  }
}

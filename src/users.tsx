import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { UserIdentity, Principal } from 'iam-mtaylor-io-js'
import { resolveUserId, resolveUserIdentifier } from './util'


interface UsersViewProps {
  client: IAM,
  path?: string
}


export function UsersView({ client }: UsersViewProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [createUserEmail, setCreateUserEmail] = useState('')
  const [newUserPrincipal, setNewUserPrincipal] = useState<Principal | null>(null)

  useEffect(() => {
    const getUsers = async () => {
      const response = await client.users.listUsers()
      const users = response.items
      setUsers(users)
    }

    getUsers()
  }, [])

  const onClickConfirmNewUser = async (event: Event) => {
    event.preventDefault()
    if (newUserPrincipal) {
      const userId = resolveUserId(newUserPrincipal.user)
      route(`/users/${userId}`)
    }
  }

  const onClickCreateUser = async (event: Event) => {
    event.preventDefault()
    setShowCreateUserForm(true)
  }

  const onSubmitCreateUser = async (event: Event) => {
    event.preventDefault()
    if (createUserEmail === '') {
      const principal = await client.users.createUser()
      setNewUserPrincipal(principal)
    } else {
      const principal = await client.users.createUser(createUserEmail)
      setNewUserPrincipal(principal)
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
  } else if (newUserPrincipal) {
    return (
      <>
        <h1>User Created</h1>
        <p>Created user with ID: {newUserPrincipal.user.id}</p>
        <label>Public Key<p>{btoa(newUserPrincipal.publicKeyBase64)}</p></label>
        <label>Private Key<p>{btoa(newUserPrincipal.privateKeyBase64)}</p></label>
        <button onClick={onClickConfirmNewUser}>Confirm</button>
      </>
    )
  } else {
    return (
      <>
        <button onClick={onClickCreateUser}>Create User</button>
        <ul>
          {users.map(user => {
            const userId = resolveUserId(user)
            const userIdentifier = resolveUserIdentifier(user)
            return (<li><a href={`/users/${userId}`}>{userIdentifier}</a></li>)
          })}
        </ul>
      </>
    )
  }
}

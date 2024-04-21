import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { UserIdentity, Principal } from 'iam-mtaylor-io-js'
import { resolveUserId, resolveUserIdentifier } from './util'


interface UsersTableProps {
  users: UserIdentity[]
}


function UsersTable({ users }: UsersTableProps) {
  return (
    <table class="background-dark border-radius">
      <thead>
        <tr>
          <th><span>Email</span></th>
          <th><span>UUID</span></th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => {
          return (
            <tr>
              <td>
                {user.email &&
                <a href={`/users/${resolveUserIdentifier(user)}`}>
                  {user.email}
                </a>
                }
              </td>
              <td>
                <a href={`/users/${resolveUserId(user)}`}>
                  {resolveUserId(user)}
                </a>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}


interface UsersViewProps {
  client: IAM,
  path?: string
}


export function UsersView({ client }: UsersViewProps) {
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [createUserEmail, setCreateUserEmail] = useState('')
  const [newUserPrincipal, setNewUserPrincipal] = useState<Principal | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await client.users.listUsers()
        const users = response.items
        setError(null)
        setUsers(users)
      } catch (error) {
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    if (!showCreateUserForm) {
      getUsers()
    }
  }, [showCreateUserForm])

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
    setError(null)
  }

  const onSubmitCreateUser = async (event: Event) => {
    event.preventDefault()

    try {
      if (createUserEmail === '') {
        const principal = await client.users.createUser()
        setNewUserPrincipal(principal)
      } else {
        const principal = await client.users.createUser(createUserEmail)
        setNewUserPrincipal(principal)
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message)
      throw error
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
        {error && <p class="error">{error}</p>}
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
        <UsersTable users={users} />
        {error && <p class="error">{error}</p>}
      </>
    )
  }
}

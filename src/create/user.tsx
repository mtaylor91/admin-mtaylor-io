import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import IAM, { Principal } from 'iam-mtaylor-io-js'


interface CreateUserProps {
  client: IAM
  path?: string
}


export function CreateUser({ client }: CreateUserProps) {
  const [createUserName, setCreateUserName] = useState('')
  const [createUserEmail, setCreateUserEmail] = useState('')
  const [newUserPrincipal, setNewUserPrincipal] = useState<Principal | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onClickConfirmNewUser = async (event: Event) => {
    event.preventDefault()
    if (newUserPrincipal) {
      route(`/users/${newUserPrincipal.user.id}`)
    }
  }

  const onSubmitCreateUser = async (event: Event) => {
    event.preventDefault()

    const name = createUserName === '' ? null : createUserName
    const email = createUserEmail === '' ? null : createUserEmail

    try {
      const principal = await client.users.createUser(name, email)
      setNewUserPrincipal(principal)
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error

      const errorMessage = error.response?.data?.error || error.message
      const errorDetails = error.response?.data?.message || null

      setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`)
      throw error
    }
  }

  const onInputCreateUserName = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setCreateUserName(target.value)
  }

  const onInputCreateUserEmail = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setCreateUserEmail(target.value)
  }

  if (newUserPrincipal) {
    return (
      <>
        <h1>User Created</h1>
        <p>Created user with ID: {newUserPrincipal.user.id}</p>
        <label>Public Key<p>{newUserPrincipal.publicKeyBase64}</p></label>
        <label>Private Key<p>{newUserPrincipal.privateKeyBase64}</p></label>
        <button onClick={onClickConfirmNewUser}>Confirm</button>
      </>
    )
  }

  return (
    <div class="section">
      {error && <p class="error">{error}</p>}
      <form onSubmit={onSubmitCreateUser}>
        <label>
          Name:
          <input type="text" value={createUserName}
            placeholder="User name"
            onInput={onInputCreateUserName} />
        </label>
        <label>
          Email:
          <input type="email" value={createUserEmail}
            placeholder="User email"
            onInput={onInputCreateUserEmail} />
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

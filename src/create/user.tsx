import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import IAM, { Principal } from 'iam-mtaylor-io-js'


interface CreateUserProps {
  client: IAM
  path?: string
}


export function CreateUser({ client }: CreateUserProps) {
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

    try {
      if (createUserEmail === '') {
        const principal = await client.users.createUser()
        setNewUserPrincipal(principal)
      } else {
        const principal = await client.users.createUser(createUserEmail)
        setNewUserPrincipal(principal)
      }
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.response?.data?.error || error.message)
      throw error
    }
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
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
      <form onSubmit={onSubmitCreateUser}>
        <label>
          Email
          <input type="email" value={createUserEmail}
            onInput={onInputCreateUserEmail} />
        </label>
        <button type="submit">Create</button>
      </form>
      <div class="menubar">
      </div>
    </div>
  )
}

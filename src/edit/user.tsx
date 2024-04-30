import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import IAM from 'iam-mtaylor-io-js'


interface EditUserProps {
  client: IAM
  id?: string
  path?: string
}


export function EditUserName({ client, id }: EditUserProps) {
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: Event) => {
    if (!id) {
      return
    }

    e.preventDefault()
    const name = (document.getElementById('name') as HTMLInputElement).value
    try {
      await client.users.updateUser(id, { name })
    } catch (error) {
      const err = error as AxiosError | Error
      if (!axios.isAxiosError(err))
        throw err

      setError(err.response?.data?.error || err.message)
      throw err
    }

    route(`/users/${id}`)
  }

  return (
    <div>
      <h1>Edit User Name</h1>
      <form onSubmit={onSubmit}>
        {error && <p class="error">{error}</p>}
        <label for="name">
          Name:
          <input type="text" id="name" name="name"
            placeholder="Enter a new name" />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}


export function EditUserEmail({ client, id }: EditUserProps) {
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: Event) => {
    if (!id) {
      return
    }

    e.preventDefault()
    const email = (document.getElementById('email') as HTMLInputElement).value
    try {
      await client.users.updateUser(id, { email })
    } catch (error) {
      const err = error as AxiosError | Error
      if (!axios.isAxiosError(err))
        throw err

      setError(err.response?.data?.error || err.message)
      throw err
    }

    route(`/users/${id}`)
  }

  return (
    <div>
      <h1>Edit User Email</h1>
      <form onSubmit={onSubmit}>
        {error && <p class="error">{error}</p>}
        <label for="email">Email</label>
        <input type="email" id="email" name="email"
          placeholder="Enter a new email" />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}

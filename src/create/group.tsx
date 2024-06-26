import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import IAM from 'iam-mtaylor-io-js'
import { resolveGroupId } from '../util'


interface CreateGroupFormProps {
  onSubmit: (event: Event) => void
  onInput: (event: Event) => void
}


function CreateGroupForm({ onSubmit, onInput }: CreateGroupFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Name:
        <input type="text" placeholder="Group Name" onInput={onInput}/>
      </label>
      <button type="submit">Create</button>
    </form>
  )
}


interface CreateGroupProps {
  iam: IAM
  path?: string
}


export function CreateGroup({ iam }: CreateGroupProps) {
  const [error, setError] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')

  const onSubmitCreateGroup = async (event: Event) => {
    event.preventDefault()
    try {
      if (newGroupName === '') {
        const group = await iam.groups.createGroup()
        route(`/groups/${resolveGroupId(group)}`)
      } else {
        const group = await iam.groups.createGroup(newGroupName)
        route(`/groups/${resolveGroupId(group)}`)
      }
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.response?.data?.error || error.message)
      throw error
    }
  }

  const onInputNewGroupName = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewGroupName(target.value)
  }

  return (
    <div class="section">
      {error && <p class="error">{error}</p>}
      <CreateGroupForm
        onSubmit={onSubmitCreateGroup}
        onInput={onInputNewGroupName}/>
    </div>
  )
}

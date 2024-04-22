import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { GroupIdentity } from 'iam-mtaylor-io-js'
import { resolveGroupId } from './util'


interface CreateGroupFormProps {
  onSubmit: (event: Event) => void
  onCancel: (event: Event) => void
  onInput: (event: Event) => void
}


function CreateGroupForm({ onSubmit, onCancel, onInput }: CreateGroupFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Name
        <input type="text" onInput={onInput} />
      </label>
      <button type="submit">Create</button>
      <button onClick={onCancel}>Cancel</button>
    </form>
  )
}


interface GroupsTableProps {
  groups: GroupIdentity[]
}


function GroupsTable({ groups }: GroupsTableProps) {
  return (
    <table class="background-dark border-radius">
      <thead>
        <tr>
          <th>Name</th>
          <th>UUID</th>
        </tr>
      </thead>
      <tbody>
        {groups.map(group => {
          return (
            <tr>
              <td>
                {group.name &&
                <a href={`/groups/${group.name}`}>
                  {group.name}
                </a>
                }
              </td>
              <td>
                <a href={`/groups/${group.id}`}>
                  {group.id}
                </a>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}


interface GroupsViewProps {
  client: IAM
  path?: string
}


export function GroupsView({ client }: GroupsViewProps) {
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<GroupIdentity[]>([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  useEffect(() => {
    const getGroups = async () => {
      try {
        const response = await client.groups.listGroups()
        const groups = response.items
        setGroups(groups)
        setError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getGroups()
  }, [])

  const onClickCreateGroup = async (event: Event) => {
    event.preventDefault()
    setShowCreateGroup(true)
  }

  const onSubmitCreateGroup = async (event: Event) => {
    event.preventDefault()
    if (newGroupName === '') {
      const group = await client.groups.createGroup()
      route(`/groups/${resolveGroupId(group)}`)
    } else {
      const group = await client.groups.createGroup(newGroupName)
      route(`/groups/${resolveGroupId(group)}`)
    }
    setShowCreateGroup(false)
  }

  const onCancelCreateGroup = async (event: Event) => {
    event.preventDefault()
    setShowCreateGroup(false)
  }

  const onInputNewGroupName = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewGroupName(target.value)
  }

  if (showCreateGroup) {
    return (
      <>
        <h1>Create Group</h1>
        {error && <p class="error">{error}</p>}
        <CreateGroupForm
          onSubmit={onSubmitCreateGroup}
          onCancel={onCancelCreateGroup}
          onInput={onInputNewGroupName}/>
      </>
    )
  } else {
    return (
      <>
        <button onClick={onClickCreateGroup}>Create Group</button>
        <GroupsTable groups={groups} />
        {error && <p class="error">{error}</p>}
      </>
    )
  }
}

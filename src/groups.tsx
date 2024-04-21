import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { GroupIdentity } from 'iam-mtaylor-io-js'
import { resolveGroupId } from './util'


interface GroupsViewProps {
  client: IAM
  path?: string
}


export function GroupsView({ client }: GroupsViewProps) {
  const [groups, setGroups] = useState<GroupIdentity[]>([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  useEffect(() => {
    const getGroups = async () => {
      const response = await client.groups.listGroups()
      const groups = response.items
      setGroups(groups)
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
        <form onSubmit={onSubmitCreateGroup}>
          <label>
            Name
            <input type="text" onInput={onInputNewGroupName} />
          </label>
          <button type="submit">Create</button>
          <button onClick={onCancelCreateGroup}>Cancel</button>
        </form>
      </>
    )
  } else {
    return (
      <>
        <button onClick={onClickCreateGroup}>Create Group</button>
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
      </>
    )
  }
}

import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { GroupIdentity } from 'iam-mtaylor-io-js'
import { resolveGroupIdentifier } from './util'


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
      const groups = await client.groups.listGroups()
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
      route(`/groups/${resolveGroupIdentifier(group)}`)
    } else {
      const group = await client.groups.createGroup(newGroupName)
      route(`/groups/${resolveGroupIdentifier(group)}`)
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
        <h1>Groups</h1>
        <button onClick={onClickCreateGroup}>Create Group</button>
        <ul>
          {groups.map(group => {
            const groupId = resolveGroupIdentifier(group)
            return (<li><a href={`/groups/${groupId}`}>{groupId}</a></li>)
          })}
        </ul>
      </>
    )
  }
}

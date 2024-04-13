import { useEffect, useState } from 'preact/hooks'
import IAM, { Group } from 'iam-mtaylor-io-js'
import { resolveGroupIdentifier } from './util'


interface GroupsViewProps {
  client: IAM
  path?: string
}


export function GroupsView({ client }: GroupsViewProps) {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    const getGroups = async () => {
      const groups = await client.groups.listGroups()
      setGroups(groups)
    }

    getGroups()
  }, [])

  return (
    <div>
      <h1>Groups</h1>
      <ul>
        {groups.map(group => {
          const groupId = resolveGroupIdentifier(group)
          return (<li><a href={`/groups/${groupId}`}>{groupId}</a></li>)
        })}
      </ul>
    </div>
  )
}

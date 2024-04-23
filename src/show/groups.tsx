import axios, { AxiosError } from 'axios'
import { Link } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { GroupIdentity } from 'iam-mtaylor-io-js'


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


interface ShowGroupsProps {
  client: IAM
  path?: string
}


export function ShowGroups({ client }: ShowGroupsProps) {
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<GroupIdentity[]>([])

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

  return (
    <div class="section">
      <div class="menubar">
        <Link href="/create/group">Create Group</Link>
      </div>
      <GroupsTable groups={groups} />
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
    </div>
  )
}

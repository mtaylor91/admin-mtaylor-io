import axios, { AxiosError } from 'axios'
import { Link, route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { GroupIdentity, SortGroupsBy, SortOrder } from 'iam-mtaylor-io-js'
import { Pagination } from '../components/pagination'


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
  offset?: number
  limit?: number
  search?: string
}


export function ShowGroups(props: ShowGroupsProps) {
  const {client, search} = props
  const [total, setTotal] = useState(0)
  const [groups, setGroups] = useState<GroupIdentity[]>([])
  const [error, setError] = useState<string | null>(null)

  const sort = "name" as SortGroupsBy
  const order = "asc" as SortOrder
  const offset = Number(props.offset) || 0
  const limit = Number(props.limit) || 50

  useEffect(() => {
    const getGroups = async () => {
      try {
        const response = await
          client.groups.listGroups(search, sort, order, offset, limit)

        const groups = response.items
        setTotal(response.total)
        setError(null)
        setGroups(groups)
        if (groups.length === 0 && offset > 0) {
          const newOffset = Math.max(0, offset - limit)
          if (search)
            route(`/groups?offset=${newOffset}&limit=${limit}&search=${search}`)
          else
            route(`/groups?offset=${newOffset}&limit=${limit}`)
        }
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getGroups()
  }, [offset, limit, search])

  const onInputSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    route(`/groups?offset=0&limit=${limit}&search=${target.value}`)
  }

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/group">Create Group</Link>
        {error && <p class="error">{error}</p>}
        <input class="border-radius" type="text" value={search}
          placeholder="Search" onInput={onInputSearch} />
      </div>
      <GroupsTable groups={groups} />
      <Pagination offset={offset} limit={limit} total={total} />
    </div>
  )
}

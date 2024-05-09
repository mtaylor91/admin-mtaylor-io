import axios, { AxiosError } from 'axios'
import { Link, route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { GroupIdentity, SortGroupsBy, SortOrder } from 'iam-mtaylor-io-js'
import { Pagination } from '../components/pagination'


interface ShowGroupsProps {
  iam: IAM
  path?: string
  offset?: number
  limit?: number
  search?: string
  sort?: string
  order?: string
}


export function ShowGroups(props: ShowGroupsProps) {
  const {iam, search} = props
  const [total, setTotal] = useState(0)
  const [groups, setGroups] = useState<GroupIdentity[]>([])
  const [error, setError] = useState<string | null>(null)

  const sort = (props.sort || "name") as SortGroupsBy
  const order = (props.order || "asc") as SortOrder
  const offset = Number(props.offset) || 0
  const limit = Number(props.limit) || 50

  useEffect(() => {
    const getGroups = async () => {
      try {
        const response = await
          iam.groups.listGroups(search, sort, order, offset, limit)

        const groups = response.items
        setTotal(response.total)
        setError(null)
        setGroups(groups)
        if (groups.length === 0 && offset > 0) {
          const newOffset = Math.max(0, offset - limit)
          const params = new URLSearchParams()
          params.append('offset', newOffset.toString())
          params.append('limit', limit.toString())
          params.append('sort', sort)
          params.append('order', order)
          if (search) params.append('search', search)
          route(`/groups?${params.toString()}`)
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
  }, [offset, limit, search, sort, order])

  const onInputSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', sort)
    params.append('order', order)
    params.append('search', target.value)
    route(`/groups?${params.toString()}`)
  }

  const onClickSortByName = () => {
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', 'name')
    if (sort === 'name' && order === 'asc') {
      params.append('order', 'desc')
    } else {
      params.append('order', 'asc')
    }
    if (search) params.append('search', search)
    route(`/groups?${params.toString()}`)
  }

  const onClickSortByUUID = () => {
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', 'id')
    if (sort === 'id' && order === 'asc') {
      params.append('order', 'desc')
    } else {
      params.append('order', 'asc')
    }
    if (search) params.append('search', search)
    route(`/groups?${params.toString()}`)
  }

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/group">Create Group</Link>
        {error && <p class="error">{error}</p>}
        <input class="search" type="text" value={search}
          placeholder="Search" onInput={onInputSearch} />
      </div>
      <table class="background-dark border-radius">
        <thead>
          <tr>
            <th><span onClick={onClickSortByName}>Name</span></th>
            <th><span onClick={onClickSortByUUID}>UUID</span></th>
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
      <Pagination offset={offset} limit={limit} total={total} />
    </div>
  )
}

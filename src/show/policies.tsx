import axios, { AxiosError } from 'axios'
import { Link, route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity, SortPoliciesBy, SortOrder } from 'iam-mtaylor-io-js'
import { Pagination } from '../components/pagination'


interface ShowPoliciesProps {
  client: IAM
  path?: string
  offset?: number
  limit?: number
  search?: string
  sort?: string
  order?: string
}


export function ShowPolicies({
  client, offset, limit, search, sort, order
}: ShowPoliciesProps) {
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  sort = sort || "name"
  order = order || "asc"

  offset = Number(offset) || 0
  limit = Number(limit) || 50

  useEffect(() => {
    const getPolicies = async () => {
      try {
        const response = await client.policies.listPolicies(
          search, sort as SortPoliciesBy, order as SortOrder, offset, limit)
        const policies = response.items
        setTotal(response.total)
        setPolicies(policies)
        setError(null)
        if (policies.length === 0 && offset > 0) {
          const newOffset = Math.max(offset - limit, 0)
          const params = new URLSearchParams()
          params.append('offset', newOffset.toString())
          params.append('limit', limit.toString())
          params.append('sort', sort)
          params.append('order', order)
          if (search) params.append('search', search)
          route(`/policies?${params.toString()}`)
        }
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getPolicies()
  }, [offset, limit, search, sort, order])

  const onInputSearch = (e: Event) => {
    const target = e.target as HTMLInputElement
    const params = new URLSearchParams()
    params.append('offset', '0')
    params.append('limit', limit.toString())
    params.append('sort', sort)
    params.append('order', order)
    params.append('search', target.value)
    route(`/policies?${params.toString()}`)
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
    route(`/policies?${params.toString()}`)
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
    route(`/policies?${params.toString()}`)
  }

  return (
    <div class="list-view">
      <div class="menubar">
        <Link href="/create/policy">Create Policy</Link>
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
          {policies.map(policy => {
            return (
              <tr>
                <td>
                  {policy.name &&
                  <a href={`/policies/${policy.name}`}>
                    {policy.name}
                  </a>
                  }
                </td>
                <td>
                  <a href={`/policies/${policy.id}`}>
                    {policy.id}
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

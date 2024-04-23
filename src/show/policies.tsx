import axios, { AxiosError } from 'axios'
import { Link, route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity } from 'iam-mtaylor-io-js'
import { Pagination } from '../components/pagination'


interface ShowPoliciesProps {
  client: IAM
  path?: string
  offset?: number
  limit?: number
}


export function ShowPolicies({ client, offset, limit }: ShowPoliciesProps) {
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState<string | null>(null)
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  offset = Number(offset) || 0
  limit = Number(limit) || 10

  useEffect(() => {
    const getPolicies = async () => {
      try {
        const response = await client.policies.listPolicies(search, offset, limit)
        const policies = response.items
        setTotal(response.total)
        setPolicies(policies)
        setError(null)
        if (policies.length === 0 && offset > 0) {
          const newOffset = Math.max(offset - limit, 0)
          route(`/policies?offset=${newOffset}&limit=${limit}`)
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
  }, [offset, limit, search])

  return (
    <div class="section">
      <div class="menubar">
        <Link href="/create/policy">Create Policy</Link>
        <input class="border-radius" type="text" placeholder="Search"
          onInput={e => setSearch((e.target as HTMLInputElement).value)} />
      </div>
      <table class="background-dark border-radius">
        <thead>
          <tr>
            <th>Name</th>
            <th>UUID</th>
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
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
    </div>
  )
}

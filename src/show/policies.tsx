import axios, { AxiosError } from 'axios'
import { Link } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity } from 'iam-mtaylor-io-js'


interface ShowPoliciesProps {
  client: IAM
  path?: string
}


export function ShowPolicies({ client }: ShowPoliciesProps) {
  const [error, setError] = useState<string | null>(null)
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  useEffect(() => {
    const getPolicies = async () => {
      try {
        const response = await client.policies.listPolicies()
        const policies = response.items
        setPolicies(policies)
        setError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getPolicies()
  }, [])

  return (
    <>
      <div class="menubar">
        <Link href="/create/policy">Create Policy</Link>
        {error && <p class="error">{error}</p>}
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
      <div class="menubar">
      </div>
    </>
  )
}

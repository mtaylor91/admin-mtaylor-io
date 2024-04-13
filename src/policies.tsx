import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolvePolicyIdentifier } from './util'


interface PoliciesViewProps {
  client: IAM
  path?: string
}


export function PoliciesView({ client }: PoliciesViewProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])

  useEffect(() => {
    const getPolicies = async () => {
      const policies = await client.policies.listPolicies()
      setPolicies(policies)
    }

    getPolicies()
  }, [])

  return (
    <div>
      <h1>Policies</h1>
      <ul>
        {policies.map(policy => {
          const policyId = resolvePolicyIdentifier(policy)
          return (<li><a href={`/policies/${policyId}`}>{policyId}</a></li>)
        })}
      </ul>
    </div>
  )
}

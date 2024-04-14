import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity } from 'iam-mtaylor-io-js'
import { resolvePolicyIdentifier } from './util'


interface PoliciesViewProps {
  client: IAM
  path?: string
}


export function PoliciesView({ client }: PoliciesViewProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])
  const [showCreatePolicy, setShowCreatePolicy] = useState(false)
  const [newPolicyName, setNewPolicyName] = useState('')
  const [newPolicyHostname, setNewPolicyHostname] = useState('')

  useEffect(() => {
    const getPolicies = async () => {
      const policies = await client.policies.listPolicies()
      setPolicies(policies)
    }

    getPolicies()
  }, [])

  const onClickCreatePolicy = async (event: Event) => {
    event.preventDefault()
    setShowCreatePolicy(true)
  }

  const onSubmitCreatePolicy = async (event: Event) => {
    event.preventDefault()
    if (newPolicyName === '') {
      const policy = await client.policies.createPolicy({
        hostname: newPolicyHostname, statements: []
      })

      route(`/policies/${resolvePolicyIdentifier(policy)}`)
    } else {
      const policy = await client.policies.createPolicy({
        name: newPolicyName, hostname: newPolicyHostname, statements: []
      })

      route(`/policies/${resolvePolicyIdentifier(policy)}`)
    }
    setShowCreatePolicy(false)
  }

  const onCancelCreatePolicy = async (event: Event) => {
    event.preventDefault()
    setShowCreatePolicy(false)
  }

  const onInputNewPolicyName = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewPolicyName(target.value)
  }

  const onInputNewPolicyHostname = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewPolicyHostname(target.value)
  }

  if (showCreatePolicy) {
    return (
      <div>
        <h1>Create Policy</h1>
        <form onSubmit={onSubmitCreatePolicy}>
          <label>
            Name
            <input type="text" onInput={onInputNewPolicyName} />
          </label>
          <label>
            Hostname
            <input type="text" onInput={onInputNewPolicyHostname} />
          </label>
          <button type="submit">Create</button>
          <button onClick={onCancelCreatePolicy}>Cancel</button>
        </form>
      </div>
    )
  } else {
    return (
      <div>
        <h1>Policies</h1>
        <button onClick={onClickCreatePolicy}>Create Policy</button>
        <ul>
          {policies.map(policy => {
            const policyId = resolvePolicyIdentifier(policy)
            return (<li><a href={`/policies/${policyId}`}>{policyId}</a></li>)
          })}
        </ul>
      </div>
    )
  }
}

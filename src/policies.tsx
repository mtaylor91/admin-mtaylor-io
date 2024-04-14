import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity, Rule, Action, Effect } from 'iam-mtaylor-io-js'
import { resolvePolicyIdentifier } from './util'


interface CreatePolicyStatementsViewProps {
  statements: Rule[]
  setStatements: (statements: Rule[]) => void
}


function CreatePolicyStatementsView({ statements, setStatements }: CreatePolicyStatementsViewProps) {
  const [newStatementAction, setNewStatementAction] = useState("Read")
  const [newStatementEffect, setNewStatementEffect] = useState("Allow")
  const [newStatementResource, setNewStatementResource] = useState('*')

  const onClickAddStatement = async (event: Event) => {
    event.preventDefault()
    setStatements([...statements, {
      action: newStatementAction as Action,
      effect: newStatementEffect as Effect,
      resource: newStatementResource
    }])
  }

  const onClickRemoveStatement = async (index: number) => {
    setStatements(statements.filter((_, i) => i !== index))
  }

  const onInputNewStatementAction = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewStatementAction(target.value)
  }

  const onInputNewStatementEffect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewStatementEffect(target.value)
  }

  const onInputNewStatementResource = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewStatementResource(target.value)
  }

  return (
    <>
      <h2>Statements</h2>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Effect</th>
            <th>Resource</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {statements.map((statement, index) => {
            return (
              <tr>
                <td>{statement.action}</td>
                <td>{statement.effect}</td>
                <td>{statement.resource}</td>
                <td>
                  <button onClick={() => onClickRemoveStatement(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <label>
        Action
        <select onInput={onInputNewStatementAction}>
          <option value="Read">Read</option>
          <option value="Write">Write</option>
        </select>
      </label>
      <label>
        Effect
        <select onInput={onInputNewStatementEffect}>
          <option value="Allow">Allow</option>
          <option value="Deny">Deny</option>
        </select>
      </label>
      <label>
        Resource
        <input type="text" onInput={onInputNewStatementResource}
          value={newStatementResource} />
      </label>
      <button onClick={onClickAddStatement}>Add Statement</button>
    </>
  )
}


interface PoliciesViewProps {
  client: IAM
  path?: string
}


export function PoliciesView({ client }: PoliciesViewProps) {
  const [policies, setPolicies] = useState<PolicyIdentity[]>([])
  const [showCreatePolicy, setShowCreatePolicy] = useState(false)
  const [newPolicyName, setNewPolicyName] = useState('')
  const [newPolicyHostname, setNewPolicyHostname] = useState('')
  const [newPolicyStatements, setNewPolicyStatements] = useState<Rule[]>([])

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
        hostname: newPolicyHostname,
        statements: newPolicyStatements
      })

      route(`/policies/${resolvePolicyIdentifier(policy)}`)
    } else {
      const policy = await client.policies.createPolicy({
        name: newPolicyName, hostname: newPolicyHostname,
        statements: newPolicyStatements
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
          <CreatePolicyStatementsView statements={newPolicyStatements}
            setStatements={setNewPolicyStatements} />
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

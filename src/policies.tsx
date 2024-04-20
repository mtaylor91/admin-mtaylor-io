import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import IAM, { PolicyIdentity, Rule, Action, Effect } from 'iam-mtaylor-io-js'
import { resolvePolicyId, resolvePolicyIdentifier } from './util'


interface CreatePolicyStatementViewProps {
  statement: Rule
  setStatement: (statement: Rule) => void
  deleteStatement: () => void
}


function CreatePolicyStatementView({
  statement, setStatement, deleteStatement
}: CreatePolicyStatementViewProps) {
  const onInputAction = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setStatement({ ...statement, action: target.value as Action })
  }

  const onInputEffect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setStatement({ ...statement, effect: target.value as Effect })
  }

  const onInputResource = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setStatement({ ...statement, resource: target.value })
  }

  return (
    <tr>
      <td>
        <select onInput={onInputAction}>
          <option value="Read">Read</option>
          <option value="Write">Write</option>
        </select>
      </td>
      <td>
        <select onInput={onInputEffect}>
          <option value="Allow">Allow</option>
          <option value="Deny">Deny</option>
        </select>
      </td>
      <td>
        <input type="text" onInput={onInputResource}
          value={statement.resource} />
      </td>
      <td>
        <button onClick={deleteStatement}>Delete</button>
      </td>
    </tr>
  )
}


interface CreatePolicyStatementsViewProps {
  statements: Rule[]
  setStatements: (statements: Rule[]) => void
}


function CreatePolicyStatementsView({
  statements, setStatements
}: CreatePolicyStatementsViewProps) {
  const onClickAddStatement = async (event: Event) => {
    event.preventDefault()
    setStatements([...statements, {
      effect: "Allow" as Effect,
      action: "Read" as Action,
      resource: "*"
    }])
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
            const setStatement = (statement: Rule) => {
              setStatements(statements.map((s, i) => i === index ? statement : s))
            }

            const deleteStatement = () => {
              setStatements(statements.filter((_, i) => i !== index))
            }

            return (
              <CreatePolicyStatementView statement={statement}
                setStatement={setStatement} deleteStatement={deleteStatement} />
            )
          })}
        </tbody>
      </table>
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

      route(`/policies/${resolvePolicyId(policy)}`)
    } else {
      const policy = await client.policies.createPolicy({
        name: newPolicyName, hostname: newPolicyHostname,
        statements: newPolicyStatements
      })

      route(`/policies/${resolvePolicyId(policy)}`)
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
      <>
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
      </>
    )
  } else {
    return (
      <>
        <button onClick={onClickCreatePolicy}>Create Policy</button>
        <ul>
          {policies.map(policy => {
            const policyId = resolvePolicyId(policy)
            const policyName = resolvePolicyIdentifier(policy)
            return (<li><a href={`/policies/${policyId}`}>{policyName}</a></li>)
          })}
        </ul>
      </>
    )
  }
}

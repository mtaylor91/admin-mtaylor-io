import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import IAM, { Rule, Action, Effect } from 'iam-mtaylor-io-js'
import { resolvePolicyId } from '../util'


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
          placeholder="Resource"
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
      resource: ""
    }])
  }

  return (
    <>
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


interface CreatePolicyProps {
  client: IAM
  path?: string
}


export function CreatePolicy({ client }: CreatePolicyProps) {
  const [error, setError] = useState<string | null>(null)
  const [newPolicyName, setNewPolicyName] = useState('')
  const [newPolicyHostname, setNewPolicyHostname] = useState('')
  const [newPolicyStatements, setNewPolicyStatements] = useState<Rule[]>([])

  const onSubmitCreatePolicy = async (event: Event) => {
    event.preventDefault()
    try {
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
    } catch (err) {
      const error = err as Error | AxiosError
      if (!axios.isAxiosError(error))
        throw error
      setError(error.response?.data?.error || error.message)
      throw error
    }
  }

  const onInputNewPolicyName = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewPolicyName(target.value)
  }

  const onInputNewPolicyHostname = async (event: Event) => {
    const target = event.target as HTMLInputElement
    setNewPolicyHostname(target.value)
  }

  return (
    <div class="section">
      <div class="menubar">
        {error && <p class="error">{error}</p>}
      </div>
      <form onSubmit={onSubmitCreatePolicy}>
        <label>
          Name:
          <input type="text" placeholder="Policy Name" onInput={onInputNewPolicyName} />
        </label>
        <label>
          Hostname:
          <input type="text" placeholder="Hostname" onInput={onInputNewPolicyHostname} />
        </label>
        <CreatePolicyStatementsView statements={newPolicyStatements}
          setStatements={setNewPolicyStatements} />
        <button type="submit">Create</button>
      </form>
      <div class="menubar">
      </div>
    </div>
  )
}
